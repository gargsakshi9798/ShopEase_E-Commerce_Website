const express = require("express");
const router = express.Router();
const dashboardController = require("../../../../../controllers/api/v1/admin/dashboard/dashboard.controller");

router.get("/",         dashboardController.getDashboardStats);
router.get("/employee", dashboardController.getEmployeeDashboardStats);

module.exports = router;
