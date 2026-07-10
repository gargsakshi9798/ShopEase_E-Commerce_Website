const express = require("express");
const router = express.Router();
const orderController = require("../../../../../controllers/api/v1/customer/order/order.controller");

router.post("/place", orderController.placeOrder);
router.get("/", orderController.getMyOrders);
router.get("/track/:order_number", orderController.trackByOrderNumber);
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);
router.post("/:id/return", orderController.requestReturn);

module.exports = router;
