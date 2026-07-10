const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    group: { type: String, default: "general" },
    label: { type: String, default: "" },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "image"],
      default: "string",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
