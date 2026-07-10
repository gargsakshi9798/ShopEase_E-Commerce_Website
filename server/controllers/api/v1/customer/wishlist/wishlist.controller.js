const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate } = require("../../../../../helper/common/utils");
const Wishlist = require("../../../../../models/Wishlist");
const Cart = require("../../../../../models/Cart");
const Product = require("../../../../../models/Product");

class WishlistController {
  async getWishlist(req, res) {
    try {
      return Paginate(
        Wishlist,
        {
          filter: { user_id: req.user.user },
          sort: { createdAt: -1 },
          populate: [{ path: "product_id", select: "name thumbnail price mrp discount_percent rating_avg status" }],
        },
        req,
        res
      );
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async toggle(req, res) {
    try {
      const { product_id } = req.body;

      const existing = await Wishlist.findOne({ user_id: req.user.user, product_id });

      if (existing) {
        await Wishlist.findByIdAndDelete(existing._id);
        return Base.sendResponse(res, HTTPS.OK, { added: false }, "Removed from wishlist");
      } else {
        const product = await Product.findById(product_id);
        if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");

        await Wishlist.create({ user_id: req.user.user, product_id });
        return Base.sendResponse(res, HTTPS.CREATED, { added: true }, "Added to wishlist");
      }
    } catch (error) {
      console.error("wishlist toggle error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(req, res) {
    try {
      await Wishlist.findOneAndDelete({ _id: req.params.id, user_id: req.user.user });
      return Base.sendResponse(res, HTTPS.OK, null, "Removed from wishlist");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async moveToCart(req, res) {
    try {
      const wishlistItem = await Wishlist.findOne({
        _id: req.params.id,
        user_id: req.user.user,
      }).populate("product_id");

      if (!wishlistItem) return Base.sendError(res, HTTPS.NOT_FOUND, "Item not found in wishlist");

      const product = wishlistItem.product_id;

      let cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) {
        cart = new Cart({ user_id: req.user.user, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === product._id.toString() && !item.saved_for_later
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += 1;
      } else {
        cart.items.push({
          product_id: product._id,
          quantity: 1,
          price: product.price,
          mrp: product.mrp,
        });
      }

      await cart.save();
      await Wishlist.findByIdAndDelete(req.params.id);

      return Base.sendResponse(res, HTTPS.OK, null, "Moved to cart");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new WishlistController();
