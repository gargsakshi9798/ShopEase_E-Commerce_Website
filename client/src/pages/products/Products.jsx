import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct, updateStock } from "../../features/products/productSlice";
import { fetchCategories } from "../../features/masters/categorySlice";
import { fetchBrands } from "../../features/masters/brandSlice";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdInventory,
  MdStar, MdFilterList, MdRefresh, MdDownload,
  MdCheckCircle, MdBlock, MdWarning, MdVisibility,
  MdClose, MdImage,
} from "react-icons/md";
import { formatCurrency, formatDate, getImgUrl } from "../../utils/Methods";

const Products = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { list, total, current_page, total_pages, status } = useSelector((s) => s.product);
  const { list: categories } = useSelector((s) => s.category);
  const { list: brands }     = useSelector((s) => s.brand);
  const loading = status === "loading";

  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [catFilter, setCatFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter]   = useState(""); // "low" | ""
  const [featFilter, setFeatFilter]     = useState(""); // "featured" | "bestseller" | "new_arrival"
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [viewProd, setViewProd]   = useState(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)      params.search      = search;
    if (catFilter)   params.category_id = catFilter;
    if (brandFilter) params.brand_id    = brandFilter;
    if (statusFilter) params.status     = statusFilter;
    if (featFilter)   params[featFilter] = true;
    return params;
  };

  const load = (p = page) => dispatch(fetchProducts(buildParams(p)));

  useEffect(() => {
    dispatch(fetchCategories({ per_page: 200 }));
    dispatch(fetchBrands({ per_page: 200 }));
  }, [dispatch]);

  useEffect(() => { load(page); }, [page, catFilter, brandFilter, statusFilter, featFilter]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const clearFilters = () => {
    setSearch(""); setCatFilter(""); setBrandFilter("");
    setStatusFilter(""); setStockFilter(""); setFeatFilter("");
    setPage(1);
  };
  const hasFilters = search || catFilter || brandFilter || statusFilter || stockFilter || featFilter;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalAll     = total;
  const activeCount  = list.filter((p) => p.status).length;
  const lowStock     = list.filter((p) => p.stock <= p.low_stock_threshold).length;
  const featuredCount= list.filter((p) => p.is_featured).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteProduct(deleteId)).unwrap();
      if (res?.success) {
        toast.success("Product deleted");
        setDeleteId(null);
        load();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) { toast.error(err?.message || "Something went wrong"); }
    finally { setDeleting(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "thumbnail", label: "", width: 56,
      render: (v) => (
        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          <img
            src={v ? getImgUrl(v) : "/placeholder.png"}
            alt="" className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/placeholder.png"; }}
          />
        </div>
      ),
    },
    {
      key: "name", label: "Product",
      render: (v, row) => (
        <div className="min-w-[180px]">
          <p className="font-semibold text-gray-800 text-sm leading-tight">{v}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.category_id?.name || "—"}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {row.is_featured    && <span className="badge text-[9px] bg-yellow-100 text-yellow-700">Featured</span>}
            {row.is_bestseller  && <span className="badge text-[9px] bg-orange-100 text-orange-700">Bestseller</span>}
            {row.is_new_arrival && <span className="badge text-[9px] bg-blue-100 text-blue-700">New</span>}
          </div>
        </div>
      ),
    },
    {
      key: "price", label: "Price",
      render: (v, row) => (
        <div>
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(v)}</p>
          {row.mrp > v && <p className="text-xs text-gray-400 line-through">{formatCurrency(row.mrp)}</p>}
          {row.discount_percent > 0 && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
              {row.discount_percent}% off
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock", label: "Stock",
      render: (v, row) => {
        const isLow = v <= (row.low_stock_threshold || 10);
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-sm ${isLow ? "text-red-600" : "text-gray-700"}`}>{v}</span>
            {isLow && <MdWarning size={14} className="text-red-500" title="Low stock" />}
          </div>
        );
      },
    },
    {
      key: "rating_avg", label: "Rating",
      render: (v, row) => v > 0
        ? <span className="flex items-center gap-0.5 text-sm"><MdStar size={14} className="text-yellow-500" />{v} <span className="text-xs text-gray-400">({row.rating_count})</span></span>
        : <span className="text-gray-300 text-xs">No ratings</span>,
    },
    {
      key: "status", label: "Status",
      render: (v) => (
        <span className={`badge ${v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {v ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewProd(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Quick view">
            <MdVisibility size={16} />
          </button>
          <button onClick={() => navigate(`/admin/products/edit/${row._id}`)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" title="Edit">
            <MdEdit size={16} />
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button
            onClick={() => navigate("/admin/inventory")}
            className="flex items-center gap-2 px-4 py-2 border border-orange-200 text-orange-700 bg-orange-50 rounded-xl text-sm hover:bg-orange-100"
          >
            <MdWarning size={16} /> Low Stock
          </button>
          <button
            onClick={() => navigate("/admin/products/create")}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <MdAdd size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: totalAll,     icon: MdInventory, bg: "bg-primary-50",  color: "text-primary-600" },
          { label: "Active",         value: activeCount,  icon: MdCheckCircle, bg: "bg-green-50",  color: "text-green-600",  sub: "this page" },
          { label: "Low Stock",      value: lowStock,     icon: MdWarning,   bg: "bg-red-50",     color: "text-red-600",    sub: "this page" },
          { label: "Featured",       value: featuredCount,icon: MdStar,      bg: "bg-yellow-50",  color: "text-yellow-600", sub: "this page" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub && <p className="text-[10px] text-gray-400">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9 w-56 text-sm py-2"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <MdFilterList size={16} className="text-gray-400" />

            <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-40">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>

            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-32">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select value={featFilter} onChange={(e) => { setFeatFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Types</option>
              <option value="is_featured">Featured</option>
              <option value="is_bestseller">Bestseller</option>
              <option value="is_new_arrival">New Arrival</option>
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline px-2 py-1 whitespace-nowrap">
                Clear All
              </button>
            )}
          </div>

          <div className="ml-auto text-xs text-gray-400">
            Total: <span className="font-semibold text-gray-700">{total}</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          currentPage={current_page}
          totalPages={total_pages}
          total={total}
          perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ── Quick View Drawer ─────────────────────────────────────────────── */}
      {viewProd && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewProd(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Product Details</h3>
              <button onClick={() => setViewProd(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Image */}
              <div className="w-full h-48 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {viewProd.thumbnail
                  ? <img src={getImgUrl(viewProd.thumbnail)} alt={viewProd.name} className="w-full h-full object-contain p-2" />
                  : <MdImage size={48} className="text-gray-300" />}
              </div>

              {/* Name + badges */}
              <div>
                <h4 className="text-xl font-bold text-gray-900">{viewProd.name}</h4>
                <p className="text-sm text-gray-400 mt-0.5">{viewProd.category_id?.name} {viewProd.brand_id?.name && `· ${viewProd.brand_id.name}`}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {viewProd.is_featured    && <span className="badge bg-yellow-100 text-yellow-700">Featured</span>}
                  {viewProd.is_bestseller  && <span className="badge bg-orange-100 text-orange-700">Bestseller</span>}
                  {viewProd.is_new_arrival && <span className="badge bg-blue-100 text-blue-700">New Arrival</span>}
                  {viewProd.is_on_sale     && <span className="badge bg-red-100 text-red-700">On Sale</span>}
                  <span className={`badge ${viewProd.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {viewProd.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Price",     value: formatCurrency(viewProd.price) },
                  { label: "MRP",       value: formatCurrency(viewProd.mrp) },
                  { label: "Discount",  value: `${viewProd.discount_percent || 0}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Stock + SKU + Rating */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Stock",     value: viewProd.stock, alert: viewProd.stock <= (viewProd.low_stock_threshold || 10) },
                  { label: "SKU",       value: viewProd.sku || "—" },
                  { label: "Rating",    value: viewProd.rating_avg > 0 ? `⭐ ${viewProd.rating_avg}` : "—" },
                ].map(({ label, value, alert }) => (
                  <div key={label} className={`rounded-xl p-3 text-center ${alert ? "bg-red-50" : "bg-gray-50"}`}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${alert ? "text-red-600" : "text-gray-800"}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {viewProd.short_description && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Short Description</p>
                  <p className="text-sm text-gray-600">{viewProd.short_description}</p>
                </div>
              )}

              {/* Tags */}
              {viewProd.tags?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewProd.tags.map((t) => (
                      <span key={t} className="badge bg-gray-100 text-gray-600 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Created */}
              <p className="text-xs text-gray-400">Added on {formatDate(viewProd.createdAt)}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => { setViewProd(null); navigate(`/admin/products/edit/${viewProd._id}`); }}
                className="flex-1 btn-primary text-sm py-2"
              >
                <MdEdit size={15} className="inline mr-1.5" /> Edit Product
              </button>
              <button
                onClick={() => { setViewProd(null); setDeleteId(viewProd._id); }}
                className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium"
              >
                <MdDelete size={15} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ─────────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete Product"
        message="Are you sure? This will deactivate the product. This action cannot be undone."
      />

    </div>
  );
};

export default Products;
