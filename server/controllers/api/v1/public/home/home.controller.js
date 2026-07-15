const Base = require("../../../../../helper/exception_handling/index.js");
const { HTTPS } = require("../../../../../helper/https-status-codes/https-status-codes");
const Product = require("../../../../../models/Product");
const Category = require("../../../../../models/Category");
const Brand = require("../../../../../models/Brand");
const Banner = require("../../../../../models/Banner");
const FAQ = require("../../../../../models/FAQ");

class HomeController {
  async getHomeData(req, res) {
    try {
      const [
        banners,
        featuredCategories,
        featuredProducts,
        bestSellers,
        newArrivals,
        flashSaleProducts,
        trendingProducts,
        featuredBrands,
      ] = await Promise.all([
        Banner.find({ position: "hero", status: true }).sort({ sort_order: 1 }).limit(10),
        Category.find({ level: 1, status: true, is_featured: true }).sort({ sort_order: 1 }).limit(12),
        Product.find({ is_featured: true, status: true })
          .select("name slug thumbnail price mrp discount_percent rating_avg rating_count brand_id")
          .sort({ createdAt: -1 })
          .limit(12),
        Product.find({ is_bestseller: true, status: true })
          .select("name slug thumbnail price mrp discount_percent rating_avg total_sold brand_id")
          .sort({ total_sold: -1 })
          .limit(12),
        Product.find({ is_new_arrival: true, status: true })
          .select("name slug thumbnail price mrp discount_percent rating_avg brand_id")
          .sort({ createdAt: -1 })
          .limit(12),
        Product.find({ is_on_sale: true, status: true, sale_end: { $gte: new Date() } })
          .select("name slug thumbnail price mrp discount_percent sale_end brand_id")
          .sort({ discount_percent: -1 })
          .limit(12),
        Product.find({ status: true })
          .select("name slug thumbnail price mrp discount_percent rating_avg brand_id")
          .sort({ rating_count: -1 })
          .limit(12),
        Brand.find({ is_featured: true, status: true }).sort({ sort_order: 1 }).limit(20),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        banners,
        featured_categories: featuredCategories,
        featured_products: featuredProducts,
        best_sellers: bestSellers,
        new_arrivals: newArrivals,
        flash_sale: flashSaleProducts,
        trending: trendingProducts,
        brands: featuredBrands,
      });
    } catch (error) {
      console.error("getHomeData error:", error);
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getProducts(req, res) {
    try {
      const {
        search = "",
        category_id,
        brand_id,
        min_price,
        max_price,
        rating,
        sort = "createdAt",
        order = "desc",
        page = 1,
        per_page = 20,
      } = req.query;

      const filter = { status: true };
      if (search) filter.name = { $regex: search, $options: "i" };
      if (category_id) filter.category_id = category_id;
      if (brand_id) filter.brand_id = brand_id;
      if (min_price || max_price) {
        filter.price = {};
        if (min_price) filter.price.$gte = Number(min_price);
        if (max_price) filter.price.$lte = Number(max_price);
      }
      if (rating) filter.rating_avg = { $gte: Number(rating) };

      const skip = (Number(page) - 1) * Number(per_page);
      const sortObj = { [sort]: order === "asc" ? 1 : -1 };

      const [data, total] = await Promise.all([
        Product.find(filter)
          .select("name slug thumbnail price mrp discount_percent rating_avg rating_count is_bestseller is_new_arrival brand_id category_id")
          .populate("category_id", "name slug")
          .populate("brand_id", "name")
          .sort(sortObj)
          .skip(skip)
          .limit(Number(per_page)),
        Product.countDocuments(filter),
      ]);

      return Base.sendResponse(res, HTTPS.OK, {
        data,
        current_page: Number(page),
        total_pages: Math.ceil(total / Number(per_page)),
        per_page: Number(per_page),
        total,
      });
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductDetail(req, res) {
    try {
      const product = await Product.findOne({ slug: req.params.slug, status: true })
        .populate("category_id", "name slug")
        .populate("subcategory_id", "name slug")
        .populate("brand_id", "name logo");

      if (!product) return Base.sendError(res, HTTPS.NOT_FOUND, "Product not found");

      // Related products
      const related = await Product.find({
        category_id: product.category_id,
        _id: { $ne: product._id },
        status: true,
      })
        .select("name slug thumbnail price mrp discount_percent rating_avg brand_id")
        .limit(8);

      return Base.sendResponse(res, HTTPS.OK, { product, related });
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await Category.find({ level: 1, status: true })
        .sort({ sort_order: 1 });

      // Attach subcategories
      const categoriesWithSubs = await Promise.all(
        categories.map(async (cat) => {
          const subcategories = await Category.find({ parent_id: cat._id, status: true }).sort({ sort_order: 1 });
          return { ...cat.toJSON(), subcategories };
        })
      );

      return Base.sendResponse(res, HTTPS.OK, categoriesWithSubs);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }

  async getFAQs(req, res) {
    try {
      const faqs = await FAQ.find({ status: true }).sort({ sort_order: 1 });
      return Base.sendResponse(res, HTTPS.OK, faqs);
    } catch (error) {
      return Base.sendError(res, HTTPS.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = new HomeController();
