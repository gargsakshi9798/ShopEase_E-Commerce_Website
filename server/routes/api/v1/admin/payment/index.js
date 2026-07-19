/**
 * Admin Payment Routes
 * Base path: /api/v1/admin/payment
 * All routes are protected by AuthMiddleware (applied in admin/index.js).
 *
 * POST  /refund              → Initiate a Razorpay refund
 * GET   /refund/:order_id    → Get refund status for an order
 * GET   /refunds             → List all refunded payments (paginated)
 */

"use strict";

const express          = require("express");
const router           = express.Router();
const refundController = require("../../../../../controllers/api/v1/admin/payment/refund.controller");

// Initiate a refund
// Body: { order_id, amount?, reason?, notes? }
router.post("/refund", refundController.initiateRefund.bind(refundController));

// Get refund status for a specific order
router.get("/refund/:order_id", refundController.getRefundStatus.bind(refundController));

// List all refunded payments
// Query: ?page=1&limit=20&status=refunded
router.get("/refunds", refundController.listRefunds.bind(refundController));

module.exports = router;
