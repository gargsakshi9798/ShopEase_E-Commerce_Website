const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, GenerateOrderNumber, GenerateInvoiceNumber } = require("../../../../../helper/common/utils");
const { sendOrderConfirmationEmail } = require("../../../../../helper/NodeMailer");
const Order = require("../../../../../models/Order");
const Cart = require("../../../../../models/Cart");
const Product = require("../../../../../models/Product");
const Address = require("../../../../../models/Address");
const Coupon = require("../../../../../models/Coupon");
const Payment = require("../../../../../models/Payment");
const Notification = require("../../../../../models/Notification");

class CustomerOrderController {
  async placeOrder(req, res) {
    try {
      const {
        address_id,
        payment_method,
        notes,
      } = req.body;

      const userId = req.user.user;

      // Get address
      const address = await Address.findOne({ _id: address_id, user_id: userId });
      if (!address) return Base.sendError(res, HTTPS.NOT_FOUND, "Address not found");

      // Get cart
      const cart = await Cart.findOne({ user_id: userId }).populate(
        "items.product_id",
        "name thumbnail price stock status"
      );

      if (!cart || cart.items.filter((i) => !i.saved_for_later).length === 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Cart is empty");
      }

      const activeItems = cart.items.filter((i) => !i.saved_for_later);

      // Validate stock
      for (const item of activeItems) {
        if (!item.product_id || !item.product_id.status) {
          return Base.sendError(res, HTTPS.BAD_REQUEST, `Product unavailable`);
        }
        if (item.product_id.stock < item.quantity) {
          return Base.sendError(res, HTTPS.BAD_REQUEST, {
            product: `${item.product_id.name} - only ${item.product_id.stock} left in stock`,
          });
        }
      }

      // Calculate totals
      const subtotal = activeItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const shipping_charge = subtotal >= 500 ? 0 : 50;
      const coupon_discount = cart.coupon_discount || 0;
      const tax = Math.round(subtotal * 0.05); // 5% GST
      const total_amount = subtotal + shipping_charge - coupon_discount + tax;

      // Build order items
      const orderItems = activeItems.map((item) => ({
        product_id: item.product_id._id,
        variant_id: item.variant_id || null,
        product_name: item.product_id.name,
        product_image: item.product_id.thumbnail,
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        total: item.price * item.quantity,
      }));

      const order_number = GenerateOrderNumber();

      const order = new Order({
        order_number,
        user_id: userId,
        items: orderItems,
        address: {
          full_name: address.full_name,
          contact_no: address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        subtotal,
        shipping_charge,
        coupon_id: cart.coupon_id || null,
        coupon_discount,
        tax,
        total_amount,
        payment_method,
        payment_status: payment_method === "cod" ? "cod" : "pending",
        order_status: "pending",
        notes: notes || "",
        status_history: [{ status: "pending", note: "Order placed", changed_at: new Date() }],
      });

      await order.save();

      // Reduce stock
      for (const item of activeItems) {
        await Product.findByIdAndUpdate(item.product_id._id, {
          $inc: { stock: -item.quantity, total_sold: item.quantity },
        });
      }

      // Increment coupon usage
      if (cart.coupon_id) {
        await Coupon.findByIdAndUpdate(cart.coupon_id, { $inc: { used_count: 1 } });
      }

      // Clear cart
      await Cart.findOneAndUpdate(
        { user_id: userId },
        { items: [], coupon_id: null, coupon_discount: 0 }
      );

      // Create notification
      await Notification.create({
        user_id: userId,
        title: "Order Placed!",
        message: `Your order #${order_number} has been placed successfully.`,
        type: "order",
        reference_id: order._id,
        reference_type: "Order",
      });

      // Send confirmation email (non-blocking)
      const User = require("../../../../../models/User");
      const user = await User.findById(userId);
      if (user) {
        sendOrderConfirmationEmail(user.email, {
          order_number,
          total_amount,
        }).catch(console.error);
      }

      return Base.sendResponse(res, HTTPS.CREATED, order, "Order placed successfully");
    } catch (error) {
      console.error("placeOrder error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async getMyOrders(req, res) {
    try {
      const filter = { user_id: req.user.user };
      const { order_status } = req.query;
      if (order_status) filter.order_status = order_status;

      return Paginate(
        Order,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [],   // items already embedded; no ref populate needed for list
        },
        req,
        res
      );
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async trackByOrderNumber(req, res) {
    try {
      const order = await Order.findOne({
        order_number: req.params.order_number,
        user_id: req.user.user,
      }).select("order_number order_status payment_status payment_method total_amount estimated_delivery tracking_id courier_name createdAt delivered_at address items invoice_no status_history");

      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");
      return Base.sendResponse(res, HTTPS.OK, order);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user_id: req.user.user,
      });

      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");
      return Base.sendResponse(res, HTTPS.OK, order);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelOrder(req, res) {
    try {
      const cancel_reason = req.body.cancel_reason || req.body.reason || "";
      const order = await Order.findOne({
        _id: req.params.id,
        user_id: req.user.user,
      });

      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");

      const cancellableStatuses = ["pending", "confirmed"];
      if (!cancellableStatuses.includes(order.order_status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Order cannot be cancelled at this stage");
      }

      await Order.findByIdAndUpdate(req.params.id, {
        order_status: "cancelled",
        cancelled_at: new Date(),
        cancel_reason: cancel_reason || "",
        $push: {
          status_history: { status: "cancelled", note: cancel_reason || "Cancelled by customer", changed_at: new Date() },
        },
      });

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: item.quantity, total_sold: -item.quantity },
        });
      }

      return Base.sendResponse(res, HTTPS.OK, null, "Order cancelled successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async requestReturn(req, res) {
    try {
      const { item_id, return_reason } = req.body;
      const order = await Order.findOne({
        _id: req.params.id,
        user_id: req.user.user,
        order_status: "delivered",
      });

      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found or not eligible for return");

      const item = order.items.id(item_id);
      if (!item) return Base.sendError(res, HTTPS.NOT_FOUND, "Order item not found");

      item.return_requested = true;
      item.return_status = "requested";
      item.return_reason = return_reason;
      order.order_status = "return_requested";
      order.status_history.push({ status: "return_requested", note: return_reason, changed_at: new Date() });

      await order.save();
      return Base.sendResponse(res, HTTPS.OK, null, "Return request submitted");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new CustomerOrderController();
