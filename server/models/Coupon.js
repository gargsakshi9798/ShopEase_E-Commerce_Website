const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    discount_type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discount_value: { type: Number, required: true },
    min_order_amount: { type: Number, default: 0 },
    max_discount_amount: { type: Number, default: null }, // cap for percentage discount
    usage_limit: { type: Number, default: null }, // null = unlimited
    usage_per_customer: { type: Number, default: 1 },
    used_count: { type: Number, default: 0 },
    applicable_for: {
      type: String,
      enum: ["all", "category", "product", "user"],
      default: "all",
    },
    applicable_ids: [{ type: mongoose.Schema.Types.ObjectId }],
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: is expired
couponSchema.virtual("is_expired").get(function () {
  return new Date() > this.end_date;
});

couponSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Coupon", couponSchema);
