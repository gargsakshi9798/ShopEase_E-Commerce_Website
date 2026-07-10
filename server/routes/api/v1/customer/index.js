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

module.exports = router;
