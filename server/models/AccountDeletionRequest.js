"use strict";
const mongoose = require("mongoose");

/**
 * AccountDeletionRequest
 *
 * Lifecycle:
 *   pending  → Customer submitted, awaiting employee review
 *   reviewed → Employee reviewed, forwarded to admin with notes
 *   approved → Admin approved — account deactivated, will be purged
 *   rejected → Admin/employee rejected — account stays active
 *   deleted  → SuperAdmin hard-deleted the account
 */
const accountDeletionRequestSchema = new mongoose.Schema(
  {
    // ── Customer ───────────────────────────────────────────────────────────
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer_name:  { type: String, default: "" },
    customer_email: { type: String, default: "" },

    // ── Request details (from customer) ────────────────────────────────────
    reason: { type: String, required: true, trim: true },
    additional_info: { type: String, default: "", trim: true },

    // ── Status machine ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected", "deleted"],
      default: "pending",
      index: true,
    },

    // ── Employee review ────────────────────────────────────────────────────
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employee_notes: { type: String, default: "", trim: true },
    // Did employee check — no pending orders, no dues, etc.
    employee_checks: {
      no_pending_orders:  { type: Boolean, default: false },
      no_pending_payment: { type: Boolean, default: false },
      no_open_tickets:    { type: Boolean, default: false },
      no_active_disputes: { type: Boolean, default: false },
    },
    reviewed_at: { type: Date, default: null },

    // ── Admin decision ─────────────────────────────────────────────────────
    decided_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    admin_notes:  { type: String, default: "", trim: true },
    decided_at:   { type: Date, default: null },

    // ── Rejection reason (set by employee OR admin) ────────────────────────
    rejection_reason: { type: String, default: "", trim: true },

    // ── SuperAdmin force-delete ────────────────────────────────────────────
    force_deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    force_deleted_at: { type: Date, default: null },

    // ── Timeline / audit trail ─────────────────────────────────────────────
    timeline: [
      {
        action:      { type: String },          // "submitted" | "reviewed" | "forwarded" | "approved" | "rejected" | "force_deleted"
        actor_id:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        actor_name:  { type: String },
        actor_role:  { type: String },
        note:        { type: String, default: "" },
        at:          { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// A customer can only have ONE active (non-rejected/deleted) request at a time
accountDeletionRequestSchema.index(
  { customer_id: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "reviewed", "approved"] },
    },
  }
);

module.exports = mongoose.model("AccountDeletionRequest", accountDeletionRequestSchema);
