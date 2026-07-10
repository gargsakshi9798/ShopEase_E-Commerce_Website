const express = require("express");
const router = express.Router();

// Public routes
router.use("/public", require("./public/index"));

// Common routes (auth)
router.use("/common", require("./common/index"));

// Admin routes (protected)
router.use("/admin", require("./admin/index"));

// Customer routes (protected)
router.use("/customer", require("./customer/index"));

module.exports = router;
