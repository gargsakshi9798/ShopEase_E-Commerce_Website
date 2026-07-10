import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
} from "../../features/masters/categorySlice";
import DataTable   from "../../components/common/DataTable";
import Modal       from "../../components/common/Modal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdCategory,
  MdStar, MdRefresh, MdClose, MdCloudUpload,
  MdCheckCircle, MdBlock, MdFilterList,
} from "react-icons/md";
import { formatDate, getImgUrl } from "../../utils/Methods";

const Categories = () => {
  const dispatch = useDispatch();
  const { list, total, current_page, total_pages, status } =
    useSelector((s) => s.category);
  const loading = status === "loading";

  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [levelFilter, setLevelFilter] = useState(""); // "" | "1" | "2"
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const parentIdValue = watch("parent_id");

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)      params.search = search;
    if (levelFilter) params.level  = levelFilter;
    return params;
  };
  const load = (p = page) => dispatch(fetchCategories(buildParams(p)));

  useEffect(() => { load(page); }, [page, levelFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Parent categories (level=1) for sub-category dropdown
  const parentCategories = list.filter((c) => c.level === 1);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const mainCats  = list.filter((c) => c.level === 1).length;
  const subCats   = list.filter((c) => c.level === 2).length;
  const featured  = list.filter((c) => c.is_featured).length;
  const active    = list.filter((c) => c.status).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); reset({}); setPreviewImg(null); setShowForm(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    reset({
      name:        item.name,
      description: item.description,
      parent_id:   item.parent_id?._id || "",
      sort_order:  item.sort_order,
      is_featured: item.is_featured,
      meta_title:  item.meta_title,
      meta_description: item.meta_description,
    });
    setPreviewImg(item.image ? getImgUrl(item.image) : null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); reset({}); setPreviewImg(null); };

  const onSubmit = async (data) => {
    const fd = new FormData();
    ["name","description","parent_id","sort_order","meta_title","meta_description"]
      .forEach((k) => { if (data[k] !== undefined && data[k] !== "") fd.append(k, data[k]); });
    fd.append("is_featured", data.is_featured ? "true" : "false");
    if (data.image?.[0]) fd.append("image", data.image[0]);

    try {
      let res;
      if (editItem) {
        res = await dispatch(updateCategory({ id: editItem._id, formData: fd }));
        if (res.payload?.success) { toast.success("Category updated!"); closeForm(); load(); }
        else toast.error(res.payload?.message || "Update failed");
      } else {
        res = await dispatch(createCategory(fd));
        if (res.payload?.success) { toast.success("Category created!"); closeForm(); load(); }
        else toast.error(res.payload?.message || "Create failed");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteCategory(deleteId));
      toast.success("Category deleted"); setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "image", label: "", width: 56,
      render: (v) => (
        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
          <img
            src={v ? getImgUrl(v) : "/placeholder.png"}
            alt="" className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "/placeholder.png"; }}
          />
        </div>
      ),
    },
    {
      key: "name", label: "Category",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v}</p>
          {row.parent_id && (
            <p className="text-xs text-gray-400 mt-0.5">Under: {row.parent_id?.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "level", label: "Type",
      render: (v) => (
        <span className={`badge ${v === 1 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
          {v === 1 ? "Category" : "Sub-Category"}
        </span>
      ),
    },
    {
      key: "is_featured", label: "Featured",
      render: (v) => (
        <span className={`badge ${v ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
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
      render: (v) => <span className="text-sm text-gray-500">{v}</span>,
    },
    {
      key: "createdAt", label: "Created",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage product categories and sub-categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",        value: total,    bg: "bg-primary-50", color: "text-primary-600", icon: MdCategory },
          { label: "Categories",   value: mainCats, bg: "bg-blue-50",    color: "text-blue-600",    icon: MdCategory, sub: "this page" },
          { label: "Sub-Categories", value: subCats,bg: "bg-purple-50",  color: "text-purple-600",  icon: MdCategory, sub: "this page" },
          { label: "Featured",     value: featured, bg: "bg-yellow-50",  color: "text-yellow-600",  icon: MdStar,     sub: "this page" },
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
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="input-field pl-9 w-56 text-sm py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <MdFilterList size={16} className="text-gray-400" />
              <select
                value={levelFilter}
                onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                className="input-field text-sm py-1.5 w-40"
              >
                <option value="">All Types</option>
                <option value="1">Categories</option>
                <option value="2">Sub-Categories</option>
              </select>
              {(search || levelFilter) && (
                <button onClick={() => { setSearch(""); setLevelFilter(""); setPage(1); }}
                  className="text-xs text-primary-600 hover:underline">Clear</button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></p>
        </div>

        <DataTable
          columns={columns} data={list} loading={loading}
          currentPage={current_page} totalPages={total_pages} total={total} perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showForm} onClose={closeForm}
        title={editItem ? "Edit Category" : "Add Category"}
        size="md"
        footer={
          <>
            <button onClick={closeForm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
            <button form="cat-form" type="submit" disabled={isSubmitting}
              className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
              {isSubmitting ? "Saving..." : editItem ? "Save Changes" : "Create Category"}
            </button>
          </>
        }
      >
        <form id="cat-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
            <input className="input-field" placeholder="Enter category name"
              {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Parent (for sub-category) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select className="input-field" {...register("parent_id")}>
              <option value="">None — Top level category</option>
              {parentCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {parentIdValue ? "This will be a Sub-Category" : "This will be a top-level Category"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Brief description..."
              {...register("description")} />
          </div>

          {/* Sort + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="0" className="input-field" placeholder="0" {...register("sort_order")} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="is_feat_cat" className="rounded accent-primary-600" {...register("is_featured")} />
              <label htmlFor="is_feat_cat" className="text-sm text-gray-700 cursor-pointer">⭐ Featured</label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
              <MdCloudUpload size={24} className="text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Click to upload image</p>
              <input type="file" accept="image/*" className="hidden"
                {...register("image")}
                onChange={(e) => { register("image").onChange(e); if (e.target.files[0]) setPreviewImg(URL.createObjectURL(e.target.files[0])); }}
              />
            </label>
            {previewImg && (
              <div className="relative mt-2 inline-block">
                <img src={previewImg} alt="preview" className="h-20 rounded-xl object-cover border-2 border-gray-200" />
                <button type="button" onClick={() => setPreviewImg(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  <MdClose size={12} />
                </button>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO (optional)</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input className="input-field" placeholder="SEO title" {...register("meta_title")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea rows={2} className="input-field resize-none" placeholder="SEO description" {...register("meta_description")} />
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Confirm Delete ─────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={onDelete} loading={deleting}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will also affect subcategories. This action cannot be undone."
      />

    </div>
  );
};

export default Categories;
