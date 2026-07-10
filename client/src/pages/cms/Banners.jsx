import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners, createBanner, updateBanner, deleteBanner } from "../../features/cms/bannerSlice";
import DataTable   from "../../components/common/DataTable";
import Modal       from "../../components/common/Modal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdImage,
  MdRefresh, MdClose, MdCloudUpload, MdLink,
  MdFilterList, MdInfo,
} from "react-icons/md";
import { formatDate, getImgUrl } from "../../utils/Methods";

const POSITIONS = ["hero", "top", "middle", "bottom", "sidebar", "popup"];

const POSITION_COLORS = {
  hero:    "bg-purple-100 text-purple-700",
  top:     "bg-blue-100 text-blue-700",
  middle:  "bg-cyan-100 text-cyan-700",
  bottom:  "bg-teal-100 text-teal-700",
  sidebar: "bg-orange-100 text-orange-700",
  popup:   "bg-red-100 text-red-700",
};

const Banners = () => {
  const dispatch = useDispatch();
  const { list, total, status } = useSelector((s) => s.banner);
  const loading = status === "loading";

  const [page, setPage]             = useState(1);
  const [posFilter, setPosFilter]   = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [viewItem, setViewItem]     = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [preview, setPreview]       = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (posFilter) params.position = posFilter;
    dispatch(fetchBanners(params));
  };

  useEffect(() => { load(page); }, [page, posFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount = list.filter((b) => b.status).length;
  const heroCount   = list.filter((b) => b.position === "hero").length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); reset({}); setPreview(null); setShowForm(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    reset({
      title:       item.title,
      subtitle:    item.subtitle,
      link:        item.link,
      button_text: item.button_text,
      position:    item.position,
      sort_order:  item.sort_order,
      start_date:  item.start_date ? item.start_date.slice(0, 10) : "",
      end_date:    item.end_date   ? item.end_date.slice(0, 10)   : "",
    });
    setPreview(item.image ? getImgUrl(item.image) : null);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditItem(null); reset({}); setPreview(null); };

  const onSubmit = async (data) => {
    const fd = new FormData();
    ["title","subtitle","link","button_text","position","sort_order","start_date","end_date"]
      .forEach((k) => { if (data[k] !== undefined && data[k] !== "") fd.append(k, data[k]); });
    if (data.image?.[0]) fd.append("image", data.image[0]);

    try {
      let res;
      if (editItem) {
        res = await dispatch(updateBanner({ id: editItem._id, formData: fd }));
        if (res.payload?.success) { toast.success("Banner updated!"); closeForm(); load(); }
        else toast.error(res.payload?.message || "Update failed");
      } else {
        res = await dispatch(createBanner(fd));
        if (res.payload?.success) { toast.success("Banner created!"); closeForm(); load(); }
        else toast.error(res.payload?.message || "Create failed");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteBanner(deleteId));
      toast.success("Banner deleted"); setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "image", label: "", width: 72,
      render: (v) => (
        <div className="w-16 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
          {v ? (
            <img src={getImgUrl(v)} alt="" className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "/placeholder.png"; }} />
          ) : <MdImage size={20} className="text-gray-300" />}
        </div>
      ),
    },
    {
      key: "title", label: "Banner",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v}</p>
          {row.subtitle && <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.subtitle}</p>}
          {row.link && (
            <a href={row.link} target="_blank" rel="noreferrer"
              className="flex items-center gap-0.5 text-[10px] text-primary-500 hover:underline mt-0.5">
              <MdLink size={11} /> {row.link.replace(/https?:\/\//, "").split("/")[0]}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "position", label: "Position",
      render: (v) => (
        <span className={`badge capitalize ${POSITION_COLORS[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
      ),
    },
    {
      key: "button_text", label: "Button",
      render: (v) => v ? <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">{v}</span> : <span className="text-gray-300">—</span>,
    },
    {
      key: "sort_order", label: "Order",
      render: (v) => <span className="text-sm text-gray-500">{v}</span>,
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
          <button onClick={() => setViewItem(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Preview">
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage website banners and promotional images</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add Banner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Banners", value: total,       bg: "bg-primary-50", color: "text-primary-600" },
          { label: "Active",        value: activeCount, bg: "bg-green-50",   color: "text-green-600",  sub: "this page" },
          { label: "Hero Banners",  value: heroCount,   bg: "bg-purple-50",  color: "text-purple-600", sub: "this page" },
          { label: "Positions",     value: POSITIONS.length, bg: "bg-blue-50", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <MdImage size={20} className={s.color} />
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
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={posFilter} onChange={(e) => { setPosFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-40">
              <option value="">All Positions</option>
              {POSITIONS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            {posFilter && (
              <button onClick={() => { setPosFilter(""); setPage(1); }} className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></div>
        </div>
        <DataTable columns={columns} data={list} loading={loading} total={total} perPage={10} onPageChange={(p) => setPage(p)} />
      </div>

      {/* ── Preview Drawer ─────────────────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewItem(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Banner Preview</h3>
              <button onClick={() => setViewItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {/* Image Preview */}
              <div className="w-full rounded-xl overflow-hidden bg-gray-100">
                {viewItem.image ? (
                  <img src={getImgUrl(viewItem.image)} alt={viewItem.title}
                    className="w-full object-cover" onError={(e) => { e.target.src = "/placeholder.png"; }} />
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <MdImage size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              {/* Details */}
              <div>
                <h4 className="text-xl font-bold text-gray-900">{viewItem.title}</h4>
                {viewItem.subtitle && <p className="text-sm text-gray-500 mt-1">{viewItem.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge capitalize ${POSITION_COLORS[viewItem.position] || "bg-gray-100"}`}>{viewItem.position}</span>
                <span className={`badge ${viewItem.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {viewItem.status ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Button Text",  value: viewItem.button_text || "—" },
                  { label: "Sort Order",   value: viewItem.sort_order ?? 0 },
                  { label: "Start Date",   value: viewItem.start_date ? formatDate(viewItem.start_date) : "—" },
                  { label: "End Date",     value: viewItem.end_date   ? formatDate(viewItem.end_date)   : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              {viewItem.link && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Link URL</p>
                  <a href={viewItem.link} target="_blank" rel="noreferrer"
                    className="text-sm text-primary-600 hover:underline break-all">{viewItem.link}</a>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="flex-1 btn-primary text-sm py-2">
                <MdEdit size={15} className="inline mr-1.5" /> Edit
              </button>
              <button onClick={() => { setViewItem(null); setDeleteId(viewItem._id); }}
                className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? "Edit Banner" : "Add Banner"} size="md"
        footer={<>
          <button onClick={closeForm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button form="banner-form" type="submit" disabled={isSubmitting}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
            {isSubmitting ? "Saving..." : editItem ? "Save Changes" : "Create Banner"}
          </button>
        </>}
      >
        <form id="banner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input className="input-field" placeholder="e.g. Summer Sale"
              {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input className="input-field" placeholder="Short tagline" {...register("subtitle")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position <span className="text-red-500">*</span></label>
              <select className="input-field" {...register("position")}>
                {POSITIONS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="0" className="input-field" placeholder="0" {...register("sort_order")} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
            <input className="input-field" placeholder="https://..." {...register("link")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input className="input-field" placeholder="e.g. Shop Now" {...register("button_text")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" className="input-field" {...register("start_date")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" className="input-field" {...register("end_date")} />
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image {!editItem && <span className="text-red-500">*</span>}
            </label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
              <MdCloudUpload size={24} className="text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Click to upload banner image</p>
              <input type="file" accept="image/*" className="hidden"
                {...register("image", !editItem ? { required: "Image is required" } : {})}
                onChange={(e) => {
                  register("image").onChange(e);
                  if (e.target.files[0]) setPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </label>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            {preview && (
              <div className="relative mt-2">
                <img src={preview} alt="preview" className="w-full rounded-xl object-cover max-h-32" />
                <button type="button" onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <MdClose size={14} />
                </button>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDelete isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} loading={deleting}
        title="Delete Banner" message="Are you sure you want to delete this banner?" />
    </div>
  );
};

export default Banners;
