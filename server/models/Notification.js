const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = broadcast to all
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "payment", "promo", "general", "account", "return"],
      default: "general",
    },
    reference_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    reference_type: {
      type: String,
      enum: ["Order", "Product", "Coupon", null],
      default: null,
    },
    is_read: { type: Boolean, default: false },
    read_at: { type: Date, default: null },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
