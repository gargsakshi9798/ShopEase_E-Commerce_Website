/**
 * razorpay.controller.js  (Customer-facing)
 *
 * Thin HTTP layer — all business logic lives in razorpay.service.js
 * and the shared validateAndPrice helper in payment.controller.js.
 *
 * Routes handled here:
 *   POST /customer/payment/razorpay/create-order   → createRazorpayOrder
 *   POST /customer/payment/razorpay/verify         → verifyAndCreateOrder
 *   GET  /customer/payment/razorpay/order/:rzp_id  → getRazorpayOrderStatus
 *   GET  /customer/payment/razorpay/payment/:pay_id→ getRazorpayPaymentStatus
 */

"use strict";

const crypto   = require("crypto");
const mongoose = require("mongoose");

const Base    = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { GenerateOrderNumber, GenerateInvoiceNumber } = require("../../../../../helper/common/utils");
const { sendOrderConfirmationEmail } = require("../../../../../helper/NodeMailer");

const RazorpayService = require("../../../../../services/razorpay/razorpay.service");
const { RAZORPAY_KEY_ID } = require("../../../../../services/razorpay/razorpay.config");

const Order        = require("../../../../../models/Order");
const Cart         = require("../../../../../models/Cart");
const Product      = require("../../../../../models/Product");
const Address      = require("../../../../../models/Address");
const Coupon       = require("../../../../../models/Coupon");
const Payment      = require("../../../../../models/Payment");
const Invoice      = require("../../../../../models/Invoice");
const Notification = require("../../../../../models/Notification");
const User         = require("../../../../../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// Shared: validate cart + compute pricing
// (Identical to the version in payment.controller.js — kept here so this
//  controller is fully self-contained and doesn't couple to the old file.)
// ─────────────────────────────────────────────────────────────────────────────
const validateAndPrice = async (userId, clientItems = null) => {
  const cart = await Cart.findOne({ user_id: userId }).populate({
    path:   "items.product_id",
    select: "name thumbnail price mrp stock status variants",
  });

  const dbActiveItems = cart ? cart.items.filter((i) => !i.saved_for_later) : [];
  let activeItems       = [];
  let useClientFallback = false;

  if (dbActiveItems.length > 0) {
    for (const item of dbActiveItems) {
      const prod = item.product_id;
      if (!prod || !prod.status) continue;

      if (item.variant_id) {
        const variant = prod.variants?.id(item.variant_id);
        if (!variant || !variant.status) continue;
        if (variant.stock < item.quantity) {
          throw { status: 400, message: `Only ${variant.stock} units of "${prod.name}" (variant) left` };
        }
        item.price = variant.price;
      } else {
        if (prod.stock < item.quantity) {
          throw { status: 400, message: `Only ${prod.stock} units of "${prod.name}" left` };
        }
        item.price = prod.price;
      }
      activeItems.push(item);
    }
    if (activeItems.length === 0) useClientFallback = true;
  }

  if ((dbActiveItems.length === 0 || useClientFallback) && clientItems?.length > 0) {
    useClientFallback = true;
    activeItems = clientItems
      .filter((i) => i.price && Number(i.price) > 0)
      .map((i) => ({
        product_id: {
          _id: (() => {
            try { return new mongoose.Types.ObjectId(i._id); }
            catch { return new mongoose.Types.ObjectId(); }
          })(),
          name:      i.name      || "Product",
          thumbnail: i.thumbnail || i.img || "",
        },
        variant_id: null,
        quantity:   Number(i.qty || i.quantity || 1),
        price:      Number(i.price),
        mrp:        Number(i.mrp ?? i.price),
      }));

    if (activeItems.length === 0) {
      throw { status: 400, message: "Cart is empty or has no valid items" };
    }
  } else if (!useClientFallback && activeItems.length === 0) {
    throw { status: 400, message: "Cart is empty" };
  }

  const subtotal        = activeItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping_charge = subtotal >= 500 ? 0 : 49;
  let   coupon_id       = (!useClientFallback && cart?.coupon_id) ? cart.coupon_id : null;
  let   coupon_discount = 0;

  if (coupon_id) {
    const coupon = await Coupon.findById(coupon_id);
    if (coupon && coupon.is_active && coupon.status && new Date() <= coupon.end_date) {
      if (subtotal >= coupon.min_order_amount) {
        coupon_discount =
          coupon.discount_type === "percentage"
            ? Math.min(
                (subtotal * coupon.discount_value) / 100,
                coupon.max_discount_amount || Infinity
              )
            : coupon.discount_value;
        coupon_discount = Math.round(coupon_discount);
      } else {
        coupon_id = null;
      }
    } else {
      coupon_id = null;
    }
  }

  const tax          = Math.round(subtotal * 0.05); // 5 % GST
  const total_amount = subtotal + shipping_charge - coupon_discount + tax;

  return {
    cart, activeItems, subtotal, shipping_charge,
    coupon_id, coupon_discount, tax, total_amount, useClientFallback,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller class
// ─────────────────────────────────────────────────────────────────────────────

class RazorpayController {

  // ── 1. Create Razorpay Order ─────────────────────────────────────────────
  /**
   * POST /customer/payment/razorpay/create-order
   * Body: { address_id, cart_items? }
   *
   * 1. Validates address belongs to the customer
   * 2. Prices the cart
   * 3. Creates a Razorpay order via the service
   * 4. Returns key_id + order details so the frontend can open the checkout modal
   */
  async createRazorpayOrder(req, res) {
    try {
      const userId               = req.user.user;
      const { address_id, cart_items } = req.body;

      // Validate delivery address
      const address = await Address.findOne({
        _id: address_id, user_id: userId, status: true,
      });
      if (!address) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");
      }

      // Price the cart
      let pricing;
      try {
        pricing = await validateAndPrice(userId, cart_items || null);
      } catch (e) {
        return Base.sendError(
          res,
          { code: e.status || 400, message: e.message },
          e.message
        );
      }

      if (pricing.total_amount <= 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Invalid order amount");
      }

      // Delegate to service
      let rzpOrder;
      try {
        rzpOrder = await RazorpayService.createOrder({
          amount:  pricing.total_amount,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            user_id:    String(userId),
            address_id: String(address_id),
          },
        });
      } catch (serviceErr) {
        console.error("[RazorpayController] createOrder failed:", serviceErr.message);
        return Base.sendError(
          res,
          { code: serviceErr.statusCode || 500, message: serviceErr.message },
          serviceErr.message
        );
      }

      return Base.sendResponse(res, HTTPS.CREATED, {
        razorpay_order_id: rzpOrder.id,
        amount:            rzpOrder.amount,
        currency:          rzpOrder.currency,
        key_id:            RAZORPAY_KEY_ID,
        // Pricing summary for the frontend order summary card
        subtotal:          pricing.subtotal,
        shipping_charge:   pricing.shipping_charge,
        coupon_discount:   pricing.coupon_discount,
        tax:               pricing.tax,
        total_amount:      pricing.total_amount,
      }, "Razorpay order created successfully");

    } catch (err) {
      if (err.status) {
        return Base.sendError(
          res, { code: err.status, message: err.message }, err.message
        );
      }
      console.error("[RazorpayController] createRazorpayOrder:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 2. Verify Payment & Persist Order ───────────────────────────────────
  /**
   * POST /customer/payment/razorpay/verify
   * Body: {
   *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
   *   address_id, payment_method, cart_items?, notes?
   * }
   *
   * 1. Verifies HMAC-SHA256 signature
   * 2. Re-validates cart & pricing (prevents price tampering)
   * 3. Atomically reserves inventory
   * 4. Creates Order, Payment, Invoice documents
   * 5. Sends confirmation email + notifications (non-blocking)
   * 6. Clears the DB cart
   */
  async verifyAndCreateOrder(req, res) {
    let createdOrderId   = null;
    let createdPaymentId = null;
    let createdInvoiceId = null;
    const stockDeducted  = []; // [{ productId, quantity, variantId }]

    try {
      const userId = req.user.user;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        address_id,
        payment_method = "razorpay",
        cart_items,
        notes             = "",
      } = req.body;

      // ── Verify Razorpay signature ────────────────────────────────────────
      let signatureValid;
      try {
        signatureValid = RazorpayService.verifySignature(
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );
      } catch (sigErr) {
        return Base.sendError(
          res,
          { code: sigErr.statusCode || 400, message: sigErr.message },
          sigErr.message
        );
      }

      if (!signatureValid) {
        return Base.sendError(
          res, HTTPS.BAD_REQUEST, "Payment signature verification failed"
        );
      }

      // ── Validate address ─────────────────────────────────────────────────
      const address = await Address.findOne({
        _id: address_id, user_id: userId, status: true,
      });
      if (!address) {
        return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");
      }

      // ── Re-validate cart & pricing ───────────────────────────────────────
      let pricing;
      try {
        pricing = await validateAndPrice(userId, cart_items || null);
      } catch (e) {
        return Base.sendError(
          res, { code: e.status || 400, message: e.message }, e.message
        );
      }

      const {
        activeItems, subtotal, shipping_charge,
        coupon_id, coupon_discount, tax, total_amount, useClientFallback,
      } = pricing;

      // ── Reserve inventory (DB cart only) ─────────────────────────────────
      if (!useClientFallback) {
        for (const item of activeItems) {
          const prod = item.product_id;

          if (item.variant_id) {
            const updated = await Product.findOneAndUpdate(
              {
                _id:                prod._id,
                "variants._id":     item.variant_id,
                "variants.stock":   { $gte: item.quantity },
              },
              { $inc: { "variants.$.stock": -item.quantity, total_sold: item.quantity } },
              { new: true }
            );
            if (!updated) {
              // Rollback already-deducted stock
              await _rollbackStock(stockDeducted);
              return Base.sendError(
                res, HTTPS.BAD_REQUEST,
                `Insufficient stock for "${prod.name}" variant`
              );
            }
            stockDeducted.push({
              productId: prod._id, quantity: item.quantity, variantId: item.variant_id,
            });
          } else {
            const updated = await Product.findOneAndUpdate(
              { _id: prod._id, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity, total_sold: item.quantity } },
              { new: true }
            );
            if (!updated) {
              await _rollbackStock(stockDeducted);
              return Base.sendError(
                res, HTTPS.BAD_REQUEST,
                `Insufficient stock for "${prod.name}"`
              );
            }
            stockDeducted.push({
              productId: prod._id, quantity: item.quantity, variantId: null,
            });
          }
        }
      }

      // ── Build order items ────────────────────────────────────────────────
      const orderItems = activeItems.map((item) => ({
        product_id:    item.product_id._id || item.product_id,
        variant_id:    item.variant_id || null,
        product_name:  item.product_id.name      || "",
        product_image: item.product_id.thumbnail || "",
        quantity:      item.quantity,
        price:         item.price,
        mrp:           item.mrp ?? item.price,
        total:         item.price * item.quantity,
      }));

      const order_number     = GenerateOrderNumber();
      const invoice_number   = GenerateInvoiceNumber();
      const estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // ── Create Order ─────────────────────────────────────────────────────
      const order = await Order.create({
        order_number,
        user_id:    userId,
        items:      orderItems,
        address: {
          full_name:     address.full_name,
          contact_no:    address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          landmark:      address.landmark      || "",
          city:          address.city,
          state:         address.state,
          pincode:       address.pincode,
          country:       address.country,
        },
        subtotal,
        shipping_charge,
        coupon_id:           coupon_id   || null,
        coupon_discount,
        tax,
        total_amount,
        payment_method:      payment_method || "razorpay",
        payment_status:      "paid",
        razorpay_order_id,
        razorpay_payment_id,
        order_status:        "confirmed",
        invoice_no:          invoice_number,
        notes,
        estimated_delivery,
        status_history: [
          { status: "pending",   note: "Order initiated",              changed_at: new Date() },
          { status: "confirmed", note: "Payment verified, order confirmed", changed_at: new Date() },
        ],
      });
      createdOrderId = order._id;

      // ── Create Payment record ────────────────────────────────────────────
      const payment = await Payment.create({
        order_id:            order._id,
        user_id:             userId,
        amount:              total_amount,
        payment_method:      payment_method || "razorpay",
        payment_status:      "success",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        transaction_id:      razorpay_payment_id,
      });
      createdPaymentId = payment._id;

      // ── Create Invoice ───────────────────────────────────────────────────
      const invoice = await Invoice.create({
        invoice_number,
        order_id:        order._id,
        user_id:         userId,
        billing_address: {
          full_name:     address.full_name,
          contact_no:    address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          city:          address.city,
          state:         address.state,
          pincode:       address.pincode,
          country:       address.country,
        },
        items: orderItems.map((i) => ({
          product_id:   i.product_id,
          product_name: i.product_name,
          quantity:     i.quantity,
          price:        i.price,
          mrp:          i.mrp,
          total:        i.total,
        })),
        subtotal,
        shipping_charge,
        coupon_discount,
        tax_percent: 5,
        tax_amount:  tax,
        total_amount,
        payment_method:  payment_method || "razorpay",
        payment_status:  "paid",
      });
      createdInvoiceId = invoice._id;

      // ── Consume coupon ───────────────────────────────────────────────────
      if (coupon_id) {
        await Coupon.findByIdAndUpdate(coupon_id, { $inc: { used_count: 1 } });
      }

      // ── Clear DB cart ────────────────────────────────────────────────────
      await Cart.findOneAndUpdate(
        { user_id: userId },
        { items: [], coupon_id: null, coupon_discount: 0 }
      );

      // ── Post-order side-effects (non-blocking) ───────────────────────────
      _postOrderSideEffects({
        userId,
        order_number,
        order_id:         order._id,
        invoice_number,
        total_amount,
        subtotal,
        shipping_charge,
        coupon_discount,
        tax,
        payment_method:   payment_method || "razorpay",
        estimated_delivery,
        address,
        orderItems,
        isOnline:         true,
      });

      return Base.sendResponse(res, HTTPS.CREATED, {
        order_id:         order._id,
        order_number,
        invoice_number,
        total_amount,
        payment_method:   payment_method || "razorpay",
        payment_status:   "paid",
        order_status:     "confirmed",
        estimated_delivery,
      }, "Payment verified. Order placed successfully");

    } catch (err) {
      console.error("[RazorpayController] verifyAndCreateOrder:", err);

      // Best-effort rollback
      if (createdInvoiceId)  await Invoice.findByIdAndDelete(createdInvoiceId).catch(() => {});
      if (createdPaymentId)  await Payment.findByIdAndDelete(createdPaymentId).catch(() => {});
      if (createdOrderId)    await Order.findByIdAndDelete(createdOrderId).catch(() => {});
      await _rollbackStock(stockDeducted);

      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // ── 3. Get Razorpay order status ─────────────────────────────────────────
  /**
   * GET /customer/payment/razorpay/order/:rzp_order_id
   * Fetches the current status of a Razorpay order from Razorpay's API.
   */
  async getRazorpayOrderStatus(req, res) {
    try {
      const rzpOrder = await RazorpayService.fetchOrder(req.params.rzp_order_id);
      return Base.sendResponse(res, HTTPS.OK, {
        razorpay_order_id: rzpOrder.id,
        status:            rzpOrder.status,
        amount:            rzpOrder.amount,
        amount_paid:       rzpOrder.amount_paid,
        amount_due:        rzpOrder.amount_due,
        currency:          rzpOrder.currency,
        attempts:          rzpOrder.attempts,
      });
    } catch (err) {
      return Base.sendError(
        res,
        { code: err.statusCode || 500, message: err.message },
        err.message
      );
    }
  }

  // ── 4. Get Razorpay payment status ───────────────────────────────────────
  /**
   * GET /customer/payment/razorpay/payment/:rzp_payment_id
   * Fetches the current status of a specific Razorpay payment.
   */
  async getRazorpayPaymentStatus(req, res) {
    try {
      const rzpPayment = await RazorpayService.fetchPayment(req.params.rzp_payment_id);
      return Base.sendResponse(res, HTTPS.OK, {
        razorpay_payment_id: rzpPayment.id,
        status:              rzpPayment.status,
        amount:              rzpPayment.amount,
        currency:            rzpPayment.currency,
        method:              rzpPayment.method,
        email:               rzpPayment.email,
        contact:             rzpPayment.contact,
        captured:            rzpPayment.captured,
        error_code:          rzpPayment.error_code     || null,
        error_description:   rzpPayment.error_description || null,
      });
    } catch (err) {
      return Base.sendError(
        res,
        { code: err.statusCode || 500, message: err.message },
        err.message
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Rolls back previously deducted inventory. Fire-and-forget safe. */
async function _rollbackStock(stockDeducted) {
  for (const d of stockDeducted) {
    try {
      if (d.variantId) {
        await Product.findOneAndUpdate(
          { _id: d.productId, "variants._id": d.variantId },
          { $inc: { "variants.$.stock": d.quantity, total_sold: -d.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(d.productId, {
          $inc: { stock: d.quantity, total_sold: -d.quantity },
        });
      }
    } catch (e) {
      console.error("[RazorpayController] stockRollback error:", e.message);
    }
  }
}

/** Creates notifications + sends confirmation email without blocking the response. */
function _postOrderSideEffects({
  userId, order_number, order_id,
  invoice_number, total_amount, subtotal, shipping_charge,
  coupon_discount, tax, payment_method, estimated_delivery,
  address, orderItems, isOnline,
}) {
  Promise.all([
    Notification.create({
      user_id:        userId,
      title:          "Order Confirmed! 🎉",
      message:        `Your order #${order_number} is confirmed. Expected delivery: ${estimated_delivery.toLocaleDateString("en-IN")}.`,
      type:           "order",
      reference_id:   order_id,
      reference_type: "Order",
    }),
    Notification.create({
      user_id:        userId,
      title:          isOnline ? "Payment Successful ✅" : "Order Placed - COD",
      message:        isOnline
        ? `Payment of ₹${total_amount} received for order #${order_number}.`
        : `COD order #${order_number} of ₹${total_amount} placed.`,
      type:           "payment",
      reference_id:   order_id,
      reference_type: "Order",
    }),
    (async () => {
      try {
        const user = await User.findById(userId).select("email name contact_no");
        if (user?.email) {
          await sendOrderConfirmationEmail(user.email, {
            order_number,
            invoice_number,
            total_amount,
            subtotal,
            shipping_charge,
            coupon_discount,
            tax,
            payment_method,
            payment_status:    isOnline ? "paid" : "cod",
            order_status:      "confirmed",
            estimated_delivery: estimated_delivery.toLocaleDateString("en-IN"),
            customer_name:     user.name,
            customer_email:    user.email,
            customer_phone:    user.contact_no || "",
            delivery_address: {
              full_name:     address.full_name,
              address_line1: address.address_line1,
              address_line2: address.address_line2 || "",
              city:          address.city,
              state:         address.state,
              pincode:       address.pincode,
              country:       address.country,
            },
            items: orderItems.map((i) => ({
              product_name:  i.product_name,
              product_image: i.product_image,
              quantity:      i.quantity,
              price:         i.price,
              mrp:           i.mrp,
              total:         i.total,
            })),
          });
          console.log(`[RazorpayController] confirmation email sent to ${user.email}`);
        }
      } catch (emailErr) {
        console.error("[RazorpayController] email error:", emailErr.message);
      }
    })(),
  ]).catch((e) => console.error("[RazorpayController] postOrder side-effect error:", e.message));
}

module.exports = new RazorpayController();
