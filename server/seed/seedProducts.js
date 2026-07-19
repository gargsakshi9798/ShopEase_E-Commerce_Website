/**
 * ShopEase — Product Seed Script
 * 100 products across 11 categories with real Unsplash image URLs
 * Usage: node server/seed/seedProducts.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

// ─── Slug helper ──────────────────────────────────────────────────────────────
const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Fashion",        slug: "fashion",        icon: "👕" },
  { name: "Electronics",   slug: "electronics",    icon: "💻" },
  { name: "Mobiles",       slug: "mobiles",        icon: "📱" },
  { name: "Home & Kitchen",slug: "home-kitchen",   icon: "🏠" },
  { name: "Appliances",    slug: "appliances",     icon: "🔌" },
  { name: "Beauty",        slug: "beauty",         icon: "💄" },
  { name: "Sports",        slug: "sports",         icon: "🏋️" },
  { name: "Books",         slug: "books",          icon: "📚" },
  { name: "Toys",          slug: "toys",           icon: "🧸" },
  { name: "Grocery",       slug: "grocery",        icon: "🛒" },
  { name: "Automotive",    slug: "automotive",     icon: "🚗" },
];


// ─── Brands ───────────────────────────────────────────────────────────────────
const BRANDS = [
  "Nike","Adidas","Puma","Levi's","H&M",                          // Fashion
  "Samsung","LG","Sony","Dell","HP","Lenovo","Apple","Asus","Acer",// Electronics/Mobiles
  "OnePlus","Xiaomi","Realme","Vivo","Oppo",                       // Mobiles
  "IKEA","Prestige","Hawkins","Milton","Borosil",                  // Home/Kitchen
  "Whirlpool","Haier","Voltas","Godrej","Bajaj",                   // Appliances
  "Lakme","Maybelline","L'Oreal","Himalaya","Biotique",            // Beauty
  "Cosco","Nivia","Decathlon","Reebok","Yonex",                    // Sports
  "Penguin","HarperCollins","Scholastic","Oxford","Wiley",         // Books
  "Lego","Hasbro","Mattel","Fisher-Price","Hot Wheels",            // Toys
  "Amul","Nestle","Britannia","Haldiram's","ITC",                  // Grocery
  "Bosch","3M","Castrol","Michelin","MRF",                         // Automotive
];

