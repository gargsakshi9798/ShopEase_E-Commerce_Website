import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createProduct, updateProduct, fetchProductById } from "../../features/products/productSlice";
import { fetchCategories } from "../../features/masters/categorySlice";
import { fetchBrands }     from "../../features/masters/brandSlice";
import toast from "react-hot-toast";
import {
  MdArrowBack, MdCloudUpload, MdClose, MdAdd, MdDelete,
} from "react-icons/md";

const ProductForm = () => {
  const { id }   = useParams();
  const isEdit   = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selected } = useSelector((s) => s.product);
  const { list: categories } = useSelector((s) => s.category);
  const { list: brands }     = useSelector((s) => s.brand);

  const [previews, setPreviews]         = useState([]);
  const [specs, setSpecs]               = useState([{ key: "", value: "" }]);
  const [tagInput, setTagInput]         = useState("");

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { discount_percent: 0, stock: 0, low_stock_threshold: 10 } });

  const price = watch("price");
  const mrp   = watch("mrp");

  // ── Load categories, brands, existing product ─────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories({ per_page: 200 }));
    dispatch(fetchBrands({ per_page: 200 }));
    if (isEdit) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        name:                selected.name,
        short_description:   selected.short_description,
        description:         selected.description,
        price:               selected.price,
        mrp:                 selected.mrp,
        discount_percent:    selected.discount_percent,
        sku:                 selected.sku,
        stock:               selected.stock,
        low_stock_threshold: selected.low_stock_threshold,
        category_id:         selected.category_id?._id,
        brand_id:            selected.brand_id?._id,
        tags:                selected.tags?.join(", "),
        weight:              selected.weight,
        meta_title:          selected.meta_title,
        meta_description:    selected.meta_description,
        is_featured:         selected.is_featured,
        is_bestseller:       selected.is_bestseller,
        is_new_arrival:      selected.is_new_arrival,
        is_on_sale:          selected.is_on_sale,
      });
      if (selected.specifications?.length) setSpecs(selected.specifications);
      if (selected.images?.length) {
        setPreviews(selected.images.map((img) =>
          img.startsWith("http") ? img : `${import.meta.env.VITE_IMG_URL}${img}`
        ));
      }
    }
  }, [selected, isEdit]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    const fd = new FormData();

    // Text fields
    const fields = [
      "name","short_description","description","price","mrp","discount_percent",
      "sku","stock","low_stock_threshold","category_id","brand_id","tags","weight",
      "meta_title","meta_description",
    ];
    fields.forEach((k) => { if (data[k] !== undefined && data[k] !== "") fd.append(k, data[k]); });

    // Boolean flags
    ["is_featured","is_bestseller","is_new_arrival","is_on_sale"].forEach((f) => {
      fd.append(f, data[f] ? "true" : "false");
    });

    // Specifications
    const validSpecs = specs.filter((s) => s.key && s.value);
    if (validSpecs.length) fd.append("specifications", JSON.stringify(validSpecs));

    // Images
    if (data.images?.length > 0) {
      Array.from(data.images).forEach((f) => fd.append("images", f));
    }

    try {
      let res;
      if (isEdit) {
        res = await dispatch(updateProduct({ id, formData: fd }));
        if (res.payload?.success) { toast.success("Product updated!"); navigate("/admin/products"); }
        else toast.error(res.payload?.message || "Update failed");
      } else {
        res = await dispatch(createProduct(fd));
        if (res.payload?.success) { toast.success("Product created!"); navigate("/admin/products"); }
        else toast.error(res.payload?.message || "Create failed");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const addSpec = () => setSpecs((p) => [...p, { key: "", value: "" }]);
  const removeSpec = (i) => setSpecs((p) => p.filter((_, idx) => idx !== i));
  const updateSpec = (i, field, val) => setSpecs((p) => p.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <MdArrowBack size={18} />
          Back to Products
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Main content ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="Enter product name"
                  {...register("name", { required: "Product name is required" })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  className="input-field"
                  placeholder="Brief one-line description"
                  {...register("short_description")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Detailed product description..."
                  {...register("description")}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" step="0.01" min="0"
                    className="input-field"
                    placeholder="0.00"
                    {...register("price", { required: "Price is required", min: { value: 0.01, message: "Must be > 0" } })}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MRP (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" step="0.01" min="0"
                    className="input-field"
                    placeholder="0.00"
                    {...register("mrp", { required: "MRP is required" })}
                  />
                  {errors.mrp && <p className="text-red-500 text-xs mt-1">{errors.mrp.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number" min="0" max="100"
                    className="input-field"
                    placeholder="0"
                    {...register("discount_percent")}
                  />
                </div>
              </div>
              {price && mrp && Number(mrp) > Number(price) && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <span>💡 Effective discount:</span>
                  <strong>{Math.round(((mrp - price) / mrp) * 100)}% off</strong>
                  <span>from MRP</span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Inventory
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input className="input-field" placeholder="e.g. PRD-001" {...register("sku")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input type="number" min="0" className="input-field" placeholder="0" {...register("stock")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                  <input type="number" min="0" className="input-field" placeholder="10" {...register("low_stock_threshold")} />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Product Images
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                <MdCloudUpload size={32} className="text-gray-400 mb-1" />
                <p className="text-sm text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP — up to 5 images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  {...register("images")}
                  onChange={(e) => { register("images").onChange(e); handleImageChange(e); }}
                />
              </label>
              {previews.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {previews.map((p, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={p}
                        alt=""
                        className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                        onError={(e) => { e.target.src = "/placeholder.png"; }}
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] bg-primary-600 text-white py-0.5 rounded-b-xl">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-800 text-base">Specifications</h3>
                <button type="button" onClick={addSpec} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <MdAdd size={15} /> Add Row
                </button>
              </div>
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="e.g. Material"
                    value={spec.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                  />
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="e.g. Cotton"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                  />
                  <button type="button" onClick={() => removeSpec(i)} className="p-1.5 text-red-400 hover:text-red-600">
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Tags + Weight */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Additional Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    className="input-field"
                    placeholder="tag1, tag2, tag3 (comma separated)"
                    {...register("tags")}
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
                  <input type="number" min="0" className="input-field" placeholder="0" {...register("weight")} />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                SEO (optional)
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input className="input-field" placeholder="SEO page title" {...register("meta_title")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea rows={2} className="input-field resize-none" placeholder="SEO description" {...register("meta_description")} />
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Publish Actions */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Publish
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full text-sm py-2.5 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Publish Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="btn-secondary w-full text-sm py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Organisation */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Organisation
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="input-field"
                  {...register("category_id", { required: "Category is required" })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select className="input-field" {...register("brand_id")}>
                  <option value="">Select brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Flags */}
            <div className="bg-white rounded-xl shadow-card p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">
                Product Labels
              </h3>
              {[
                ["is_featured",    "⭐ Featured Product",   "Show on homepage featured section"],
                ["is_bestseller",  "🔥 Bestseller",         "Mark as bestselling product"],
                ["is_new_arrival", "✨ New Arrival",         "Show in new arrivals section"],
                ["is_on_sale",     "🏷️ On Sale",             "Show sale badge on product"],
              ].map(([field, label, hint]) => (
                <label key={field} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded accent-primary-600"
                    {...register(field)}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{label}</p>
                    <p className="text-xs text-gray-400">{hint}</p>
                  </div>
                </label>
              ))}
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
