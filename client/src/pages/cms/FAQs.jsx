import { useEffect, useState } from "react";
import { GET, POST, PUT, DELETE } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import Modal       from "../../components/common/Modal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { useForm } from "react-hook-form";
import toast from "../../utils/toast";
import {
  MdAdd, MdEdit, MdDelete, MdSearch, MdHelpOutline,
  MdRefresh, MdExpandMore, MdExpandLess, MdFilterList,
} from "react-icons/md";
import { formatDate } from "../../utils/Methods";

const FAQs = () => {
  const [list, setList]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [expanded, setExpanded]   = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (catFilter) params.category = catFilter;
      const res = await GET(APIS.CMS.FAQs, params);
      const data = res?.data?.data || [];
      const filtered = search
        ? data.filter((f) =>
            f.question.toLowerCase().includes(search.toLowerCase()) ||
            f.answer.toLowerCase().includes(search.toLowerCase())
          )
        : data;
      setList(filtered);
      setTotal(res?.data?.total || 0);
    } catch { toast.error("Failed to load FAQs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [catFilter]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Unique categories from list
  const categories = [...new Set(list.map((f) => f.category).filter(Boolean))];

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount = list.filter((f) => f.status).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); reset({ category: "General", sort_order: 0 }); setShowForm(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    reset({ question: item.question, answer: item.answer, category: item.category, sort_order: item.sort_order });
    setShowForm(true);
  };
  const closeForm  = () => { setShowForm(false); setEditItem(null); reset({}); };

  const onSubmit = async (data) => {
    try {
      if (editItem) await PUT(`${APIS.CMS.FAQs}/${editItem._id}`, data);
      else           await POST(APIS.CMS.FAQs, data);
      toast.success(editItem ? "FAQ updated!" : "FAQ created!");
      closeForm(); load();
    } catch { toast.error("Save failed"); }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await DELETE(`${APIS.CMS.FAQs}/${deleteId}`);
      toast.success("FAQ deleted"); setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage frequently asked questions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add FAQ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total FAQs",  value: total,           bg: "bg-primary-50", color: "text-primary-600" },
          { label: "Active",      value: activeCount,     bg: "bg-green-50",   color: "text-green-600" },
          { label: "Categories",  value: categories.length, bg: "bg-blue-50",  color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <MdHelpOutline size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar + FAQ List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..." className="input-field pl-9 w-64 text-sm py-2" />
          </div>
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <MdFilterList size={16} className="text-gray-400" />
              <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                className="input-field text-sm py-1.5 w-40">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {catFilter && (
                <button onClick={() => setCatFilter("")} className="text-xs text-primary-600 hover:underline">Clear</button>
              )}
            </div>
          )}
          <div className="ml-auto text-xs text-gray-400">
            {list.length} FAQ{list.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* FAQ Accordion */}
        {loading ? (
          <div className="px-4 py-12 flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading FAQs...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="px-4 py-12 flex flex-col items-center gap-2 text-gray-400">
            <MdHelpOutline size={40} />
            <p className="text-sm">No FAQs found</p>
            <button onClick={openCreate} className="text-sm text-primary-600 hover:underline">Add the first FAQ</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((faq) => (
              <div key={faq._id} className="group">
                {/* Question row */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => toggleExpand(faq._id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      expanded === faq._id ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {expanded === faq._id ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {faq.category && (
                          <span className="badge text-[10px] bg-blue-100 text-blue-600">{faq.category}</span>
                        )}
                        <span className={`badge text-[10px] ${faq.status ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {faq.status ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[10px] text-gray-400">Order: {faq.sort_order}</span>
                      </div>
                    </div>
                  </button>
                  {/* Actions — show on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
                      <MdEdit size={15} />
                    </button>
                    <button onClick={() => setDeleteId(faq._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
                      <MdDelete size={15} />
                    </button>
                  </div>
                </div>

                {/* Answer (expanded) */}
                {expanded === faq._id && (
                  <div className="px-4 pb-4 ml-10">
                    <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary-300">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showForm} onClose={closeForm}
        title={editItem ? "Edit FAQ" : "Add FAQ"} size="md"
        footer={<>
          <button onClick={closeForm} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button form="faq-form" type="submit" disabled={isSubmitting}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
            {isSubmitting ? "Saving..." : editItem ? "Save Changes" : "Create FAQ"}
          </button>
        </>}
      >
        <form id="faq-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
            <input className="input-field" placeholder="Enter the question"
              {...register("question", { required: "Question is required" })} />
            {errors.question && <p className="text-red-500 text-xs mt-1">{errors.question.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer <span className="text-red-500">*</span></label>
            <textarea rows={5} className="input-field resize-none" placeholder="Write a detailed answer..."
              {...register("answer", { required: "Answer is required" })} />
            {errors.answer && <p className="text-red-500 text-xs mt-1">{errors.answer.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input className="input-field" placeholder="e.g. Shipping, Returns, Payment"
                {...register("category")} />
              <p className="text-xs text-gray-400 mt-1">Used to group related FAQs</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="0" className="input-field" placeholder="0" {...register("sort_order")} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDelete isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={onDelete} loading={deleting}
        title="Delete FAQ" message="Are you sure you want to delete this FAQ?" />
    </div>
  );
};

export default FAQs;
