const express = require("express");
const router = express.Router();
const Settings = require("../../../../../models/Settings");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { FileUpload } = require("../../../../../helper/common/utils");

router.get("/", async (req, res) => {
  try {
    const settings = await Settings.find();
    const result = {};
    settings.forEach((s) => (result[s.key] = s.value));
    return Base.sendResponse(res, HTTPS.OK, result);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.put("/", async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    }
    if (req.files?.logo) {
      const logoUrl = await FileUpload(req.files.logo, "/settings");
      await Settings.findOneAndUpdate({ key: "logo" }, { value: logoUrl }, { upsert: true });
    }
    return Base.sendResponse(res, HTTPS.OK, null, "Settings updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
