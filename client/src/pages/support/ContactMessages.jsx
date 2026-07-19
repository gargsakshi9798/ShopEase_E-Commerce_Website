import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages, fetchMessageById,
  replyToMessage, archiveMessage, deleteMessage,
  clearSelectedMessage,
} from "../../features/support/supportSlice";
import DataTable    from "../../components/common/DataTable";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import { formatDateTime, getImgUrl } from "../../utils/Methods";
import {
  MdSearch, MdRefresh, MdClose, MdReply, MdFilterList,
  MdEmail, MdMail, MdMarkEmailRead, MdArchive, MdDelete,
  MdSend, MdPerson, MdPhone, MdSubject, MdDownload,
  MdImage, MdOpenInNew, MdShoppingBag, MdPayment, MdInventory2,
} from "react-icons/md";

const STATUS_CONFIG = {
  unread:   { label: "Unread",   color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  read:     { label: "Read",     color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  replied:  { label: "Replied",  color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  archived: { label: "Archived", color: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
};

const exportCSV = (list) => {
  if (!list.length) return;
  const rows = [["Name","Email","Phone","Subject","Status","Date"],
    ...list.map((m) => [m.name, m.email, m.phone || "", m.subject, m.status, formatDateTime(m.createdAt)])
  ];
  const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = "contact_messages.csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported");
};

const ContactMessages = () => {
  const dispatch = useDispatch();
  const { messages, selectedMessage, status, mutating } = useSelector((s) => s.support);
  const { role_slug } = useSelector((s) => s.auth);
  const isEmployee   = role_slug === "employee";
  const isSuperAdmin = role_slug === "super_admin";
  const canDelete    = isSuperAdmin;   // only superadmin can delete messages
  const loading = status === "loading";

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]               = useState(1);
  const [viewMsg, setViewMsg]         = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [replyText, setReplyText]     = useState("");
  const [adminNotes, setAdminNotes]   = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)       params.search = search;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchMessages(params));
  };

  useEffect(() => { load(page); }, [page, statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Stats from current page ───────────────────────────────────────────────
  const unreadCount  = messages.list.filter((m) => m.status === "unread").length;
  const repliedCount = messages.list.filter((m) => m.status === "replied").length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openDetail = async (msg) => {
    setViewMsg(msg);
    setReplyText("");
    setAdminNotes("");
    setShowReplyForm(false);
    await dispatch(fetchMessageById(msg._id));
  };

  const closeDetail = () => {
    setViewMsg(null);
    dispatch(clearSelectedMessage());
    setShowReplyForm(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) { toast.error("Reply message is required"); return; }
    const id = viewMsg?._id || selectedMessage?._id;
    try {
      const res = await dispatch(replyToMessage({ id, reply_message: replyText, admin_notes: adminNotes })).unwrap();
      if (res?.success) {
        toast.success("Reply sent successfully!");
        setReplyText(""); setAdminNotes(""); setShowReplyForm(false);
        dispatch(fetchMessageById(id));
        load(page);
      }
    } catch (err) { toast.error(err?.message || "Reply failed"); }
  };

  const handleArchive = async (id) => {
    try {
      const res = await dispatch(archiveMessage(id)).unwrap();
      if (res?.success) {
        toast.success("Message archived");
        if (viewMsg?._id === id) closeDetail();
        load(page);
      }
    } catch { toast.error("Archive failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteMessage(deleteId)).unwrap();
      if (res?.success) {
        toast.success("Message deleted");
        setDeleteId(null);
        if (viewMsg?._id === deleteId) closeDetail();
        load(page);
      }
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const detail = selectedMessage || viewMsg;

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "status", label: "", width: 12,
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || STATUS_CONFIG.read;
        return <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0 mx-auto`} title={cfg.label} />;
      },
    },
    {
      key: "name", label: "Sender",
      render: (v, row) => (
        <div>
          <p className={`text-sm font-medium ${row.status === "unread" ? "font-bold text-gray-900" : "text-gray-700"}`}>{v}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "subject", label: "Subject",
      render: (v, row) => (
        <p className={`text-sm truncate max-w-[200px] ${row.status === "unread" ? "font-semibold text-gray-900" : "text-gray-600"}`}>{v}</p>
      ),
    },
    {
      key: "status", label: "Status",
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || STATUS_CONFIG.read;
        return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: "createdAt", label: "Date",
      render: (v) => <span className="text-xs text-gray-400 whitespace-nowrap">{formatDateTime(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openDetail(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <MdEmail size={13} /> Open
          </button>
          <button onClick={() => handleArchive(row._id)} disabled={row.status === "archived" || mutating}
            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 disabled:opacity-30" title="Archive">
            <MdArchive size={16} />
          </button>
          {canDelete && (
            <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete message">
              <MdDelete size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            Manage enquiries and messages from the contact form
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
              ${isSuperAdmin ? "bg-purple-100 text-purple-700"
              : isEmployee   ? "bg-blue-100 text-blue-700"
              :                "bg-green-100 text-green-700"}`}>
              {isSuperAdmin ? "Super Admin" : isEmployee ? "Employee" : "Admin"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"><MdRefresh size={18} /></button>
          <button onClick={() => exportCSV(messages.list)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdDownload size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",    value: messages.total,  icon: MdMail,         bg: "bg-primary-50", color: "text-primary-600", filter: "" },
          { label: "Unread",   value: unreadCount,     icon: MdEmail,        bg: "bg-blue-50",    color: "text-blue-600",    filter: "unread",   sub: "this page" },
          { label: "Replied",  value: repliedCount,    icon: MdMarkEmailRead,bg: "bg-green-50",   color: "text-green-600",   filter: "replied",  sub: "this page" },
          { label: "Archived", value: messages.list.filter((m) => m.status === "archived").length, icon: MdArchive, bg: "bg-orange-50", color: "text-orange-600", filter: "archived", sub: "this page" },
        ].map((s) => (
          <div key={s.label}
            onClick={() => { setStatusFilter(s.filter); setPage(1); }}
            className={`bg-white rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow ${statusFilter === s.filter ? "ring-2 ring-primary-400" : ""}`}>
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
              placeholder="Search by name, email or subject..."
              className="input-field pl-9 w-64 text-sm py-2" />
          </div>
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }} className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{messages.total}</span></div>
        </div>
        <DataTable
          columns={columns} data={messages.list} loading={loading}
          currentPage={messages.current_page} totalPages={messages.total_pages}
          total={messages.total} perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ── Detail Drawer ────────────────────────────────────────────────── */}
      {viewMsg && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeDetail} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`badge flex-shrink-0 ${STATUS_CONFIG[detail?.status]?.color || "bg-gray-100"}`}>
                  {STATUS_CONFIG[detail?.status]?.label}
                </span>
                <p className="text-base font-semibold text-gray-800 truncate">{detail?.subject}</p>
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0">
                <MdClose size={20} />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">

              {/* Sender Info */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {detail?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{detail?.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MdEmail size={12} /> {detail?.email}
                      </span>
                      {detail?.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MdPhone size={12} /> {detail.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Received</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDateTime(detail?.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-800 capitalize mt-0.5">
                    {detail?.department || (detail?.source || "contact_form").replace("_", " ")}
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <MdSubject size={14} /> Message
                </p>
                <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary-300">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail?.message}</p>
                </div>
              </div>

              {/* Reference — linked order / product / payment */}
              {detail?.reference_type && detail.reference_type !== "none" && detail?.reference_label && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-primary-50 border border-primary-100 rounded-xl">
                  {detail.reference_type === "order"   && <MdShoppingBag size={16} className="text-primary-500 flex-shrink-0" />}
                  {detail.reference_type === "payment" && <MdPayment      size={16} className="text-primary-500 flex-shrink-0" />}
                  {detail.reference_type === "product" && <MdInventory2   size={16} className="text-primary-500 flex-shrink-0" />}
                  {detail.reference_type === "review"  && <MdImage        size={16} className="text-primary-500 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-[10px] text-primary-500 uppercase font-semibold tracking-wide capitalize">
                      Related {detail.reference_type}
                    </p>
                    <p className="text-sm font-medium text-primary-800 truncate">{detail.reference_label}</p>
                  </div>
                </div>
              )}

              {/* Attached Images */}
              {detail?.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <MdImage size={14} /> Attachments
                    <span className="text-gray-400 font-normal">({detail.images.length})</span>
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {detail.images.map((url, idx) => (
                      <a
                        key={idx}
                        href={getImgUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group block w-28 h-28 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 hover:border-primary-400 transition-colors"
                        title={`View Image ${idx + 1}`}
                      >
                        <img
                          src={getImgUrl(url)}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <MdOpenInNew size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                          Image {idx + 1}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Reply (if already replied) */}
              {detail?.status === "replied" && detail?.reply_message && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <MdReply size={14} /> Your Reply
                    <span className="text-[10px] text-gray-400 font-normal">— {formatDateTime(detail?.replied_at)}</span>
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.reply_message}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {detail?.admin_notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Admin Notes</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs text-gray-600">{detail.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {showReplyForm ? (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MdReply size={16} /> Reply to {detail?.name}</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reply Message <span className="text-red-500">*</span></label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={5}
                      placeholder="Write your reply to the customer..."
                      className="input-field resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Internal Notes (not sent to customer)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      placeholder="Add an internal note..."
                      className="input-field resize-none text-sm bg-yellow-50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReplyForm(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                    <button onClick={handleReply} disabled={!replyText.trim() || mutating}
                      className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50">
                      {mutating
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <MdSend size={16} />}
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-3">Send an email reply directly to this enquiry.</p>
                  <button onClick={() => setShowReplyForm(true)}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
                    <MdReply size={17} /> Write Reply
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => handleArchive(detail?._id)}
                disabled={detail?.status === "archived" || mutating}
                className="flex-1 text-sm py-2 rounded-xl border border-orange-200 text-orange-700 hover:bg-orange-50 font-medium disabled:opacity-40"
              >
                <MdArchive size={15} className="inline mr-1" /> Archive
              </button>
              {canDelete && (
                <button
                  onClick={() => { setDeleteId(detail?._id); closeDetail(); }}
                  className="flex-1 text-sm py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                >
                  <MdDelete size={15} className="inline mr-1" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ────────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Message"
        message="Are you sure you want to permanently delete this contact message?"
      />
    </div>
  );
};

export default ContactMessages;
