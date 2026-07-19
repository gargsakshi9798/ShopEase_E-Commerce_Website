const express  = require("express");
const router   = express.Router();
const Base     = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const Order    = require("../../../../../models/Order");
const Review   = require("../../../../../models/Review");

/**
 * GET /customer/contact/options?department=<dept>
 *
 * Returns a list of selectable items relevant to the chosen department.
 * Each item: { _id, label, sub, type }
 *
 * Departments that return data:
 *   "Order & Delivery"  → last 20 orders   (type: order)
 *   "Returns & Refunds" → last 20 orders   (type: order)
 *   "Payment Issue"     → last 20 orders with payment info (type: payment)
 *   "Product Query"     → last 20 ordered products (type: product)
 *   "Feedback / Suggestion" → reviewed products (type: review)
 *
 * Departments that return empty (no reference needed):
 *   "Account Help", "Other"
 */
router.get("/options", async (req, res) => {
  try {
    const userId     = req.user?.user;
    const department = (req.query.department || "").trim();

    // ── Order & Delivery / Returns & Refunds ──────────────────────────────
    if (
      department === "Order & Delivery" ||
      department === "Returns & Refunds"
    ) {
      const orders = await Order.find({ user_id: userId })
        .select("_id order_number order_status total_amount createdAt items")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const options = orders.map((o) => ({
        _id:   o._id,
        label: `Order #${o.order_number}`,
        sub:   `${_statusLabel(o.order_status)} · ₹${o.total_amount.toLocaleString("en-IN")}`,
        type:  "order",
      }));

      return Base.sendResponse(res, HTTPS.OK, options);
    }

    // ── Payment Issue ─────────────────────────────────────────────────────
    if (department === "Payment Issue") {
      const orders = await Order.find({ user_id: userId })
        .select("_id order_number payment_method payment_status total_amount createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const options = orders.map((o) => ({
        _id:   o._id,
        label: `Order #${o.order_number}`,
        sub:   `${_paymentLabel(o.payment_method)} · ${_paymentStatusLabel(o.payment_status)} · ₹${o.total_amount.toLocaleString("en-IN")}`,
        type:  "payment",
      }));

      return Base.sendResponse(res, HTTPS.OK, options);
    }

    // ── Product Query ─────────────────────────────────────────────────────
    if (department === "Product Query") {
      const orders = await Order.find({ user_id: userId })
        .select("_id items.product_id items.product_name items.product_image")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      // Flatten all ordered items, deduplicate by product_id
      const seen    = new Set();
      const options = [];
      for (const order of orders) {
        for (const item of order.items || []) {
          const pid = item.product_id?.toString();
          if (pid && !seen.has(pid)) {
            seen.add(pid);
            options.push({
              _id:   item.product_id,
              label: item.product_name,
              sub:   "From your orders",
              type:  "product",
              image: item.product_image || null,
            });
          }
        }
      }

      return Base.sendResponse(res, HTTPS.OK, options.slice(0, 30));
    }

    // ── Feedback / Suggestion ─────────────────────────────────────────────
    if (department === "Feedback / Suggestion") {
      let options = [];

      // If Review model exists, pull reviewed products
      try {
        const reviews = await Review.find({ user_id: userId })
          .select("_id product_id product_name rating")
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        options = reviews.map((r) => ({
          _id:   r.product_id || r._id,
          label: r.product_name || "Product",
          sub:   `You rated: ${"★".repeat(r.rating || 0)}`,
          type:  "review",
        }));
      } catch (_) {
        // Review model may not exist — return empty gracefully
      }

      return Base.sendResponse(res, HTTPS.OK, options);
    }

    // ── All other departments — no linked options ─────────────────────────
    return Base.sendResponse(res, HTTPS.OK, []);
  } catch (err) {
    console.error("contact options error:", err);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function _statusLabel(status) {
  const map = {
    pending:          "Pending",
    confirmed:        "Confirmed",
    processing:       "Processing",
    packed:           "Packed",
    shipped:          "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered:        "Delivered",
    cancelled:        "Cancelled",
    return_requested: "Return Requested",
    returned:         "Returned",
    refunded:         "Refunded",
  };
  return map[status] || status;
}

function _paymentLabel(method) {
  const map = { cod: "COD", razorpay: "Razorpay", stripe: "Stripe", wallet: "Wallet" };
  return map[method] || method;
}

function _paymentStatusLabel(status) {
  const map = { pending: "Pending", paid: "Paid", failed: "Failed", refunded: "Refunded", cod: "COD" };
  return map[status] || status;
}

module.exports = router;
