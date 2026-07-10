const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  value: { type: String, required: true }, // e.g., "Red", "XL"
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, default: "" },
  images: [{ type: String }],
  status: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    short_description: { type: String, default: "" },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount_percent: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 10 },
    images: [{ type: String }],
    thumbnail: { type: String, default: null },
    variants: [productVariantSchema],
    tags: [{ type: String }],
    specifications: [{ key: String, value: String }],
    weight: { type: Number, default: 0 }, // in grams
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    is_featured: { type: Boolean, default: false },
    is_bestseller: { type: Boolean, default: false },
    is_new_arrival: { type: Boolean, default: false },
    is_on_sale: { type: Boolean, default: false },
    sale_start: { type: Date, default: null },
    sale_end: { type: Date, default: null },
    rating_avg: { type: Number, default: 0, min: 0, max: 5 },
    rating_count: { type: Number, default: 0 },
    total_sold: { type: Number, default: 0 },
    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual for discounted price
productSchema.virtual("discounted_price").get(function () {
  return Math.round(this.price - (this.price * this.discount_percent) / 100);
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
