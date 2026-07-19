/**
 * razorpay.routes.js  (Customer-facing)
 *
 * All routes here are protected by CustomerMiddleware (applied in
 * customer/index.js before mounting /payment).
 *
 * Base path: /api/v1/customer/payment/razorpay
 *
 * POST   /create-order          → Create a Razorpay order
 * POST   /verify                → Verify payment signature + persist order
 * GET    /order/:rzp_order_id   → Fetch live Razorpay order status
 * GET    /payment/:rzp_pay_id   → Fetch live Razorpay payment status
 */

"use strict";

const express           = require("express");
const router            = express.Router();
const razorpayController = require("../../../../../controllers/api/v1/customer/payment/razorpay.controller");

// POST /customer/payment/razorpay/create-order
// Body: { address_id, cart_items? }
router.post("/create-order", razorpayController.createRazorpayOrder.bind(razorpayController));

// POST /customer/payment/razorpay/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         address_id, payment_method?, cart_items?, notes? }
router.post("/verify", razorpayController.verifyAndCreateOrder.bind(razorpayController));

// GET /customer/payment/razorpay/order/:rzp_order_id
// Fetches live order status from Razorpay (useful for polling on the frontend)
router.get("/order/:rzp_order_id", razorpayController.getRazorpayOrderStatus.bind(razorpayController));

// GET /customer/payment/razorpay/payment/:rzp_payment_id
// Fetches live payment status from Razorpay
router.get("/payment/:rzp_payment_id", razorpayController.getRazorpayPaymentStatus.bind(razorpayController));

module.exports = router;
