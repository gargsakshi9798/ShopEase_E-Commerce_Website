"use strict";

const mongoose  = require("mongoose");
const Base      = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { GenerateCode } = require("../../../../../helper/common/utils");
const { sendGiftCardEmail } = require("../../../../../helper/NodeMailer");

const GiftCard     = require("../../../../../models/GiftCard");
const Notification = require("../../../../../models/Notification");
const User         = require("../../../../../models/User");

const generateGiftCode = async () => {
  let code, exists;
  do {
    code   = `GIFT-${GenerateCode(8)}`;
    exists = await GiftCard.findOne({ code });
  } while (exists);
  return code;
};

class AdminGiftCardController {

  // ── 1. List all gift cards ────────────────────────────────────────────────
  async getAll(req, res) {
    try {
      const { page = 1, per_page = 15, status, search, sort_by = "createdAt", order = "desc" } = req.query;
      const filter = {};
      if (status)  filter.status = status;
      if (search) {
        filter.$or = [
          { code:            { $regex: search, $options: "i" } },
          { recipient_email: { $regex: search, $options: "i" } },
          { recipient_name:  { $regex: search, $options: "i" } },
        ];
      }
      const skip = (Number(page) - 1) * Number(per_page);
      const [cards, total] = await Promise.all([
        GiftCard.find(filter)
          .populate("purchased_by", "name email")
          .populate("owner_id",     "name email")
          .populate("reviewed_by",  "name")
          .populate("approved_by",  "name")
          .populate("issued_by",    "name")
          .sort({ [sort_by]: order === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(Number(per_page))
          .lean(),
        GiftCard.countDocuments(filter),
      ]);
      return Base.sendResponse(res, HTTPS.OK, {
        data: cards, total,
        current_page: Number(page),
        total_pages:  Math.ceil(total / Number(per_page)),
        per_page:     Number(per_page),
      });
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 2. Get single ─────────────────────────────────────────────────────────
  async getById(req, res) {
    try {
      const card = await GiftCard.findById(req.params.id)
        .populate("purchased_by",  "name email contact_no")
        .populate("owner_id",      "name email")
        .populate("reviewed_by",   "name email")
        .populate("approved_by",   "name email")
        .populate("issued_by",     "name email")
        .populate("redemptions.order_id", "order_number total_amount")
        .lean();
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");
      return Base.sendResponse(res, HTTPS.OK, card);
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 3. Employee Review: pending_review → pending_approval ─────────────────
  async review(req, res) {
    try {
      const adminId = req.user.user;
      const { note = "" } = req.body;

      const card = await GiftCard.findById(req.params.id);
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");
      if (card.status !== "pending_review") {
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          `Card is already '${card.status}' — only 'pending_review' cards can be reviewed`);
      }

      await GiftCard.findByIdAndUpdate(card._id, {
        status:      "pending_approval",
        reviewed_by: adminId,
        reviewed_at: new Date(),
        review_note: note,
      });
      return Base.sendResponse(res, HTTPS.OK, null, "Reviewed — sent for admin approval");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 4. Admin/SuperAdmin Approve ───────────────────────────────────────────
  async approve(req, res) {
    try {
      const adminId  = req.user.user;
      const roleSlug = req.user.role;
      const { note = "" } = req.body;

      if (!["admin", "super_admin"].includes(roleSlug)) {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only Admin or SuperAdmin can approve gift cards");
      }

      const card = await GiftCard.findById(req.params.id)
        .populate("purchased_by", "name email")
        .lean();
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");

      if (!["pending_review", "pending_approval"].includes(card.status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          `Cannot approve a card with status '${card.status}'`);
      }

      await GiftCard.findByIdAndUpdate(card._id, {
        status:        "active",
        approved_by:   adminId,
        approved_at:   new Date(),
        approval_note: note,
      });

      // Notifications + emails (non-blocking)
      const notifJobs = [];

      if (card.purchased_by?._id) {
        notifJobs.push(
          Notification.create({
            user_id:        card.purchased_by._id,
            title:          "Gift Card Activated! 🎁",
            message:        `Your ₹${card.amount} gift card (${card.code}) for ${card.recipient_name} is now active!`,
            type:           "general",
            reference_id:   card._id,
            reference_type: "GiftCard",
          }),
          sendGiftCardEmail(card.purchased_by.email, {
            type:            "activated",
            customer_name:   card.purchased_by.name,
            gift_card_code:  card.code,
            amount:          card.amount,
            recipient_name:  card.recipient_name,
            recipient_email: card.recipient_email,
            expiry_date:     card.expiry_date,
          })
        );
      }

      // Email the recipient
      notifJobs.push(
        sendGiftCardEmail(card.recipient_email, {
          type:           "gift_received",
          customer_name:  card.recipient_name,
          gift_card_code: card.code,
          amount:         card.amount,
          sender_name:    card.sender_name || (card.purchased_by?.name || "ShopEase"),
          message:        card.message,
          expiry_date:    card.expiry_date,
        })
      );

      // In-app notification to recipient if registered
      if (card.owner_id) {
        notifJobs.push(
          Notification.create({
            user_id:        card.owner_id,
            title:          `🎁 You received a ₹${card.amount} Gift Card!`,
            message:        `${card.sender_name || "Someone"} sent you a gift card. Code: ${card.code}.`,
            type:           "general",
            reference_id:   card._id,
            reference_type: "GiftCard",
          })
        );
      }
      Promise.all(notifJobs).catch(console.error);

      return Base.sendResponse(res, HTTPS.OK, null, "Gift card approved and activated");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 5. Admin/SuperAdmin Reject ────────────────────────────────────────────
  async reject(req, res) {
    try {
      const adminId  = req.user.user;
      const roleSlug = req.user.role;
      const { note = "" } = req.body;

      if (!["admin", "super_admin"].includes(roleSlug)) {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only Admin or SuperAdmin can reject gift cards");
      }

      const card = await GiftCard.findById(req.params.id)
        .populate("purchased_by", "name email")
        .lean();
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");

      if (!["pending_review", "pending_approval"].includes(card.status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          `Cannot reject a card with status '${card.status}'`);
      }

      await GiftCard.findByIdAndUpdate(card._id, {
        status:        "rejected",
        approved_by:   adminId,
        approved_at:   new Date(),
        approval_note: note,
      });

      const notifJobs = [];
      if (card.purchased_by?._id) {
        notifJobs.push(
          Notification.create({
            user_id:        card.purchased_by._id,
            title:          "Gift Card Request Rejected",
            message:        `Your ₹${card.amount} gift card request has been rejected. Reason: ${note || "Policy check failed"}. A refund will be processed.`,
            type:           "general",
            reference_id:   card._id,
            reference_type: "GiftCard",
          }),
          sendGiftCardEmail(card.purchased_by.email, {
            type:          "rejected",
            customer_name: card.purchased_by.name,
            amount:        card.amount,
            message:       note || "Your request did not meet our gift card policy requirements.",
            expiry_date:   card.expiry_date,
          })
        );
      }
      Promise.all(notifJobs).catch(console.error);

      return Base.sendResponse(res, HTTPS.OK, null, "Gift card rejected");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 6. Admin/SuperAdmin: Directly issue a gift card ───────────────────────
  async issue(req, res) {
    try {
      const adminId  = req.user.user;
      const roleSlug = req.user.role;
      if (!["admin", "super_admin"].includes(roleSlug)) {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only Admin or SuperAdmin can directly issue gift cards");
      }
      const {
        amount, recipient_email, recipient_name,
        occasion    = "general",
        design      = "festive",
        message     = "",
        sender_name = "ShopEase Team",
        note        = "",
      } = req.body;

      if (!amount || amount < 100) return Base.sendError(res, HTTPS.BAD_REQUEST, "Amount must be at least ₹100");
      if (!recipient_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email))
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Valid recipient email is required");
      if (!recipient_name?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Recipient name is required");

      const code          = await generateGiftCode();
      const recipientUser = await User.findOne({ email: recipient_email.toLowerCase() }, "_id");

      const card = await GiftCard.create({
        code,
        amount:          Number(amount),
        balance:         Number(amount),
        owner_id:        recipientUser?._id || null,
        recipient_email: recipient_email.toLowerCase(),
        recipient_name:  recipient_name.trim(),
        sender_name:     sender_name.trim(),
        payment_status:  "free",
        design, occasion, message,
        status:          "active",
        is_admin_issued: true,
        issued_by:       adminId,
        approved_by:     adminId,
        approved_at:     new Date(),
        approval_note:   note,
        expiry_date:     new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      const notifJobs = [
        sendGiftCardEmail(recipient_email, {
          type:           "gift_received",
          customer_name:  recipient_name,
          gift_card_code: code,
          amount:         Number(amount),
          sender_name,
          message,
          expiry_date:    card.expiry_date,
        }),
      ];
      if (recipientUser) {
        notifJobs.push(
          Notification.create({
            user_id:        recipientUser._id,
            title:          `🎁 You received a ₹${amount} Gift Card from ShopEase!`,
            message:        `${sender_name} gifted you a gift card. Code: ${code}. Use it during checkout!`,
            type:           "general",
            reference_id:   card._id,
            reference_type: "GiftCard",
          })
        );
      }
      Promise.all(notifJobs).catch(console.error);

      return Base.sendResponse(res, HTTPS.CREATED, {
        gift_card_id: card._id, code, amount: card.amount, status: card.status,
        recipient_name: card.recipient_name, recipient_email: card.recipient_email,
      }, "Gift card issued successfully");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 7. Stats ──────────────────────────────────────────────────────────────
  async getStats(req, res) {
    try {
      const [statusCounts, totalValue, redeemedValue] = await Promise.all([
        GiftCard.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, total_amount: { $sum: "$amount" } } }]),
        GiftCard.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
        GiftCard.aggregate([
          { $match: { status: { $in: ["redeemed", "partially_redeemed"] } } },
          { $group: { _id: null, total: { $sum: { $subtract: ["$amount", "$balance"] } } } },
        ]),
      ]);
      return Base.sendResponse(res, HTTPS.OK, {
        by_status:      statusCounts,
        total_issued:   totalValue[0]?.total   || 0,
        total_redeemed: redeemedValue[0]?.total || 0,
      });
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 8. Cancel ─────────────────────────────────────────────────────────────
  async cancel(req, res) {
    try {
      const roleSlug = req.user.role;
      if (!["admin", "super_admin"].includes(roleSlug)) {
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only Admin or SuperAdmin can cancel gift cards");
      }
      const card = await GiftCard.findById(req.params.id);
      if (!card) return Base.sendError(res, HTTPS.NOT_FOUND, "Gift card not found");
      if (["redeemed", "cancelled"].includes(card.status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, `Cannot cancel a '${card.status}' card`);
      }
      await GiftCard.findByIdAndUpdate(card._id, { status: "cancelled" });
      return Base.sendResponse(res, HTTPS.OK, null, "Gift card cancelled");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

module.exports = new AdminGiftCardController();
