const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    module: { type: String, required: true }, // e.g., "Products", "Orders"
    action: { type: String, required: true }, // e.g., "create", "read", "update", "delete"
    permission_id: { type: Number, required: true, unique: true }, // numeric ID for easy check
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
