const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload, CheckExists } = require("../../../../../helper/common/utils");
const Category = require("../../../../../models/Category");

class CategoryController {
  // List with pagination
  async getAll(req, res) {
    try {
      const { search = "", parent_id = null, level } = req.query;
      const filter = {};

      if (search) filter.name = { $regex: search, $options: "i" };
      if (parent_id === "null" || parent_id === "") {
        filter.parent_id = null;
      } else if (parent_id) {
        filter.parent_id = parent_id;
      }
      if (level) filter.level = Number(level);

      return Paginate(
        Category,
        { filter, sort: { sort_order: 1, createdAt: -1 }, populate: [{ path: "parent_id", select: "name slug" }] },
        req,
        res
      );
    } catch (error) {
      console.error("getAll categories error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get single
  async getById(req, res) {
    try {
      const category = await Category.findById(req.params.id).populate("parent_id", "name slug");
      if (!category) return Base.sendError(res, HTTPS.NOT_FOUND, "Category not found");
      return Base.sendResponse(res, HTTPS.OK, category);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Create
  async create(req, res) {
    try {
      const { name, description, parent_id, sort_order, is_featured, meta_title, meta_description } = req.body;

      const existing = await CheckExists(Category, { name: name.trim() });
      if (existing) return Base.sendError(res, HTTPS.CONFLICT, { name: "Category already exists" });

      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const data = {
        name: name.trim(),
        slug,
        description,
        parent_id: parent_id || null,
        level: parent_id ? 2 : 1,
        sort_order: sort_order || 0,
        is_featured: is_featured || false,
        meta_title,
        meta_description,
      };

      if (req.files?.image) {
        data.image = await FileUpload(req.files.image, "/categories");
      }

      const category = new Category(data);
      await category.save();

      return Base.sendResponse(res, HTTPS.CREATED, category, "Category created successfully");
    } catch (error) {
      console.error("create category error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Update
  async update(req, res) {
    try {
      const { name, description, parent_id, sort_order, is_featured, status, meta_title, meta_description } = req.body;

      const category = await Category.findById(req.params.id);
      if (!category) return Base.sendError(res, HTTPS.NOT_FOUND, "Category not found");

      const updateData = { description, parent_id: parent_id || null, sort_order, is_featured, status, meta_title, meta_description };

      if (name && name.trim() !== category.name) {
        updateData.name = name.trim();
        updateData.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }

      if (req.files?.image) {
        updateData.image = await FileUpload(req.files.image, "/categories");
      }

      const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return Base.sendResponse(res, HTTPS.OK, updated, "Category updated successfully");
    } catch (error) {
      console.error("update category error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete (soft)
  async remove(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return Base.sendError(res, HTTPS.NOT_FOUND, "Category not found");

      await Category.findByIdAndUpdate(req.params.id, { status: false });
      return Base.sendResponse(res, HTTPS.OK, null, "Category deleted successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Toggle status
  async toggleStatus(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return Base.sendError(res, HTTPS.NOT_FOUND, "Category not found");

      await Category.findByIdAndUpdate(req.params.id, { status: !category.status });
      return Base.sendResponse(res, HTTPS.OK, null, "Status updated");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new CategoryController();
