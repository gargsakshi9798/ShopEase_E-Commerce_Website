const express = require("express");
const router = express.Router();
const productController = require("../../../../../controllers/api/v1/admin/product_management/product.controller");

router.get("/",          productController.getAll);
router.get("/inventory", productController.getAllForInventory);   // all products with brand+category
router.get("/low-stock", productController.getLowStock);
router.get("/:id",       productController.getById);
router.post("/",         productController.create);
router.put("/:id",       productController.update);
router.delete("/:id",    productController.remove);
router.patch("/:id/stock", productController.updateStock);

module.exports = router;
