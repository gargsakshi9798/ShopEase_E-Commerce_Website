import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTickets, fetchTicketStats, fetchTicketById,
  updateTicketStatus, updateTicketPriority,
  assignTicket, replyToTicket, deleteTicket,
  clearSelectedTicket, clearPermissionError,
} from "../../features/support/supportSlice";
import { fetchEmployees } from "../../features/users/employeeSlice";
import DataTable    from "../../components/common/DataTable";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import { formatDateTime } from "../../utils/Methods";
import {
  MdSearch, MdRefresh, MdClose, MdReply, MdFilterList,
  MdBuild, MdPerson, MdCheckCircle, MdAssignment,
  MdHourglassEmpty, MdCancel, MdSend, MdDelete,
} from "react-icons/md";

const STATUS_CONFIG = {
  open:             { label: "Open",             color: "bg-blue-100 text-blue-700" },
  in_progress:      { label: "In Progress",      color: "bg-orange-100 text-orange-700" },
  waiting_customer: { label: "Waiting Customer", color: "bg-yellow-100 text-yellow-700" },
  resolved:         { label: "Resolved",         color: "bg-green-100 text-green-700" },
  closed:           { label: "Closed",           color: "bg-gray-100 text-gray-600" },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const CATEGORY_LABELS = {
  order: "Order", payment: "Payment", product: "Product",
  shipping: "Shipping", return: "Return", account: "Account",
  technical: "Technical", other: "Other",
};

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { tickets, ticketStats, selectedTicket, status, mutating, permissionError } = useSelector((s) => s.support);
  const { list: employees } = useSelector((s) => s.employee);
  const { role_slug, data: authData } = useSelector((s) => s.auth);
  const isEmployee   = role_slug === "employee";
  const isSuperAdmin = role_slug === "super_admin";
  const canDelete    = isSuperAdmin;                    // only superadmin deletes
  const canAssign    = !isEmployee;                     // admin + superadmin
  const canPriority  = !isEmployee;                     // admin + superadmin
  const canClose     = !isEmployee;                     // employee cannot close a ticket
  const loading = status === "loading";

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage]             = useState(1);
  const [viewTicket, setViewTicket] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [replyText, setReplyText]   = useState("");
  const [assignEmpId, setAssignEmpId] = useState("");
  const [newStatus, setNewStatus]   = useState("");
  const [newPriority, setNewPriority] = useState("");

  // ── Show permission errors as toasts ────────────────────────────────────
  useEffect(() => {
    if (permissionError) {
      toast.error(`🚫 ${permissionError}`, { duration: 4000, id: "permission-error" });
      dispatch(clearPermissionError());
    }
  }, [permissionError, dispatch]);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)         params.search   = search;
    if (statusFilter)   params.status   = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    dispatch(fetchTickets(params));
  };

  useEffect(() => {
    dispatch(fetchTicketStats());
    // Employees don't have access to the employees list endpoint — skip fetch
    if (!isEmployee) dispatch(fetchEmployees({ per_page: 100 }));
  }, [dispatch]);
  useEffect(() => { load(page); }, [page, statusFilter, priorityFilter]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(1); }, 350); return () => clearTimeout(t); }, [search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const getCount = (key) => ticketStats.byStatus?.find((s) => s._id === key)?.count || 0;
  const totalTickets = ticketStats.byStatus?.reduce((s, v) => s + v.count, 0) || 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openDetail = async (ticket) => {
    setViewTicket(ticket);
    setReplyText("");
    setAssignEmpId(ticket.assigned_to?._id || "");
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    await dispatch(fetchTicketById(ticket._id));
  };

  const closeDetail = () => { setViewTicket(null); dispatch(clearSelectedTicket()); };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const t = viewTicket?._id || selectedTicket?._id;
    try {
      const res = await dispatch(replyToTicket({ id: t, message: replyText })).unwrap();
      if (res?.success) { toast.success("Reply sent!"); setReplyText(""); dispatch(fetchTicketById(t)); load(page); }
    } catch (err) { toast.error(err?.message || "Reply failed"); }
  };

  const handleStatusUpdate = async () => {
    const t = viewTicket?._id || selectedTicket?._id;
    try {
      const res = await dispatch(updateTicketStatus({ id: t, status: newStatus })).unwrap();
      if (res?.success) { toast.success("Status updated!"); dispatch(fetchTicketById(t)); load(page); dispatch(fetchTicketStats()); }
    } catch { toast.error("Update failed"); }
  };

  const handlePriorityUpdate = async () => {
    const t = viewTicket?._id || selectedTicket?._id;
    try {
      const res = await dispatch(updateTicketPriority({ id: t, priority: newPriority })).unwrap();
      if (res?.success) { toast.success("Priority updated!"); dispatch(fetchTicketById(t)); load(page); }
    } catch { toast.error("Update failed"); }
  };

  const handleAssign = async () => {
    if (!assignEmpId) return;
    const t = viewTicket?._id || selectedTicket?._id;
    try {
      const res = await dispatch(assignTicket({ id: t, employee_id: assignEmpId })).unwrap();
      if (res?.success) { toast.success("Ticket assigned!"); dispatch(fetchTicketById(t)); load(page); }
    } catch { toast.error("Assignment failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteTicket(deleteId)).unwrap();
      if (res?.success) { toast.success("Ticket deleted"); setDeleteId(null); load(page); }
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "ticket_number", label: "Ticket",
      render: (v, row) => (
        <div>
          <p className="font-mono text-sm font-bold text-primary-600">{v}</p>
          <p className="text-xs text-gray-400 truncate max-w-[160px]">{row.subject}</p>
        </div>
      ),
    },
    {
      key: "user_id", label: "Customer",
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{v?.name || row.guest_name || "Guest"}</p>
          <p className="text-xs text-gray-400">{v?.email || row.guest_email || ""}</p>
        </div>
      ),
    },
    {
      key: "category", label: "Category",
      render: (v) => <span className="badge bg-gray-100 text-gray-600 capitalize">{CATEGORY_LABELS[v] || v}</span>,
    },
    {
      key: "priority", label: "Priority",
      render: (v) => {
        const cfg = PRIORITY_CONFIG[v] || PRIORITY_CONFIG.medium;
        return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: "status", label: "Status",
      render: (v) => {
        const cfg = STATUS_CONFIG[v] || STATUS_CONFIG.open;
        return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: "replies", label: "Replies",
      render: (v) => <span className="text-sm text-gray-600">{v?.length || 0}</span>,
    },
    {
      key: "createdAt", label: "Created",
      render: (v) => <span className="text-xs text-gray-400">{formatDateTime(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openDetail(row)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg">
            <MdAssignment size={13} /> View
          </button>
          {canDelete && (
            <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete ticket">
              <MdDelete size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const detail = selectedTicket || viewTicket;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEmployee ? "My Assigned Tickets" : "Support Tickets"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEmployee
              ? "Tickets assigned to you — reply and update status"
              : "Manage all customer support tickets and conversations"}
          </p>
        </div>
        <button onClick={() => { dispatch(fetchTicketStats()); load(page); }} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
          <MdRefresh size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",    value: totalTickets,        color: "bg-primary-50 text-primary-600", icon: MdBuild },
          { label: "Open",     value: getCount("open"),    color: "bg-blue-50 text-blue-600",       icon: MdAssignment },
          { label: "In Progress",value: getCount("in_progress"), color: "bg-orange-50 text-orange-600", icon: MdHourglassEmpty },
          { label: "Resolved", value: getCount("resolved"),color: "bg-green-50 text-green-600",    icon: MdCheckCircle },
          { label: "Closed",   value: getCount("closed"),  color: "bg-gray-50 text-gray-500",      icon: MdCancel },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-card flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setStatusFilter(s.label === "Total" ? "" : s.label.toLowerCase().replace(" ", "_")); setPage(1); }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}><s.icon size={18} /></div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[11px] text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ticket # or subject..." className="input-field pl-9 w-60 text-sm py-2" />
          </div>
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-40">
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-32">
              <option value="">All Priority</option>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || statusFilter || priorityFilter) && (
              <button onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setPage(1); }} className="text-xs text-primary-600 hover:underline">Clear</button>
            )}
          </div>
          <div className="ml-auto text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{tickets.total}</span></div>
        </div>
        <DataTable columns={columns} data={tickets.list} loading={loading}
          currentPage={tickets.current_page} totalPages={tickets.total_pages} total={tickets.total} perPage={10}
          onPageChange={(p) => setPage(p)} />
      </div>

      {/* ── Detail Drawer ────────────────────────────────────────────────── */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeDetail} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{detail?.ticket_number}</h3>
                <p className="text-xs text-gray-400 truncate max-w-[280px]">{detail?.subject}</p>
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><MdClose size={20} /></button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Status + Priority row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${STATUS_CONFIG[detail?.status]?.color || "bg-gray-100"}`}>{STATUS_CONFIG[detail?.status]?.label}</span>
                <span className={`badge ${PRIORITY_CONFIG[detail?.priority]?.color || "bg-gray-100"}`}>{PRIORITY_CONFIG[detail?.priority]?.label} Priority</span>
                <span className="badge bg-gray-100 text-gray-600 capitalize">{CATEGORY_LABELS[detail?.category] || detail?.category}</span>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</p>
                <p className="text-sm font-semibold text-gray-800">{detail?.user_id?.name || detail?.guest_name || "Guest"}</p>
                <p className="text-xs text-gray-500">{detail?.user_id?.email || detail?.guest_email}</p>
                {(detail?.user_id?.contact_no || detail?.guest_phone) && (
                  <p className="text-xs text-gray-500">{detail?.user_id?.contact_no || detail?.guest_phone}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issue Description</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail?.description}</p>
                </div>
              </div>

              {/* Conversation Thread */}
              {detail?.replies?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Conversation ({detail.replies.length})</p>
                  <div className="space-y-3">
                    {detail.replies.map((r, i) => (
                      <div key={i} className={`flex gap-2.5 ${r.sender_type === "admin" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          r.sender_type === "admin" ? "bg-primary-100 text-primary-700" : "bg-green-100 text-green-700"
                        }`}>{r.sender_name?.[0]?.toUpperCase() || (r.sender_type === "admin" ? "A" : "C")}</div>
                        <div className={`flex-1 max-w-[80%] ${r.sender_type === "admin" ? "items-end" : ""} flex flex-col`}>
                          <div className={`rounded-2xl px-4 py-3 text-sm ${
                            r.sender_type === "admin"
                              ? "bg-primary-600 text-white rounded-tr-sm"
                              : "bg-gray-100 text-gray-800 rounded-tl-sm"
                          }`}>
                            <p className="leading-relaxed">{r.message}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 px-1">{r.sender_name} · {formatDateTime(r.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Controls */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Manage Ticket</p>

                {/* Employee restriction notice */}
                {isEmployee && (() => {
                  const assignedId = detail?.assigned_to?._id || detail?.assigned_to;
                  const isAssignedToMe = assignedId && String(assignedId) === String(authData?._id || "");
                  return isAssignedToMe ? (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                      <MdPerson size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        This ticket is <span className="font-bold">assigned to you</span>. You can update status and reply. Closing, resolving, priority, and assigning are admin-only.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                      <MdPerson size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        This ticket is <span className="font-bold">not assigned to you</span>. You can view it but cannot reply or update status. Ask admin to assign it to you.
                      </p>
                    </div>
                  );
                })()}

                {/* Status — all roles can update status on their ticket */}
                {/* For employee: only if ticket is assigned to them */}
                {(() => {
                  const assignedId = detail?.assigned_to?._id || detail?.assigned_to;
                  const isAssignedToMe = !isEmployee || (assignedId && String(assignedId) === String(authData?._id || ""));
                  return (
                    <>
                <div className={`grid gap-3 ${canPriority ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                      disabled={!isAssignedToMe}
                      className="input-field text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {Object.entries(STATUS_CONFIG)
                        .filter(([k]) => isEmployee ? !["closed", "resolved"].includes(k) : true)
                        .map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  {canPriority && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Priority</label>
                      <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="input-field text-sm">
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleStatusUpdate}
                    disabled={mutating || !isAssignedToMe || (isEmployee && ["closed","resolved"].includes(newStatus))}
                    className="flex-1 btn-secondary text-xs py-1.5 disabled:opacity-50">Update Status</button>
                  {canPriority && (
                    <button onClick={handlePriorityUpdate} disabled={mutating} className="flex-1 btn-secondary text-xs py-1.5 disabled:opacity-50">Update Priority</button>
                  )}
                </div>
                    </>
                  );
                })()}

                {/* Assign — Admin/SuperAdmin only */}
                {canAssign && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Assign to Employee</label>
                    <div className="flex gap-2">
                      <select value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)} className="input-field text-sm flex-1">
                        <option value="">Select employee</option>
                        {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
                      </select>
                      <button onClick={handleAssign} disabled={!assignEmpId || mutating} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">Assign</button>
                    </div>
                  </div>
                )}

                {/* Employee info — show who is assigned */}
                {isEmployee && detail?.assigned_to && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <MdPerson size={15} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Assigned to: <span className="font-bold">{detail.assigned_to?.name || "You"}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Box */}
            <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reply to Customer</p>
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  rows={3}
                  placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                  className="input-field flex-1 resize-none text-sm"
                />
                <button onClick={handleReply} disabled={!replyText.trim() || mutating}
                  className="self-end btn-primary px-4 py-2.5 disabled:opacity-50">
                  {mutating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdSend size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Ticket" message="This will permanently delete the ticket and all its replies. Only super admin can perform this action." />
    </div>
  );
};

export default SupportTickets;
