const express = require("express");
const router = express.Router();
const couponController = require("../../../../../controllers/api/v1/admin/coupon_management/coupon.controller");

router.get("/", couponController.getAll);
router.get("/:id", couponController.getById);
router.post("/", couponController.create);
router.post("/validate", couponController.validate);
router.put("/:id", couponController.update);
router.delete("/:id", couponController.remove);

module.exports = router;
