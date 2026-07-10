const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload, CheckExists } = require("../../../../../helper/common/utils");
const Brand = require("../../../../../models/Brand");

class BrandController {
  async getAll(req, res) {
    try {
      const { search = "" } = req.query;
      const filter = {};
      if (search) filter.name = { $regex: search, $options: "i" };
      return Paginate(Brand, { filter, sort: { sort_order: 1, name: 1 } }, req, res);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(req, res) {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return Base.sendError(res, HTTPS.NOT_FOUND, "Brand not found");
      return Base.sendResponse(res, HTTPS.OK, brand);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async create(req, res) {
    try {
      const { name, description, website, is_featured, sort_order } = req.body;

      const existing = await CheckExists(Brand, { name: name.trim() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { name: "Brand already exists" });

      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const data = { name: name.trim(), slug, description, website, is_featured, sort_order: sort_order || 0 };

      if (req.files?.logo) {
        data.logo = await FileUpload(req.files.logo, "/brands");
      }

      const brand = new Brand(data);
      await brand.save();
      return Base.sendResponse(res, HTTPS.CREATED, brand, "Brand created successfully");
    } catch (error) {
      console.error("create brand error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(req, res) {
    try {
      const { name, description, website, is_featured, status, sort_order } = req.body;
      const brand = await Brand.findById(req.params.id);
      if (!brand) return Base.sendError(res, HTTPS.NOT_FOUND, "Brand not found");

      const updateData = { description, website, is_featured, status, sort_order };
      if (name) {
        updateData.name = name.trim();
        updateData.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      if (req.files?.logo) {
        updateData.logo = await FileUpload(req.files.logo, "/brands");
      }

      const updated = await Brand.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return Base.sendResponse(res, HTTPS.OK, updated, "Brand updated successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(req, res) {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return Base.sendError(res, HTTPS.NOT_FOUND, "Brand not found");
      await Brand.findByIdAndUpdate(req.params.id, { status: false });
      return Base.sendResponse(res, HTTPS.OK, null, "Brand deleted successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new BrandController();
