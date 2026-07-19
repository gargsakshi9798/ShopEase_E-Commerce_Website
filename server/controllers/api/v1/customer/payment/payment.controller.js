const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { GenerateOrderNumber, GenerateInvoiceNumber } = require("../../../../../helper/common/utils");
const { sendOrderConfirmationEmail } = require("../../../../../helper/NodeMailer");

const Order = require("../../../../../models/Order");
const Cart = require("../../../../../models/Cart");
const Product = require("../../../../../models/Product");
const Address = require("../../../../../models/Address");
const Coupon = require("../../../../../models/Coupon");
const Payment = require("../../../../../models/Payment");
const Invoice = require("../../../../../models/Invoice");
const Notification = require("../../../../../models/Notification");
const User = require("../../../../../models/User");

// --- Razorpay instance -----------------------------------------------------------
const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// --- Shared: validate cart and compute pricing -----------------------------------
// clientItems: optional array from request body used as fallback when the DB
// cart is empty (supports the localStorage-based storefront cart).
const validateAndPrice = async (userId, clientItems = null) => {
  const cart = await Cart.findOne({ user_id: userId }).populate({
    path: "items.product_id",
    select: "name thumbnail price mrp stock status variants",
  });

  const dbActiveItems = cart ? cart.items.filter((i) => !i.saved_for_later) : [];

  let activeItems;
  let useClientFallback = false;

  if (dbActiveItems.length > 0) {
    activeItems = [];
    console.log("[validateAndPrice] using DB cart, raw items:", dbActiveItems.length);

    for (const item of dbActiveItems) {
      const prod = item.product_id;
      // Skip items where the product was deleted or is null
      if (!prod) {
        console.log("[validateAndPrice] skipping item with null product_id");
        continue;
      }
      // Skip inactive products instead of throwing - just exclude them
      if (!prod.status) {
        console.log("[validateAndPrice] skipping inactive product:", prod.name);
        continue;
      }
      if (item.variant_id) {
        const variant = prod.variants?.id(item.variant_id);
        if (!variant || !variant.status) continue;
        if (variant.stock < item.quantity) {
          throw { status: 400, message: `Only ${variant.stock} units of "${prod.name}" (variant) are left` };
        }
        item.price = variant.price;
      } else {
        if (prod.stock < item.quantity) {
          throw { status: 400, message: `Only ${prod.stock} units of "${prod.name}" are left` };
        }
        item.price = prod.price;
      }
      activeItems.push(item);
    }

    // If all DB items were filtered out (deleted/inactive products), fall through to client fallback
    if (activeItems.length === 0) {
      console.log("[validateAndPrice] all DB items filtered out, trying client fallback");
      useClientFallback = true;
    }
  }

  if ((dbActiveItems.length === 0 || useClientFallback) && clientItems && clientItems.length > 0) {
    useClientFallback = true;
    console.log("[validateAndPrice] using client fallback, items:", clientItems.length);
    activeItems = clientItems
      .filter((i) => i.price && Number(i.price) > 0) // skip items with no price
      .map((i) => ({
        product_id: {
          _id: (() => {
            // Try to use the _id as ObjectId; fall back to new ObjectId for local IDs
            try {
              return new mongoose.Types.ObjectId(i._id);
            } catch {
              return new mongoose.Types.ObjectId();
            }
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
  } else if (!useClientFallback && activeItems && activeItems.length === 0) {
    console.log("[validateAndPrice] no DB items and no clientItems");
    throw { status: 400, message: "Cart is empty" };
  } else if (!activeItems || activeItems.length === 0) {
    throw { status: 400, message: "Cart is empty" };
  }

  // Compute subtotal
  const subtotal = activeItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping_charge = subtotal >= 500 ? 0 : 49;

  // Coupon (only applicable for DB cart orders)
  let coupon_id = (!useClientFallback && cart?.coupon_id) ? cart.coupon_id : null;
  let coupon_discount = 0;

  if (coupon_id) {
    const coupon = await Coupon.findById(coupon_id);
    if (coupon && coupon.is_active && coupon.status && new Date() <= coupon.end_date) {
      if (subtotal >= coupon.min_order_amount) {
        if (coupon.discount_type === "percentage") {
          coupon_discount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount_amount) {
            coupon_discount = Math.min(coupon_discount, coupon.max_discount_amount);
          }
        } else {
          coupon_discount = coupon.discount_value;
        }
        coupon_discount = Math.round(coupon_discount);
      } else {
        coupon_id = null;
        coupon_discount = 0;
      }
    } else {
      coupon_id = null;
      coupon_discount = 0;
    }
  }

  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total_amount = subtotal + shipping_charge - coupon_discount + tax;

  return { cart, activeItems, subtotal, shipping_charge, coupon_id, coupon_discount, tax, total_amount, useClientFallback };
};

class PaymentController {
  // -- 1. Validate cart & address before showing order summary -----------------
  async validateCheckout(req, res) {
    try {
      const userId = req.user.user;
      const { address_id, pincode, cart_items } = req.body;

      console.log("[validateCheckout] userId:", userId, "address_id:", address_id, "cart_items count:", cart_items?.length);

      // Validate address
      const address = await Address.findOne({ _id: address_id, user_id: userId, status: true });
      if (!address) {
        console.log("[validateCheckout] address not found for id:", address_id, "userId:", userId);
        return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");
      }

      // Simple pincode serviceability check - just ensure it's 6 digits
      const pincodeStr = String(pincode || address.pincode).trim();
      if (!/^\d{6}$/.test(pincodeStr)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Invalid pincode - must be 6 digits");
      }

      const pricing = await validateAndPrice(userId, cart_items || null);

      return Base.sendResponse(res, HTTPS.OK, {
        address,
        subtotal: pricing.subtotal,
        shipping_charge: pricing.shipping_charge,
        coupon_discount: pricing.coupon_discount,
        tax: pricing.tax,
        total_amount: pricing.total_amount,
        serviceable: true,
        estimated_delivery_days: 3,
      }, "Checkout validated");
    } catch (err) {
      if (err.status) return Base.sendError(res, { code: err.status, message: err.message }, err.message);
      // Mongoose CastError (invalid ObjectId) - treat as bad request
      if (err.name === "CastError") return Base.sendError(res, HTTPS.BAD_REQUEST, `Invalid ID format: ${err.message}`);
      console.error("validateCheckout error:", err.message || err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // -- 2. Create Razorpay Order -------------------------------------------------
  async createRazorpayOrder(req, res) {
    try {
      // Guard: ensure Razorpay keys are configured
      const keyId     = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (
        !keyId || !keySecret ||
        keyId === "your_razorpay_key_id" ||
        keySecret === "your_razorpay_key_secret"
      ) {
        console.error("[createRazorpayOrder] Razorpay keys are not configured in server/.env");
        return Base.sendError(
          res,
          HTTPS.INTERNAL_SERVER_ERROR,
          "Payment gateway is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env"
        );
      }

      const userId = req.user.user;
      const { address_id, cart_items } = req.body;

      const address = await Address.findOne({ _id: address_id, user_id: userId, status: true });
      if (!address) return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");

      const pricing = await validateAndPrice(userId, cart_items || null);

      if (pricing.total_amount <= 0) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Invalid order amount");
      }

      const razorpay = getRazorpay();
      let rzpOrder;
      try {
        rzpOrder = await razorpay.orders.create({
          amount: Math.round(pricing.total_amount * 100), // paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            user_id: String(userId),
            address_id: String(address_id),
          },
        });
      } catch (rzpErr) {
        // Razorpay SDK wraps API errors - extract the message
        const rzpMessage =
          rzpErr?.error?.description ||
          rzpErr?.error?.reason ||
          rzpErr?.message ||
          "Razorpay order creation failed";
        console.error("[createRazorpayOrder] Razorpay API error:", rzpErr?.error || rzpErr);
        return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, rzpMessage);
      }

      return Base.sendResponse(res, HTTPS.CREATED, {
        razorpay_order_id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key_id: keyId,
        // Return pricing summary for display
        subtotal: pricing.subtotal,
        shipping_charge: pricing.shipping_charge,
        coupon_discount: pricing.coupon_discount,
        tax: pricing.tax,
        total_amount: pricing.total_amount,
      }, "Razorpay order created");
    } catch (err) {
      if (err.status) return Base.sendError(res, { code: err.status, message: err.message }, err.message);
      console.error("createRazorpayOrder error:", err);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // -- 3. Verify Payment & Create Order (no-transaction safe) ------------------
  async verifyAndCreateOrder(req, res) {
    // Track created docs for manual rollback if something fails mid-way
    let createdOrderId = null;
    let createdPaymentId = null;
    let createdInvoiceId = null;
    const stockDeducted = []; // [{ productId, quantity, variantId }]

    try {
      const userId = req.user.user;
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        address_id,
        payment_method,
        cart_items,
        notes,
        shipping_method = "standard",
      } = req.body;

      // Verify Razorpay Signature
      if (payment_method === "razorpay") {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return Base.sendError(res, HTTPS.BAD_REQUEST, "Payment verification data missing");
        }
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          return Base.sendError(res, HTTPS.BAD_REQUEST, "Payment signature verification failed");
        }
      }

      // Validate Address
      const address = await Address.findOne({ _id: address_id, user_id: userId, status: true });
      if (!address) return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");

      // Re-validate Cart & Pricing
      let pricing;
      try {
        pricing = await validateAndPrice(userId, cart_items || null);
      } catch (err) {
        return Base.sendError(res, { code: err.status || 400, message: err.message }, err.message);
      }

      const { activeItems, subtotal, shipping_charge, coupon_id, coupon_discount, tax, total_amount, useClientFallback } = pricing;

      // Reserve Inventory (DB items only)
      if (!useClientFallback) {
        for (const item of activeItems) {
          const prod = item.product_id;

          if (item.variant_id) {
            const result = await Product.findOneAndUpdate(
              {
                _id: prod._id,
                "variants._id": item.variant_id,
                "variants.stock": { $gte: item.quantity },
              },
              { $inc: { "variants.$.stock": -item.quantity, total_sold: item.quantity } },
              { new: true }
            );
            if (!result) {
              // Rollback previously deducted stock
              for (const d of stockDeducted) {
                if (d.variantId) {
                  await Product.findOneAndUpdate(
                    { _id: d.productId, "variants._id": d.variantId },
                    { $inc: { "variants.$.stock": d.quantity, total_sold: -d.quantity } }
                  );
                } else {
                  await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.quantity, total_sold: -d.quantity } });
                }
              }
              return Base.sendError(res, HTTPS.BAD_REQUEST, `Insufficient stock for "${prod.name}" variant`);
            }
            stockDeducted.push({ productId: prod._id, quantity: item.quantity, variantId: item.variant_id });
          } else {
            const result = await Product.findOneAndUpdate(
              { _id: prod._id, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity, total_sold: item.quantity } },
              { new: true }
            );
            if (!result) {
              for (const d of stockDeducted) {
                if (d.variantId) {
                  await Product.findOneAndUpdate(
                    { _id: d.productId, "variants._id": d.variantId },
                    { $inc: { "variants.$.stock": d.quantity, total_sold: -d.quantity } }
                  );
                } else {
                  await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.quantity, total_sold: -d.quantity } });
                }
              }
              return Base.sendError(res, HTTPS.BAD_REQUEST, `Insufficient stock for "${prod.name}"`);
            }
            stockDeducted.push({ productId: prod._id, quantity: item.quantity, variantId: null });
          }
        }
      }

      // Build Order Items
      const orderItems = activeItems.map((item) => ({
        product_id: item.product_id._id || item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.product_id.name || item.name || "",
        product_image: item.product_id.thumbnail || item.product_id.img || "",
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        total: item.price * item.quantity,
      }));

      const order_number = GenerateOrderNumber();
      const invoice_number = GenerateInvoiceNumber();
      const isOnline = payment_method !== "cod";
      const estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      // Create Order
      const order = await Order.create({
        order_number,
        user_id: userId,
        items: orderItems,
        address: {
          full_name: address.full_name,
          contact_no: address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          landmark: address.landmark || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        subtotal,
        shipping_charge,
        coupon_id: coupon_id || null,
        coupon_discount,
        tax,
        total_amount,
        payment_method,
        payment_status: isOnline ? "paid" : "cod",
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        order_status: "confirmed",
        invoice_no: invoice_number,
        notes: notes || "",
        estimated_delivery,
        status_history: [
          { status: "pending",   note: "Order initiated",                  changed_at: new Date() },
          { status: "confirmed", note: "Payment verified, order confirmed", changed_at: new Date() },
        ],
      });
      createdOrderId = order._id;

      // Create Payment Record
      const payment = await Payment.create({
        order_id: order._id,
        user_id: userId,
        amount: total_amount,
        payment_method,
        payment_status: isOnline ? "success" : "pending",
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        razorpay_signature: razorpay_signature || null,
        transaction_id: razorpay_payment_id || null,
      });
      createdPaymentId = payment._id;

      // Create Invoice
      const invoice = await Invoice.create({
        invoice_number,
        order_id: order._id,
        user_id: userId,
        billing_address: {
          full_name: address.full_name,
          contact_no: address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        items: orderItems.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          mrp: i.mrp,
          total: i.total,
        })),
        subtotal,
        shipping_charge,
        coupon_discount,
        tax_percent: 5,
        tax_amount: tax,
        total_amount,
        payment_method,
        payment_status: isOnline ? "paid" : "cod",
      });
      createdInvoiceId = invoice._id;

      // Consume Coupon
      if (coupon_id) {
        await Coupon.findByIdAndUpdate(coupon_id, { $inc: { used_count: 1 } });
      }

      // Clear DB Cart
      await Cart.findOneAndUpdate(
        { user_id: userId },
        { items: [], coupon_id: null, coupon_discount: 0 }
      );

      // Post: Notifications & Email (non-blocking)
      Promise.all([
        Notification.create({
          user_id: userId,
          title: "Order Confirmed! 🎉",
          message: `Your order #${order_number} has been confirmed. Expected delivery: ${estimated_delivery.toLocaleDateString("en-IN")}.`,
          type: "order",
          reference_id: order._id,
          reference_type: "Order",
        }),
        Notification.create({
          user_id: userId,
          title: isOnline ? "Payment Successful ✅" : "Order Placed - COD",
          message: isOnline
            ? `Payment of ₹${total_amount} received for order #${order_number}.`
            : `Your COD order #${order_number} of ₹${total_amount} has been placed.`,
          type: "payment",
          reference_id: order._id,
          reference_type: "Order",
        }),
        (async () => {
          const user = await User.findById(userId).select("email name contact_no");
          if (user?.email) {
            return sendOrderConfirmationEmail(user.email, {
              order_number,
              invoice_number,
              total_amount,
              subtotal,
              shipping_charge,
              coupon_discount,
              tax,
              payment_method,
              payment_status: isOnline ? "paid" : "cod",
              order_status:   "confirmed",
              estimated_delivery: estimated_delivery.toLocaleDateString("en-IN"),
              customer_name:  user.name,
              customer_email: user.email,
              customer_phone: user.contact_no || "",
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
            }).catch(console.error);
          }
        })(),
      ]).catch(console.error);

      return Base.sendResponse(res, HTTPS.CREATED, {
        order_id: order._id,
        order_number,
        invoice_number,
        total_amount,
        payment_method,
        payment_status: isOnline ? "paid" : "cod",
        order_status: "confirmed",
        estimated_delivery,
      }, "Order placed successfully");

    } catch (err) {
      console.error("verifyAndCreateOrder error:", err);
      // Best-effort rollback
      if (createdInvoiceId) await Invoice.findByIdAndDelete(createdInvoiceId).catch(() => {});
      if (createdPaymentId) await Payment.findByIdAndDelete(createdPaymentId).catch(() => {});
      if (createdOrderId)   await Order.findByIdAndDelete(createdOrderId).catch(() => {});
      for (const d of stockDeducted) {
        if (d.variantId) {
          await Product.findOneAndUpdate(
            { _id: d.productId, "variants._id": d.variantId },
            { $inc: { "variants.$.stock": d.quantity, total_sold: -d.quantity } }
          ).catch(() => {});
        } else {
          await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.quantity, total_sold: -d.quantity } }).catch(() => {});
        }
      }
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // -- 4. Place COD Order -------------------------------------------------------
  async placeCODOrder(req, res) {
    let createdOrderId = null;
    let createdPaymentId = null;
    let createdInvoiceId = null;
    const stockDeducted = [];

    try {
      const userId = req.user.user;
      const { address_id, notes, cart_items } = req.body;

      const address = await Address.findOne({ _id: address_id, user_id: userId, status: true });
      if (!address) return Base.sendError(res, HTTPS.NOT_FOUND, "Delivery address not found");

      let pricing;
      try {
        pricing = await validateAndPrice(userId, cart_items || null);
      } catch (err) {
        return Base.sendError(res, { code: err.status || 400, message: err.message }, err.message);
      }

      const { activeItems, subtotal, shipping_charge, coupon_id, coupon_discount, tax, total_amount, useClientFallback } = pricing;

      // Reserve inventory (DB items only)
      if (!useClientFallback) {
        for (const item of activeItems) {
          const prod = item.product_id;
          const result = await Product.findOneAndUpdate(
            { _id: prod._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity, total_sold: item.quantity } },
            { new: true }
          );
          if (!result) {
            for (const d of stockDeducted) {
              await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.quantity, total_sold: -d.quantity } }).catch(() => {});
            }
            return Base.sendError(res, HTTPS.BAD_REQUEST, `Insufficient stock for "${prod.name}"`);
          }
          stockDeducted.push({ productId: prod._id, quantity: item.quantity });
        }
      }

      const orderItems = activeItems.map((item) => ({
        product_id: item.product_id._id || item.product_id,
        variant_id: item.variant_id || null,
        product_name: item.product_id.name || item.name || "",
        product_image: item.product_id.thumbnail || item.product_id.img || "",
        quantity: item.quantity,
        price: item.price,
        mrp: item.mrp,
        total: item.price * item.quantity,
      }));

      const order_number = GenerateOrderNumber();
      const invoice_number = GenerateInvoiceNumber();
      const estimated_delivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const order = await Order.create({
        order_number,
        user_id: userId,
        items: orderItems,
        address: {
          full_name: address.full_name,
          contact_no: address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          landmark: address.landmark || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        subtotal,
        shipping_charge,
        coupon_id: coupon_id || null,
        coupon_discount,
        tax,
        total_amount,
        payment_method: "cod",
        payment_status: "cod",
        order_status: "confirmed",
        invoice_no: invoice_number,
        notes: notes || "",
        estimated_delivery,
        status_history: [
          { status: "pending",   note: "COD order placed",   changed_at: new Date() },
          { status: "confirmed", note: "COD order confirmed", changed_at: new Date() },
        ],
      });
      createdOrderId = order._id;

      const payment = await Payment.create({
        order_id: order._id,
        user_id: userId,
        amount: total_amount,
        payment_method: "cod",
        payment_status: "pending",
      });
      createdPaymentId = payment._id;

      const invoice = await Invoice.create({
        invoice_number,
        order_id: order._id,
        user_id: userId,
        billing_address: {
          full_name: address.full_name,
          contact_no: address.contact_no,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || "",
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
        },
        items: orderItems.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          mrp: i.mrp,
          total: i.total,
        })),
        subtotal,
        shipping_charge,
        coupon_discount,
        tax_percent: 5,
        tax_amount: tax,
        total_amount,
        payment_method: "cod",
        payment_status: "cod",
      });
      createdInvoiceId = invoice._id;

      if (coupon_id) {
        await Coupon.findByIdAndUpdate(coupon_id, { $inc: { used_count: 1 } });
      }

      await Cart.findOneAndUpdate(
        { user_id: userId },
        { items: [], coupon_id: null, coupon_discount: 0 }
      );

      // Post-order: notifications & email (non-blocking)
      Promise.all([
        Notification.create({
          user_id: userId,
          title: "COD Order Confirmed! 📦",
          message: `Your order #${order_number} is confirmed. Pay ₹${total_amount} on delivery.`,
          type: "order",
          reference_id: order._id,
          reference_type: "Order",
        }),
        (async () => {
          const user = await User.findById(userId).select("email name contact_no");
          if (user?.email) {
            return sendOrderConfirmationEmail(user.email, {
              order_number,
              invoice_number,
              total_amount,
              subtotal,
              shipping_charge,
              coupon_discount,
              tax,
              payment_method:    "cod",
              payment_status:    "cod",
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
            }).catch(console.error);
          }
        })(),
      ]).catch(console.error);

      return Base.sendResponse(res, HTTPS.CREATED, {
        order_id: order._id,
        order_number,
        invoice_number,
        total_amount,
        payment_method: "cod",
        payment_status: "cod",
        order_status: "confirmed",
        estimated_delivery,
      }, "COD order placed successfully");

    } catch (err) {
      console.error("placeCODOrder error:", err);
      if (createdInvoiceId) await Invoice.findByIdAndDelete(createdInvoiceId).catch(() => {});
      if (createdPaymentId) await Payment.findByIdAndDelete(createdPaymentId).catch(() => {});
      if (createdOrderId)   await Order.findByIdAndDelete(createdOrderId).catch(() => {});
      for (const d of stockDeducted) {
        await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.quantity, total_sold: -d.quantity } }).catch(() => {});
      }
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  // -- 5. Get Invoice -----------------------------------------------------------
  async getInvoice(req, res) {
    try {
      const invoice = await Invoice.findOne({
        order_id: req.params.order_id,
        user_id: req.user.user,
      });
      if (!invoice) return Base.sendError(res, HTTPS.NOT_FOUND, "Invoice not found");
      return Base.sendResponse(res, HTTPS.OK, invoice);
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

module.exports = new PaymentController();
