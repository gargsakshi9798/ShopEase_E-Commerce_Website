const express    = require("express");
const router     = express.Router();
const controller = require("../../../../../controllers/api/v1/customer/giftcard/giftcard.controller");

// POST /customer/gift-cards/initiate-payment   — step 1: create Razorpay order
router.post("/initiate-payment", controller.initiatePayment);

// POST /customer/gift-cards/verify-payment     — step 2: verify & create card
router.post("/verify-payment",   controller.verifyAndCreate);

// GET  /customer/gift-cards                    — list my gift cards
router.get("/",                  controller.myGiftCards);

// GET  /customer/gift-cards/balance/:code      — check balance
router.get("/balance/:code",     controller.checkBalance);

// POST /customer/gift-cards/redeem             — redeem at checkout
router.post("/redeem",           controller.redeem);

module.exports = router;
