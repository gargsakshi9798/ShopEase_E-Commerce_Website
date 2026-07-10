import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleBlockEmployee,
  deleteEmployee,
  clearSelectedEmployee,
} from "../../features/users/employeeSlice";
import DataTable from "../../components/common/DataTable";
import UserFormModal from "../../components/common/UserFormModal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdBlock, MdCheckCircle,
  MdWork, MdPeople, MdClose, MdEmail, MdPhone, MdCalendarToday,
  MdVerifiedUser, MdInfo, MdDownload, MdRefresh,
} from "react-icons/md";
import { formatDate, formatDateTime } from "../../utils/Methods";

// ── CSV export ────────────────────────────────────────────────────────────────
const exportCSV = (data) => {
  if (!data.length) { toast.error("No data to export"); return; }
  const headers = ["Name", "Email", "Phone", "Status", "Last Login", "Joined"];
  const rows = data.map((e) => [
    e.name,
    e.email,
    e.contact_no || "-",
    e.block_status ? "Blocked" : "Active",
    e.last_login ? formatDate(e.last_login) : "Never",
    formatDate(e.createdAt),
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "employees.csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported");
};

const Employees = () => {
  const dispatch = useDispatch();
  const { list, total, current_page, total_pages, status, mutating } =
    useSelector((s) => s.employee);
  const loading = status === "loading";

  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm]   = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [viewUser, setViewUser]   = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)                     params.search = search;
    if (filterStatus === "active")  params.block_status = false;
    if (filterStatus === "blocked") params.block_status = true;
    return params;
  };

  const load = (p = page) => dispatch(fetchEmployees(buildParams(p)));

  useEffect(() => { load(page); }, [page, filterStatus]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditUser(null); setShowForm(true); };
  const openEdit   = (user) => { setEditUser(user); setShowForm(true); };
  const openView  = (user) => { setViewUser(user); dispatch(getEmployeeById(user._id)); };
  const closeView = () => { setViewUser(null); dispatch(clearSelectedEmployee()); };
  const closeForm = () => { setShowForm(false); setEditUser(null); };

  const onSubmit = async (data) => {
    try {
      let res;
      if (editUser) res = await dispatch(updateEmployee({ id: editUser._id, data })).unwrap();
      else          res = await dispatch(createEmployee(data)).unwrap();

      if (res?.success) {
        toast.success(editUser ? "Employee updated!" : "Employee created!");
        closeForm();
        load(1);
      } else {
        const msg = res?.message;
        if (typeof msg === "object") Object.values(msg).forEach((m) => toast.error(m));
        else toast.error(msg || "Something went wrong");
      }
    } catch (err) {
      const msg = err?.message;
      if (typeof msg === "object") Object.values(msg).forEach((m) => toast.error(m));
      else toast.error(msg || "Something went wrong");
    }
  };

  const handleToggleBlock = async (user) => {
    try {
      const res = await dispatch(toggleBlockEmployee(user._id)).unwrap();
      if (res?.success) {
        toast.success(user.block_status ? "Employee unblocked" : "Employee blocked");
        load(page);
        if (viewUser?._id === user._id) closeView();
      }
    } catch (err) { toast.error(err?.message || "Action failed"); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteEmployee(deleteId)).unwrap();
      if (res?.success) {
        toast.success("Employee deleted");
        setDeleteId(null);
        load(page);
      }
    } catch (err) { toast.error(err?.message || "Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "name", label: "Employee",
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
            {row.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "contact_no", label: "Phone", render: (v) => v || <span className="text-gray-300">—</span> },
    {
      key: "role_id", label: "Role",
      render: (v) => <span className="badge bg-blue-100 text-blue-700">{v?.name || "Employee"}</span>,
    },
    {
      key: "block_status", label: "Status",
      render: (v) => (
        <span className={`badge ${v ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {v ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      key: "last_login", label: "Last Login",
      render: (v) => <span className="text-xs text-gray-400">{v ? formatDate(v) : "Never"}</span>,
    },
    {
      key: "createdAt", label: "Joined",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="View">
            <MdInfo size={16} />
          </button>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" title="Edit">
            <MdEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleBlock(row)}
            disabled={mutating}
            className={`p-1.5 rounded-lg disabled:opacity-50 ${row.block_status ? "text-green-600 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50"}`}
            title={row.block_status ? "Unblock" : "Block"}
          >
            {row.block_status ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
          </button>
          <button onClick={() => setDeleteId(row._id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Delete">
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all employees and their access</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(page)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={() => exportCSV(list)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdDownload size={16} /> Export CSV
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: total,  icon: MdWork,        bg: "bg-blue-50",   color: "text-blue-600" },
          { label: "Active",          value: list.filter((e) => !e.block_status).length, icon: MdCheckCircle, bg: "bg-green-50", color: "text-green-600", sub: "this page" },
          { label: "Blocked",         value: list.filter((e) => e.block_status).length,  icon: MdBlock,       bg: "bg-red-50",   color: "text-red-600",   sub: "this page" },
          { label: "Never Logged In", value: list.filter((e) => !e.last_login).length,   icon: MdPeople,      bg: "bg-gray-50",  color: "text-gray-500",  sub: "this page" },
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
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9 w-64 text-sm py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            {(filterStatus !== "all" || search) && (
              <button onClick={() => { setSearch(""); setFilterStatus("all"); setPage(1); }} className="text-xs text-primary-600 hover:underline px-2 py-1">
                Clear
              </button>
            )}
            <p className="text-xs text-gray-400">Total: <span className="font-semibold text-gray-700">{total}</span></p>
          </div>
        </div>
        <DataTable
          columns={columns} data={list} loading={loading}
          currentPage={current_page} totalPages={total_pages} total={total} perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <UserFormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={onSubmit}
        editUser={editUser}
        roleLabel="Employee"
        roleBadge="bg-blue-50 border-blue-200 text-blue-700"
        roleIcon={MdWork}
        isMutating={mutating}
      />

      {/* ── View Drawer ────────────────────────────────────────────────── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeView} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Employee Details</h3>
              <button onClick={closeView} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><MdClose size={20} /></button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl">
                  {viewUser.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewUser.name}</h4>
                  <span className="badge bg-blue-100 text-blue-700 mt-1">Employee</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className={`badge ${viewUser.block_status ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {viewUser.block_status ? "Blocked" : "Active"}
                </span>
                <span className={`badge ${viewUser.is_email_verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewUser.is_email_verified ? "✓ Email Verified" : "Pending"}
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: MdEmail,         label: "Email",      value: viewUser.email },
                  { icon: MdPhone,         label: "Phone",      value: viewUser.contact_no || "Not provided" },
                  { icon: MdCalendarToday, label: "Joined",     value: formatDate(viewUser.createdAt) },
                  { icon: MdCalendarToday, label: "Last Login", value: viewUser.last_login ? formatDateTime(viewUser.last_login) : "Never" },
                  { icon: MdVerifiedUser,  label: "User ID",    value: viewUser._id },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-700 font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button onClick={() => { closeView(); openEdit(viewUser); }} className="flex-1 btn-primary text-sm py-2">
                <MdEdit size={15} className="inline mr-1.5" /> Edit
              </button>
              <button
                onClick={() => handleToggleBlock(viewUser)}
                disabled={mutating}
                className={`flex-1 text-sm py-2 rounded-xl font-medium border transition-colors disabled:opacity-50 ${
                  viewUser.block_status ? "border-green-300 text-green-700 hover:bg-green-50" : "border-orange-300 text-orange-700 hover:bg-orange-50"
                }`}
              >
                {mutating ? "..." : viewUser.block_status ? "Unblock" : "Block"}
              </button>
              <button onClick={() => { closeView(); setDeleteId(viewUser._id); }} className="flex-1 text-sm py-2 rounded-xl font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                <MdDelete size={15} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ─────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
      />

    </div>
  );
};

export default Employees;
