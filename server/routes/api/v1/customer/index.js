const express = require("express");
const router = express.Router();
const { CustomerMiddleware } = require("../../../../middleware/auth.middleware");

// Cart
router.use("/cart", CustomerMiddleware, require("./cart/index"));

// Wishlist
router.use("/wishlist", CustomerMiddleware, require("./wishlist/index"));

// Orders
router.use("/orders", CustomerMiddleware, require("./order/index"));

// Address
router.use("/address", CustomerMiddleware, require("./address/index"));

// Profile
router.use("/profile", CustomerMiddleware, require("./profile/index"));

// Reviews
router.use("/reviews", CustomerMiddleware, require("./review/index"));

// Notifications
router.use("/notifications", CustomerMiddleware, require("./notification/index"));

// Payment & Checkout (includes Razorpay + COD + Invoice)
// Note: CustomerMiddleware is applied inside payment/index.js
router.use("/payment", require("./payment/index"));

// Support Tickets (customer — view own tickets, create, reply)
router.use("/support/tickets", CustomerMiddleware, require("./support/index"));

// Contact form options — fetch department-specific items (orders, products, etc.)
router.use("/contact", CustomerMiddleware, require("./contact/index"));

// Account Deletion Requests
router.use("/account-deletion", CustomerMiddleware, require("./account_deletion/index"));

// Customer Coupons — browse available public coupons
router.get("/coupons", CustomerMiddleware, async (req, res) => {
  const Base = require("../../../../helper/exception_handling/index.js");
  const { HTTPS } = require("../../../../helper/https-status-codes/https-status-codes");
  const Coupon = require("../../../../models/Coupon");
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      is_active: true,
      status: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
      $or: [
        { usage_limit: null },
        { $expr: { $lt: ["$used_count", "$usage_limit"] } },
      ],
      applicable_for: { $in: ["all", "user"] },
    })
      .select("code title description discount_type discount_value min_order_amount max_discount_amount end_date applicable_for")
      .sort({ createdAt: -1 })
      .limit(50);
    return Base.sendResponse(res, HTTPS.OK, coupons);
  } catch (err) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
  }
});

module.exports = router;
