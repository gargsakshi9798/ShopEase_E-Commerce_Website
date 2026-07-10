const express = require("express");
const router = express.Router();
const userController = require("../../../../../controllers/api/v1/admin/user_management/user.controller");

// List routes
router.get("/customers",   userController.getAllCustomers);
router.get("/employees",   userController.getAllEmployees);
router.get("/admins",      userController.getAllAdmins);

// Single user
router.get("/:id",         userController.getById);

// Create
router.post("/employee",   userController.createEmployee);
router.post("/admin",      userController.createAdmin);
router.post("/customer",   userController.createCustomer);

// Update / Block / Delete
router.put("/:id",         userController.update);
router.patch("/:id/block", userController.toggleBlock);
router.delete("/:id",      userController.remove);

module.exports = router;
