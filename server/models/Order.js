const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  product_name: { type: String, required: true },
  product_image: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  total: { type: Number, required: true },
  return_requested: { type: Boolean, default: false },
  return_status: {
    type: String,
    enum: ["none", "requested", "approved", "rejected", "completed"],
    default: "none",
  },
  return_reason: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    order_number: { type: String, required: true, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    address: {
      full_name: String,
      contact_no: String,
      address_line1: String,
      address_line2: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    shipping_charge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    coupon_discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_method: {
      type: String,
      enum: ["cod", "razorpay", "stripe", "wallet"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cod"],
      default: "pending",
    },
    razorpay_order_id: { type: String, default: null },
    razorpay_payment_id: { type: String, default: null },
    invoice_no: { type: String, default: null },
    invoice_url: { type: String, default: null },
    order_status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "returned",
        "refunded",
      ],
      default: "pending",
    },
    tracking_id: { type: String, default: null },
    courier_name: { type: String, default: null },
    estimated_delivery: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    cancel_reason: { type: String, default: "" },
    assigned_employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: { type: String, default: "" },
    status_history: [
      {
        status: String,
        note: String,
        changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changed_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
