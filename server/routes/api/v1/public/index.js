const express = require("express");
const router = express.Router();
const homeController = require("../../../../controllers/api/v1/public/home/home.controller");

// Home page data
router.get("/home", homeController.getHomeData);

// Products (public browsing with filter/search)
router.get("/products", homeController.getProducts);
router.get("/products/:slug", homeController.getProductDetail);

// Categories
router.get("/categories", homeController.getCategories);

// FAQs
router.get("/faqs", homeController.getFAQs);

// Contact message (public — no auth required, anyone can submit)
router.post("/contact", async (req, res) => {
  const Base           = require("../../../../helper/exception_handling/index.js");
  const { HTTPS }      = require("../../../../helper/https-status-codes/https-status-codes");
  const ContactMessage = require("../../../../models/ContactMessage");
  try {
    const { name, email, phone, subject, message, department } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Base.sendError(res, HTTPS.BAD_REQUEST, "Name, email and message are required");
    }
    const msg = new ContactMessage({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      phone:   phone?.trim() || "",
      subject: subject?.trim() || department || "General Enquiry",
      message: message.trim(),
      status:  "unread",
      ip_address: req.ip,
      source:  "contact_form",
    });
    await msg.save();
    return Base.sendResponse(res, HTTPS.CREATED, { id: msg._id }, "Message sent successfully");
  } catch (error) {
    console.error("contact message error:", error);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Public settings (logo, site name, feature strips, etc.) — no auth required
router.get("/settings", async (req, res) => {
  const Settings = require("../../../../models/Settings");
  const Base = require("../../../../helper/exception_handling/index.js");
  const { HTTPS } = require("../../../../helper/https-status-codes/https-status-codes");
  try {
    const settings = await Settings.find();
    const result = {};
    settings.forEach((s) => (result[s.key] = s.value));
    return Base.sendResponse(res, HTTPS.OK, result);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
