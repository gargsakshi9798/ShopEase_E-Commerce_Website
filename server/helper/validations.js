const { check, validationResult } = require("express-validator");
const Base = require("./exception_handling/index.js");
const { HTTPS } = require("./https-status-codes/https-status-codes");

// ─── Helper Validators ────────────────────────────────────────────────────────
const Required = (field, label) => [
  check(field).notEmpty().withMessage(`${label || field} is required`),
];

const OptionalString = (field) => [check(field).optional().isString()];

const RequiredEmail = (field) => [
  check(field)
    .notEmpty().withMessage(`${field} is required`)
    .isEmail().withMessage(`${field} must be a valid email address`),
];

const OptionalEmail = (field) => [
  check(field).optional().isEmail().withMessage(`${field} must be a valid email`),
];

const RequiredBool = (field) => [
  check(field)
    .notEmpty().withMessage(`${field} is required`)
    .isBoolean().withMessage(`${field} must be boolean`),
];

const RequiredInt = (field) => [
  check(field)
    .notEmpty().withMessage(`${field} is required`)
    .isInt().withMessage(`${field} must be an integer`),
];

const RequiredDecimal = (field) => [
  check(field)
    .notEmpty().withMessage(`${field} is required`)
    .isDecimal().withMessage(`${field} must be a decimal number`),
];

// ─── Validation Rules Object ──────────────────────────────────────────────────
const Validation = {
  // Auth
  name: Required("name", "Name"),
  email: RequiredEmail("email"),
  password: Required("password", "Password"),
  contact_no: Required("contact_no", "Contact Number"),
  otp: Required("otp", "OTP"),
  email_or_contact: Required("email_or_contact", "Email or Contact"),
  new_password: Required("new_password", "New Password"),

  // Common
  status: RequiredBool("status"),
  description: OptionalString("description"),
  title: Required("title", "Title"),
  image: Required("image", "Image"),

  // Product
  product_name: Required("product_name", "Product Name"),
  price: RequiredDecimal("price"),
  mrp: RequiredDecimal("mrp"),
  stock: RequiredInt("stock"),
  category_id: Required("category_id", "Category"),
  brand_id: Required("brand_id", "Brand"),

  // Order
  address_id: Required("address_id", "Delivery Address"),
  payment_method: Required("payment_method", "Payment Method"),

  // Coupon
  code: Required("code", "Coupon Code"),
  discount_type: Required("discount_type", "Discount Type"),
  discount_value: RequiredDecimal("discount_value"),

  // Address
  address_line1: Required("address_line1", "Address Line 1"),
  city: Required("city", "City"),
  state: Required("state", "State"),
  pincode: Required("pincode", "Pincode"),
  country: Required("country", "Country"),

  // Review
  rating: Required("rating", "Rating"),

  // Employee
  role_id: Required("role_id", "Role"),
};

// ─── Final Validation Middleware ──────────────────────────────────────────────
const Validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Base.sendError(res, HTTPS.UNPROCESSABLE_ENTITY, errors.mapped());
  }
  next();
};

module.exports = { Validation, Validate };
