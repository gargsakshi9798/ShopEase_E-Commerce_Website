const express = require("express");
const router = express.Router();
const User = require("../../../../../models/User");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { FileUpload } = require("../../../../../helper/common/utils");

// Get profile
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.user).populate("role_id", "name slug");
    if (!user) return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");
    return Base.sendResponse(res, HTTPS.OK, user);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Update profile
router.put("/", async (req, res) => {
  try {
    const { name, contact_no } = req.body;
    const updateData = { name, contact_no };

    if (req.files?.profile_image) {
      updateData.profile_image = await FileUpload(req.files.profile_image, "/users");
    }

    const user = await User.findByIdAndUpdate(req.user.user, updateData, { new: true });
    return Base.sendResponse(res, HTTPS.OK, user, "Profile updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
