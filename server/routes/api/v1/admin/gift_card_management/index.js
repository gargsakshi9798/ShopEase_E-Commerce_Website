const express    = require("express");
const router     = express.Router();
const controller = require("../../../../../controllers/api/v1/admin/gift_card_management/giftcard.admin.controller");

// GET    /admin/gift-cards            — list all (paginated)
router.get("/",                   controller.getAll);

// GET    /admin/gift-cards/stats      — summary stats
router.get("/stats",              controller.getStats);

// GET    /admin/gift-cards/:id        — single card detail
router.get("/:id",                controller.getById);

// POST   /admin/gift-cards/issue      — Admin/SuperAdmin directly issue card
router.post("/issue",             controller.issue);

// PATCH  /admin/gift-cards/:id/review  — Employee reviews a pending_review card
router.patch("/:id/review",       controller.review);

// PATCH  /admin/gift-cards/:id/approve — Admin/SuperAdmin approves
router.patch("/:id/approve",      controller.approve);

// PATCH  /admin/gift-cards/:id/reject  — Admin/SuperAdmin rejects
router.patch("/:id/reject",       controller.reject);

// PATCH  /admin/gift-cards/:id/cancel  — Admin/SuperAdmin cancels
router.patch("/:id/cancel",       controller.cancel);

module.exports = router;
