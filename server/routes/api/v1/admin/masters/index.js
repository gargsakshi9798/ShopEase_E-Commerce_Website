const express = require("express");
const router = express.Router();

router.use("/category", require("./category.index"));
router.use("/brand", require("./brand.index"));

module.exports = router;
