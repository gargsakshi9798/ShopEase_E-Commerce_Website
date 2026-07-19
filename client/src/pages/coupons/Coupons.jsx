import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../features/coupons/couponSlice";
import DataTable   from "../../components/common/DataTable";
import Modal       from "../../components/common/Modal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { useForm } from "react-hook-form";
import toast from "../../utils/toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdLocalOffer,
  MdCheckCircle, MdClose, MdRefresh, MdInfo, MdContentCopy,
} from "react-icons/md";
import { formatDate, formatCurrency } from "../../utils/Methods";

const isExpired = (d) => d && new Date(d) < new Date();
const isActive  = (c) => c.is_active && !isExpired(c.end_date);

const Coupons = () => {
  const dispatch = useDispatch();
  const { list, total, status } = useSelector((s) => s.coupon);
  const loading = status === "loading";

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [viewItem, setViewItem]   = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const discountType = watch("discount_type", "percentage");

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)        params.search        = search;
    if (typeFilter)    params.discount_type = typeFilter;
    if (activeFilter)  params.is_active     = activeFilter;
    dispatch(fetchCoupons(params));
  };

  useEffect(() => { load(page); }, [page, typeFilter, activeFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount  = list.filter((c) => isActive(c)).length;
  const expiredCount = list.filter((c) => isExpired(c.end_date)).length;
  const pctCount     = list.filter((c) => c.discount_type === "percentage").length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); reset({ discount_type: "percentage" }); setShowForm(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    reset({
      code:                item.code,
      title:               item.title,
      description:         item.description,
      discount_type:       item.discount_type,
      discount_value:      item.discount_value,
      min_order_amount:    item.min_order_amount,
      max_discount_amount: item.max_discount_amount,
      usage_limit:         item.usage_limit,
      usage_per_customer:  item.usage_per_customer,
      start_date:          item.start_date ? item.start_date.slice(0, 10) : "",
      end_date:            item.end_date   ? item.end_date.slice(0, 10)   : "",
      is_active:           item.is_active,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditItem(null); reset({}); };

  const onSubmit = async (data) => {
    try {
      let res;
      if (editItem) res = await dispatch(updateCoupon({ id: editItem._id, data }));
      else           res = await dispatch(createCoupon(data));
      if (res.payload?.success) {
        toast.success(editItem ? "Coupon updated!" : "Coupon created!");
        closeForm(); load(1);
      } else toast.error(res.payload?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteCoupon(deleteId));
      toast.success("Coupon deleted"); setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "code", label: "Coupon Code",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <code className="bg-gray-100 px-2.5 py-1 rounded-lg text-sm font-bold tracking-wide text-gray-800">{v}</code>
          <button onClick={() => copyCode(v)} className="p-1 text-gray-400 hover:text-primary-600" title="Copy code">
            <MdContentCopy size={14} />
          </button>
        </div>
      ),
    },
    {
      key: "title", label: "Title",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v}</p>
          {row.description && <p className="text-xs text-gray-400 truncate max-w-[160px]">{row.description}</p>}
        </div>
      ),
    },
    {
      key: "discount_type", label: "Discount",
      render: (v, row) => (
        <div>
          <span className={`badge ${v === "percentage" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {v === "percentage" ? `${row.discount_value}% OFF` : `₹${row.discount_value} OFF`}
          </span>
          {row.min_order_amount > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">Min: {formatCurrency(row.min_order_amount)}</p>
          )}
        </div>
      ),
    },
    {
      key: "usage_limit", label: "Usage",
      render: (v, row) => (
        <div className="text-sm">
          <span className="font-medium text-gray-700">{row.used_count}</span>
          <span className="text-gray-400">/{v || "∞"}</span>
        </div>
      ),
    },
    {
      key: "end_date", label: "Validity",
      render: (v, row) => {
        const expired = isExpired(v);
        return (
          <div className="text-xs">
            <p className="text-gray-500">{formatDate(row.start_date)}</p>
            <p className={expired ? "text-red-500 font-medium" : "text-gray-500"}>
              → {formatDate(v)} {expired && "⚠ Expired"}
            </p>
          </div>
        );
      },
    },
    {
      key: "is_active", label: "Status",
      render: (v, row) => {
        const active = v && !isExpired(row.end_date);
        return (
          <span className={`badge ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {active ? "Active" : isExpired(row.end_date) ? "Expired" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="View details">
            <MdInfo size={16} />
          </button>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" title="Edit">
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

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Offers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage discount coupons</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: total,        icon: MdLocalOffer, bg: "bg-primary-50",  color: "text-primary-600" },
          { label: "Active",        value: activeCount,  icon: MdCheckCircle,bg: "bg-green-50",   color: "text-green-600",  sub: "this page" },
          { label: "Expired",       value: expiredCount, icon: MdClose,      bg: "bg-red-50",     color: "text-red-600",    sub: "this page" },
          { label: "% Discount",    value: pctCount,     icon: MdLocalOffer, bg: "bg-purple-50",  color: "text-purple-600", sub: "this page" },
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons..." className="input-field pl-9 w-52 text-sm py-2" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-field text-sm py-1.5 w-36">
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="flat">Flat Amount</option>
          </select>
          <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="input-field text-sm py-1.5 w-32">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {(search || typeFilter || activeFilter) && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setActiveFilter(""); setPage(1); }}
              className="text-xs text-primary-600 hover:underline">Clear</button>
          )}
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></div>
        </div>
        <DataTable columns={columns} data={list} loading={loading} total={total} perPage={10} onPageChange={(p) => setPage(p)} />
      </div>

      {/* ── View Drawer ───────────────────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewItem(null)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Coupon Details</h3>
              <button onClick={() => setViewItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {/* Code */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-center">
                <code className="text-2xl font-black text-primary-700 tracking-widest">{viewItem.code}</code>
                <button onClick={() => copyCode(viewItem.code)} className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-700 mx-auto mt-1">
                  <MdContentCopy size={13} /> Copy Code
                </button>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{viewItem.title}</p>
                {viewItem.description && <p className="text-sm text-gray-500 mt-0.5">{viewItem.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Discount",    value: viewItem.discount_type === "percentage" ? `${viewItem.discount_value}%` : formatCurrency(viewItem.discount_value) },
                  { label: "Type",        value: viewItem.discount_type === "percentage" ? "Percentage" : "Flat Amount" },
                  { label: "Min Order",   value: formatCurrency(viewItem.min_order_amount || 0) },
                  { label: "Max Discount",value: viewItem.max_discount_amount ? formatCurrency(viewItem.max_discount_amount) : "—" },
                  { label: "Usage",       value: `${viewItem.used_count} / ${viewItem.usage_limit || "∞"}` },
                  { label: "Per Customer",value: `${viewItem.usage_per_customer}x` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-gray-400 font-medium">Validity Period</p>
                <p className="text-sm text-gray-700">{formatDate(viewItem.start_date)} → {formatDate(viewItem.end_date)}</p>
                {isExpired(viewItem.end_date) && <p className="text-xs text-red-500 font-medium">⚠ This coupon has expired</p>}
              </div>
              <div className="flex gap-2">
                <span className={`badge ${isActive(viewItem) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {isActive(viewItem) ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="flex-1 btn-primary text-sm py-2">
                <MdEdit size={15} className="inline mr-1.5" /> Edit
              </button>
              <button onClick={() => { setViewItem(null); setDeleteId(viewItem._id); }}
                className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                <MdDelete size={15} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? "Edit Coupon" : "Create Coupon"} size="lg"
        footer={<>
          <button onClick={closeForm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button form="coupon-form" type="submit" disabled={isSubmitting}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
            {isSubmitting ? "Saving..." : editItem ? "Save Changes" : "Create Coupon"}
          </button>
        </>}
      >
        <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code <span className="text-red-500">*</span></label>
              <input className="input-field uppercase font-bold tracking-widest" placeholder="e.g. SAVE20"
                {...register("code", { required: "Code is required" })} />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input className="input-field" placeholder="e.g. Summer Sale 20% Off"
                {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input className="input-field" placeholder="Brief description" {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type <span className="text-red-500">*</span></label>
              <select className="input-field" {...register("discount_type", { required: true })}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">{discountType === "percentage" ? "(%)" : "(₹)"}</span>
              </label>
              <input type="number" step="0.01" min="0" className="input-field" placeholder="0"
                {...register("discount_value", { required: true, min: { value: 0.01, message: "Must be > 0" } })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="0" {...register("min_order_amount")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Cap (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="No limit" {...register("max_discount_amount")} />
              <p className="text-xs text-gray-400 mt-0.5">For % coupons only</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
              <input type="number" min="0" className="input-field" placeholder="Leave blank = unlimited" {...register("usage_limit")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Customer Limit</label>
              <input type="number" min="1" className="input-field" defaultValue={1} {...register("usage_per_customer")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" {...register("start_date", { required: "Start date required" })} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
              <input type="date" className="input-field" {...register("end_date", { required: "End date required" })} />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="is_active_chk" className="rounded accent-primary-600" defaultChecked {...register("is_active")} />
            <label htmlFor="is_active_chk" className="text-sm text-gray-700 cursor-pointer">Coupon is Active</label>
          </div>
        </form>
      </Modal>

      <ConfirmDelete isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} loading={deleting}
        title="Delete Coupon" message="Are you sure you want to delete this coupon? This cannot be undone." />
    </div>
  );
};

export default Coupons;
