const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, required: true, unique: true },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoice_date: { type: Date, default: Date.now },
    due_date: { type: Date, default: null },
    billing_address: {
      full_name: String,
      contact_no: String,
      address_line1: String,
      address_line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    items: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        product_name: String,
        quantity: Number,
        price: Number,
        mrp: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    shipping_charge: { type: Number, default: 0 },
    coupon_discount: { type: Number, default: 0 },
    tax_percent: { type: Number, default: 5 },
    tax_amount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_method: { type: String },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "cod"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
