/**
 * Customer Payment Routes
 * Base path: /api/v1/customer/payment
 *
 * All routes here are protected by CustomerMiddleware (applied once below).
 *
 * Sub-routers:
 *   /validate-checkout    → payment.controller  (cart + address validation)
 *   /razorpay/*           → razorpay.routes     (create-order, verify, status checks)
 *   /cod/place-order      → payment.controller  (cash on delivery)
 *   /invoice/:order_id    → payment.controller  (fetch invoice)
 */

"use strict";

const express           = require("express");
const router            = express.Router();
const { CustomerMiddleware } = require("../../../../../middleware/auth.middleware");

// Legacy controller — still handles validate-checkout, COD, and invoice
const paymentController = require("../../../../../controllers/api/v1/customer/payment/payment.controller");

// Dedicated Razorpay router (create-order, verify, order/payment status)
const razorpayRoutes    = require("./razorpay.routes");

// All payment routes require an authenticated customer
router.use(CustomerMiddleware);

// ── 1. Checkout Validation ────────────────────────────────────────────────────
// POST /customer/payment/validate-checkout
router.post("/validate-checkout", paymentController.validateCheckout);

// ── 2. Razorpay (delegated to dedicated router) ───────────────────────────────
// POST /customer/payment/razorpay/create-order
// POST /customer/payment/razorpay/verify
// GET  /customer/payment/razorpay/order/:rzp_order_id
// GET  /customer/payment/razorpay/payment/:rzp_payment_id
router.use("/razorpay", razorpayRoutes);

// ── 3. Cash on Delivery ───────────────────────────────────────────────────────
// POST /customer/payment/cod/place-order
router.post("/cod/place-order", paymentController.placeCODOrder);

// ── 4. Invoice ────────────────────────────────────────────────────────────────
// GET /customer/payment/invoice/:order_id
router.get("/invoice/:order_id", paymentController.getInvoice);

module.exports = router;
