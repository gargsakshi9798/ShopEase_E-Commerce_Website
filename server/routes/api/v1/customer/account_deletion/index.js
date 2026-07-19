"use strict";
const express = require("express");
const router  = express.Router();
const { customerDeletionController: ctrl } =
  require("../../../../../controllers/api/v1/account_deletion/accountDeletion.controller");

// POST   /customer/account-deletion         — submit request
router.post(  "/",       ctrl.submitRequest.bind(ctrl));

// GET    /customer/account-deletion         — check own request status
router.get(   "/",       ctrl.getMyRequest.bind(ctrl));

// DELETE /customer/account-deletion         — cancel own pending request
router.delete("/",       ctrl.cancelRequest.bind(ctrl));

module.exports = router;
