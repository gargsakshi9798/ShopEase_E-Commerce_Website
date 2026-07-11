const express = require("express");
const router = express.Router();
const reviewController = require("../../../../../controllers/api/v1/customer/review/review.controller");

router.get("/product/:product_id", reviewController.getProductReviews);
router.get("/my",  reviewController.getMyReviews);      // customer's own reviews
router.post("/",   reviewController.addReview);
router.put("/:id", reviewController.updateReview);       // edit own review
router.delete("/:id", reviewController.deleteReview);    // delete own review
router.patch("/:id/helpful", reviewController.markHelpful);

module.exports = router;
