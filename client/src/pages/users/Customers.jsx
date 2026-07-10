import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  getCustomerById,
  toggleBlockCustomer,
  deleteCustomer,
  clearSelectedCustomer,
} from "../../features/users/customerSlice";
import {
  createCustomerUser,
  updateAdminUser,
} from "../../features/users/adminUsersSlice";
import DataTable from "../../components/common/DataTable";
import UserFormModal from "../../components/common/UserFormModal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import {
  MdAdd, MdSearch, MdEdit, MdBlock, MdCheckCircle, MdDelete, MdInfo,
  MdPeople, MdVerified, MdClose, MdEmail, MdPhone,
  MdCalendarToday, MdFilterList, MdDownload, MdRefresh,
} from "react-icons/md";
import { formatDate, formatDateTime } from "../../utils/Methods";

// ── CSV export helper ──────────────────────────────────────────────────────────
const exportCSV = (data) => {
  if (!data.length) { toast.error("No data to export"); return; }
  const headers = ["Name", "Email", "Phone", "Verified", "Status", "Joined"];
  const rows = data.map((c) => [
    c.name,
    c.email,
    c.contact_no || "-",
    c.is_email_verified ? "Verified" : "Pending",
    c.block_status ? "Blocked" : "Active",
    formatDate(c.createdAt),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "customers.csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported");
};

const Customers = () => {
  const dispatch = useDispatch();
  const { list, total, current_page, total_pages, status, mutating, selected } =
    useSelector((s) => s.customer);
  const { mutating: adminMutating } = useSelector((s) => s.adminUsers);
  const loading = status === "loading";

  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)                        params.search = search;
    if (filterStatus === "active")     params.block_status = false;
    if (filterStatus === "blocked")    params.block_status = true;
    if (filterVerified === "verified") params.is_email_verified = true;
    if (filterVerified === "pending")  params.is_email_verified = false;
    return params;
  };

  const load = (p = page) => dispatch(fetchCustomers(buildParams(p)));

  // Load stats once on mount (no filters, large per_page to get totals)
  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, per_page: 1 })).unwrap()
      .then((res) => {
        setStats((prev) => ({ ...prev, total: res?.data?.total || 0 }));
      }).catch(() => {});
  }, []);

  useEffect(() => { load(page); }, [page, filterStatus, filterVerified]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => { setEditUser(null); setShowForm(true); };
  const openEdit   = (user) => { setEditUser(user); setShowForm(true); };
  const openView = (user) => {
    setViewUser(user);
    dispatch(getCustomerById(user._id));
  };
  const closeView = () => { setViewUser(null); dispatch(clearSelectedCustomer()); };

  const onSubmit = async (data) => {
    try {
      let res;
      if (editUser) res = await dispatch(updateAdminUser({ id: editUser._id, data })).unwrap();
      else          res = await dispatch(createCustomerUser(data)).unwrap();

      if (res?.success) {
        toast.success(editUser ? "Customer updated!" : "Customer created!");
        setShowForm(false);
        setEditUser(null);
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
      const res = await dispatch(toggleBlockCustomer(user._id)).unwrap();
      if (res?.success) {
        toast.success(user.block_status ? "Customer unblocked" : "Customer blocked");
        load(page);
        if (viewUser?._id === user._id) closeView();
      }
    } catch (err) {
      toast.error(err?.message || "Action failed");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteCustomer(deleteId)).unwrap();
      if (res?.success) {
        toast.success("Customer deleted");
        setDeleteId(null);
        load(page);
      }
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally { setDeleting(false); }
  };


  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "name", label: "Customer",
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
            {row.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact_no", label: "Phone",
      render: (v) => v || <span className="text-gray-300">—</span>,
    },
    {
      key: "is_email_verified", label: "Email",
      render: (v) => (
        <span className={`badge ${v ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {v ? "✓ Verified" : "Pending"}
        </span>
      ),
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
      key: "createdAt", label: "Joined",
      render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span>,
    },
    {
      key: "last_login", label: "Last Login",
      render: (v) => <span className="text-xs text-gray-400">{v ? formatDate(v) : "Never"}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openView(row)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
            title="View details"
          >
            <MdInfo size={16} />
          </button>
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
            title="Edit customer"
          >
            <MdEdit size={16} />
          </button>
          <button
            onClick={() => handleToggleBlock(row)}
            disabled={mutating}
            className={`p-1.5 rounded-lg disabled:opacity-50 ${
              row.block_status
                ? "text-green-600 hover:bg-green-50"
                : "text-orange-600 hover:bg-orange-50"
            }`}
            title={row.block_status ? "Unblock customer" : "Block customer"}
          >
            {row.block_status ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
            title="Delete customer"
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage all registered customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(page)}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
            title="Refresh"
          >
            <MdRefresh size={18} />
          </button>
          <button
            onClick={() => exportCSV(list)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <MdDownload size={16} /> Export CSV
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: total,  icon: MdPeople,    bg: "bg-green-50",  color: "text-green-600" },
          { label: "Active",          value: list.filter((c) => !c.block_status).length, icon: MdCheckCircle, bg: "bg-blue-50",   color: "text-blue-600",   sub: "this page" },
          { label: "Blocked",         value: list.filter((c) => c.block_status).length,  icon: MdBlock,       bg: "bg-red-50",    color: "text-red-600",    sub: "this page" },
          { label: "Email Verified",  value: list.filter((c) => c.is_email_verified).length, icon: MdVerified, bg: "bg-purple-50", color: "text-purple-600", sub: "this page" },
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
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="input-field pl-9 w-64 text-sm py-2"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={filterVerified}
              onChange={(e) => { setFilterVerified(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-40"
            >
              <option value="all">All Verified</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            {(filterStatus !== "all" || filterVerified !== "all" || search) && (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); setFilterVerified("all"); setPage(1); }}
                className="text-xs text-primary-600 hover:underline px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          currentPage={current_page}
          totalPages={total_pages}
          total={total}
          perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>


      {/* ── View Detail Drawer ────────────────────────────────────────── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeView} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
              <button onClick={closeView} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-2xl">
                  {viewUser.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewUser.name}</h4>
                  <span className="badge bg-green-100 text-green-700 mt-1">Customer</span>
                </div>
              </div>

              {/* Status chips */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className={`badge ${viewUser.block_status ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {viewUser.block_status ? "Blocked" : "Active"}
                </span>
                <span className={`badge ${viewUser.is_email_verified ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewUser.is_email_verified ? "✓ Email Verified" : "Email Pending"}
                </span>
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                {[
                  { icon: MdEmail,         label: "Email",      value: viewUser.email },
                  { icon: MdPhone,         label: "Phone",      value: viewUser.contact_no || "Not provided" },
                  { icon: MdCalendarToday, label: "Joined",     value: formatDate(viewUser.createdAt) },
                  { icon: MdCalendarToday, label: "Last Login", value: viewUser.last_login ? formatDateTime(viewUser.last_login) : "Never" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon size={16} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-700 font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* User ID */}
              <div className="px-3 py-2 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 font-medium mb-0.5">User ID</p>
                <p className="text-xs text-gray-500 font-mono break-all">{viewUser._id}</p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => { closeView(); openEdit(viewUser); }}
                className="flex-1 btn-primary text-sm py-2"
              >
                <MdEdit size={15} className="inline mr-1" /> Edit
              </button>
              <button
                onClick={() => handleToggleBlock(viewUser)}
                disabled={mutating}
                className={`flex-1 text-sm py-2 rounded-xl font-medium border transition-colors disabled:opacity-50 ${
                  viewUser.block_status
                    ? "border-green-300 text-green-700 hover:bg-green-50"
                    : "border-orange-300 text-orange-700 hover:bg-orange-50"
                }`}
              >
                {mutating ? "Please wait..." : viewUser.block_status ? "Unblock Customer" : "Block Customer"}
              </button>
              <button
                onClick={() => { closeView(); setDeleteId(viewUser._id); }}
                className="flex-1 text-sm py-2 rounded-xl font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                <MdDelete size={15} className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <UserFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditUser(null); }}
        onSubmit={onSubmit}
        editUser={editUser}
        roleLabel="Customer"
        roleBadge="bg-green-50 border-green-200 text-green-700"
        roleIcon={MdPeople}
        isMutating={adminMutating || mutating}
      />

      {/* ── Confirm Delete ─────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? All their data will be removed. This cannot be undone."
      />

    </div>
  );
};

export default Customers;
