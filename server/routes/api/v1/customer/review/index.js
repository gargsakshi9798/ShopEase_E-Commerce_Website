const express = require("express");
const router = express.Router();
const reviewController = require("../../../../../controllers/api/v1/customer/review/review.controller");

router.get("/product/:product_id", reviewController.getProductReviews);
router.post("/", reviewController.addReview);
router.patch("/:id/helpful", reviewController.markHelpful);

module.exports = router;
