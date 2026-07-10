const express = require("express");
const router = express.Router();
const orderController = require("../../../../../controllers/api/v1/admin/order_management/order.controller");

router.get("/", orderController.getAll);
router.get("/stats", orderController.getOrderStats);
router.get("/:id", orderController.getById);
router.patch("/:id/status", orderController.updateStatus);
router.patch("/:id/assign", orderController.assignEmployee);

module.exports = router;
