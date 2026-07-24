const express = require("express");
const router = express.Router();
const Notification = require("../../../../../models/Notification");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");

// Get notifications
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const per_page = parseInt(req.query.per_page) || 20;
    const skip = (page - 1) * per_page;

    const filter = {
      $or: [{ user_id: req.user.user }, { user_id: null }],
      status: true,
    };

    const [data, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(per_page),
      Notification.countDocuments(filter),
    ]);

    return Base.sendResponse(res, HTTPS.OK, {
      data,
      unread: await Notification.countDocuments({ ...filter, is_read: false }),
      current_page: page,
      total_pages: Math.ceil(total / per_page),
      total,
    });
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Mark as read
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user },
      { is_read: true, read_at: new Date() }
    );
    return Base.sendResponse(res, HTTPS.OK, null, "Marked as read");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Mark all as read
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.user, is_read: false },
      { is_read: true, read_at: new Date() }
    );
    return Base.sendResponse(res, HTTPS.OK, null, "All marked as read");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Delete a single notification
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.user,   // customers can only delete their own
    });
    if (!deleted) {
      return Base.sendError(res, HTTPS.NOT_FOUND, "Notification not found");
    }
    return Base.sendResponse(res, HTTPS.OK, null, "Notification deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Clear all notifications for this customer
router.delete("/", async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user.user });
    return Base.sendResponse(res, HTTPS.OK, null, "All notifications cleared");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
