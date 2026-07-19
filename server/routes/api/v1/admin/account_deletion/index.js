"use strict";
const express = require("express");
const router  = express.Router();
const { adminDeletionController: ctrl } =
  require("../../../../../controllers/api/v1/account_deletion/accountDeletion.controller");

// GET  /admin/account-deletion              — list all requests (paginated + filterable)
router.get(   "/",                         ctrl.getAll.bind(ctrl));

// GET  /admin/account-deletion/stats        — counts by status
router.get(   "/stats",                    ctrl.getStats.bind(ctrl));

// GET  /admin/account-deletion/:id          — single request + customer summary
router.get(   "/:id",                      ctrl.getById.bind(ctrl));

// PATCH /admin/account-deletion/:id/review  — employee: forward or reject
router.patch( "/:id/review",               ctrl.reviewRequest.bind(ctrl));

// PATCH /admin/account-deletion/:id/decide  — admin/superadmin: approve or reject
router.patch( "/:id/decide",               ctrl.decideRequest.bind(ctrl));

// DELETE /admin/account-deletion/:id/force-delete — superadmin: hard delete
router.delete("/:id/force-delete",         ctrl.forceDelete.bind(ctrl));

module.exports = router;
