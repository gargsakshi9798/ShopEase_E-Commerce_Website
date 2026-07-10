const express = require("express");
const router = express.Router();
const Review = require("../../../../../models/Review");
const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate } = require("../../../../../helper/common/utils");

router.get("/", async (req, res) => {
  const { search = "", rating, is_approved } = req.query;
  const filter = {};
  if (rating) filter.rating = Number(rating);
  if (is_approved !== undefined) filter.is_approved = is_approved === "true";
  return Paginate(
    Review,
    {
      filter,
      sort: { createdAt: -1 },
      populate: [
        { path: "user_id", select: "name email" },
        { path: "product_id", select: "name thumbnail" },
      ],
    },
    req,
    res
  );
});

router.patch("/:id/approve", async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { is_approved: !req.body.is_approved });
    return Base.sendResponse(res, HTTPS.OK, null, "Review status updated");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.post("/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;
    await Review.findByIdAndUpdate(req.params.id, {
      reply,
      reply_by: req.user.user,
      reply_at: new Date(),
    });
    return Base.sendResponse(res, HTTPS.OK, null, "Reply added");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { status: false });
    return Base.sendResponse(res, HTTPS.OK, null, "Review deleted");
  } catch (error) {
    return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;