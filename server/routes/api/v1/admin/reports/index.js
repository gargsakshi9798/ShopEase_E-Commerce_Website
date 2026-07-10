const express = require("express");
const router = express.Router();
const Order = require("../../../../../models/Order");
const User = require("../../../../../models/User");
const Product = require("../../../../../models/Product");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");

// Sales Report
router.get("/sales", async (req, res) => {
  try {
    const { start_date, end_date, group_by = "day" } = req.query;
    const matchStage = { payment_status: "paid" };
    if (start_date || end_date) {
      matchStage.createdAt = {};
      if (start_date) matchStage.createdAt.$gte = new Date(start_date);
      if (end_date) matchStage.createdAt.$lte = new Date(end_date);
    }

    const groupFormat = group_by === "month" ? { $month: "$createdAt" } :
      group_by === "year" ? { $year: "$createdAt" } :
      { $dayOfMonth: "$createdAt" };

    const data = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          orders: { $sum: 1 },
          revenue: { $sum: "$total_amount" },
          avg_order_value: { $avg: "$total_amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return Base.sendResponse(res, HTTPS.OK, data);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Revenue Report
router.get("/revenue", async (req, res) => {
  try {
    const [totalRevenue, monthlyRevenue, yearlyRevenue] = await Promise.all([
      Order.aggregate([{ $match: { payment_status: "paid" } }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]),
      Order.aggregate([
        { $match: { payment_status: "paid", createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]),
      Order.aggregate([
        { $match: { payment_status: "paid", createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]),
    ]);

    return Base.sendResponse(res, HTTPS.OK, {
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0,
      yearly: yearlyRevenue[0]?.total || 0,
    });
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Top Products
router.get("/top-products", async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product_id", total_sold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.total" } } },
      { $sort: { total_sold: -1 } },
      { $limit: 20 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { name: "$product.name", thumbnail: "$product.thumbnail", total_sold: 1, revenue: 1 } },
    ]);
    return Base.sendResponse(res, HTTPS.OK, data);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Customer Report
router.get("/customers", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const filter = {};
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) filter.createdAt.$lte = new Date(end_date);
    }
    const total = await User.countDocuments(filter);
    return Base.sendResponse(res, HTTPS.OK, { total });
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
