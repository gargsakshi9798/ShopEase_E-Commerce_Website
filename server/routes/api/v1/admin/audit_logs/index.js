const express = require("express");
const router  = express.Router();
const AuditLog = require("../../../../../models/AuditLog");
const Base     = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }  = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate } = require("../../../../../helper/common/utils");

// GET /admin/audit-logs — paginated, filterable
router.get("/", async (req, res) => {
  try {
    const { search, action, module: mod, start_date, end_date } = req.query;
    const filter = {};

    if (search)  filter.description = { $regex: search, $options: "i" };
    if (action)  filter.action      = action.toUpperCase();
    if (mod)     filter.module      = { $regex: mod, $options: "i" };
    if (start_date || end_date) {
      filter.createdAt = {};
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date)   filter.createdAt.$lte = new Date(end_date + "T23:59:59");
    }

    return Paginate(
      AuditLog,
      { filter, sort: { createdAt: -1 }, populate: [{ path: "user_id", select: "name email" }] },
      req,
      res
    );
  } catch (error) {
    console.error("audit logs error:", error);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/audit-logs/:id — single log
router.get("/:id", async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate("user_id", "name email");
    if (!log) return Base.sendError(res, HTTPS.NOT_FOUND, "Log not found");
    return Base.sendResponse(res, HTTPS.OK, log);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/audit-logs/clear — clear old logs (super_admin only)
router.delete("/clear", async (req, res) => {
  try {
    const { before_date } = req.body;
    const filter = {};
    if (before_date) filter.createdAt = { $lt: new Date(before_date) };
    const result = await AuditLog.deleteMany(filter);
    return Base.sendResponse(res, HTTPS.OK, { deleted: result.deletedCount }, "Audit logs cleared");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
