const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const Cart = require("../../../../../models/Cart");
const Product = require("../../../../../models/Product");
const Coupon = require("../../../../../models/Coupon");

class CartController {
  async getCart(req, res) {
    try {
      let cart = await Cart.findOne({ user_id: req.user.user }).populate(
        "items.product_id",
        "name thumbnail price mrp discount_percent stock status"
      );

      if (!cart) {
        cart = new Cart({ user_id: req.user.user, items: [] });
        await cart.save();
      }

      return Base.sendResponse(res, HTTPS.OK, cart);
    } catch (error) {
      console.error("getCart error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async addToCart(req, res) {
    try {
      const { product_id, variant_id, quantity = 1 } = req.body;

      const product = await Product.findById(product_id);
      if (!product || !product.status) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");
      }

      // Find variant price if applicable
      let price = product.price;
      let mrp = product.mrp;
      if (variant_id && product.variants.length > 0) {
        const variant = product.variants.id(variant_id);
        if (variant) {
          price = variant.price;
          mrp = variant.mrp;
        }
      }

      let cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) {
        cart = new Cart({ user_id: req.user.user, items: [] });
      }

      // Check if item already exists
      const existingIndex = cart.items.findIndex(
        (item) =>
          item.product_id.toString() === product_id &&
          (!variant_id || item.variant_id?.toString() === variant_id) &&
          !item.saved_for_later
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += Number(quantity);
      } else {
        cart.items.push({
          product_id,
          variant_id: variant_id || null,
          quantity: Number(quantity),
          price,
          mrp,
        });
      }

      await cart.save();
      await cart.populate("items.product_id", "name thumbnail price mrp stock status");
      return Base.sendResponse(res, HTTPS.OK, cart, "Item added to cart");
    } catch (error) {
      console.error("addToCart error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async updateQuantity(req, res) {
    try {
      const { item_id, quantity } = req.body;

      if (quantity < 1) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Quantity must be at least 1");
      }

      const cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) return Base.sendError(res, HTTPS.NOT_FOUND, "Cart not found");

      const item = cart.items.id(item_id);
      if (!item) return Base.sendError(res, HTTPS.NOT_FOUND, "Item not found in cart");

      item.quantity = Number(quantity);
      await cart.save();
      return Base.sendResponse(res, HTTPS.OK, cart, "Quantity updated");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async removeFromCart(req, res) {
    try {
      const cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) return Base.sendError(res, HTTPS.NOT_FOUND, "Cart not found");

      cart.items = cart.items.filter(
        (item) => item._id.toString() !== req.params.item_id
      );
      await cart.save();
      return Base.sendResponse(res, HTTPS.OK, cart, "Item removed from cart");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async saveForLater(req, res) {
    try {
      const cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) return Base.sendError(res, HTTPS.NOT_FOUND, "Cart not found");

      const item = cart.items.id(req.params.item_id);
      if (!item) return Base.sendError(res, HTTPS.NOT_FOUND, "Item not found");

      item.saved_for_later = !item.saved_for_later;
      await cart.save();
      return Base.sendResponse(res, HTTPS.OK, cart, item.saved_for_later ? "Saved for later" : "Moved to cart");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async applyCoupon(req, res) {
    try {
      const { code } = req.body;
      const cart = await Cart.findOne({ user_id: req.user.user });
      if (!cart) return Base.sendError(res, HTTPS.NOT_FOUND, "Cart not found");

      const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: true, is_active: true });
      if (!coupon) return Base.sendError(res, HTTPS.NOT_FOUND, { code: "Invalid coupon" });
      if (new Date() > coupon.end_date) return Base.sendError(res, HTTPS.BAD_REQUEST, { code: "Coupon expired" });

      const subtotal = cart.items
        .filter((i) => !i.saved_for_later)
        .reduce((s, i) => s + i.price * i.quantity, 0);

      if (subtotal < coupon.min_order_amount) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, {
          code: `Min order ₹${coupon.min_order_amount} required`,
        });
      }

      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
      } else {
        discount = coupon.discount_value;
      }

      cart.coupon_id = coupon._id;
      cart.coupon_discount = Math.round(discount);
      await cart.save();

      return Base.sendResponse(res, HTTPS.OK, cart, `Coupon applied. Saved ₹${Math.round(discount)}`);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async removeCoupon(req, res) {
    try {
      await Cart.findOneAndUpdate(
        { user_id: req.user.user },
        { coupon_id: null, coupon_discount: 0 }
      );
      return Base.sendResponse(res, HTTPS.OK, null, "Coupon removed");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async clearCart(req, res) {
    try {
      await Cart.findOneAndUpdate(
        { user_id: req.user.user },
        { items: [], coupon_id: null, coupon_discount: 0 }
      );
      return Base.sendResponse(res, HTTPS.OK, null, "Cart cleared");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new CartController();
