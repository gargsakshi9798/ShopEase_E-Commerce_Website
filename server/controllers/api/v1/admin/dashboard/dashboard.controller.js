const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const User = require("../../../../../models/User");
const Order = require("../../../../../models/Order");
const Product = require("../../../../../models/Product");
const Review = require("../../../../../models/Review");

class DashboardController {
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
