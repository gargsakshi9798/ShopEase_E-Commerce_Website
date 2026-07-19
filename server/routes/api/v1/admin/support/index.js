"use strict";

const express        = require("express");
const router         = express.Router();
const mongoose       = require("mongoose");
const Ticket         = require("../../../../../models/SupportTicket");
const ContactMessage = require("../../../../../models/ContactMessage");
const Base           = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }      = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate }   = require("../../../../../helper/common/utils");

// ─── Role helpers ─────────────────────────────────────────────────────────────
// JWT payload: { user: ObjectId, role: "super_admin"|"admin"|"employee", ... }
const role        = (req) => req.user?.role || "";
const isSuperAdmin = (req) => role(req) === "super_admin";
const isAdmin      = (req) => role(req) === "admin";
const isEmployee   = (req) => role(req) === "employee";
const isAdminOrAbove = (req) => isAdmin(req) || isSuperAdmin(req);

/**
 * PERMISSION MATRIX
 * ──────────────────────────────────────────────────────────────
 *  Action                    Employee   Admin   SuperAdmin
 *  View tickets list         own only   all     all
 *  View ticket detail        own only   all     all
 *  Reply to ticket           own only   all     all
 *  Update status             own only   all     all
 *  Update priority           ✗          all     all
 *  Assign ticket             ✗          all     all
 *  Delete ticket             ✗          ✗       ✓
 *
 *  View messages             ✓          ✓       ✓
 *  Reply to message          ✓          ✓       ✓
 *  Archive message           ✓          ✓       ✓
 *  Delete message            ✗          ✗       ✓
 * ──────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /admin/support/tickets
// Employee → only tickets assigned to them
// Admin/SuperAdmin → all tickets (with optional filters)
router.get("/tickets", async (req, res) => {
  try {
    const { search, status, priority, category, assigned_to } = req.query;
    const filter = {};

    // Employees see ALL open/in_progress tickets (so they have visibility),
    // but can only act on tickets assigned to them (enforced at action routes).
    // Remove the assigned_to filter so employee sees the full queue.
    if (!isEmployee(req)) {
      if (assigned_to) filter.assigned_to = assigned_to;
    }

    if (search) filter.$or = [
      { ticket_number: { $regex: search, $options: "i" } },
      { subject:       { $regex: search, $options: "i" } },
      { guest_email:   { $regex: search, $options: "i" } },
    ];
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

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
    console.error("[Support] GET /tickets:", e.message);
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/support/tickets/stats
// Employee → stats for their own assigned tickets only
router.get("/tickets/stats", async (req, res) => {
  try {
    // Employee sees stats for all tickets (same as their list view)
    const matchStage = { $match: {} };

    const [byStatus, byPriority] = await Promise.all([
      Ticket.aggregate([matchStage, { $group: { _id: "$status",   count: { $sum: 1 } } }]),
      Ticket.aggregate([matchStage, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ]);
    return Base.sendResponse(res, HTTPS.OK, { byStatus, byPriority });
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// GET /admin/support/tickets/:id
// Employee → only if the ticket is assigned to them
router.get("/tickets/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("user_id",           "name email contact_no")
      .populate("assigned_to",       "name email")
      .populate("order_id",          "order_number total_amount order_status")
      .populate("replies.sender_id", "name");

    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");

    // Employee can only view tickets assigned to them
    if (isEmployee(req) && String(ticket.assigned_to?._id || ticket.assigned_to) !== String(req.user.user)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "You are not assigned to this ticket");
    }

    return Base.sendResponse(res, HTTPS.OK, ticket);
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/status
// Employee → only own assigned tickets
router.patch("/tickets/:id/status", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");

    if (isEmployee(req) && String(ticket.assigned_to) !== String(req.user.user)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "You can only update status on tickets assigned to you");
    }

    const { status } = req.body;
    const update = { status };
    if (status === "resolved") update.resolved_at = new Date();
    if (status === "closed")   update.closed_at   = new Date();

    const updated = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true });
    return Base.sendResponse(res, HTTPS.OK, updated, "Status updated");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/priority
// Admin and SuperAdmin only — employees cannot change priority
router.patch("/tickets/:id/priority", async (req, res) => {
  try {
    if (!isAdminOrAbove(req)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "Only admin or super admin can change ticket priority");
    }
    const { priority } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, ticket, "Priority updated");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// PATCH /admin/support/tickets/:id/assign
// Admin and SuperAdmin only — employees cannot assign tickets
router.patch("/tickets/:id/assign", async (req, res) => {
  try {
    if (!isAdminOrAbove(req)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "Only admin or super admin can assign tickets");
    }
    const { employee_id } = req.body;
    if (!employee_id) return Base.sendError(res, HTTPS.BAD_REQUEST, "employee_id is required");

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

// POST /admin/support/tickets/:id/reply
// Employee → only own assigned tickets; Admin/SuperAdmin → any ticket
router.post("/tickets/:id/reply", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");

    if (isEmployee(req) && String(ticket.assigned_to) !== String(req.user.user)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "You can only reply to tickets assigned to you");
    }

    const { message } = req.body;
    if (!message?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Message is required");

    const senderRole = role(req);
    const reply = {
      message:     message.trim(),
      sender_type: "admin",
      sender_id:   req.user.user,
      sender_name: req.user.name || (senderRole === "employee" ? "Employee" : "Admin"),
      created_at:  new Date(),
    };

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply }, status: "waiting_customer", last_reply_at: new Date() },
      { new: true }
    ).populate("user_id", "name email").populate("assigned_to", "name");

    return Base.sendResponse(res, HTTPS.OK, updated, "Reply sent");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/support/tickets/:id
// SuperAdmin ONLY
router.delete("/tickets/:id", async (req, res) => {
  try {
    if (!isSuperAdmin(req)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "Only super admin can delete support tickets");
    }
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");
    return Base.sendResponse(res, HTTPS.OK, null, "Ticket deleted permanently");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

// GET /admin/support/messages
// All roles can view all messages
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
// All roles — marks as read on open
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
// All roles can reply
router.post("/messages/:id/reply", async (req, res) => {
  try {
    const { reply_message, admin_notes } = req.body;
    if (!reply_message?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Reply message is required");

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        status:        "replied",
        reply_message: reply_message.trim(),
        admin_notes:   admin_notes?.trim() || "",
        replied_by:    req.user.user,
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
// All roles can archive
router.patch("/messages/:id/archive", async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id, { status: "archived" }, { new: true }
    );
    if (!msg) return Base.sendError(res, HTTPS.NOT_FOUND);
    return Base.sendResponse(res, HTTPS.OK, msg, "Message archived");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// DELETE /admin/support/messages/:id
// SuperAdmin ONLY
router.delete("/messages/:id", async (req, res) => {
  try {
    if (!isSuperAdmin(req)) {
      return Base.sendError(res, HTTPS.FORBIDDEN, "Only super admin can delete contact messages");
    }
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return Base.sendError(res, HTTPS.NOT_FOUND, "Message not found");
    return Base.sendResponse(res, HTTPS.OK, null, "Message deleted permanently");
  } catch (e) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
