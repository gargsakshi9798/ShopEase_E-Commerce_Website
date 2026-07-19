const express      = require("express");
const router       = express.Router();
const Notification = require("../../../../../models/Notification");
const Order        = require("../../../../../models/Order");
const Product      = require("../../../../../models/Product");
const Base         = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }    = require("../../../../../helper/https-status-codes/https-status-codes");

// GET /admin/notifications — latest 20 system notifications
router.get("/", async (req, res) => {
  try {
    const { page = 1, per_page = 20 } = req.query;
    const skip = (page - 1) * per_page;

    // Build smart notifications from real data
    const [
      recentOrders,
      pendingOrders,
      lowStockProducts,
      storedNotifications,
    ] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user_id", "name"),
      Order.countDocuments({ order_status: "pending" }),
      Product.find({ $expr: { $lte: ["$stock", "$low_stock_threshold"] }, status: true })
        .select("name stock low_stock_threshold").limit(5),
      Notification.find({ $or: [{ user_id: req.user?.user }, { user_id: null }] })
        .sort({ createdAt: -1 }).limit(10),
    ]);

    // Compose dynamic notification list
    const notifications = [];

    // New order notifications
    recentOrders.forEach((o) => {
      notifications.push({
        _id:       o._id + "_order",
        type:      "order",
        icon:      "🛒",
        title:     "New Order Placed",
        message:   `${o.user_id?.name || "Customer"} placed order ${o.order_number}`,
        time:      o.createdAt,
        is_read:   false,
        link:      `/admin/orders/${o._id}`,
        color:     "bg-blue-100 text-blue-600",
      });
    });

    // Low stock alerts
    lowStockProducts.forEach((p) => {
      notifications.push({
        _id:     p._id + "_stock",
        type:    "warning",
        icon:    "⚠️",
        title:   "Low Stock Alert",
        message: `${p.name} has only ${p.stock} units left`,
        time:    new Date(),
        is_read: false,
        link:    "/admin/inventory",
        color:   "bg-orange-100 text-orange-600",
      });
    });

    // Pending orders
    if (pendingOrders > 0) {
      notifications.push({
        _id:     "pending_orders",
        type:    "general",
        icon:    "📦",
        title:   "Pending Orders",
        message: `${pendingOrders} orders are waiting to be processed`,
        time:    new Date(),
        is_read: false,
        link:    "/admin/orders?status=pending",
        color:   "bg-yellow-100 text-yellow-600",
      });
    }

    // Stored notifications
    storedNotifications.forEach((n) => {
      notifications.push({
        _id:     n._id,
        type:    n.type,
        icon:    "🔔",
        title:   n.title,
        message: n.message,
        time:    n.createdAt,
        is_read: n.is_read,
        link:    null,
        color:   "bg-primary-100 text-primary-600",
      });
    });

    // Sort by time, newest first
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    const total_unread = notifications.filter((n) => !n.is_read).length;
    const paginated    = notifications.slice(skip, skip + Number(per_page));

    return Base.sendResponse(res, HTTPS.OK, {
      notifications: paginated,
      total:         notifications.length,
      total_unread,
    });
  } catch (error) {
    console.error("notifications error:", error);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/notifications/mark-all-read
router.patch("/mark-all-read", async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user_id: req.user?.user }, { user_id: null }] },
      { is_read: true, read_at: new Date() }
    );
    return Base.sendResponse(res, HTTPS.OK, null, "All notifications marked as read");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true, read_at: new Date() });
    return Base.sendResponse(res, HTTPS.OK, null, "Notification marked as read");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return Base.sendError(res, HTTPS.NOT_FOUND, "Notification not found");
    }
    return Base.sendResponse(res, HTTPS.OK, null, "Notification deleted");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
