import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLowStock, updateStock, fetchProducts } from "../../features/products/productSlice";
import DataTable from "../../components/common/DataTable";
import { formatCurrency, getImgUrl } from "../../utils/Methods";
import toast from "react-hot-toast";
import {
  MdWarning, MdEdit, MdCheck, MdClose, MdInventory,
  MdRefresh, MdSearch, MdArrowBack,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { lowStockList, total, status } = useSelector((s) => s.product);
  const loading = status === "loading";

  const [editingId, setEditingId] = useState(null);
  const [stockVal, setStockVal]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");

  useEffect(() => { dispatch(fetchLowStock({ per_page: 100 })); }, [dispatch]);

  const filtered = search
    ? lowStockList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : lowStockList;

  // ── Stock stats ───────────────────────────────────────────────────────────
  const criticalCount = lowStockList.filter((p) => p.stock === 0).length;
  const lowCount      = lowStockList.filter((p) => p.stock > 0 && p.stock <= (p.low_stock_threshold || 10)).length;

  // ── Update handler ────────────────────────────────────────────────────────
  const handleUpdateStock = async (id) => {
    if (stockVal === "" || Number(stockVal) < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }
    setSaving(true);
    try {
      const res = await dispatch(updateStock({ id, stock: Number(stockVal) })).unwrap();
      if (res?.success) {
        toast.success("Stock updated successfully");
        setEditingId(null);
        setStockVal("");
        // Refresh list to remove items that are no longer low stock
        dispatch(fetchLowStock({ per_page: 100 }));
      } else {
        toast.error("Stock update failed");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally { setSaving(false); }
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
            alt="" className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/placeholder.png"; }}
          />
        </div>
      ),
    },
    {
      key: "name", label: "Product",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v}</p>
          <p className="text-xs text-gray-400">{row.category_id?.name || "—"} {row.sku ? `· SKU: ${row.sku}` : ""}</p>
        </div>
      ),
    },
    {
      key: "price", label: "Price",
      render: (v) => <span className="text-sm font-semibold text-gray-700">{formatCurrency(v)}</span>,
    },
    {
      key: "stock", label: "Current Stock",
      render: (v, row) => {
        const threshold = row.low_stock_threshold || 10;
        const isCritical = v === 0;
        const isLow      = v > 0 && v <= threshold;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-bold ${isCritical ? "text-red-600" : isLow ? "text-orange-500" : "text-gray-700"}`}>
              {v}
            </span>
            {isCritical && <span className="badge bg-red-100 text-red-700 text-[9px]">Out of Stock</span>}
            {isLow      && <span className="badge bg-orange-100 text-orange-700 text-[9px]">Low Stock</span>}
          </div>
        );
      },
    },
    {
      key: "low_stock_threshold", label: "Alert At",
      render: (v) => <span className="text-sm text-gray-500">{v || 10} units</span>,
    },
    {
      key: "actions", label: "Update Stock",
      render: (_, row) =>
        editingId === row._id ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={stockVal}
              onChange={(e) => setStockVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUpdateStock(row._id); if (e.key === "Escape") cancelEdit(); }}
              className="input-field w-20 text-sm py-1.5"
              autoFocus
            />
            <button
              onClick={() => handleUpdateStock(row._id)}
              disabled={saving}
              className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              title="Save"
            >
              <MdCheck size={16} />
            </button>
            <button onClick={cancelEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="Cancel">
              <MdClose size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingId(row._id); setStockVal(String(row.stock)); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <MdEdit size={14} /> Update
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
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
            <p className="text-sm text-gray-500 mt-0.5">Manage stock for low inventory products</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(fetchLowStock({ per_page: 100 }))}
          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
        >
          <MdRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Out of Stock",     value: criticalCount,          bg: "bg-red-50",    color: "text-red-600",    border: "border-red-200" },
          { label: "Low Stock",        value: lowCount,               bg: "bg-orange-50", color: "text-orange-600", border: "border-orange-200" },
          { label: "Items Monitored",  value: lowStockList.length,    bg: "bg-blue-50",   color: "text-blue-600",   border: "border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-4 shadow-card flex items-center gap-4 border ${s.border}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <MdWarning size={22} className={s.color} />
            </div>
            <div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <MdWarning className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700 font-medium">
            {criticalCount} product{criticalCount > 1 ? "s are" : " is"} completely out of stock. Update immediately to avoid order failures.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9 w-60 text-sm py-2"
            />
          </div>
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> low / out-of-stock products
          </p>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
        />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Only products at or below their low stock threshold are shown here. Manage all products from the{" "}
        <button onClick={() => navigate("/admin/products")} className="text-primary-600 hover:underline">Products page</button>.
      </p>

    </div>
  );
};

export default Inventory;
