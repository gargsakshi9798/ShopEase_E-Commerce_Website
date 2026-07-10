const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload } = require("../../../../../helper/common/utils");
const Coupon = require("../../../../../models/Coupon");

class CouponController {
  async getAll(req, res) {
    try {
      const { search = "", is_active } = req.query;
      const filter = {};
      if (search) filter.code = { $regex: search, $options: "i" };
      if (is_active !== undefined) filter.is_active = is_active === "true";
      return Paginate(Coupon, { filter, sort: { createdAt: -1 } }, req, res);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(req, res) {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return Base.sendError(res, HTTPS.NOT_FOUND, "Coupon not found");
      return Base.sendResponse(res, HTTPS.OK, coupon);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async create(req, res) {
    try {
      const {
        code, title, description, discount_type, discount_value, min_order_amount,
        max_discount_amount, usage_limit, usage_per_customer, applicable_for,
        applicable_ids, start_date, end_date,
      } = req.body;

      const existing = await Coupon.findOne({ code: code.toUpperCase() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { code: "Coupon code already exists" });

      const data = {
        code: code.toUpperCase(),
        title, description, discount_type,
        discount_value: Number(discount_value),
        min_order_amount: Number(min_order_amount) || 0,
        max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
        usage_limit: usage_limit ? Number(usage_limit) : null,
        usage_per_customer: Number(usage_per_customer) || 1,
        applicable_for: applicable_for || "all",
        applicable_ids: applicable_ids || [],
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      };

      if (req.files?.image) {
        data.image = await FileUpload(req.files.image, "/coupons");
      }

      const coupon = new Coupon(data);
      await coupon.save();
      return Base.sendResponse(res, HTTPS.CREATED, coupon, "Coupon created successfully");
    } catch (error) {
      console.error("create coupon error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(req, res) {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) return Base.sendError(res, HTTPS.NOT_FOUND, "Coupon not found");

      const updateData = { ...req.body };
      if (req.body.start_date) updateData.start_date = new Date(req.body.start_date);
      if (req.body.end_date) updateData.end_date = new Date(req.body.end_date);
      if (req.files?.image) updateData.image = await FileUpload(req.files.image, "/coupons");

      const updated = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return Base.sendResponse(res, HTTPS.OK, updated, "Coupon updated");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(req, res) {
    try {
      await Coupon.findByIdAndUpdate(req.params.id, { status: false });
      return Base.sendResponse(res, HTTPS.OK, null, "Coupon deleted");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Validate coupon (used in checkout)
  async validate(req, res) {
    try {
      const { code, order_amount, user_id } = req.body;
      const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: true, is_active: true });

      if (!coupon) return Base.sendError(res, HTTPS.NOT_FOUND, { code: "Invalid coupon code" });

      if (new Date() > coupon.end_date) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, { code: "Coupon has expired" });
      }
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, { code: "Coupon usage limit reached" });
      }
      if (order_amount < coupon.min_order_amount) {
        return Base.sendError(res, HTTPS.BAD_REQUEST, {
          code: `Minimum order amount is ₹${coupon.min_order_amount}`,
        });
      }

      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = (order_amount * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
      } else {
        discount = coupon.discount_value;
      }

      return Base.sendResponse(res, HTTPS.OK, {
        coupon_id: coupon._id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: Math.round(discount),
      }, "Coupon applied");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new CouponController();
