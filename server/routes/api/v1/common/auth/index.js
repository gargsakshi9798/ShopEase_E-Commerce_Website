const express = require("express");
const router = express.Router();
const { Validation, Validate } = require("../../../../../helper/validations");
const authController = require("../../../../../controllers/api/v1/common/auth/auth.controller");
const { AuthMiddleware, CustomerMiddleware } = require("../../../../../middleware/auth.middleware");

// ─── Admin Auth ────────────────────────────────────────────────────────────────
router.post(
  "/admin-login",
  Validation.email,
  Validation.password,
  Validate,
  authController.adminLogin
);
router.get("/admin-details", AuthMiddleware, authController.adminDetails);

// ─── Customer Auth ─────────────────────────────────────────────────────────────
router.post(
  "/register",
  Validation.name,
  Validation.email,
  Validation.password,
  Validate,
  authController.customerRegister
);
router.post("/verify-email", authController.verifyEmailOTP);

router.post(
  "/login",
  Validation.email,
  Validation.password,
  Validate,
  authController.customerLogin
);

// ─── Password Management ───────────────────────────────────────────────────────
router.post("/forgot-password", Validation.email, Validate, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", AuthMiddleware, authController.changePassword);

module.exports = router;
