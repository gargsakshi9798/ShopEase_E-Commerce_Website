"use strict";

const Razorpay  = require("razorpay");
const crypto    = require("crypto");

const Base   = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { GenerateCode } = require("../../../../../helper/common/utils");
const { sendGiftCardEmail } = require("../../../../../helper/NodeMailer");

const GiftCard    = require("../../../../../models/GiftCard");
const Payment     = require("../../../../../models/Payment");
const Notification = require("../../../../../models/Notification");
const User        = require("../../../../../models/User");

const getRazorpay = () =>
  new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// Generate unique gift card code: GIFT-XXXXXX
const generateGiftCode = async () => {
  let code, exists;
  do {
    code   = `GIFT-${GenerateCode(8)}`;
    exists = await GiftCard.findOne({ code });
  } while (exists);
  return code;
};

/**
 * Auto Fraud Check
 * Returns: { needsReview: bool, needsApproval: bool, reason: string }
 *
 * Rules:
 *  - Amount > ₹5,000  → needs employee review
 *  - Amount > ₹10,000 → additionally needs admin approval
 *  - Customer account < 7 days old → needs review
 *  - More than 3 gift card purchases in last 24h → flagged
 */
const autoFraudCheck = async (userId, amount) => {
  const HIGH_VALUE_REVIEW    = 5000;
  const HIGH_VALUE_APPROVAL  = 10000;

  let needsReview    = false;
  let needsApproval  = false;
  const reasons      = [];

  // Rule 1: High value
  if (amount > HIGH_VALUE_APPROVAL) {
    needsReview   = true;
    needsApproval = true;
    reasons.push(`High value purchase ₹${amount} (>₹${HIGH_VALUE_APPROVAL})`);
  } else if (amount > HIGH_VALUE_REVIEW) {
    needsReview = true;
    reasons.push(`Elevated value purchase ₹${amount} (>₹${HIGH_VALUE_REVIEW})`);
  }

  // Rule 2: New account (< 7 days)
  const user = await User.findById(userId).select("createdAt").lean();
  if (user) {
    const daysSinceJoined = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceJoined < 7) {
      needsReview = true;
      reasons.push("Account less than 7 days old");
    }
  }

  // Rule 3: Velocity check — more than 3 purchases in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await GiftCard.countDocuments({
    purchased_by: userId,
    createdAt: { $gte: since },
    payment_status: "paid",
  });
  if (recentCount >= 3) {
    needsReview   = true;
    needsApproval = true;
    reasons.push(`${recentCount + 1} gift card purchases in last 24 hours (velocity flag)`);
  }

  return {
    needsReview,
    needsApproval,
    reason: reasons.join("; "),
  };
};

class CustomerGiftCardController {

  // ── 1. Create Razorpay order for gift card purchase ───────────────────────
  async initiatePayment(req, res) {
    try {
      const keyId     = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret || keyId === "your_razorpay_key_id") {
        return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR,
          "Payment gateway is not configured");
      }

      const userId = req.user.user;
      const {
        amount,
        recipient_email,
        recipient_name,
        sender_name,
        occasion = "general",
        design   = "festive",
        message  = "",
      } = req.body;

      if (!amount || amount < 100 || amount > 50000) {
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          "Amount must be between ₹100 and ₹50,000");
      }
      if (!recipient_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Valid recipient email is required");
      }
      if (!recipient_name?.trim()) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Recipient name is required");
      }

      const razorpay = getRazorpay();
      const rzpOrder = await razorpay.orders.create({
        amount:   Math.round(amount * 100),
        currency: "INR",
        receipt:  `gc_receipt_${Date.now()}`,
        notes:    { user_id: String(userId), type: "gift_card" },
      });

      return Base.sendResponse(res, HTTPS.CREATED, {
        razorpay_order_id: rzpOrder.id,
        amount:            rzpOrder.amount,
        currency:          rzpOrder.currency,
        key_id:            keyId,
        gift_card_data: { amount, recipient_email, recipient_name, sender_name, occasion, design, message },
      }, "Payment order created");
    } catch (err) {
      console.error("GiftCard initiatePayment:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 2. Verify payment & create gift card (with Auto Fraud Check) ──────────
  async verifyAndCreate(req, res) {
    try {
      const userId = req.user.user;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        recipient_email,
        recipient_name,
        sender_name  = "",
        occasion     = "general",
        design       = "festive",
        message      = "",
      } = req.body;

      // ── Step 1: Verify Razorpay Signature ───────────────────────────────
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expected !== razorpay_signature) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Payment signature verification failed");
      }

      // ── Step 2: Auto Fraud Check ─────────────────────────────────────────
      const fraudResult = await autoFraudCheck(userId, Number(amount));

      // Determine initial status based on fraud check
      const initialStatus = (fraudResult.needsApproval || fraudResult.needsReview)
        ? "pending_review"
        : "active";

      const code = await generateGiftCode();

      // Find recipient user if registered
      const recipientUser = await User.findOne({ email: recipient_email.toLowerCase() }, "_id");

      const card = await GiftCard.create({
        code,
        amount:              Number(amount),
        balance:             Number(amount),
        owner_id:            recipientUser?._id || null,
        recipient_email:     recipient_email.toLowerCase(),
        recipient_name:      recipient_name.trim(),
        sender_name:         sender_name.trim(),
        purchased_by:        userId,
        razorpay_order_id,
        razorpay_payment_id,
        payment_status:      "paid",
        design,
        occasion,
        message,
        status:              initialStatus,
        review_note:         fraudResult.reason || "",
        expiry_date:         new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      await Payment.create({
        order_id:            card._id,
        user_id:             userId,
        amount:              Number(amount),
        payment_method:      "razorpay",
        payment_status:      "success",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        transaction_id:      razorpay_payment_id,
      });

      // ── Step 3: Post-transaction notifications & email (non-blocking) ───
      const isActive = card.status === "active";

      Promise.all([
        // Notify purchaser
        Notification.create({
          user_id:        userId,
          title:          isActive ? "Gift Card Activated! 🎁" : "Gift Card Purchase Successful! 🎁",
          message:        isActive
            ? `Your ₹${card.amount} gift card (${card.code}) for ${card.recipient_name} is now active!`
            : `Your ₹${card.amount} gift card for ${card.recipient_name} is under review. You'll be notified once activated.`,
          type:           "payment",
          reference_id:   card._id,
          reference_type: "GiftCard",
        }),

        // Email to purchaser
        (async () => {
          const purchaser = await User.findById(userId).select("email name").lean();
          if (purchaser?.email) {
            await sendGiftCardEmail(purchaser.email, {
              type:            "purchase_confirmation",
              customer_name:   purchaser.name,
              gift_card_code:  card.code,
              amount:          card.amount,
              recipient_name:  card.recipient_name,
              recipient_email: card.recipient_email,
              status:          card.status,
              expiry_date:     card.expiry_date,
              is_active:       isActive,
            }).catch(console.error);
          }
        })(),

        // If activated immediately, also email recipient
        isActive
          ? sendGiftCardEmail(card.recipient_email, {
              type:           "gift_received",
              customer_name:  card.recipient_name,
              gift_card_code: card.code,
              amount:         card.amount,
              sender_name:    card.sender_name || "Someone",
              message:        card.message,
              expiry_date:    card.expiry_date,
            }).catch(console.error)
          : Promise.resolve(),

        // Notify recipient if they have an account (and card is active)
        isActive && card.owner_id
          ? Notification.create({
              user_id:        card.owner_id,
              title:          `🎁 You received a ₹${card.amount} Gift Card!`,
              message:        `${card.sender_name || "Someone"} sent you a gift card. Code: ${card.code}. Use it during checkout!`,
              type:           "general",
              reference_id:   card._id,
              reference_type: "GiftCard",
            })
          : Promise.resolve(),
      ]).catch(console.error);

      return Base.sendResponse(res, HTTPS.CREATED, {
        gift_card_id:    card._id,
        code:            isActive ? card.code : null,
        amount:          card.amount,
        status:          card.status,
        recipient_name:  card.recipient_name,
        recipient_email: card.recipient_email,
        is_active:       isActive,
        fraud_flagged:   !isActive,
      }, isActive
        ? "Gift card purchased and activated successfully!"
        : "Gift card purchased! It will be activated after review (usually within 24 hours)."
      );
    } catch (err) {
      console.error("GiftCard verifyAndCreate:", err);
      const status = err.status || 500;
      return Base.sendError(res, { code: status, message: err.message }, err.message);
    }
  }

  // ── 3. List my gift cards (purchased by me OR owned by me) ───────────────
  async myGiftCards(req, res) {
    try {
      const userId = req.user.user;
      const user   = await User.findById(userId).select("email");

      const cards = await GiftCard.find({
        $or: [
          { purchased_by: userId },
          { owner_id:     userId },
          { recipient_email: user?.email },
        ],
      })
        .populate("purchased_by", "name email")
        .sort({ createdAt: -1 })
        .lean();

      return Base.sendResponse(res, HTTPS.OK, cards);
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 4. Check balance of a gift card ───────────────────────────────────────
  async checkBalance(req, res) {
    try {
      const { code } = req.params;
      const card = await GiftCard.findOne({ code: code.toUpperCase() })
        .select("code amount balance status expiry_date recipient_name")
        .lean();

      if (!card) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");
      }

      return Base.sendResponse(res, HTTPS.OK, {
        code:            card.code,
        original_amount: card.amount,
        balance:         card.balance,
        status:          card.status,
        expiry_date:     card.expiry_date,
        is_usable:       (card.status === "active" || card.status === "partially_redeemed") && card.balance > 0,
      });
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 5. Redeem gift card at checkout ───────────────────────────────────────
  async redeem(req, res) {
    try {
      const { code, amount_to_use, order_id } = req.body;

      if (!code || !amount_to_use || amount_to_use <= 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Code and amount_to_use are required");
      }

      const card = await GiftCard.findOne({ code: code.toUpperCase() });
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");

      if (!["active", "partially_redeemed"].includes(card.status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, `Gift card is ${card.status}`);
      }
      if (card.expiry_date && new Date() > card.expiry_date) {
        await GiftCard.findByIdAndUpdate(card._id, { status: "expired" });
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Gift card has expired");
      }
      if (card.balance <= 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Gift card has no balance remaining");
      }

      const use        = Math.min(Number(amount_to_use), card.balance);
      const newBalance = card.balance - use;

      await GiftCard.findByIdAndUpdate(card._id, {
        balance:  newBalance,
        status:   newBalance === 0 ? "redeemed" : "partially_redeemed",
        $push: {
          redemptions: {
            order_id:    order_id || null,
            amount_used: use,
            redeemed_at: new Date(),
          },
        },
      });

      return Base.sendResponse(res, HTTPS.OK, {
        amount_used:       use,
        remaining_balance: newBalance,
      }, `₹${use} redeemed from gift card`);
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

module.exports = new CustomerGiftCardController();
