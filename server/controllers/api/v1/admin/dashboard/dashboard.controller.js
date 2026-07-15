const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const mongoose = require("mongoose");
const User = require("../../../../../models/User");
const Order = require("../../../../../models/Order");
const Product = require("../../../../../models/Product");
const Review = require("../../../../../models/Review");

class DashboardController {
  // ─── Employee-scoped dashboard ────────────────────────────────────────────
  async getEmployeeDashboardStats(req, res) {
    try {
      const employeeId = req.user?.user;
      if (!employeeId) return Base.sendError(res, HTTPS.UNAUTHORIZED, "Unauthorized");

      const empObjId = new mongoose.Types.ObjectId(String(employeeId));

      const today      = new Date();
      const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      const baseFilter = { assigned_employee_id: empObjId };

      const [
        totalAssigned,
        pendingOrders,
        todayOrders,
        deliveredOrders,
        returnRequests,
        statusStats,
        recentOrders,
        topProducts,
        weeklyChart,
      ] = await Promise.all([
        // total assigned to this employee
        Order.countDocuments(baseFilter),

        // pending assigned orders
        Order.countDocuments({ ...baseFilter, order_status: "pending" }),

        // assigned orders placed today
        Order.countDocuments({ ...baseFilter, createdAt: { $gte: startOfDay } }),

        // delivered orders for this employee
        Order.countDocuments({ ...baseFilter, order_status: "delivered" }),

        // return requests
        Order.countDocuments({ ...baseFilter, order_status: "return_requested" }),

        // status distribution
        Order.aggregate([
          { $match: baseFilter },
          { $group: { _id: "$order_status", count: { $sum: 1 } } },
        ]),

        // recent 10 assigned orders
        Order.find(baseFilter)
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user_id", "name email"),

        // top products from assigned orders
        Order.aggregate([
          { $match: baseFilter },
          { $unwind: "$items" },
          { $group: { _id: "$items.product_id", total_sold: { $sum: "$items.quantity" }, name: { $first: "$items.product_name" } } },
          { $sort: { total_sold: -1 } },
          { $limit: 5 },
        ]),

        // weekly order counts (last 7 days)
        Order.aggregate([
          { $match: { ...baseFilter, createdAt: { $gte: startOfWeek } } },
          { $group: { _id: { $dayOfWeek: "$createdAt" }, count: { $sum: 1 } } },
          { $sort: { "_id": 1 } },
        ]),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        stats: {
          total_assigned:   totalAssigned,
          pending_orders:   pendingOrders,
          today_orders:     todayOrders,
          delivered_orders: deliveredOrders,
          return_requests:  returnRequests,
        },
        status_stats:  statusStats,
        recent_orders: recentOrders,
        top_products:  topProducts,
        weekly_chart:  weeklyChart,
      });
    } catch (error) {
      console.error("getEmployeeDashboardStats error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getDashboardStats(req, res) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        todayOrders,
        monthlyRevenue,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        User.countDocuments({ status: true }),
        Order.countDocuments(),
        Product.countDocuments({ status: true }),
        Order.aggregate([
          { $match: { payment_status: "paid" } },
          { $group: { _id: null, total: { $sum: "$total_amount" } } },
        ]),
        Order.countDocuments({
          createdAt: { $gte: startOfDay },
        }),
        Order.aggregate([
          {
            $match: {
              payment_status: "paid",
              createdAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$total_amount" } } },
        ]),
        Order.countDocuments({ order_status: "pending" }),
        Product.countDocuments({
          $expr: { $lte: ["$stock", "$low_stock_threshold"] },
          status: true,
        }),
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user_id", "name email"),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.product_id", total_sold: { $sum: "$items.quantity" } } },
          { $sort: { total_sold: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $project: {
              name: "$product.name",
              thumbnail: "$product.thumbnail",
              total_sold: 1,
            },
          },
        ]),
      ]);

      // Monthly revenue for chart (last 12 months)
      const monthlyChart = await Order.aggregate([
        {
          $match: {
            payment_status: "paid",
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            revenue: { $sum: "$total_amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]);

      const data = {
        stats: {
          total_users: totalUsers,
          total_orders: totalOrders,
          total_products: totalProducts,
          total_revenue: totalRevenue[0]?.total || 0,
          today_orders: todayOrders,
          monthly_revenue: monthlyRevenue[0]?.total || 0,
          pending_orders: pendingOrders,
          low_stock_count: lowStockProducts,
        },
        recent_orders: recentOrders,
        top_products: topProducts,
        monthly_chart: monthlyChart,
      };

      return Base.sendResponse(res, HTTPS.OK, data);
    } catch (error) {
      console.error("getDashboardStats error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new DashboardController();
