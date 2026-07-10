const express = require("express");
const router = express.Router();
const Address = require("../../../../../models/Address");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");

// Get all addresses
router.get("/", async (req, res) => {
  try {
    const addresses = await Address.find({ user_id: req.user.user, status: true }).sort({ is_default: -1, createdAt: -1 });
    return Base.sendResponse(res, HTTPS.OK, addresses);
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Add address
router.post("/", async (req, res) => {
  try {
    const { full_name, contact_no, address_line1, address_line2, landmark, city, state, pincode, country, address_type, is_default } = req.body;

    if (is_default) {
      await Address.updateMany({ user_id: req.user.user }, { is_default: false });
    }

    const address = new Address({
      user_id: req.user.user,
      full_name, contact_no, address_line1, address_line2: address_line2 || "",
      landmark: landmark || "", city, state, pincode,
      country: country || "India", address_type: address_type || "home",
      is_default: is_default || false,
    });

    await address.save();
    return Base.sendResponse(res, HTTPS.CREATED, address, "Address added");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Update address
router.put("/:id", async (req, res) => {
  try {
    if (req.body.is_default) {
      await Address.updateMany({ user_id: req.user.user }, { is_default: false });
    }
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.user },
      req.body,
      { new: true }
    );
    if (!address) return Base.sendError(res, HTTPS.NOT_FOUND, "Address not found");
    return Base.sendResponse(res, HTTPS.OK, address, "Address updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Set default
router.patch("/:id/default", async (req, res) => {
  try {
    await Address.updateMany({ user_id: req.user.user }, { is_default: false });
    await Address.findOneAndUpdate({ _id: req.params.id, user_id: req.user.user }, { is_default: true });
    return Base.sendResponse(res, HTTPS.OK, null, "Default address set");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

// Delete address
router.delete("/:id", async (req, res) => {
  try {
    await Address.findOneAndUpdate({ _id: req.params.id, user_id: req.user.user }, { status: false });
    return Base.sendResponse(res, HTTPS.OK, null, "Address deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;
