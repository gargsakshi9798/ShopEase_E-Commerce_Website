/**
 * razorpay.webhook.js
 *
 * Razorpay webhook endpoint.
 * IMPORTANT: This route must receive the RAW (unparsed) request body so the
 * HMAC-SHA256 signature can be recomputed. It must be mounted BEFORE
 * express.json() in index.js, or the rawBody middleware below must be used.
 *
 * Mount in server/index.js:
 *   app.use(
 *     "/api/v1/webhook/razorpay",
 *     express.raw({ type: "application/json" }),   // ← raw body, not parsed JSON
 *     require("./routes/api/v1/webhook/razorpay.webhook")
 *   );
 *
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:    https://yourdomain.com/api/v1/webhook/razorpay
 *   Secret: value of RAZORPAY_WEBHOOK_SECRET in server/.env
 *   Events: payment.captured, payment.failed, refund.created, order.paid
 *
 * Base path: /api/v1/webhook/razorpay
 * POST / → handleWebhook
 */

"use strict";

const express = require("express");
const router  = express.Router();

const Base    = require("../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../helper/https-status-codes/https-status-codes");
const RazorpayService = require("../../../../services/razorpay/razorpay.service");

/**
 * POST /api/v1/webhook/razorpay
 *
 * Razorpay sends a POST with JSON body + x-razorpay-signature header.
 * We MUST respond with 200 quickly — Razorpay retries on any non-2xx.
 *
 * Security:
 *   - Verifies x-razorpay-signature using HMAC-SHA256 with RAZORPAY_WEBHOOK_SECRET
 *   - Uses crypto.timingSafeEqual to prevent timing attacks
 *   - Always responds 200 even for unknown events to suppress retries
 */
router.post("/", async (req, res) => {
  const receivedSig    = req.headers["x-razorpay-signature"];
  const webhookSecret  = process.env.RAZORPAY_WEBHOOK_SECRET;

  // ── Guard: webhook secret must be configured ──────────────────────────────
  if (!webhookSecret || webhookSecret === "your_razorpay_webhook_secret") {
    console.error("[RazorpayWebhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    // Still return 200 to prevent Razorpay flood-retrying
    return res.status(200).json({ received: true, warning: "Webhook secret not configured" });
  }

  // ── Guard: signature header must be present ───────────────────────────────
  if (!receivedSig) {
    console.warn("[RazorpayWebhook] Request missing x-razorpay-signature header");
    return res.status(400).json({ success: false, message: "Missing webhook signature" });
  }

  // ── Process ───────────────────────────────────────────────────────────────
  try {
    // req.body is a Buffer because we mount with express.raw()
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

    const result = await RazorpayService.processWebhookEvent(
      rawBody,
      webhookSecret,
      receivedSig
    );

    console.log(`[RazorpayWebhook] Processed — event: ${result.event}, handled: ${result.handled}`);

    // Always 200 — Razorpay considers anything else a failure and retries
    return res.status(200).json({ received: true, event: result.event, handled: result.handled });

  } catch (err) {
    // Signature mismatch → 400 (tells Razorpay something is genuinely wrong)
    if (err.statusCode === 400) {
      console.warn("[RazorpayWebhook] Signature mismatch:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    // All other errors → still 200 to suppress retries, but log for investigation
    console.error("[RazorpayWebhook] Processing error:", err.message, err.stack);
    return res.status(200).json({ received: true, error: err.message });
  }
});

module.exports = router;
