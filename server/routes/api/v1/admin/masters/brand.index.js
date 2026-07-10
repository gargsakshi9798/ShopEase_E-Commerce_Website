const express = require("express");
const router = express.Router();
const brandController = require("../../../../../controllers/api/v1/admin/masters/brand.controller");

router.get("/", brandController.getAll);
router.get("/:id", brandController.getById);
router.post("/", brandController.create);
router.put("/:id", brandController.update);
router.delete("/:id", brandController.remove);

module.exports = router;
