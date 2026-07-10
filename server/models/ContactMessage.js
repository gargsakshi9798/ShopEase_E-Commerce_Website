const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["unread", "read", "replied", "archived"],
      default: "unread",
    },
    admin_notes: { type: String, default: "" },
    replied_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reply_message: { type: String, default: "" },
    replied_at:    { type: Date, default: null },
    ip_address:    { type: String, default: null },
    source:        { type: String, default: "contact_form" }, // contact_form | chatbot | email
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
