const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    mobile_image: { type: String, default: null },
    link: { type: String, default: "" },
    button_text: { type: String, default: "Shop Now" },
    position: {
      type: String,
      enum: ["hero", "top", "middle", "bottom", "sidebar", "popup"],
      default: "hero",
    },
    sort_order: { type: Number, default: 0 },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
