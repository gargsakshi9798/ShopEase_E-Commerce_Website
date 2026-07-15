import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTicket, fetchMyTickets, fetchMyTicketById,
  replyToMyTicket, closeMyTicket, clearSelected,
} from "../../features/public/publicSupportSlice";
import { fetchMyOrders } from "../../features/public/publicOrderSlice";
import AccountLayout from "../../components/public/layout/AccountLayout";
import { formatDate, formatDateTime } from "../../utils/Methods";
import toast from "react-hot-toast";
import {
  MdAdd, MdClose, MdSend, MdArrowBack, MdHelpOutline,
  MdCheckCircle, MdRefresh, MdAccessTime, MdLockOutline,
  MdChat, MdPriorityHigh,
} from "react-icons/md";

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:             { label: "Open",             cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  in_progress:      { label: "In Progress",      cls: "bg-orange-100 text-orange-700",dot: "bg-orange-500" },
  waiting_customer: { label: "Waiting Reply",    cls: "bg-yellow-100 text-yellow-700",dot: "bg-yellow-500" },
  resolved:         { label: "Resolved",         cls: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  closed:           { label: "Closed",           cls: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
};

const CATEGORY_OPTIONS = [
  { value: "order",     label: "Order Issue" },
  { value: "payment",   label: "Payment Problem" },
  { value: "product",   label: "Product Issue" },
  { value: "shipping",  label: "Shipping / Delivery" },
  { value: "return",    label: "Return / Refund" },
  { value: "account",   label: "Account Help" },
  { value: "technical", label: "Technical Issue" },
  { value: "other",     label: "Other" },
];

const STATUS_FILTERS = [
  { key: "",              label: "All Tickets" },
  { key: "open",          label: "Open" },
  { key: "in_progress",   label: "In Progress" },
  { key: "waiting_customer", label: "Waiting Reply" },
  { key: "resolved",      label: "Resolved" },
  { key: "closed",        label: "Closed" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Create Ticket Modal ──────────────────────────────────────────────────────
const CreateTicketModal = ({ onClose, onCreated, orders }) => {
  const dispatch = useDispatch();
  const { mutating } = useSelector((s) => s.publicSupport);
  const [form, setForm] = useState({
    subject: "", description: "", category: "other", order_id: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject     = "Subject is required";
    if (!form.description.trim()) e.description = "Please describe the issue";
    if (!form.category)           e.category    = "Select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        subject:     form.subject.trim(),
        description: form.description.trim(),
        category:    form.category,
      };
      if (form.order_id) payload.order_id = form.order_id;

      const res = await dispatch(createTicket(payload)).unwrap();
      if (res?.success) {
        toast.success("Ticket raised! We'll respond soon 🎯");
        onCreated();
        onClose();
      } else {
        toast.error(res?.message || "Failed to create ticket");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
              <MdHelpOutline size={20} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Raise a Support Ticket</h3>
              <p className="text-xs text-gray-400">We'll respond within 24 hours</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <MdClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Related Order (optional) */}
          {orders?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Related Order <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 bg-white"
              >
                <option value="">— None —</option>
                {orders.slice(0, 20).map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.order_number} · ₹{o.total_amount?.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of your issue"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Describe the Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Please provide as much detail as possible — what happened, when, and what you expected…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={mutating}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {mutating ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
              ) : (
                <><MdSend size={15} /> Submit Ticket</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Ticket Detail View ───────────────────────────────────────────────────────
const TicketDetail = ({ ticket, onBack, onRefresh }) => {
  const dispatch = useDispatch();
  const { selected, mutating } = useSelector((s) => s.publicSupport);
  const [replyText, setReplyText] = useState("");
  const bottomRef = useRef(null);
  const detail = selected || ticket;

  useEffect(() => {
    dispatch(fetchMyTicketById(ticket._id));
    return () => dispatch(clearSelected());
  }, [ticket._id, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.replies?.length]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await dispatch(replyToMyTicket({ id: detail._id, message: replyText })).unwrap();
      if (res?.success) {
        toast.success("Reply sent!");
        setReplyText("");
        dispatch(fetchMyTicketById(detail._id));
      }
    } catch (err) {
      toast.error(err?.message || "Failed to send reply");
    }
  };

  const handleClose = async () => {
    try {
      const res = await dispatch(closeMyTicket(detail._id)).unwrap();
      if (res?.success) {
        toast.success("Ticket closed");
        onRefresh();
        onBack();
      }
    } catch { toast.error("Failed to close ticket"); }
  };

  const isTerminal = ["resolved", "closed"].includes(detail?.status);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <MdArrowBack size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-primary-600">{detail?.ticket_number}</span>
            <StatusBadge status={detail?.status} />
          </div>
          <p className="text-base font-semibold text-gray-900 truncate">{detail?.subject}</p>
        </div>
        {!isTerminal && (
          <button onClick={handleClose} disabled={mutating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 flex-shrink-0">
            <MdLockOutline size={14} /> Close Ticket
          </button>
        )}
      </div>

      {/* Original description */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Issue</span>
          <span className="text-xs text-gray-400">{formatDate(detail?.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail?.description}</p>
        {detail?.order_id && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-400">Related order: </span>
            <span className="text-xs font-semibold text-primary-600">
              {detail.order_id?.order_number || "—"}
            </span>
          </div>
        )}
      </div>

      {/* Conversation */}
      {detail?.replies?.length > 0 && (
        <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <MdChat size={13} /> Conversation ({detail.replies.length})
          </p>
          {detail.replies.map((r, i) => {
            const isAdmin = r.sender_type === "admin";
            return (
              <div key={i} className={`flex gap-2.5 ${isAdmin ? "" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isAdmin ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {isAdmin ? "S" : "Me"}
                </div>
                <div className={`max-w-[75%] ${isAdmin ? "" : "items-end"} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    isAdmin
                      ? "bg-primary-600 text-white rounded-tl-sm"
                      : "bg-gray-100 text-gray-800 rounded-tr-sm"
                  }`}>
                    {r.message}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    {isAdmin ? "Support Team" : "You"} · {formatDateTime(r.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply box */}
      {!isTerminal ? (
        <div className="mt-auto pt-4 border-t border-gray-100">
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
            placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button onClick={handleReply} disabled={!replyText.trim() || mutating}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40">
              {mutating
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <MdSend size={15} />}
              Send Reply
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 py-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <MdLockOutline size={16} />
          This ticket is {detail?.status}. {detail?.status === "resolved" ? "We hope your issue was resolved! 😊" : "No further replies accepted."}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyTickets = () => {
  const dispatch = useDispatch();
  const { list, total, current_page, total_pages, status } = useSelector((s) => s.publicSupport);
  const { orders } = useSelector((s) => s.publicOrder);
  const loading = status === "loading";

  const [showCreate, setShowCreate] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);

  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (activeFilter) params.status = activeFilter;
    dispatch(fetchMyTickets(params));
  };

  useEffect(() => {
    load(page);
    // Load orders for the create ticket dropdown
    dispatch(fetchMyOrders({ page: 1, per_page: 20 }));
  }, [dispatch]);

  useEffect(() => { load(page); }, [page, activeFilter]);

  const handleCreated = () => { setPage(1); load(1); };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const openCount     = list.filter((t) => t.status === "open").length;
  const inProgCount   = list.filter((t) => t.status === "in_progress").length;
  const resolvedCount = list.filter((t) => t.status === "resolved").length;

  return (
    <AccountLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Support Tickets</h2>
            <p className="text-sm text-gray-500 mt-0.5">Raise issues, track progress and chat with our team</p>
          </div>
          {!selectedTicket && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-primary-200"
            >
              <MdAdd size={18} /> Raise a Ticket
            </button>
          )}
        </div>

        {/* Detail view */}
        {selectedTicket ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px]">
            <TicketDetail
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
              onRefresh={handleCreated}
            />
          </div>
        ) : (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total",      value: total,        icon: MdHelpOutline, bg: "bg-primary-50", color: "text-primary-600" },
                { label: "Open",       value: openCount,    icon: MdAccessTime,  bg: "bg-blue-50",    color: "text-blue-600",    sub: "this page" },
                { label: "In Progress",value: inProgCount,  icon: MdRefresh,     bg: "bg-orange-50",  color: "text-orange-600",  sub: "this page" },
                { label: "Resolved",   value: resolvedCount,icon: MdCheckCircle, bg: "bg-green-50",   color: "text-green-600",   sub: "this page" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
                    <s.icon size={17} className={s.color} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{s.value ?? 0}</p>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button key={f.key}
                  onClick={() => { setActiveFilter(f.key); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeFilter === f.key
                      ? "bg-primary-600 text-white shadow"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Tickets list */}
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                      <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                ))
              ) : list.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MdHelpOutline size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-semibold mb-1">No tickets yet</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {activeFilter ? "No tickets with this status." : "Raise a ticket if you need any help with your order or product."}
                  </p>
                  {!activeFilter && (
                    <button onClick={() => setShowCreate(true)}
                      className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700">
                      Raise First Ticket
                    </button>
                  )}
                </div>
              ) : (
                list.map((ticket) => {
                  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                  const categoryLabel = CATEGORY_OPTIONS.find((c) => c.value === ticket.category)?.label || ticket.category;
                  const hasUnread = ticket.status === "waiting_customer";
                  return (
                    <button
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 p-4 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          hasUnread ? "bg-yellow-50" : "bg-gray-50"
                        }`}>
                          {hasUnread
                            ? <MdPriorityHigh size={20} className="text-yellow-600" />
                            : <MdHelpOutline size={20} className="text-gray-400" />}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-primary-600">{ticket.ticket_number}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-400">{categoryLabel}</span>
                            {hasUnread && (
                              <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-1.5 py-0.5 rounded-full">
                                Admin replied!
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                            {ticket.replies?.length > 0 && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <MdChat size={11} /> {ticket.replies.length} repl{ticket.replies.length === 1 ? "y" : "ies"}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Status */}
                        <StatusBadge status={ticket.status} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current_page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  ← Prev
                </button>
                <span className="text-xs text-gray-500">Page {current_page} of {total_pages}</span>
                <button onClick={() => setPage((p) => Math.min(total_pages, p + 1))} disabled={current_page === total_pages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          orders={orders}
        />
      )}
    </AccountLayout>
  );
};

export default MyTickets;
