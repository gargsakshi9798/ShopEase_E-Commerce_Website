const express = require("express");
const router = express.Router();
const { CustomerMiddleware } = require("../../../../../middleware/auth.middleware");
const paymentController = require("../../../../../controllers/api/v1/customer/payment/payment.controller");

// All routes require customer auth
router.use(CustomerMiddleware);

// ── Checkout Validation ───────────────────────────────────────────────────────
// POST /customer/payment/validate-checkout
// Validates address + cart + pricing before showing order summary
router.post("/validate-checkout", paymentController.validateCheckout);

// ── Razorpay ──────────────────────────────────────────────────────────────────
// POST /customer/payment/razorpay/create-order
// Creates a Razorpay order and returns order_id + amount
router.post("/razorpay/create-order", paymentController.createRazorpayOrder);

// POST /customer/payment/razorpay/verify
// Verifies Razorpay signature, then creates order atomically
router.post("/razorpay/verify", paymentController.verifyAndCreateOrder);

// ── COD ───────────────────────────────────────────────────────────────────────
// POST /customer/payment/cod/place-order
router.post("/cod/place-order", paymentController.placeCODOrder);

// ── Invoice ───────────────────────────────────────────────────────────────────
// GET /customer/payment/invoice/:order_id
router.get("/invoice/:order_id", paymentController.getInvoice);

module.exports = router;
