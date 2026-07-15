import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands, createBrand, updateBrand, deleteBrand,
} from "../../features/masters/brandSlice";
import DataTable   from "../../components/common/DataTable";
import Modal       from "../../components/common/Modal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "../../utils/toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdLabelOutline,
  MdStar, MdRefresh, MdClose, MdCloudUpload,
  MdCheckCircle, MdLink, MdInfo, MdFilterList,
} from "react-icons/md";
import { formatDate, getImgUrl } from "../../utils/Methods";

const Brands = () => {
  const dispatch = useDispatch();
  const { list, total, status } = useSelector((s) => s.brand);
  const loading = status === "loading";

  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [featFilter, setFeatFilter] = useState(""); // "" | "true" | "false"
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [viewItem, setViewItem]     = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)      params.search      = search;
    if (featFilter)  params.is_featured = featFilter;
    return params;
  };
  const load = (p = page) => dispatch(fetchBrands(buildParams(p)));

  useEffect(() => { load(page); }, [page, featFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const featured = list.filter((b) => b.is_featured).length;
  const active   = list.filter((b) => b.status).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); reset({}); setPreviewImg(null); setShowForm(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    reset({
      name:        item.name,
      description: item.description,
      website:     item.website,
      sort_order:  item.sort_order,
      is_featured: item.is_featured,
    });
    setPreviewImg(item.logo ? getImgUrl(item.logo) : null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); reset({}); setPreviewImg(null); };

  const onSubmit = async (data) => {
    const fd = new FormData();
    ["name","description","website","sort_order"].forEach((k) => {
      if (data[k] !== undefined && data[k] !== "") fd.append(k, data[k]);
    });
    fd.append("is_featured", data.is_featured ? "true" : "false");
    if (data.logo?.[0]) fd.append("logo", data.logo[0]);

    try {
      let res;
      if (editItem) {
        res = await dispatch(updateBrand({ id: editItem._id, formData: fd }));
        if (res.payload?.success) { showSuccess("Brand updated!"); closeForm(); load(); }
        else showError(res.payload?.message || "Update failed");
      } else {
        res = await dispatch(createBrand(fd));
        if (res.payload?.success) { showSuccess("Brand created!"); closeForm(); load(); }
        else showError(res.payload?.message || "Create failed");
      }
    } catch { showError("Something went wrong"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteBrand(deleteId));
      toast.success("Brand deleted"); setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "logo", label: "", width: 56,
      render: (v) => (
        <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
          <img
            src={v ? getImgUrl(v) : "/placeholder.png"}
            alt="" className="w-full h-full object-contain"
            onError={(e) => { e.target.src = "/placeholder.png"; }}
          />
        </div>
      ),
    },
    {
      key: "name", label: "Brand",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v}</p>
          {row.description && (
            <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "website", label: "Website",
      render: (v) => v
        ? <a href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            <MdLink size={13} /> {v.replace(/https?:\/\//, "").split("/")[0]}
          </a>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: "is_featured", label: "Featured",
      render: (v) => (
        <span className={`badge ${v ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"}`}>
          {v ? "⭐ Featured" : "—"}
        </span>
      ),
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
      key: "sort_order", label: "Order",
      render: (v) => <span className="text-sm text-gray-500">{v ?? 0}</span>,
    },
    {
      key: "createdAt", label: "Created",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewItem(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="View">
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

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage product brands and their details</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add Brand
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Brands", value: total,    bg: "bg-primary-50", color: "text-primary-600", icon: MdLabelOutline },
          { label: "Active",       value: active,   bg: "bg-green-50",   color: "text-green-600",   icon: MdCheckCircle, sub: "this page" },
          { label: "Featured",     value: featured, bg: "bg-yellow-50",  color: "text-yellow-600",  icon: MdStar,        sub: "this page" },
          { label: "With Website", value: list.filter((b) => b.website).length, bg: "bg-blue-50", color: "text-blue-600", icon: MdLink, sub: "this page" },
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
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="input-field pl-9 w-56 text-sm py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <MdFilterList size={16} className="text-gray-400" />
              <select
                value={featFilter}
                onChange={(e) => { setFeatFilter(e.target.value); setPage(1); }}
                className="input-field text-sm py-1.5 w-40"
              >
                <option value="">All Brands</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
              {(search || featFilter) && (
                <button onClick={() => { setSearch(""); setFeatFilter(""); setPage(1); }}
                  className="text-xs text-primary-600 hover:underline">Clear</button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></p>
        </div>

        <DataTable
          columns={columns} data={list} loading={loading}
          total={total} perPage={10} onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ── View Drawer ─────────────────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewItem(null)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Brand Details</h3>
              <button onClick={() => setViewItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Logo */}
              <div className="flex flex-col items-center gap-3 py-3">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center p-3">
                  <img
                    src={viewItem.logo ? getImgUrl(viewItem.logo) : "/placeholder.png"}
                    alt={viewItem.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900">{viewItem.name}</h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {viewItem.is_featured && <span className="badge bg-yellow-100 text-yellow-700">⭐ Featured</span>}
                    <span className={`badge ${viewItem.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {viewItem.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {viewItem.description && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-700">{viewItem.description}</p>
                  </div>
                )}
                {viewItem.website && (
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                    <MdLink size={16} className="text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={viewItem.website} target="_blank" rel="noreferrer"
                        className="text-sm text-primary-600 hover:underline font-medium">
                        {viewItem.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">Sort Order</p>
                    <p className="text-lg font-bold text-gray-800">{viewItem.sort_order ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(viewItem.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="flex-1 btn-primary text-sm py-2">
                <MdEdit size={15} className="inline mr-1.5" /> Edit Brand
              </button>
              <button onClick={() => { setViewItem(null); setDeleteId(viewItem._id); }}
                className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                <MdDelete size={15} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showForm} onClose={closeForm}
        title={editItem ? "Edit Brand" : "Add Brand"}
        size="md"
        footer={
          <>
            <button onClick={closeForm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button form="brand-form" type="submit" disabled={isSubmitting}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              {isSubmitting ? "Saving..." : editItem ? "Save Changes" : "Create Brand"}
            </button>
          </>
        }
      >
        <form id="brand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name <span className="text-red-500">*</span></label>
            <input className="input-field" placeholder="Enter brand name"
              {...register("name", { required: "Brand name is required" })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input className="input-field" placeholder="https://example.com"
              {...register("website", {
                pattern: { value: /^https?:\/\/.+/, message: "Must start with http:// or https://" }
              })} />
            {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Brief brand description"
              {...register("description")} />
          </div>

          {/* Sort + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="0" className="input-field" placeholder="0" {...register("sort_order")} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="is_feat_brand" className="rounded accent-primary-600" {...register("is_featured")} />
              <label htmlFor="is_feat_brand" className="text-sm text-gray-700 cursor-pointer">⭐ Featured Brand</label>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
              <MdCloudUpload size={24} className="text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Click to upload logo (PNG, SVG, JPG)</p>
              <input type="file" accept="image/*" className="hidden"
                {...register("logo")}
                onChange={(e) => { register("logo").onChange(e); if (e.target.files[0]) setPreviewImg(URL.createObjectURL(e.target.files[0])); }}
              />
            </label>
            {previewImg && (
              <div className="relative mt-2 inline-block">
                <img src={previewImg} alt="preview" className="h-16 rounded-xl object-contain bg-gray-50 p-2 border border-gray-200" />
                <button type="button" onClick={() => setPreviewImg(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <MdClose size={12} />
                </button>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete ─────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={onDelete} loading={deleting}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? Products using this brand will be unaffected."
      />

    </div>
  );
};

export default Brands;
