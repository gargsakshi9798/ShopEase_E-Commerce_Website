/**
 * razorpay.service.js
 *
 * Pure business-logic layer for all Razorpay operations.
 * Controllers call these functions — no req/res objects here.
 *
 * Exports:
 *   createOrder          – create a Razorpay order
 *   verifySignature      – HMAC-SHA256 signature verification
 *   initiateRefund       – trigger a full or partial refund
 *   fetchOrder           – fetch a Razorpay order by ID
 *   fetchPayment         – fetch a Razorpay payment by ID
 *   processWebhookEvent  – validate & handle incoming webhook events
 */

"use strict";

const crypto   = require("crypto");
const { getRazorpayInstance, isRazorpayConfigured } = require("./razorpay.config");

const Order        = require("../../models/Order");
const Payment      = require("../../models/Payment");
const Notification = require("../../models/Notification");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps Razorpay SDK calls and normalises their error format.
 * The SDK throws plain objects, not Error instances — this converts them.
 */
const safeRzpCall = async (fn) => {
  try {
    return await fn();
  } catch (raw) {
    const description =
      raw?.error?.description ||
      raw?.error?.reason     ||
      raw?.message           ||
      "Razorpay API error";
    const code = raw?.statusCode || raw?.error?.code || 500;
    const err  = new Error(description);
    err.statusCode   = code;
    err.razorpayError = raw?.error || raw;
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. createOrder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Razorpay order.
 *
 * @param {object} params
 * @param {number} params.amount       - Amount in RUPEES (converted to paise internally)
 * @param {string} [params.currency]   - Defaults to "INR"
 * @param {string} [params.receipt]    - Short reference string (max 40 chars)
 * @param {object} [params.notes]      - Key-value metadata (max 15 pairs)
 *
 * @returns {Promise<object>} Razorpay order object
 * @throws  {Error} if keys are not configured or Razorpay API fails
 */
const createOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  if (!isRazorpayConfigured()) {
    const err = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env"
    );
    err.statusCode = 503;
    throw err;
  }

  if (!amount || amount <= 0) {
    const err = new Error("Order amount must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  const rzp = getRazorpayInstance();

  return safeRzpCall(() =>
    rzp.orders.create({
      amount:   Math.round(amount * 100), // rupees → paise
      currency,
      receipt:  receipt || `rcpt_${Date.now()}`,
      notes,
    })
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. verifySignature
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies Razorpay payment signature (HMAC-SHA256).
 * Must be called server-side — never trust client-side verification.
 *
 * @param {string} razorpay_order_id
 * @param {string} razorpay_payment_id
 * @param {string} razorpay_signature   - Signature received from Razorpay checkout
 *
 * @returns {boolean} true if signature is valid
 * @throws  {Error}   if any argument is missing
 */
const verifySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const err = new Error("razorpay_order_id, razorpay_payment_id and razorpay_signature are all required");
    err.statusCode = 400;
    throw err;
  }

  const secret   = process.env.RAZORPAY_KEY_SECRET;
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(razorpay_signature, "hex")
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. initiateRefund
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initiates a full or partial refund for a Razorpay payment.
 * Also updates the Payment and Order documents in MongoDB.
 *
 * @param {object} params
 * @param {string} params.razorpay_payment_id  - Payment ID from Razorpay (pay_xxx)
 * @param {number} [params.amount]             - Refund amount in RUPEES. Omit for full refund.
 * @param {string} [params.reason]             - "duplicate" | "fraudulent" | "customer_request"
 * @param {string} [params.notes]              - Internal notes (not shown to customer)
 * @param {string} params.order_id             - MongoDB Order _id (to update DB records)
 *
 * @returns {Promise<object>} Razorpay refund object
 */
const initiateRefund = async ({
  razorpay_payment_id,
  amount,
  reason = "customer_request",
  notes  = "",
  order_id,
}) => {
  if (!razorpay_payment_id) {
    const err = new Error("razorpay_payment_id is required to initiate a refund");
    err.statusCode = 400;
    throw err;
  }

  const rzp = getRazorpayInstance();

  const refundPayload = {
    speed:  "normal",
    notes:  { reason: notes || reason },
  };

  // If amount is provided, convert to paise; otherwise Razorpay does a full refund
  if (amount && amount > 0) {
    refundPayload.amount = Math.round(amount * 100);
  }

  const refund = await safeRzpCall(() =>
    rzp.payments.refund(razorpay_payment_id, refundPayload)
  );

  // ── Update MongoDB records ────────────────────────────────────────────────
  const updatePayload = {
    payment_status: "refunded",
    refund_id:      refund.id,
    refunded_at:    new Date(),
  };

  await Promise.all([
    Payment.findOneAndUpdate(
      { razorpay_payment_id },
      { $set: updatePayload }
    ),
    order_id
      ? Order.findByIdAndUpdate(order_id, {
          $set: {
            payment_status: "refunded",
            order_status:   "refunded",
          },
          $push: {
            status_history: {
              status:     "refunded",
              note:       `Refund initiated (ID: ${refund.id}). Reason: ${reason}`,
              changed_at: new Date(),
            },
          },
        })
      : Promise.resolve(),
  ]);

  return refund;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. fetchOrder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a Razorpay order by its order ID (order_xxx).
 *
 * @param {string} razorpayOrderId
 * @returns {Promise<object>}
 */
const fetchOrder = async (razorpayOrderId) => {
  if (!razorpayOrderId) {
    const err = new Error("razorpayOrderId is required");
    err.statusCode = 400;
    throw err;
  }
  const rzp = getRazorpayInstance();
  return safeRzpCall(() => rzp.orders.fetch(razorpayOrderId));
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. fetchPayment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a Razorpay payment by its payment ID (pay_xxx).
 *
 * @param {string} razorpayPaymentId
 * @returns {Promise<object>}
 */
const fetchPayment = async (razorpayPaymentId) => {
  if (!razorpayPaymentId) {
    const err = new Error("razorpayPaymentId is required");
    err.statusCode = 400;
    throw err;
  }
  const rzp = getRazorpayInstance();
  return safeRzpCall(() => rzp.payments.fetch(razorpayPaymentId));
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. processWebhookEvent
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates the Razorpay webhook signature and dispatches to the correct
 * internal handler based on event type.
 *
 * Supported events:
 *   payment.captured   → mark Payment + Order as paid
 *   payment.failed     → mark Payment + Order as failed, notify user
 *   refund.created     → record refund_id, mark as refunded
 *   order.paid         → no-op (handled by payment.captured)
 *
 * @param {string} rawBody        - Exact raw request body (Buffer or string)
 * @param {string} webhookSecret  - From process.env.RAZORPAY_WEBHOOK_SECRET
 * @param {string} receivedSig    - x-razorpay-signature header value
 *
 * @returns {Promise<{ handled: boolean, event: string }>}
 */
const processWebhookEvent = async (rawBody, webhookSecret, receivedSig) => {
  // ── 1. Verify webhook signature ───────────────────────────────────────────
  if (!webhookSecret) {
    throw Object.assign(new Error(
      "RAZORPAY_WEBHOOK_SECRET is not set in server/.env"
    ), { statusCode: 503 });
  }

  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const signaturesMatch = (() => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSig, "hex"),
        Buffer.from(receivedSig  || "", "hex")
      );
    } catch {
      return false;
    }
  })();

  if (!signaturesMatch) {
    throw Object.assign(new Error("Webhook signature verification failed"), {
      statusCode: 400,
    });
  }

  // ── 2. Parse payload ──────────────────────────────────────────────────────
  const payload = JSON.parse(rawBody.toString());
  const event   = payload?.event;

  console.log(`[RazorpayWebhook] Received event: ${event}`);

  // ── 3. Dispatch ───────────────────────────────────────────────────────────
  switch (event) {

    case "payment.captured": {
      const p = payload.payload?.payment?.entity;
      if (!p) break;

      await Payment.findOneAndUpdate(
        { razorpay_order_id: p.order_id },
        {
          $set: {
            payment_status:      "success",
            razorpay_payment_id: p.id,
            transaction_id:      p.id,
          },
        }
      );

      await Order.findOneAndUpdate(
        { razorpay_order_id: p.order_id },
        {
          $set: { payment_status: "paid" },
          $push: {
            status_history: {
              status:     "confirmed",
              note:       `Payment captured via webhook (pay_id: ${p.id})`,
              changed_at: new Date(),
            },
          },
        }
      );
      break;
    }

    case "payment.failed": {
      const p = payload.payload?.payment?.entity;
      if (!p) break;

      const failReason =
        p?.error_description || p?.error_reason || "Payment failed";

      await Payment.findOneAndUpdate(
        { razorpay_order_id: p.order_id },
        {
          $set: {
            payment_status: "failed",
            failure_reason: failReason,
          },
        }
      );

      const order = await Order.findOneAndUpdate(
        { razorpay_order_id: p.order_id },
        {
          $set: { payment_status: "failed", order_status: "cancelled" },
          $push: {
            status_history: {
              status:     "cancelled",
              note:       `Payment failed: ${failReason}`,
              changed_at: new Date(),
            },
          },
        },
        { new: true }
      );

      // Notify customer
      if (order?.user_id) {
        await Notification.create({
          user_id:        order.user_id,
          title:          "Payment Failed ❌",
          message:        `Your payment for order #${order.order_number} failed. Reason: ${failReason}`,
          type:           "payment",
          reference_id:   order._id,
          reference_type: "Order",
        });
      }
      break;
    }

    case "refund.created": {
      const r = payload.payload?.refund?.entity;
      if (!r) break;

      await Payment.findOneAndUpdate(
        { razorpay_payment_id: r.payment_id },
        {
          $set: {
            payment_status: "refunded",
            refund_id:      r.id,
            refunded_at:    new Date(r.created_at * 1000),
          },
        }
      );

      await Order.findOneAndUpdate(
        { razorpay_payment_id: r.payment_id },
        {
          $set: { payment_status: "refunded", order_status: "refunded" },
          $push: {
            status_history: {
              status:     "refunded",
              note:       `Refund created via webhook (refund_id: ${r.id})`,
              changed_at: new Date(),
            },
          },
        }
      );
      break;
    }

    case "order.paid":
      // Handled by payment.captured — no duplicate processing needed
      break;

    default:
      console.log(`[RazorpayWebhook] Unhandled event: ${event}`);
      return { handled: false, event };
  }

  return { handled: true, event };
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  createOrder,
  verifySignature,
  initiateRefund,
  fetchOrder,
  fetchPayment,
  processWebhookEvent,
};
