"use strict";

const Base     = require("../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../helper/https-status-codes/https-status-codes");
const { Paginate } = require("../../../../helper/common/utils");

const AccountDeletionRequest = require("../../../../models/AccountDeletionRequest");
const User    = require("../../../../models/User");
const Order   = require("../../../../models/Order");
const Payment = require("../../../../models/Payment");
const Role    = require("../../../../models/Role");

const { sendAccountDeletionRequestEmail,
        sendAccountDeletionStatusEmail } = require("../../../../helper/NodeMailer");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the role slug of a user doc (already populated with role_id) */
const getRoleSlug = (user) => user?.role_id?.slug || "";

/** Build a timeline entry */
const entry = (action, actorId, actorName, actorRole, note = "") => ({
  action, actor_id: actorId, actor_name: actorName, actor_role: actorRole,
  note, at: new Date(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class CustomerDeletionController {
  /**
   * POST /customer/account-deletion
   * Customer submits a deletion request.
   */
  async submitRequest(req, res) {
    try {
      const customerId = req.user.user;
      const { reason, additional_info = "" } = req.body;

      if (!reason?.trim())
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Reason is required");

      // Check for an already-active request
      const existing = await AccountDeletionRequest.findOne({
        customer_id: customerId,
        status: { $in: ["pending", "reviewed", "approved"] },
      });
      if (existing)
        return Base.sendError(
          res, HTTPS.CONFLICT,
          "You already have an active deletion request. Please wait for it to be processed."
        );

      const customer = await User.findById(customerId).populate("role_id", "slug");
      if (!customer)
        return Base.sendError(res, HTTPS.NOT_FOUND, "User not found");

      const request = await AccountDeletionRequest.create({
        customer_id:     customerId,
        customer_name:   customer.name,
        customer_email:  customer.email,
        reason:          reason.trim(),
        additional_info: additional_info.trim(),
        status:          "pending",
        timeline: [entry("submitted", customerId, customer.name, "customer",
          "Customer submitted account deletion request")],
      });

      // Non-blocking notification email
      sendAccountDeletionRequestEmail(customer.email, {
        customer_name:  customer.name,
        request_id:     request._id.toString(),
        reason:         request.reason,
      }).catch(console.error);

      return Base.sendResponse(res, HTTPS.CREATED, { request_id: request._id },
        "Deletion request submitted. Our team will review it shortly.");
    } catch (err) {
      console.error("[AccountDeletion] submitRequest:", err.message);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * GET /customer/account-deletion
   * Customer checks the status of their own request.
   */
  async getMyRequest(req, res) {
    try {
      const request = await AccountDeletionRequest.findOne({
        customer_id: req.user.user,
        status: { $in: ["pending", "reviewed", "approved"] },
      })
        .populate("reviewed_by", "name")
        .populate("decided_by",  "name");

      return Base.sendResponse(res, HTTPS.OK, request || null);
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * DELETE /customer/account-deletion
   * Customer cancels their own pending request.
   */
  async cancelRequest(req, res) {
    try {
      const request = await AccountDeletionRequest.findOne({
        customer_id: req.user.user,
        status: "pending",            // can only cancel when still pending
      });
      if (!request)
        return Base.sendError(res, HTTPS.NOT_FOUND,
          "No pending request found to cancel");

      request.status = "rejected";
      request.rejection_reason = "Cancelled by customer";
      request.timeline.push(
        entry("cancelled", req.user.user, "Customer", "customer", "Customer cancelled their own request")
      );
      await request.save();

      return Base.sendResponse(res, HTTPS.OK, null, "Deletion request cancelled");
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / EMPLOYEE CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

class AdminDeletionController {
  /**
   * GET /admin/account-deletion
   * List all requests with filters (status, search, page).
   * Employee sees only pending/reviewed; admin+superadmin see all.
   */
  async getAll(req, res) {
    try {
      const actor = await User.findById(req.user.user).populate("role_id", "slug name");
      const slug  = getRoleSlug(actor);

      const { status, search, page = 1, per_page = 15 } = req.query;
      const filter = {};

      // Employees can only see pending & reviewed requests
      if (slug === "employee") {
        filter.status = { $in: ["pending", "reviewed"] };
      } else if (status) {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { customer_name:  { $regex: search, $options: "i" } },
          { customer_email: { $regex: search, $options: "i" } },
          { reason:         { $regex: search, $options: "i" } },
        ];
      }

      return Paginate(
        AccountDeletionRequest,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [
            { path: "customer_id",    select: "name email status block_status profile_image" },
            { path: "reviewed_by",    select: "name email" },
            { path: "decided_by",     select: "name email" },
            { path: "force_deleted_by", select: "name email" },
          ],
        },
        req, res
      );
    } catch (err) {
      console.error("[AccountDeletion] getAll:", err.message);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * GET /admin/account-deletion/stats
   * Quick counts by status for dashboard widgets.
   */
  async getStats(req, res) {
    try {
      const [pending, reviewed, approved, rejected, deleted] = await Promise.all([
        AccountDeletionRequest.countDocuments({ status: "pending"  }),
        AccountDeletionRequest.countDocuments({ status: "reviewed" }),
        AccountDeletionRequest.countDocuments({ status: "approved" }),
        AccountDeletionRequest.countDocuments({ status: "rejected" }),
        AccountDeletionRequest.countDocuments({ status: "deleted"  }),
      ]);
      return Base.sendResponse(res, HTTPS.OK, { pending, reviewed, approved, rejected, deleted, total: pending + reviewed + approved + rejected + deleted });
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * GET /admin/account-deletion/:id
   * Fetch a single request with full detail + customer's order/payment summary.
   */
  async getById(req, res) {
    try {
      const request = await AccountDeletionRequest.findById(req.params.id)
        .populate("customer_id",     "name email contact_no status block_status createdAt last_login")
        .populate("reviewed_by",     "name email")
        .populate("decided_by",      "name email")
        .populate("force_deleted_by","name email")
        .populate("timeline.actor_id", "name");

      if (!request)
        return Base.sendError(res, HTTPS.NOT_FOUND, "Request not found");

      // Fetch a quick summary of the customer's activity
      const customerId = request.customer_id?._id || request.customer_id;
      const [pendingOrders, unpaidPayments, totalOrders] = await Promise.all([
        Order.countDocuments({
          user_id: customerId,
          order_status: { $in: ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery"] },
        }),
        Payment.countDocuments({
          user_id: customerId,
          payment_status: { $in: ["pending", "failed"] },
        }),
        Order.countDocuments({ user_id: customerId }),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        request,
        customer_summary: { pending_orders: pendingOrders, unpaid_payments: unpaidPayments, total_orders: totalOrders },
      });
    } catch (err) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * PATCH /admin/account-deletion/:id/review
   * Employee reviews the request, runs checks, and forwards to admin.
   * Body: { employee_notes, employee_checks, action: "forward" | "reject", rejection_reason? }
   */
  async reviewRequest(req, res) {
    try {
      const actor = await User.findById(req.user.user).populate("role_id", "slug name");
      if (!["employee", "admin", "super_admin"].includes(getRoleSlug(actor)))
        return Base.sendError(res, HTTPS.FORBIDDEN, "Not authorised");

      const request = await AccountDeletionRequest.findById(req.params.id);
      if (!request)
        return Base.sendError(res, HTTPS.NOT_FOUND, "Request not found");

      if (!["pending"].includes(request.status))
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          `Cannot review a request with status "${request.status}"`);

      const { employee_notes = "", employee_checks = {}, action, rejection_reason = "" } = req.body;

      if (!["forward", "reject"].includes(action))
        return Base.sendError(res, HTTPS.BAD_REQUEST, 'action must be "forward" or "reject"');

      request.reviewed_by    = actor._id;
      request.employee_notes = employee_notes.trim();
      request.employee_checks = {
        no_pending_orders:  !!employee_checks.no_pending_orders,
        no_pending_payment: !!employee_checks.no_pending_payment,
        no_open_tickets:    !!employee_checks.no_open_tickets,
        no_active_disputes: !!employee_checks.no_active_disputes,
      };
      request.reviewed_at = new Date();

      if (action === "forward") {
        request.status = "reviewed";
        request.timeline.push(entry(
          "forwarded", actor._id, actor.name, getRoleSlug(actor),
          `Reviewed by employee. Notes: ${employee_notes || "—"}`
        ));
      } else {
        request.status           = "rejected";
        request.rejection_reason = rejection_reason.trim();
        request.decided_by       = actor._id;
        request.decided_at       = new Date();
        request.timeline.push(entry(
          "rejected", actor._id, actor.name, getRoleSlug(actor),
          `Rejected by employee. Reason: ${rejection_reason || "—"}`
        ));

        // Notify customer
        sendAccountDeletionStatusEmail(request.customer_email, {
          customer_name: request.customer_name,
          status:        "rejected",
          reason:        rejection_reason || employee_notes || "Your request was reviewed and rejected.",
          decided_by:    actor.name,
        }).catch(console.error);
      }

      await request.save();
      return Base.sendResponse(res, HTTPS.OK, request,
        action === "forward" ? "Request forwarded to admin" : "Request rejected");
    } catch (err) {
      console.error("[AccountDeletion] reviewRequest:", err.message);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * PATCH /admin/account-deletion/:id/decide
   * Admin approves or rejects a forwarded request.
   * Body: { action: "approve" | "reject", admin_notes?, rejection_reason? }
   */
  async decideRequest(req, res) {
    try {
      const actor = await User.findById(req.user.user).populate("role_id", "slug name");
      const slug  = getRoleSlug(actor);

      if (!["admin", "super_admin"].includes(slug))
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only admin or super_admin can approve/reject");

      const request = await AccountDeletionRequest.findById(req.params.id);
      if (!request)
        return Base.sendError(res, HTTPS.NOT_FOUND, "Request not found");

      // Admin can decide on reviewed requests; superadmin can also decide pending ones
      const allowedStatuses = slug === "super_admin"
        ? ["pending", "reviewed"]
        : ["reviewed"];

      if (!allowedStatuses.includes(request.status))
        return Base.sendError(res, HTTPS.BAD_REQUEST,
          `Cannot decide on a request with status "${request.status}"`);

      const { action, admin_notes = "", rejection_reason = "" } = req.body;

      if (!["approve", "reject"].includes(action))
        return Base.sendError(res, HTTPS.BAD_REQUEST, 'action must be "approve" or "reject"');

      request.decided_by  = actor._id;
      request.admin_notes = admin_notes.trim();
      request.decided_at  = new Date();

      if (action === "approve") {
        request.status = "approved";
        request.timeline.push(entry(
          "approved", actor._id, actor.name, slug,
          `Approved by ${slug}. Notes: ${admin_notes || "—"}`
        ));

        // Soft-deactivate the customer account immediately on approval
        await User.findByIdAndUpdate(request.customer_id, {
          status:       false,
          block_status: true,
        });

        sendAccountDeletionStatusEmail(request.customer_email, {
          customer_name: request.customer_name,
          status:        "approved",
          reason:        admin_notes || "Your deletion request has been approved. Your account has been deactivated.",
          decided_by:    actor.name,
        }).catch(console.error);

      } else {
        request.status           = "rejected";
        request.rejection_reason = rejection_reason.trim();
        request.timeline.push(entry(
          "rejected", actor._id, actor.name, slug,
          `Rejected by ${slug}. Reason: ${rejection_reason || "—"}`
        ));

        // Re-activate the account in case it was previously deactivated
        await User.findByIdAndUpdate(request.customer_id, {
          status:       true,
          block_status: false,
        });

        sendAccountDeletionStatusEmail(request.customer_email, {
          customer_name: request.customer_name,
          status:        "rejected",
          reason:        rejection_reason || admin_notes || "Your deletion request was reviewed and rejected.",
          decided_by:    actor.name,
        }).catch(console.error);
      }

      await request.save();
      return Base.sendResponse(res, HTTPS.OK, request,
        action === "approve" ? "Account deletion approved" : "Request rejected");
    } catch (err) {
      console.error("[AccountDeletion] decideRequest:", err.message);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  /**
   * DELETE /admin/account-deletion/:id/force-delete
   * SuperAdmin hard-deletes the customer account immediately, bypassing workflow.
   * Also works on an approved request to complete the final deletion.
   */
  async forceDelete(req, res) {
    try {
      const actor = await User.findById(req.user.user).populate("role_id", "slug name");
      if (getRoleSlug(actor) !== "super_admin")
        return Base.sendError(res, HTTPS.FORBIDDEN, "Only super_admin can force-delete accounts");

      const request = await AccountDeletionRequest.findById(req.params.id);
      if (!request)
        return Base.sendError(res, HTTPS.NOT_FOUND, "Request not found");

      if (request.status === "deleted")
        return Base.sendError(res, HTTPS.BAD_REQUEST, "Account already deleted");

      const { admin_notes = "" } = req.body;

      // Hard-delete the user document (ignore if already gone)
      await User.findByIdAndDelete(request.customer_id).catch(() => {});

      // Resolve ALL other active requests for the same customer first
      // to avoid the partial unique index conflict before we save this one
      await AccountDeletionRequest.updateMany(
        {
          customer_id: request.customer_id,
          _id:         { $ne: request._id },
          status:      { $in: ["pending", "reviewed", "approved"] },
        },
        { $set: { status: "deleted", rejection_reason: "Account deleted by SuperAdmin" } }
      );

      request.status           = "deleted";
      request.force_deleted_by = actor._id;
      request.force_deleted_at = new Date();
      request.admin_notes      = admin_notes.trim() || request.admin_notes;
      request.decided_by       = request.decided_by || actor._id;
      request.decided_at       = request.decided_at || new Date();
      request.timeline.push(entry(
        "force_deleted", actor._id, actor.name, "super_admin",
        `Account permanently deleted by SuperAdmin. Notes: ${admin_notes || "—"}`
      ));

      await request.save();

      return Base.sendResponse(res, HTTPS.OK, null,
        "Customer account has been permanently deleted");
    } catch (err) {
      console.error("[AccountDeletion] forceDelete:", err.message);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}

module.exports = {
  customerDeletionController: new CustomerDeletionController(),
  adminDeletionController:    new AdminDeletionController(),
};
