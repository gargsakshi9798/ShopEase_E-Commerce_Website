const express = require("express");
const router = express.Router();
const homeController    = require("../../../../controllers/api/v1/public/home/home.controller");
const contactController = require("../../../../controllers/api/v1/public/contact/contact.controller");

// Home page data
router.get("/home", homeController.getHomeData);

// Products (public browsing with filter/search)
router.get("/products", homeController.getProducts);
router.get("/products/:slug", homeController.getProductDetail);

// Categories
router.get("/categories", homeController.getCategories);

// FAQs
router.get("/faqs", homeController.getFAQs);

// Brands
router.get("/brands", homeController.getBrands);

// Contact message (public — no auth required, anyone can submit)
router.post("/contact", contactController.submitContact);

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

// Newsletter subscription (public — stores email, no auth required)
router.post("/newsletter", async (req, res) => {
  const Base = require("../../../../helper/exception_handling/index.js");
  const { HTTPS } = require("../../../../helper/https-status-codes/https-status-codes");
  const ContactMessage = require("../../../../models/ContactMessage");
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Base.sendError(res, HTTPS.BAD_REQUEST, "Please provide a valid email address");
    }
    // Reuse ContactMessage with type "newsletter" to store the email
    await ContactMessage.create({
      name: "Newsletter Subscriber",
      email,
      subject: "Newsletter Subscription",
      message: `Newsletter subscription request from ${email}`,
      department: "general",
      status: "new",
    });
    return Base.sendResponse(res, HTTPS.OK, null, "Subscribed successfully!");
  } catch (err) {
    // Ignore duplicate key errors — subscriber already exists
    if (err.code === 11000) {
      return Base.sendResponse(res, HTTPS.OK, null, "You are already subscribed!");
    }
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, "Failed to subscribe");
  }
});

module.exports = router;
