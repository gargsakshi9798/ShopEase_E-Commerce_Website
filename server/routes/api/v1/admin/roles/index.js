const express = require("express");
const router = express.Router();
const Role = require("../../../../../models/Role");
const Permission = require("../../../../../models/Permission");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");

// ─── Roles ─────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");
    return Base.sendResponse(res, HTTPS.OK, roles);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, slug, description, permissions } = req.body;
    const role = new Role({ name, slug, description, permissions: permissions || [] });
    await role.save();
    return Base.sendResponse(res, HTTPS.CREATED, role, "Role created");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return Base.sendResponse(res, HTTPS.OK, role, "Role updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.put("/:id/permissions", async (req, res) => {
  try {
    const { permissions } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    ).populate("permissions");
    return Base.sendResponse(res, HTTPS.OK, role, "Permissions updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Role.findByIdAndUpdate(req.params.id, { status: false });
    return Base.sendResponse(res, HTTPS.OK, null, "Role deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// ─── Permissions ───────────────────────────────────────────────────────────────
router.get("/permissions", async (req, res) => {
  try {
    const permissions = await Permission.find({ status: true }).sort({ module: 1, permission_id: 1 });
    return Base.sendResponse(res, HTTPS.OK, permissions);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
