const express = require("express");
const router = express.Router();
const categoryController = require("../../../../../controllers/api/v1/admin/masters/category.controller");
const { PermissionMiddleware } = require("../../../../../middleware/permission.middleware");
const { IDS } = require("../../../../../helper/fix_ids");

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);
router.patch("/:id/status", categoryController.toggleStatus);

module.exports = router;
