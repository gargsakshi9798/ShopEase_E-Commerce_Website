const express = require("express");
const router = express.Router();
const Banner = require("../../../../../models/Banner");
const FAQ = require("../../../../../models/FAQ");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload } = require("../../../../../helper/common/utils");

// ─── Banners ───────────────────────────────────────────────────────────────────
router.get("/banners", async (req, res) => {
  const { position } = req.query;
  const filter = position ? { position } : {};
  return Paginate(Banner, { filter, sort: { sort_order: 1 } }, req, res);
});

router.post("/banners", async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = await FileUpload(req.files.image, "/banners");
    const banner = new Banner(data);
    await banner.save();
    return Base.sendResponse(res, HTTPS.CREATED, banner, "Banner created");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.put("/banners/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = await FileUpload(req.files.image, "/banners");
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    return Base.sendResponse(res, HTTPS.OK, banner, "Banner updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.delete("/banners/:id", async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(req.params.id, { status: false });
    return Base.sendResponse(res, HTTPS.OK, null, "Banner deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// ─── FAQs ───────────────────────────────────────────────────────────────────────
router.get("/faqs", async (req, res) => {
  return Paginate(FAQ, { filter: {}, sort: { sort_order: 1 } }, req, res);
});

router.post("/faqs", async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    return Base.sendResponse(res, HTTPS.CREATED, faq, "FAQ created");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.put("/faqs/:id", async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return Base.sendResponse(res, HTTPS.OK, faq, "FAQ updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.delete("/faqs/:id", async (req, res) => {
  try {
    await FAQ.findByIdAndUpdate(req.params.id, { status: false });
    return Base.sendResponse(res, HTTPS.OK, null, "FAQ deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
