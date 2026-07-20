import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "../../utils/toast";
import {
  MdCardGiftcard, MdSearch, MdCheck, MdClose, MdRefresh,
  MdOutbox, MdAdd, MdVisibility, MdCheckCircle, MdCancel,
  MdPending, MdFilterList,
} from "react-icons/md";
import { FaGift } from "react-icons/fa";
import {
  fetchAdminGiftCards, fetchAdminGiftCardStats, fetchAdminGiftCardById,
  reviewGiftCard, approveGiftCard, rejectGiftCard, issueGiftCard, cancelGiftCard,
  clearDetail, resetActionStatus,
} from "../../features/giftcards/adminGiftCardSlice";
import { formatDate, formatCurrency } from "../../utils/Methods";

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CFG = {
  pending_review:    { label: "Pending Review",    color: "bg-amber-100 text-amber-800 border-amber-200" },
  pending_approval:  { label: "Pending Approval",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  active:            { label: "Active",            color: "bg-green-100 text-green-800 border-green-200" },
  redeemed:          { label: "Redeemed",          color: "bg-purple-100 text-purple-800 border-purple-200" },
  partially_redeemed:{ label: "Partial",           color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  rejected:          { label: "Rejected",          color: "bg-red-100 text-red-800 border-red-200" },
  expired:           { label: "Expired",           color: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled:         { label: "Cancelled",         color: "bg-red-100 text-red-700 border-red-200" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ── Issue Modal ───────────────────────────────────────────────────────────────
const IssueModal = ({ onClose, onIssue, loading }) => {
  const [form, setForm] = useState({
    amount: 500, recipient_email: "", recipient_name: "",
    sender_name: "ShopEase Team", occasion: "general",
    design: "festive", message: "", note: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.recipient_email || !form.recipient_name) { toast.error("Recipient details required"); return; }
    if (form.amount < 100) { toast.error("Minimum amount ₹100"); return; }
    onIssue(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaGift className="text-primary-600" /> Issue Gift Card
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
            <MdClose size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount (₹) *</label>
              <input type="number" min={100} max={50000} value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Sender Name</label>
              <input value={form.sender_name} onChange={(e) => set("sender_name", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Recipient Name *</label>
            <input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)}
              placeholder="Customer full name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Recipient Email *</label>
            <input type="email" value={form.recipient_email} onChange={(e) => set("recipient_email", e.target.value)}
              placeholder="customer@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Occasion</label>
            <select value={form.occasion} onChange={(e) => set("occasion", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500">
              {["general","birthday","anniversary","diwali","new_year","thank_you","loyalty_reward"].map((o) => (
                <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Personal Message</label>
            <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
              rows={2} placeholder="Optional message to recipient..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Internal Note</label>
            <input value={form.note} onChange={(e) => set("note", e.target.value)}
              placeholder="Reason for issuing (internal)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Issue Gift Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Action Modal (Review / Approve / Reject / Cancel) ─────────────────────────
const ActionModal = ({ action, card, onClose, onConfirm, loading }) => {
  const [note, setNote] = useState("");
  const configs = {
    review:  { title: "Mark as Reviewed",   color: "bg-blue-600",  label: "Submit Review",  noteLabel: "Review note" },
    approve: { title: "Approve Gift Card",   color: "bg-green-600", label: "Approve",        noteLabel: "Approval note (optional)" },
    reject:  { title: "Reject Gift Card",    color: "bg-red-600",   label: "Reject",         noteLabel: "Rejection reason *" },
    cancel:  { title: "Cancel Gift Card",    color: "bg-red-600",   label: "Cancel Card",    noteLabel: "Reason (optional)" },
  };
  const cfg = configs[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">{cfg.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Gift card <span className="font-mono font-bold text-gray-700">{card?.code}</span> · ₹{card?.amount?.toLocaleString()}
          {" for "}<span className="font-semibold">{card?.recipient_name}</span>
        </p>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">{cfg.noteLabel}</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Enter a note..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(note)} disabled={loading || (action === "reject" && !note.trim())}
            className={`flex-1 ${cfg.color} hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2`}>
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {cfg.label}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ card, onClose }) => (
  <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
    <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
        <h2 className="text-base font-bold text-gray-900">Gift Card Detail</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl">
          <MdClose size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        {/* Card visual */}
        <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-6 text-white text-center">
          <p className="text-xs text-white/70 uppercase tracking-widest mb-2">ShopEase Gift Card</p>
          <p className="text-3xl font-extrabold">₹{card.amount?.toLocaleString()}</p>
          <p className="text-white/70 text-sm mt-1 font-mono tracking-widest">{card.code}</p>
          <p className="text-white/60 text-xs mt-1">Balance: ₹{card.balance?.toLocaleString()}</p>
        </div>

        {/* Details */}
        {[
          ["Status",       <StatusBadge status={card.status} />],
          ["Recipient",    `${card.recipient_name} (${card.recipient_email})`],
          ["Purchased By", card.purchased_by ? `${card.purchased_by.name} (${card.purchased_by.email})` : "Admin Issued"],
          ["Occasion",     card.occasion],
          ["Design",       card.design],
          ["Created",      formatDate(card.createdAt)],
          ["Expires",      formatDate(card.expiry_date)],
          ["Payment",      card.payment_status],
          ["Fraud Flag",   card.review_note || "None"],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-800 font-semibold text-right max-w-[60%]">{val}</span>
          </div>
        ))}

        {card.message && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-700 italic">"{card.message}"</p>
          </div>
        )}

        {/* Review/Approval trail */}
        {(card.reviewed_by || card.approved_by) && (
          <div className="bg-blue-50 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Approval Trail</p>
            {card.reviewed_by && (
              <p className="text-xs text-blue-600">
                Reviewed by <strong>{card.reviewed_by.name}</strong> on {formatDate(card.reviewed_at)}
                {card.review_note && ` — "${card.review_note}"`}
              </p>
            )}
            {card.approved_by && (
              <p className="text-xs text-blue-600">
                Decided by <strong>{card.approved_by.name}</strong> on {formatDate(card.approved_at)}
                {card.approval_note && ` — "${card.approval_note}"`}
              </p>
            )}
          </div>
        )}

        {/* Redemptions */}
        {card.redemptions?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Redemption History</p>
            {card.redemptions.map((r, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50">
                <span>{formatDate(r.redeemed_at)}</span>
                <span className="font-semibold text-red-500">−₹{r.amount_used?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminGiftCards = () => {
  const dispatch = useDispatch();
  const { cards, total, totalPages, status, stats, actionStatus, error } =
    useSelector((s) => s.adminGiftCard);
  const { role_slug } = useSelector((s) => s.auth);
  const isAdmin = ["admin", "super_admin"].includes(role_slug);

  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showIssue,  setShowIssue]  = useState(false);
  const [modal,      setModal]      = useState(null); // { action, card }
  const [detailCard, setDetailCard] = useState(null);

  const load = () => dispatch(fetchAdminGiftCards({ page, per_page: 15, status: filterStatus, search }));

  useEffect(() => { dispatch(fetchAdminGiftCardStats()); }, [dispatch]);
  useEffect(() => { load(); }, [page, filterStatus, search]);

  const handleAction = async (action, card) => setModal({ action, card });

  const handleConfirm = async (note) => {
    const { action, card } = modal;
    let res;
    if      (action === "review")  res = await dispatch(reviewGiftCard ({ id: card._id, note }));
    else if (action === "approve") res = await dispatch(approveGiftCard({ id: card._id, note }));
    else if (action === "reject")  res = await dispatch(rejectGiftCard ({ id: card._id, note }));
    else if (action === "cancel")  res = await dispatch(cancelGiftCard (card._id));

    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success(`Gift card ${action}d successfully`);
      setModal(null);
      load();
    } else {
      toast.error(res?.payload?.message || `Failed to ${action}`);
    }
  };

  const handleIssue = async (data) => {
    const res = await dispatch(issueGiftCard(data));
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Gift card issued successfully!");
      setShowIssue(false);
      load();
    } else {
      toast.error(res?.payload?.message || "Failed to issue gift card");
    }
  };

  const FILTERS = ["", "pending_review", "pending_approval", "active", "redeemed", "rejected", "cancelled"];
  const FILTER_LABELS = { "": "All", pending_review: "Pending Review", pending_approval: "Pending Approval",
    active: "Active", redeemed: "Redeemed", rejected: "Rejected", cancelled: "Cancelled" };

  // Stats summary
  const pendingCount = (stats?.by_status || [])
    .filter((s) => ["pending_review", "pending_approval"].includes(s._id))
    .reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <MdCardGiftcard size={22} className="text-primary-600" /> Gift Card Management
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage customer gift card requests, approvals, and direct issuance
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowIssue(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <MdAdd size={18} /> Issue Gift Card
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Issued",   value: `₹${(stats.total_issued || 0).toLocaleString()}`,   color: "from-blue-500 to-indigo-600" },
            { label: "Total Redeemed", value: `₹${(stats.total_redeemed || 0).toLocaleString()}`, color: "from-green-500 to-emerald-600" },
            { label: "Pending Action", value: pendingCount,                                        color: "from-amber-500 to-orange-500" },
            { label: "Total Cards",    value: total,                                               color: "from-purple-500 to-pink-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white`}>
              <p className="text-xs text-white/70 font-medium">{label}</p>
              <p className="text-2xl font-extrabold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by code, name, email…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilterStatus(f); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === f ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16">
            <MdCardGiftcard size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No gift cards found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {["Code", "Recipient", "Amount", "Balance", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary-700">{card.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-xs">{card.recipient_name}</p>
                      <p className="text-gray-400 text-[10px]">{card.recipient_email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">₹{card.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">₹{card.balance?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={card.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(card.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* View */}
                        <button onClick={() => setDetailCard(card)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="View detail">
                          <MdVisibility size={14} className="text-gray-600" />
                        </button>
                        {/* Employee: Review */}
                        {card.status === "pending_review" && (
                          <button onClick={() => handleAction("review", card)}
                            className="flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-lg transition-colors"
                            title="Review">
                            <MdOutbox size={12} /> Review
                          </button>
                        )}
                        {/* Admin: Approve */}
                        {isAdmin && ["pending_review", "pending_approval"].includes(card.status) && (
                          <button onClick={() => handleAction("approve", card)}
                            className="flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-lg transition-colors">
                            <MdCheck size={12} /> Approve
                          </button>
                        )}
                        {/* Admin: Reject */}
                        {isAdmin && ["pending_review", "pending_approval"].includes(card.status) && (
                          <button onClick={() => handleAction("reject", card)}
                            className="flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-lg transition-colors">
                            <MdClose size={12} /> Reject
                          </button>
                        )}
                        {/* Admin: Cancel active */}
                        {isAdmin && ["active", "partially_redeemed"].includes(card.status) && (
                          <button onClick={() => handleAction("cancel", card)}
                            className="flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors">
                            <MdCancel size={12} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {cards.length} of {total} gift cards
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showIssue && (
        <IssueModal
          onClose={() => setShowIssue(false)}
          onIssue={handleIssue}
          loading={actionStatus === "loading"}
        />
      )}
      {modal && (
        <ActionModal
          action={modal.action}
          card={modal.card}
          onClose={() => setModal(null)}
          onConfirm={handleConfirm}
          loading={actionStatus === "loading"}
        />
      )}
      {detailCard && <DetailPanel card={detailCard} onClose={() => setDetailCard(null)} />}
    </div>
  );
};

export default AdminGiftCards;
