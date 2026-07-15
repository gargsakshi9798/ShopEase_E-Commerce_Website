const Base            = require("../../../../../helper/exception_handling/index.js");
const { HTTPS }       = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate }    = require("../../../../../helper/common/utils");
const SupportTicket   = require("../../../../../models/SupportTicket");

class CustomerSupportController {

  // POST /customer/support/tickets — create new ticket
  async createTicket(req, res) {
    try {
      const customerId = req.user?.user;
      const { subject, description, category, order_id } = req.body;

      if (!subject?.trim())      return Base.sendError(res, HTTPS.BAD_REQUEST, "Subject is required");
      if (!description?.trim())  return Base.sendError(res, HTTPS.BAD_REQUEST, "Description is required");

      const ticket = new SupportTicket({
        user_id:     customerId,
        subject:     subject.trim(),
        description: description.trim(),
        category:    category || "other",
        priority:    "medium",
        status:      "open",
        order_id:    order_id || null,
      });

      await ticket.save();
      await ticket.populate("user_id", "name email");

      return Base.sendResponse(res, HTTPS.CREATED, ticket, "Ticket created successfully");
    } catch (error) {
      console.error("createTicket error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /customer/support/tickets — list my tickets
  async getMyTickets(req, res) {
    try {
      const customerId = req.user?.user;
      const { status, category } = req.query;

      const filter = { user_id: customerId };
      if (status)   filter.status   = status;
      if (category) filter.category = category;

      return Paginate(
        SupportTicket,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [{ path: "order_id", select: "order_number total_amount" }],
        },
        req,
        res
      );
    } catch (error) {
      console.error("getMyTickets error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // GET /customer/support/tickets/:id — single ticket detail with full conversation
  async getTicketById(req, res) {
    try {
      const customerId = req.user?.user;

      const ticket = await SupportTicket.findOne({
        _id:     req.params.id,
        user_id: customerId,            // ensure customer owns this ticket
      })
        .populate("order_id",    "order_number total_amount order_status")
        .populate("assigned_to", "name");

      if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");
      return Base.sendResponse(res, HTTPS.OK, ticket);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // POST /customer/support/tickets/:id/reply — customer adds a reply
  async replyToTicket(req, res) {
    try {
      const customerId = req.user?.user;
      const { message } = req.body;

      if (!message?.trim()) return Base.sendError(res, HTTPS.BAD_REQUEST, "Message is required");

      // Verify ownership
      const ticket = await SupportTicket.findOne({ _id: req.params.id, user_id: customerId });
      if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");

      if (["resolved", "closed"].includes(ticket.status)) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Cannot reply to a resolved or closed ticket");
      }

      const reply = {
        message:     message.trim(),
        sender_type: "customer",
        sender_id:   customerId,
        sender_name: req.user?.name || "Customer",
        created_at:  new Date(),
      };

      const updated = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        {
          $push:         { replies: reply },
          status:        "open",           // re-open if waiting_customer
          last_reply_at: new Date(),
        },
        { new: true }
      ).populate("order_id", "order_number").populate("assigned_to", "name");

      return Base.sendResponse(res, HTTPS.OK, updated, "Reply sent");
    } catch (error) {
      console.error("replyToTicket error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // PATCH /customer/support/tickets/:id/close — customer closes/resolves their ticket
  async closeTicket(req, res) {
    try {
      const customerId = req.user?.user;

      const ticket = await SupportTicket.findOne({ _id: req.params.id, user_id: customerId });
      if (!ticket) return Base.sendError(res, HTTPS.NOT_FOUND, "Ticket not found");

      const updated = await SupportTicket.findByIdAndUpdate(
        req.params.id,
        { status: "closed", closed_at: new Date() },
        { new: true }
      );

      return Base.sendResponse(res, HTTPS.OK, updated, "Ticket closed");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new CustomerSupportController();
