const express = require("express");
const router = express.Router();
const wishlistController = require("../../../../../controllers/api/v1/customer/wishlist/wishlist.controller");

router.get("/", wishlistController.getWishlist);
router.post("/toggle", wishlistController.toggle);
router.delete("/:id", wishlistController.remove);
router.post("/:id/move-to-cart", wishlistController.moveToCart);

module.exports = router;
