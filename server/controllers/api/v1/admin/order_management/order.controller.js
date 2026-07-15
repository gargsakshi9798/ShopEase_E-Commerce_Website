const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, GenerateInvoiceNumber } = require("../../../../../helper/common/utils");
const Order   = require("../../../../../models/Order");
const Product = require("../../../../../models/Product");
const mongoose = require("mongoose");
const { sendOrderConfirmationEmail } = require("../../../../../helper/NodeMailer");

class OrderController {
  async getAll(req, res) {
    try {
      const { search = "", order_status, payment_status, start_date, end_date } = req.query;
      const filter = {};

      if (search) filter.order_number = { $regex: search, $options: "i" };
      if (order_status) filter.order_status = order_status;
      if (payment_status) filter.payment_status = payment_status;
      if (start_date || end_date) {
        filter.createdAt = {};
        if (start_date) filter.createdAt.$gte = new Date(start_date);
        if (end_date) filter.createdAt.$lte = new Date(end_date);
      }

      return Paginate(
        Order,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [
            { path: "user_id", select: "name email contact_no" },
            { path: "coupon_id", select: "code" },
            { path: "assigned_employee_id", select: "name" },
          ],
        },
        req,
        res
      );
    } catch (error) {
      console.error("getAll orders error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate("user_id", "name email contact_no")
        .populate("items.product_id", "name thumbnail")
        .populate("assigned_employee_id", "name email");

      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");
      return Base.sendResponse(res, HTTPS.OK, order);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(req, res) {
    try {
      const { order_status, note, tracking_id, courier_name, estimated_delivery } = req.body;

      const order = await Order.findById(req.params.id);
      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");

      const prevStatus = order.order_status;

      const updateData = {
        order_status,
        $push: {
          status_history: {
            status: order_status,
            note: note || "",
            changed_by: req.user.user,
            changed_at: new Date(),
          },
        },
      };

      if (tracking_id)        updateData.tracking_id        = tracking_id;
      if (courier_name)       updateData.courier_name       = courier_name;
      if (estimated_delivery) updateData.estimated_delivery = new Date(estimated_delivery);
      if (order_status === "delivered") updateData.delivered_at = new Date();
      if (order_status === "cancelled") {
        updateData.cancelled_at  = new Date();
        updateData.cancel_reason = req.body.cancel_reason || "";
      }

      const updated = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });

      // ── Stock restoration on cancel / return ──────────────────────────────
      // Only restore if transitioning INTO a terminal status from a non-terminal one.
      // "cancelled" restores stock; "returned" restores stock (admin approved return).
      const STOCK_RESTORE_STATUSES = ["cancelled", "returned"];
      const NO_RESTORE_FROM = ["cancelled", "returned", "refunded"]; // already restored

      if (
        STOCK_RESTORE_STATUSES.includes(order_status) &&
        !NO_RESTORE_FROM.includes(prevStatus)
      ) {
        const bulkOps = order.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product_id },
            update: {
              $inc: {
                stock:      +item.quantity,
                total_sold: -item.quantity,
              },
            },
          },
        }));
        if (bulkOps.length > 0) {
          await Product.bulkWrite(bulkOps);
        }
      }

      // ── Socket event ──────────────────────────────────────────────────────
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${order.user_id}`).emit("order_status_updated", {
          order_id:     order._id,
          order_number: order.order_number,
          status:       order_status,
        });
      }

      return Base.sendResponse(res, HTTPS.OK, updated, "Order status updated");
    } catch (error) {
      console.error("updateStatus error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async assignEmployee(req, res) {
    try {
      const { employee_id } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { assigned_employee_id: employee_id },
        { new: true }
      );
      if (!order) return Base.sendError(res, HTTPS.NOT_FOUND, "Order not found");
      return Base.sendResponse(res, HTTPS.OK, order, "Employee assigned");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrderStats(req, res) {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: "$order_status",
            count: { $sum: 1 },
            revenue: { $sum: "$total_amount" },
          },
        },
      ]);
      return Base.sendResponse(res, HTTPS.OK, stats);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Employee: only orders assigned to the logged-in employee ─────────────
  async getMyAssignedOrders(req, res) {
    try {
      const employeeId = req.user?.user;
      if (!employeeId) return Base.sendError(res, HTTPS.UNAUTHORIZED, "Unauthorized");

      const { search = "", order_status, payment_status, start_date, end_date } = req.query;
      const filter = { assigned_employee_id: employeeId };

      if (search) filter.order_number = { $regex: search, $options: "i" };
      if (order_status)   filter.order_status   = order_status;
      if (payment_status) filter.payment_status = payment_status;
      if (start_date || end_date) {
        filter.createdAt = {};
        if (start_date) filter.createdAt.$gte = new Date(start_date);
        if (end_date)   filter.createdAt.$lte = new Date(end_date);
      }

      return Paginate(
        Order,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [
            { path: "user_id",  select: "name email contact_no" },
            { path: "coupon_id", select: "code" },
          ],
        },
        req,
        res
      );
    } catch (error) {
      console.error("getMyAssignedOrders error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // ─── Employee: stats for only the assigned orders ─────────────────────────
  async getMyAssignedStats(req, res) {
    try {
      const employeeId = req.user?.user;
      if (!employeeId) return Base.sendError(res, HTTPS.UNAUTHORIZED, "Unauthorized");

      const empObjId   = new mongoose.Types.ObjectId(String(employeeId));
      const today      = new Date();
      const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);

      const [statusStats, todayCount, totalCount, pendingCount] = await Promise.all([
        Order.aggregate([
          { $match: { assigned_employee_id: empObjId } },
          { $group: { _id: "$order_status", count: { $sum: 1 }, revenue: { $sum: "$total_amount" } } },
        ]),
        Order.countDocuments({ assigned_employee_id: empObjId, createdAt: { $gte: startOfDay } }),
        Order.countDocuments({ assigned_employee_id: empObjId }),
        Order.countDocuments({ assigned_employee_id: empObjId, order_status: "pending" }),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        status_stats:  statusStats,
        today_count:   todayCount,
        total_count:   totalCount,
        pending_count: pendingCount,
      });
    } catch (error) {
      console.error("getMyAssignedStats error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new OrderController();
