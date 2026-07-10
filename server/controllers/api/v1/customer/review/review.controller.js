const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload } = require("../../../../../helper/common/utils");
const Review = require("../../../../../models/Review");
const Product = require("../../../../../models/Product");
const Order = require("../../../../../models/Order");

class ReviewController {
  async getProductReviews(req, res) {
    try {
      const { product_id } = req.params;
      const { rating } = req.query;
      const filter = { product_id, is_approved: true };
      if (rating) filter.rating = Number(rating);

      return Paginate(
        Review,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [{ path: "user_id", select: "name profile_image" }],
        },
        req,
        res
      );
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async addReview(req, res) {
    try {
      const { product_id, order_id, rating, title, review } = req.body;
      const userId = req.user.user;

      const existing = await Review.findOne({ product_id, user_id: userId });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, "You already reviewed this product");

      // Check verified purchase
      let is_verified_purchase = false;
      if (order_id) {
        const order = await Order.findOne({
          _id: order_id,
          user_id: userId,
          "items.product_id": product_id,
          order_status: "delivered",
        });
        if (order) is_verified_purchase = true;
      }

      const data = {
        product_id,
        user_id: userId,
        order_id: order_id || null,
        rating: Number(rating),
        title,
        review,
        is_verified_purchase,
        images: [],
      };

      if (req.files?.images) {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        data.images = await Promise.all(images.map((img) => FileUpload(img, "/reviews")));
      }

      const newReview = new Review(data);
      await newReview.save();

      // Update product rating
      const allReviews = await Review.find({ product_id, is_approved: true });
      const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await Product.findByIdAndUpdate(product_id, {
        rating_avg: Math.round(avgRating * 10) / 10,
        rating_count: allReviews.length,
      });

      return Base.sendResponse(res, HTTPS.CREATED, newReview, "Review added successfully");
    } catch (error) {
      console.error("addReview error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async markHelpful(req, res) {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return Base.sendError(res, HTTPS.NOT_FOUND, "Review not found");

      const userId = req.user.user;
      const alreadyMarked = review.helpful_by.includes(userId);

      if (alreadyMarked) {
        review.helpful_by = review.helpful_by.filter((id) => id.toString() !== userId);
        review.helpful_count = Math.max(0, review.helpful_count - 1);
      } else {
        review.helpful_by.push(userId);
        review.helpful_count += 1;
      }

      await review.save();
      return Base.sendResponse(res, HTTPS.OK, null, alreadyMarked ? "Unmarked" : "Marked as helpful");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new ReviewController();
