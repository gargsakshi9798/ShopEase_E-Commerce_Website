const express = require("express");
const router = express.Router();
const { AuthMiddleware } = require("../../../../middleware/auth.middleware");

// Dashboard
router.use("/dashboard", AuthMiddleware, require("./dashboard/index"));

// Masters
router.use("/masters", AuthMiddleware, require("./masters/index"));

// Product Management
router.use("/product-management", AuthMiddleware, require("./product_management/index"));

// Order Management
router.use("/order-management", AuthMiddleware, require("./order_management/index"));

// User Management
router.use("/user-management", AuthMiddleware, require("./user_management/index"));

// Coupon Management
router.use("/coupon-management", AuthMiddleware, require("./coupon_management/index"));

// Review Management
router.use("/review-management", AuthMiddleware, require("./review_management/index"));

// CMS
router.use("/cms", AuthMiddleware, require("./cms/index"));

// Settings
router.use("/settings", AuthMiddleware, require("./settings/index"));

// Reports
router.use("/reports", AuthMiddleware, require("./reports/index"));

// Roles & Permissions
router.use("/roles", AuthMiddleware, require("./roles/index"));

// Audit Logs
router.use("/audit-logs", AuthMiddleware, require("./audit_logs/index"));

// Support (Tickets + Contact Messages)
router.use("/support", AuthMiddleware, require("./support/index"));

// Notifications
router.use("/notifications", AuthMiddleware, require("./notifications/index"));

module.exports = router;
