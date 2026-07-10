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

module.exports = router;
