import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllInventory, updateStock } from "../../features/products/productSlice";
import DataTable from "../../components/common/DataTable";
import { formatCurrency, getImgUrl } from "../../utils/Methods";
import toast from "../../utils/toast";
import {
  MdWarning, MdEdit, MdCheck, MdClose, MdInventory,
  MdRefresh, MdSearch, MdFilterList, MdArrowBack,
  MdCheckCircle, MdRemoveCircle, MdCategory, MdLabel,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

// ─── Stock status tabs ────────────────────────────────────────────────────────
const STOCK_TABS = [
  { key: "",              label: "All Products",  color: "text-gray-600"   },
  { key: "out_of_stock",  label: "Out of Stock",  color: "text-red-600"    },
  { key: "low_stock",     label: "Low Stock",     color: "text-orange-600" },
  { key: "in_stock",      label: "In Stock",      color: "text-green-600"  },
];

// ─── Stock status badge helper ────────────────────────────────────────────────
const stockBadge = (stock, threshold = 10) => {
  if (stock === 0)            return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (stock <= threshold)     return { label: "Low Stock",    cls: "bg-orange-100 text-orange-700" };
  return                             { label: "In Stock",     cls: "bg-green-100 text-green-700" };
};

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    inventoryList, inventoryTotal, inventoryPage, inventoryPages, status,
  } = useSelector((s) => s.product);
  const loading = status === "loading";

  const [editingId, setEditingId] = useState(null);
  const [stockVal,  setStockVal]  = useState("");
  const [saving,    setSaving]    = useState(false);

  const [search,      setSearch]      = useState("");
  const [stockTab,    setStockTab]    = useState("");
  const [page,        setPage]        = useState(1);

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = useCallback((p = page) => {
    const params = { page: p, per_page: 15 };
    if (search)   params.search       = search;
    if (stockTab) params.stock_status = stockTab;
    return params;
  }, [page, search, stockTab]);

  const load = useCallback((p = page) => {
    dispatch(fetchAllInventory(buildParams(p)));
  }, [dispatch, buildParams, page]);

  useEffect(() => { load(page); }, [page, stockTab]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Derived stats (from current page — full-list stats come from server) ──
  const outOfStock = inventoryList.filter((p) => p.stock === 0).length;
  const lowStock   = inventoryList.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold || 10)).length;
  const inStock    = inventoryList.filter((p) => p.stock > (p.low_stock_threshold || 10)).length;

  // ── Update stock handler ──────────────────────────────────────────────────
  const handleUpdateStock = async (id) => {
    if (stockVal === "" || Number(stockVal) < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }
    setSaving(true);
    try {
      const res = await dispatch(updateStock({ id, stock: Number(stockVal) })).unwrap();
      if (res?.success) {
        toast.success("Stock updated");
        setEditingId(null);
        setStockVal("");
      } else {
        toast.error("Stock update failed");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => { setEditingId(null); setStockVal(""); };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "thumbnail", label: "", width: 56,
      render: (v) => (
        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          <img
            src={v ? getImgUrl(v) : "/placeholder.png"}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/placeholder.png"; }}
          />
        </div>
      ),
    },
    {
      key: "name", label: "Product",
      render: (v, row) => (
        <div className="min-w-[160px]">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{v}</p>
          {row.sku && <p className="text-[10px] text-gray-400 mt-0.5">SKU: {row.sku}</p>}
        </div>
      ),
    },
    {
      key: "category_id", label: "Category",
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <MdCategory size={13} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">{v?.name || "—"}</span>
        </div>
      ),
    },
    {
      key: "brand_id", label: "Brand",
      render: (v) => v ? (
        <div className="flex items-center gap-1.5">
          {v.logo ? (
            <img
              src={getImgUrl(v.logo)}
              alt={v.name}
              className="w-5 h-5 object-contain rounded flex-shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <MdLabel size={13} className="text-blue-400 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-600">{v.name}</span>
        </div>
      ) : <span className="text-xs text-gray-300">—</span>,
    },
    {
      key: "price", label: "Price",
      render: (v) => <span className="text-sm font-semibold text-gray-700">{formatCurrency(v)}</span>,
    },
    {
      key: "stock", label: "Stock",
      render: (v, row) => {
        const { label, cls } = stockBadge(v, row.low_stock_threshold || 10);
        return (
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${v === 0 ? "text-red-600" : v <= (row.low_stock_threshold || 10) ? "text-orange-500" : "text-gray-800"}`}>
              {v}
            </span>
            <span className={`badge text-[9px] ${cls}`}>{label}</span>
          </div>
        );
      },
    },
    {
      key: "low_stock_threshold", label: "Alert At",
      render: (v) => (
        <span className="text-xs text-gray-400">{v || 10} units</span>
      ),
    },
    {
      key: "total_sold", label: "Sold",
      render: (v) => <span className="text-sm text-gray-600">{v || 0}</span>,
    },
    {
      key: "actions", label: "Update Stock",
      render: (_, row) =>
        editingId === row._id ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={stockVal}
              onChange={(e) => setStockVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")  handleUpdateStock(row._id);
                if (e.key === "Escape") cancelEdit();
              }}
              className="input-field w-20 text-sm py-1.5"
              autoFocus
            />
            <button
              onClick={() => handleUpdateStock(row._id)}
              disabled={saving}
              className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              title="Save"
            >
              <MdCheck size={15} />
            </button>
            <button
              onClick={cancelEdit}
              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              title="Cancel"
            >
              <MdClose size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingId(row._id); setStockVal(String(row.stock)); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <MdEdit size={13} /> Update
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <MdArrowBack size={18} /> Products
          </button>
          <span className="text-gray-300">|</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory & Stock</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              All products — brand, category, stock level at a glance
            </p>
          </div>
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
        >
          <MdRefresh size={16} /> Refresh
        </button>
      </div>

      {/* ── Summary Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products",  value: inventoryTotal, bg: "bg-primary-50",  color: "text-primary-600",  border: "border-primary-100",  icon: MdInventory },
          { label: "In Stock",        value: inStock,        bg: "bg-green-50",    color: "text-green-600",    border: "border-green-100",    icon: MdCheckCircle },
          { label: "Low Stock",       value: lowStock,       bg: "bg-orange-50",   color: "text-orange-600",   border: "border-orange-100",   icon: MdWarning },
          { label: "Out of Stock",    value: outOfStock,     bg: "bg-red-50",      color: "text-red-600",      border: "border-red-100",      icon: MdRemoveCircle },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-4 shadow-card flex items-center gap-3 border ${s.border}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Alert Banner ───────────────────────────────────────────────────── */}
      {outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <MdWarning className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700 font-medium">
            {outOfStock} product{outOfStock > 1 ? "s are" : " is"} completely out of stock — update stock to avoid order failures.
          </p>
        </div>
      )}

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">

        {/* Status filter tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStockTab(tab.key); setPage(1); }}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                stockTab === tab.key
                  ? `border-primary-600 ${tab.color}`
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name..."
              className="input-field pl-9 w-64 text-sm py-2"
            />
          </div>
          <p className="text-xs text-gray-400">
            Total: <span className="font-semibold text-gray-700">{inventoryTotal}</span> products
          </p>
        </div>

        <DataTable
          columns={columns}
          data={inventoryList}
          loading={loading}
          currentPage={inventoryPage}
          totalPages={inventoryPages}
          total={inventoryTotal}
          perPage={15}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Stock is automatically decreased when an order is placed and restored when an order is cancelled or returned.
      </p>
    </div>
  );
};

export default Inventory;
