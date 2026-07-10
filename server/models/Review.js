const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    review: { type: String, default: "" },
    images: [{ type: String }],
    is_verified_purchase: { type: Boolean, default: false },
    helpful_count: { type: Number, default: 0 },
    helpful_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reply: { type: String, default: "" },
    reply_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reply_at: { type: Date, default: null },
    is_approved: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
