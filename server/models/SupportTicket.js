const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  message:     { type: String, required: true },
  sender_type: { type: String, enum: ["admin", "customer"], required: true },
  sender_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  sender_name: { type: String, default: "" },
  attachments: [{ type: String }],
  created_at:  { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticket_number: { type: String, required: true, unique: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Guest fields (if not logged in)
    guest_name:  { type: String, default: "" },
    guest_email: { type: String, default: "" },
    guest_phone: { type: String, default: "" },

    subject:     { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["order", "payment", "product", "shipping", "return", "account", "technical", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_customer", "resolved", "closed"],
      default: "open",
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    attachments: [{ type: String }],
    replies:     [replySchema],
    tags:        [{ type: String }],
    resolved_at: { type: Date, default: null },
    closed_at:   { type: Date, default: null },
    last_reply_at: { type: Date, default: null },
    satisfaction_rating: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true }
);

// Auto-generate ticket number before validation (so required check passes)
ticketSchema.pre("validate", async function (next) {
  if (!this.ticket_number) {
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticket_number = `TKT-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("SupportTicket", ticketSchema);
