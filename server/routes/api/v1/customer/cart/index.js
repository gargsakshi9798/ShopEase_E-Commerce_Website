const express = require("express");
const router = express.Router();
const cartController = require("../../../../../controllers/api/v1/customer/cart/cart.controller");

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateQuantity);
router.delete("/item/:item_id", cartController.removeFromCart);
router.patch("/save-later/:item_id", cartController.saveForLater);
router.post("/apply-coupon", cartController.applyCoupon);
router.delete("/remove-coupon", cartController.removeCoupon);
router.delete("/clear", cartController.clearCart);

module.exports = router;
