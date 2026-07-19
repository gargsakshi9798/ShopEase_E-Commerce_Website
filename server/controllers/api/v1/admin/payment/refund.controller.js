/**
 * refund.controller.js  (Admin-facing)
 *
 * Handles Razorpay refunds initiated by admins through the dashboard.
 *
 * Routes:
 *   POST /admin/payment/refund              → initiateRefund
 *   GET  /admin/payment/refund/:order_id    → getRefundStatus
 *   GET  /admin/payment/refunds             → listRefunds
 */

"use strict";

const Base     = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");

const RazorpayService = require("../../../../../services/razorpay/razorpay.service");

const Order    = require("../../../../../models/Order");
const Payment  = require("../../../../../models/Payment");
const Notification = require("../../../../../models/Notification");

// Valid refund reasons accepted by Razorpay
const VALID_REASONS = new Set(["duplicate", "fraudulent", "customer_request"]);

class RefundController {

  // ── 1. Initiate Refund ───────────────────────────────────────────────────
  /**
   * POST /admin/payment/refund
   * Body: {
   *   order_id,           – MongoDB Order _id (required)
   *   amount?,            – Partial refund amount in ₹. Omit for full refund.
   *   reason?,            – "duplicate" | "fraudulent" | "customer_request"
   *   notes?              – Internal note for audit trail
   * }
   *
   * Flow:
   *   1. Validate the order exists and payment is in a refundable state
   *   2. Pull razorpay_payment_id from the linked Payment document
   *   3. Call RazorpayService.initiateRefund
   *   4. Notify the customer
   */
  async initiateRefund(req, res) {
    try {
      const { order_id, amount, reason = "customer_request", notes = "" } = req.body;

      if (!order_id) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "order_id is required");
      }

      const normalizedReason = VALID_REASONS.has(reason) ? reason : "customer_request";

      // ── Fetch the order ──────────────────────────────────────────────────
      const order = await Order.findById(order_id);
      if (!order) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");
      }

      // ── Guard: only online-paid orders can be refunded ───────────────────
      if (order.payment_method === "cod") {
        return Base.sendError(
          res, HTTPS.BAD_REQUEST,
          "COD orders cannot be refunded via Razorpay. Issue store credit manually."
        );
      }
      if (order.payment_status === "refunded") {
        return Base.sendError(res, HTTPS.CONFLICT, "This order has already been refunded");
      }
      if (order.payment_status !== "paid") {
        return Base.sendError(
          res, HTTPS.BAD_REQUEST,
          `Cannot refund an order with payment_status "${order.payment_status}"`
        );
      }

      // ── Fetch the payment record ─────────────────────────────────────────
      const paymentRecord = await Payment.findOne({ order_id });
      if (!paymentRecord?.razorpay_payment_id) {
        return Base.sendError(
          res, HTTPS.NOT_FOUND,
          "No Razorpay payment record found for this order"
        );
      }

      // ── Validate partial refund amount ───────────────────────────────────
      if (amount !== undefined) {
        const refundAmount = Number(amount);
        if (isNaN(refundAmount) || refundAmount <= 0) {
          return Base.sendError(res, HTTPS.BAD_REQUEST, "Refund amount must be a positive number");
        }
        if (refundAmount > order.total_amount) {
          return Base.sendError(
            res, HTTPS.BAD_REQUEST,
            `Refund amount (₹${refundAmount}) cannot exceed order total (₹${order.total_amount})`
          );
        }
      }

      // ── Call Razorpay service ────────────────────────────────────────────
      let refund;
      try {
        refund = await RazorpayService.initiateRefund({
          razorpay_payment_id: paymentRecord.razorpay_payment_id,
          amount:              amount ? Number(amount) : undefined,
          reason:              normalizedReason,
          notes,
          order_id,
        });
      } catch (serviceErr) {
        console.error("[RefundController] initiateRefund service error:", serviceErr.message);
        return Base.sendError(
          res,
          { code: serviceErr.statusCode || 500, message: serviceErr.message },
          serviceErr.message
        );
      }

      // ── Notify customer (non-blocking) ───────────────────────────────────
      const refundedAmount = amount ? Number(amount) : order.total_amount;
      Notification.create({
        user_id:        order.user_id,
        title:          "Refund Initiated 💰",
        message:        `A refund of ₹${refundedAmount} for order #${order.order_number} has been initiated. It will reflect in 5–7 business days.`,
        type:           "payment",
        reference_id:   order._id,
        reference_type: "Order",
      }).catch((e) => console.error("[RefundController] notification error:", e.message));

      return Base.sendResponse(res, HTTPS.OK, {
        refund_id:           refund.id,
        razorpay_payment_id: paymentRecord.razorpay_payment_id,
        order_id:            order._id,
        order_number:        order.order_number,
        amount_refunded:     refund.amount / 100,   // paise → rupees
        currency:            refund.currency,
        status:              refund.status,
        reason:              normalizedReason,
        speed:               refund.speed_requested || "normal",
        created_at:          new Date(refund.created_at * 1000),
      }, "Refund initiated successfully");

    } catch (err) {
      console.error("[RefundController] initiateRefund:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 2. Get Refund Status ─────────────────────────────────────────────────
  /**
   * GET /admin/payment/refund/:order_id
   * Returns current refund status from the local Payment document +
   * live status from Razorpay if a refund_id exists.
   */
  async getRefundStatus(req, res) {
    try {
      const { order_id } = req.params;

      const paymentRecord = await Payment.findOne({ order_id }).lean();
      if (!paymentRecord) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "No payment record found for this order");
      }

      const response = {
        order_id,
        payment_status:      paymentRecord.payment_status,
        refund_id:           paymentRecord.refund_id   || null,
        refunded_at:         paymentRecord.refunded_at || null,
        razorpay_payment_id: paymentRecord.razorpay_payment_id || null,
        amount:              paymentRecord.amount,
        razorpay_live:       null,
      };

      // Fetch live status from Razorpay if we have a payment ID
      if (paymentRecord.razorpay_payment_id) {
        try {
          const live = await RazorpayService.fetchPayment(paymentRecord.razorpay_payment_id);
          response.razorpay_live = {
            status:   live.status,
            amount:   live.amount / 100,
            captured: live.captured,
            refund_status: live.refund_status || null,
          };
        } catch (rzpErr) {
          // Non-fatal — still return local data
          response.razorpay_live_error = rzpErr.message;
        }
      }

      return Base.sendResponse(res, HTTPS.OK, response);
    } catch (err) {
      console.error("[RefundController] getRefundStatus:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 3. List All Refunds ──────────────────────────────────────────────────
  /**
   * GET /admin/payment/refunds?page=1&limit=20&status=refunded
   * Returns paginated list of refunded payments from the local DB.
   */
  async listRefunds(req, res) {
    try {
      const page   = Math.max(1, parseInt(req.query.page)  || 1);
      const limit  = Math.min(100, parseInt(req.query.limit) || 20);
      const skip   = (page - 1) * limit;
      const status = req.query.status || "refunded";

      const filter = { payment_status: status };

      const [records, total] = await Promise.all([
        Payment.find(filter)
          .sort({ refunded_at: -1 })
          .skip(skip)
          .limit(limit)
          .populate({ path: "order_id", select: "order_number total_amount order_status" })
          .populate({ path: "user_id",  select: "name email" })
          .lean(),
        Payment.countDocuments(filter),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        records,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("[RefundController] listRefunds:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

module.exports = new RefundController();
