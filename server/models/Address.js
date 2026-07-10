const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    full_name: { type: String, required: true, trim: true },
    contact_no: { type: String, required: true, trim: true },
    address_line1: { type: String, required: true, trim: true },
    address_line2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India" },
    address_type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    is_default: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
