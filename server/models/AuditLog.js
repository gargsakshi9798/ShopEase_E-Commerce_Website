const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: { type: String, required: true }, // e.g., "CREATE", "UPDATE", "DELETE", "LOGIN"
    module: { type: String, required: true }, // e.g., "Products", "Orders"
    description: { type: String, required: true },
    reference_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    ip_address: { type: String, default: null },
    user_agent: { type: String, default: null },
    old_data: { type: Object, default: null },
    new_data: { type: Object, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
