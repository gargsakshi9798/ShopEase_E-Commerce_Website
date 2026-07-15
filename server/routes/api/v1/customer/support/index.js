const express    = require("express");
const router     = express.Router();
const controller = require("../../../../../controllers/api/v1/customer/support/support.controller");

router.get("/",              controller.getMyTickets);
router.post("/",             controller.createTicket);
router.get("/:id",           controller.getTicketById);
router.post("/:id/reply",    controller.replyToTicket);
router.patch("/:id/close",   controller.closeTicket);

module.exports = router;
