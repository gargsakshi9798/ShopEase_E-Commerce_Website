import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdDeleteForever, MdSearch, MdRefresh, MdFilterList,
  MdClose, MdCheck, MdWarning, MdInfo,
  MdHourglassEmpty, MdCheckCircle, MdCancel, MdPerson,
  MdEmail, MdPhone, MdForward, MdHistory, MdShoppingBag,
  MdSend, MdBlock,
} from "react-icons/md";
import DataTable    from "../../components/common/DataTable";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import { formatDate, formatDateTime } from "../../utils/Methods";
import {
  fetchDeletionRequests, fetchDeletionStats, fetchDeletionRequestById,
  reviewDeletionRequest, decideDeletionRequest, forceDeleteAccount,
  clearSelected,
} from "../../features/users/accountDeletionSlice";

const STATUS = {
  pending:  { label: "Pending",       cls: "bg-amber-100 text-amber-700",  icon: MdHourglassEmpty },
  reviewed: { label: "Forwarded",     cls: "bg-blue-100  text-blue-700",   icon: MdForward },
  approved: { label: "Approved",      cls: "bg-green-100 text-green-700",  icon: MdCheckCircle },
  rejected: { label: "Rejected",      cls: "bg-red-100   text-red-700",    icon: MdCancel },
  deleted:  { label: "Hard Deleted",  cls: "bg-gray-100  text-gray-500",   icon: MdDeleteForever },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${s.cls}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, bg, color, active, onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:shadow-md transition-all
      ${active ? "ring-2 ring-primary-400" : ""}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900">{value ?? 0}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const Chk = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const AccountDeletionRequests = () => {
  const dispatch = useDispatch();
  const { list, total, current_page, total_pages, listStatus, stats, statsStatus,
          selected, customerSummary, selectedStatus, mutating } =
    useSelector((s) => s.accountDeletion);
  const { role_slug } = useSelector((s) => s.auth);

  const isSuperAdmin = role_slug === "super_admin";
  const isEmployee   = role_slug === "employee";
  const canDecide    = !isEmployee;               // admin + superadmin approve/reject
  const canForce     = isSuperAdmin;              // superadmin force-delete only

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [page,          setPage]          = useState(1);
  const [viewId,        setViewId]        = useState(null);
  const [forceId,       setForceId]       = useState(null);
  const [forcing,       setForcing]       = useState(false);

  // Employee review form
  const [empNotes,      setEmpNotes]      = useState("");
  const [empChecks,     setEmpChecks]     = useState({
    no_pending_orders: false, no_pending_payment: false,
    no_open_tickets: false,   no_active_disputes: false,
  });
  const [empAction,     setEmpAction]     = useState("forward"); // "forward" | "reject"
  const [empRejectReason, setEmpRejectReason] = useState("");

  // Admin decision form
  const [adminNotes,    setAdminNotes]    = useState("");
  const [adminAction,   setAdminAction]   = useState("approve"); // "approve" | "reject"
  const [adminRejectReason, setAdminRejectReason] = useState("");
  const [forceNotes,    setForceNotes]    = useState("");

  const loading = listStatus === "loading";

  const load = (p = page) => {
    const params = { page: p, per_page: 12 };
    if (search)       params.search = search;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchDeletionRequests(params));
  };

  useEffect(() => { dispatch(fetchDeletionStats()); }, [dispatch]);
  useEffect(() => { load(page); }, [page, statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const openDetail = async (id) => {
    setViewId(id);
    setEmpNotes(""); setEmpRejectReason(""); setAdminNotes(""); setAdminRejectReason(""); setForceNotes("");
    setEmpAction("forward"); setAdminAction("approve");
    setEmpChecks({ no_pending_orders: false, no_pending_payment: false, no_open_tickets: false, no_active_disputes: false });
    await dispatch(fetchDeletionRequestById(id));
  };

  const closeDetail = () => { setViewId(null); dispatch(clearSelected()); };

  const handleReview = async () => {
    if (empAction === "reject" && !empRejectReason.trim()) {
      toast.error("Rejection reason is required"); return;
    }
    try {
      const res = await dispatch(reviewDeletionRequest({
        id: viewId,
        data: { action: empAction, employee_notes: empNotes,
                employee_checks: empChecks, rejection_reason: empRejectReason },
      })).unwrap();
      if (res?.success) {
        toast.success(empAction === "forward" ? "Request forwarded to admin" : "Request rejected");
        dispatch(fetchDeletionStats()); load(page); closeDetail();
      }
    } catch (e) { toast.error(e?.message || "Action failed"); }
  };

  const handleDecide = async () => {
    if (adminAction === "reject" && !adminRejectReason.trim()) {
      toast.error("Rejection reason is required"); return;
    }
    try {
      const res = await dispatch(decideDeletionRequest({
        id: viewId,
        data: { action: adminAction, admin_notes: adminNotes, rejection_reason: adminRejectReason },
      })).unwrap();
      if (res?.success) {
        toast.success(adminAction === "approve" ? "Account deletion approved — account deactivated" : "Request rejected");
        dispatch(fetchDeletionStats()); load(page); closeDetail();
      }
    } catch (e) { toast.error(e?.message || "Action failed"); }
  };

  const handleForceDelete = async () => {
    setForcing(true);
    try {
      const res = await dispatch(forceDeleteAccount({ id: forceId, data: { admin_notes: forceNotes } })).unwrap();
      if (res?.success) {
        toast.success("Account permanently deleted");
        setForceId(null); dispatch(fetchDeletionStats()); load(page);
        if (viewId === forceId) closeDetail();
      }
    } catch (e) { toast.error(e?.message || "Force delete failed"); }
    finally { setForcing(false); }
  };

  const columns = [
    {
      key: "customer_name", label: "Customer",
      render: (v, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800">{v || row.customer_id?.name || "—"}</p>
          <p className="text-xs text-gray-400">{row.customer_email || row.customer_id?.email}</p>
        </div>
      ),
    },
    {
      key: "reason", label: "Reason",
      render: (v) => <p className="text-xs text-gray-600 max-w-[180px] truncate">{v}</p>,
    },
    {
      key: "status", label: "Status",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: "reviewed_by", label: "Reviewed By",
      render: (v) => <p className="text-xs text-gray-500">{v?.name || "—"}</p>,
    },
    {
      key: "decided_by", label: "Decided By",
      render: (v) => <p className="text-xs text-gray-500">{v?.name || "—"}</p>,
    },
    {
      key: "createdAt", label: "Submitted",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openDetail(row._id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <MdInfo size={13} /> View
          </button>
          {canForce && !["deleted","rejected"].includes(row.status) && (
            <button onClick={() => setForceId(row._id)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Force delete account">
              <MdDeleteForever size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const req = selected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdDeleteForever size={24} className="text-red-500" /> Account Deletion Requests
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEmployee ? "Review requests and forward to admin after verification"
              : isSuperAdmin ? "Full control — approve, reject or force-delete accounts"
              : "Approve or reject forwarded deletion requests"}
          </p>
        </div>
        <button onClick={() => { dispatch(fetchDeletionStats()); load(page); }}
          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: "",         label: "Total",    value: stats.total,    bg: "bg-gray-50",   color: "text-gray-500",   icon: MdHistory },
          { key: "pending",  label: "Pending",  value: stats.pending,  bg: "bg-amber-50",  color: "text-amber-600",  icon: MdHourglassEmpty },
          { key: "reviewed", label: "Forwarded",value: stats.reviewed, bg: "bg-blue-50",   color: "text-blue-600",   icon: MdForward },
          { key: "approved", label: "Approved", value: stats.approved, bg: "bg-green-50",  color: "text-green-600",  icon: MdCheckCircle },
          { key: "rejected", label: "Rejected", value: stats.rejected, bg: "bg-red-50",    color: "text-red-600",    icon: MdCancel },
        ].map((s) => (
          <StatCard key={s.key} label={s.label} value={s.value} icon={s.icon}
            bg={s.bg} color={s.color} active={statusFilter === s.key}
            onClick={() => { setStatusFilter(s.key); setPage(1); }} />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or reason…"
              className="input-field pl-9 w-64 text-sm py-2" />
          </div>
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-40">
              <option value="">All Status</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || statusFilter) && (
              <button onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
                className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">
            Total: <span className="font-semibold text-gray-700">{total}</span>
          </div>
        </div>
        <DataTable columns={columns} data={list} loading={loading}
          currentPage={current_page} totalPages={total_pages} total={total} perPage={12}
          onPageChange={(p) => setPage(p)} />
      </div>

      {/* ── Detail Drawer ── */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetail} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <MdDeleteForever size={20} className="text-red-500" />
                <h3 className="text-base font-bold text-gray-800">Deletion Request</h3>
                {req && <StatusBadge status={req.status} />}
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>

            {selectedStatus === "loading" ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : req ? (
              <div className="flex-1 px-6 py-5 space-y-5">

                {/* Employee scope notice */}
                {isEmployee && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <MdPerson size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      As an employee you can <span className="font-bold">review and forward</span> pending requests to admin.{" "}
                      <span className="font-bold">Approving, rejecting final decisions, and force-deleting</span> are restricted to admin.
                    </p>
                  </div>
                )}

                {/* Customer info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700 flex-shrink-0">
                      {(req.customer_name || req.customer_id?.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{req.customer_name || req.customer_id?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MdEmail size={11} /> {req.customer_email || req.customer_id?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Customer activity summary */}
                {customerSummary && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Total Orders",   value: customerSummary.total_orders,    color: customerSummary.total_orders > 0 ? "text-blue-600" : "text-gray-500" },
                      { label: "Pending Orders", value: customerSummary.pending_orders,  color: customerSummary.pending_orders > 0 ? "text-red-600 font-bold" : "text-green-600" },
                      { label: "Unpaid",         value: customerSummary.unpaid_payments, color: customerSummary.unpaid_payments > 0 ? "text-red-600 font-bold" : "text-green-600" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Request details */}
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Reason</p>
                    <p className="text-sm text-gray-800 font-medium">{req.reason}</p>
                    {req.additional_info && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{req.additional_info}"</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    Submitted: {formatDateTime(req.createdAt)}
                  </p>
                </div>

                {/* Pending orders / dues warning */}
                {customerSummary && (customerSummary.pending_orders > 0 || customerSummary.unpaid_payments > 0) && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                    <MdWarning size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">⚠️ Pending Issues Found</p>
                      <ul className="text-xs text-red-600 mt-1 space-y-0.5">
                        {customerSummary.pending_orders > 0 && <li>• {customerSummary.pending_orders} pending/active order(s)</li>}
                        {customerSummary.unpaid_payments > 0 && <li>• {customerSummary.unpaid_payments} unpaid payment(s)</li>}
                      </ul>
                      <p className="text-xs text-red-500 mt-1">Resolve these before approving deletion.</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {req.timeline?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <MdHistory size={12} /> Timeline
                    </p>
                    <div className="space-y-2">
                      {req.timeline.map((t, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-700 capitalize">{t.action?.replace("_", " ")} by {t.actor_name} <span className="text-gray-400 font-normal">({t.actor_role})</span></p>
                            {t.note && <p className="text-[11px] text-gray-400 italic">"{t.note}"</p>}
                            <p className="text-[10px] text-gray-400">{formatDateTime(t.at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── EMPLOYEE: Review form (status=pending only) ── */}
                {isEmployee && req.status === "pending" && (
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MdCheck size={16} className="text-blue-500" /> Employee Review
                    </p>
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification Checklist</p>
                      <Chk checked={empChecks.no_pending_orders}  onChange={(v) => setEmpChecks(p => ({...p, no_pending_orders: v}))}  label="No pending or active orders" />
                      <Chk checked={empChecks.no_pending_payment} onChange={(v) => setEmpChecks(p => ({...p, no_pending_payment: v}))} label="No unpaid dues or payments" />
                      <Chk checked={empChecks.no_open_tickets}    onChange={(v) => setEmpChecks(p => ({...p, no_open_tickets: v}))}    label="No open support tickets" />
                      <Chk checked={empChecks.no_active_disputes} onChange={(v) => setEmpChecks(p => ({...p, no_active_disputes: v}))} label="No active disputes or returns" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Notes for Admin</label>
                      <textarea value={empNotes} onChange={(e) => setEmpNotes(e.target.value)}
                        placeholder="Summary of your review…" rows={3}
                        className="input-field text-sm resize-none w-full" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEmpAction("forward")}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${empAction === "forward" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                        <MdForward size={14} className="inline mr-1" /> Forward to Admin
                      </button>
                      <button onClick={() => setEmpAction("reject")}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${empAction === "reject" ? "bg-red-600 text-white border-red-600" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                        <MdCancel size={14} className="inline mr-1" /> Reject
                      </button>
                    </div>
                    {empAction === "reject" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                        <textarea value={empRejectReason} onChange={(e) => setEmpRejectReason(e.target.value)}
                          placeholder="Reason for rejection…" rows={2}
                          className="input-field text-sm resize-none w-full" />
                      </div>
                    )}
                    <button onClick={handleReview} disabled={mutating}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                      {mutating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSend size={15} />}
                      {empAction === "forward" ? "Forward to Admin" : "Reject Request"}
                    </button>
                  </div>
                )}

                {/* ── ADMIN/SUPERADMIN: Decision form (status=reviewed, or pending for superadmin) ── */}
                {canDecide && ["reviewed", ...(isSuperAdmin ? ["pending"] : [])].includes(req.status) && (
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MdCheckCircle size={16} className="text-green-500" /> Admin Decision
                    </p>
                    {req.employee_notes && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Employee Notes</p>
                        <p className="text-xs text-gray-700">{req.employee_notes}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(req.employee_checks || {}).map(([k, v]) => (
                            <span key={k} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {v ? "✓" : "✗"} {k.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Admin Notes</label>
                      <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Decision notes…" rows={2}
                        className="input-field text-sm resize-none w-full" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setAdminAction("approve")}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${adminAction === "approve" ? "bg-green-600 text-white border-green-600" : "border-gray-200 text-gray-600 hover:border-green-300"}`}>
                        <MdCheckCircle size={14} className="inline mr-1" /> Approve
                      </button>
                      <button onClick={() => setAdminAction("reject")}
                        className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${adminAction === "reject" ? "bg-red-600 text-white border-red-600" : "border-gray-200 text-gray-600 hover:border-red-300"}`}>
                        <MdBlock size={14} className="inline mr-1" /> Reject
                      </button>
                    </div>
                    {adminAction === "reject" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                        <textarea value={adminRejectReason} onChange={(e) => setAdminRejectReason(e.target.value)}
                          placeholder="Reason for rejection…" rows={2}
                          className="input-field text-sm resize-none w-full" />
                      </div>
                    )}
                    <button onClick={handleDecide} disabled={mutating}
                      className={`w-full py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors
                        ${adminAction === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                      {mutating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSend size={15} />}
                      {adminAction === "approve" ? "Approve & Deactivate Account" : "Reject Request"}
                    </button>
                  </div>
                )}

                {/* ── SUPERADMIN: Force delete (any non-deleted request) ── */}
                {canForce && !["deleted"].includes(req.status) && (
                  <div className="border border-dashed border-red-300 rounded-xl p-4 space-y-3 bg-red-50">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-2">
                      <MdDeleteForever size={14} /> SuperAdmin — Force Hard Delete
                    </p>
                    <p className="text-xs text-red-500">Permanently deletes the user account from the database. Cannot be undone.</p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                      <textarea value={forceNotes} onChange={(e) => setForceNotes(e.target.value)}
                        placeholder="Reason for force deletion…" rows={2}
                        className="input-field text-sm resize-none w-full bg-white" />
                    </div>
                    <button onClick={() => setForceId(viewId)}
                      className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                      <MdDeleteForever size={16} /> Force Delete Account
                    </button>
                  </div>
                )}

                {/* Already resolved */}
                {["approved", "rejected", "deleted"].includes(req.status) && (
                  <div className={`rounded-xl p-4 border ${req.status === "approved" ? "bg-green-50 border-green-200" : req.status === "deleted" ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}>
                    <p className={`text-sm font-bold ${req.status === "approved" ? "text-green-700" : req.status === "deleted" ? "text-gray-700" : "text-red-700"}`}>
                      {req.status === "approved" ? "✅ Approved — Account deactivated"
                        : req.status === "deleted" ? "🗑 Account permanently deleted"
                        : "❌ Request Rejected"}
                    </p>
                    {(req.rejection_reason || req.admin_notes) && (
                      <p className="text-xs text-gray-500 mt-1">{req.rejection_reason || req.admin_notes}</p>
                    )}
                    {req.decided_by?.name && (
                      <p className="text-xs text-gray-400 mt-1">By: {req.decided_by.name} · {formatDateTime(req.decided_at)}</p>
                    )}
                  </div>
                )}

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Force delete confirm */}
      <ConfirmDelete isOpen={!!forceId} onClose={() => setForceId(null)} onConfirm={handleForceDelete}
        loading={forcing} title="Force Delete Account"
        message="This will PERMANENTLY delete the customer account and all their data from the database. This action cannot be undone." />
    </div>
  );
};

export default AccountDeletionRequests;
