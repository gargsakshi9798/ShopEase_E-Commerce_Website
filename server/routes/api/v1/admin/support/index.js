const express          = require("express");
const router           = express.Router();
const Ticket           = require("../../../../../models/SupportTicket");
const ContactMessage   = require("../../../../../models/ContactMessage");
const Base             = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }        = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate }     = require("../../../../../helper/common/utils");

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /admin/support/tickets — list with filters
router.get("/tickets", async (req, res) => {
  try {
    const { search, status, priority, category, assigned_to } = req.query;
    const filter = {};
    if (search)      filter.$or = [
      { ticket_number: { $regex: search, $options: "i" } },
      { subject:       { $regex: search, $options: "i" } },
      { guest_email:   { $regex: search, $options: "i" } },
    ];
    if (status)      filter.status   = status;
    if (priority)    filter.priority = priority;
    if (category)    filter.category = category;
    if (assigned_to) filter.assigned_to = assigned_to;

    return Paginate(
      Ticket,
      {
        filter,
        sort: { createdAt: -1 },
        populate: [
          { path: "user_id",     select: "name email contact_no" },
          { path: "assigned_to", select: "name email" },
          { path: "order_id",    select: "order_number total_amount" },
        ],
      },
      req, res
    );
  } catch (e) {
    console.error(e);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/support/tickets/stats
router.get("/tickets/stats", async (req, res) => {
  try {
    const [byStatus, byPriority] = await Promise.all([
      Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ]);
    return Base.sendResponse(res, HTTPS.OK, { byStatus, byPriority });
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/support/tickets/:id
router.get("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("user_id",     "name email contact_no")
      .populate("assigned_to", "name email")
      .populate("order_id",    "order_number total_amount order_status")
      .populate("replies.sender_id", "name role");
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");
    return Base.sendResponse(res, HTTPS.OK, ticket);
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/status
router.patch("/tickets/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === "resolved") update.resolved_at = new Date();
    if (status === "closed")   update.closed_at   = new Date();
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, ticket, "Status updated");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/assign
router.patch("/tickets/:id/assign", async (req, res) => {
  try {
    const { employee_id } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assigned_to: employee_id, status: "in_progress" },
      { new: true }
    ).populate("assigned_to", "name email");
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, ticket, "Ticket assigned");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/priority
router.patch("/tickets/:id/priority", async (req, res) => {
  try {
    const { priority } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, ticket, "Priority updated");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// POST /admin/support/tickets/:id/reply
router.post("/tickets/:id/reply", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Message is required");

    const reply = {
      message:     message.trim(),
      sender_type: "admin",
      sender_id:   req.user?.user,
      sender_name: req.user?.name || "Admin",
      created_at:  new Date(),
    };

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: { replies: reply },
        status: "waiting_customer",
        last_reply_at: new Date(),
      },
      { new: true }
    ).populate("user_id", "name email").populate("assigned_to", "name");

    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, ticket, "Reply sent");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/support/tickets/:id
router.delete("/tickets/:id", async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    return Base.sendResponse(res, HTTPS.OK, null, "Ticket deleted");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

// GET /admin/support/messages
router.get("/messages", async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name:    { $regex: search, $options: "i" } },
      { email:   { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
    if (status) filter.status = status;

    return Paginate(
      ContactMessage,
      { filter, sort: { createdAt: -1 }, populate: [{ path: "replied_by", select: "name" }] },
      req, res
    );
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/support/messages/:id
router.get("/messages/:id", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "read" } },
      { new: true }
    ).populate("replied_by", "name email");
    if (!msg) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, msg);
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// POST /admin/support/messages/:id/reply
router.post("/messages/:id/reply", async (req, res) => {
  try {
    const { reply_message, admin_notes } = req.body;
    if (!reply_message?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Reply message is required");

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        status:        "replied",
        reply_message: reply_message.trim(),
        admin_notes:   admin_notes || "",
        replied_by:    req.user?.user,
        replied_at:    new Date(),
      },
      { new: true }
    );
    if (!msg) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, msg, "Reply sent");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/messages/:id/archive
router.patch("/messages/:id/archive", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
    if (!msg) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, msg, "Message archived");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/support/messages/:id
router.delete("/messages/:id", async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    return Base.sendResponse(res, HTTPS.OK, null, "Message deleted");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
