const mongoose = require("mongoose");

/**
 * GiftCard Model
 *
 * Flow:
 *  1. Customer purchases → status: "pending_review", payment_status: "paid"
 *  2. Employee reviews  → status: "pending_approval"
 *  3. Admin/SuperAdmin approves → status: "active" (redeemable)
 *     OR rejects → status: "rejected" (refund initiated)
 *
 *  Admin/SuperAdmin can also directly create a gift card (free or paid):
 *    → status: "active" immediately
 *
 *  Redemption: customer uses code at checkout → status: "redeemed"
 */
const giftCardSchema = new mongoose.Schema(
  {
    // ── Unique redeemable code ─────────────────────────────────────────────
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ── Value ─────────────────────────────────────────────────────────────
    amount: { type: Number, required: true, min: 100 },
    balance: { type: Number, required: true },   // remaining balance (starts = amount)

    // ── Ownership ─────────────────────────────────────────────────────────
    // Customer who purchased / was gifted this card
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Email of the recipient (used when owner not yet registered)
    recipient_email: { type: String, default: null },
    recipient_name:  { type: String, default: null },

    // ── Purchase details (filled when customer buys) ───────────────────────
    purchased_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Razorpay payment details
    razorpay_order_id:   { type: String, default: null },
    razorpay_payment_id: { type: String, default: null },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "free"],
      default: "pending",
    },

    // ── Design / personalisation ───────────────────────────────────────────
    design: { type: String, default: "festive" },    // festive/birthday/premium/…
    occasion: { type: String, default: "general" },
    message: { type: String, default: "" },
    sender_name: { type: String, default: "" },

    // ── Workflow status ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending_review",    // paid by customer, waiting for employee review
        "pending_approval",  // reviewed by employee, waiting for admin approval
        "active",            // approved and redeemable
        "redeemed",          // fully used
        "partially_redeemed",// partially used
        "rejected",          // rejected by admin (refund needed)
        "expired",           // past expiry_date
        "cancelled",         // cancelled before use
      ],
      default: "pending_review",
    },

    // ── Review / Approval trail ────────────────────────────────────────────
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewed_at: { type: Date, default: null },
    review_note: { type: String, default: "" },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approved_at: { type: Date, default: null },
    approval_note: { type: String, default: "" },

    // ── Direct issue by admin (free gift) ─────────────────────────────────
    is_admin_issued: { type: Boolean, default: false },
    issued_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Redemption log ─────────────────────────────────────────────────────
    redemptions: [
      {
        order_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount_used: { type: Number, required: true },
        redeemed_at: { type: Date, default: Date.now },
      },
    ],

    // ── Validity ──────────────────────────────────────────────────────────
    expiry_date: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },

    // ── Notification sent ─────────────────────────────────────────────────
    notification_sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual: is_expired
giftCardSchema.virtual("is_expired").get(function () {
  return this.expiry_date && new Date() > this.expiry_date;
});

// Virtual: is_usable
giftCardSchema.virtual("is_usable").get(function () {
  return (
    (this.status === "active" || this.status === "partially_redeemed") &&
    this.balance > 0 &&
    !this.is_expired
  );
});

giftCardSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("GiftCard", giftCardSchema);
