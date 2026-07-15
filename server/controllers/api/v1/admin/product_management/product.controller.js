const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const { Paginate, FileUpload } = require("../../../../../helper/common/utils");
const Product = require("../../../../../models/Product");

class ProductController {
  async getAll(req, res) {
    try {
      const { search = "", category_id, brand_id, status, is_featured } = req.query;
      const filter = {};
      if (search) filter.name = { $regex: search, $options: "i" };
      if (category_id) filter.category_id = category_id;
      if (brand_id) filter.brand_id = brand_id;
      if (status !== undefined) filter.status = status === "true";
      if (is_featured !== undefined) filter.is_featured = is_featured === "true";

      return Paginate(
        Product,
        {
          filter,
          sort: { createdAt: -1 },
          populate: [
            { path: "category_id", select: "name slug" },
            { path: "brand_id", select: "name logo" },
          ],
        },
        req,
        res
      );
    } catch (error) {
      console.error("getAll products error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate("category_id", "name slug")
        .populate("subcategory_id", "name slug")
        .populate("brand_id", "name logo");

      if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");
      return Base.sendResponse(res, HTTPS.OK, product);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async create(req, res) {
    try {
      const {
        name, description, short_description, category_id, subcategory_id,
        brand_id, price, mrp, discount_percent, sku, stock, low_stock_threshold,
        tags, specifications, weight, dimensions, is_featured, is_bestseller,
        is_new_arrival, is_on_sale, sale_start, sale_end, meta_title, meta_description, variants,
      } = req.body;

      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

      const data = {
        name: name.trim(), slug, description, short_description,
        category_id, subcategory_id: subcategory_id || null,
        brand_id: brand_id || null, price, mrp,
        discount_percent: discount_percent || 0, sku, stock: stock || 0,
        low_stock_threshold: low_stock_threshold || 10,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
        specifications: specifications || [],
        weight: weight || 0, dimensions: dimensions || {},
        is_featured: is_featured || false, is_bestseller: is_bestseller || false,
        is_new_arrival: is_new_arrival || false, is_on_sale: is_on_sale || false,
        sale_start: sale_start || null, sale_end: sale_end || null,
        meta_title, meta_description,
        variants: variants ? (typeof variants === "string" ? JSON.parse(variants) : variants) : [],
      };

      // Handle multiple product images
      if (req.files?.images) {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const uploadedImages = await Promise.all(images.map((img) => FileUpload(img, "/products")));
        data.images = uploadedImages;
        data.thumbnail = uploadedImages[0];
      }

      if (req.files?.thumbnail) {
        data.thumbnail = await FileUpload(req.files.thumbnail, "/products");
      }

      const product = new Product(data);
      await product.save();

      return Base.sendResponse(res, HTTPS.CREATED, product, "Product created successfully");
    } catch (error) {
      console.error("create product error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async update(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");

      const updateData = { ...req.body };

      if (req.body.tags && typeof req.body.tags === "string") {
        updateData.tags = req.body.tags.split(",").map((t) => t.trim());
      }
      if (req.body.variants && typeof req.body.variants === "string") {
        updateData.variants = JSON.parse(req.body.variants);
      }
      if (req.files?.images) {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const uploadedImages = await Promise.all(images.map((img) => FileUpload(img, "/products")));
        updateData.images = uploadedImages;
        updateData.thumbnail = uploadedImages[0];
      }
      if (req.files?.thumbnail) {
        updateData.thumbnail = await FileUpload(req.files.thumbnail, "/products");
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      return Base.sendResponse(res, HTTPS.OK, updated, "Product updated successfully");
    } catch (error) {
      console.error("update product error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");
      await Product.findByIdAndUpdate(req.params.id, { status: false });
      return Base.sendResponse(res, HTTPS.OK, null, "Product deleted successfully");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all products for inventory view — all products with brand+category, sorted by stock asc
  async getAllForInventory(req, res) {
    try {
      const { search = "", stock_status, category_id, brand_id } = req.query;
      const filter = { status: true };

      if (search)      filter.name        = { $regex: search, $options: "i" };
      if (category_id) filter.category_id = category_id;
      if (brand_id)    filter.brand_id    = brand_id;

      // stock_status filter: out_of_stock | low_stock | in_stock
      if (stock_status === "out_of_stock") {
        filter.stock = 0;
      } else if (stock_status === "low_stock") {
        filter.$expr = { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$low_stock_threshold"] }] };
      } else if (stock_status === "in_stock") {
        filter.$expr = { $gt: ["$stock", "$low_stock_threshold"] };
      }

      return Paginate(
        Product,
        {
          filter,
          sort: { stock: 1 },
          populate: [
            { path: "category_id", select: "name slug" },
            { path: "brand_id",    select: "name logo" },
          ],
        },
        req,
        res
      );
    } catch (error) {
      console.error("getAllForInventory error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get low stock products
  async getLowStock(req, res) {
    try {
      return Paginate(
        Product,
        {
          filter: { $expr: { $lte: ["$stock", "$low_stock_threshold"] }, status: true },
          sort: { stock: 1 },
          populate: [
            { path: "category_id", select: "name slug" },
            { path: "brand_id",    select: "name logo" },
          ],
        },
        req,
        res
      );
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  // Update stock
  async updateStock(req, res) {
    try {
      const { stock } = req.body;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock: Number(stock) },
        { new: true }
      );
      if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");
      return Base.sendResponse(res, HTTPS.OK, product, "Stock updated");
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new ProductController();
