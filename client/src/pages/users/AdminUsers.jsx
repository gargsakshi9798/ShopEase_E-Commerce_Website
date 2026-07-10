import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  fetchSuperAdminCount,
  fetchAdminCount,
  fetchAllEmployees,
  fetchAllCustomers,
  createAdminUser,
  createEmployeeUser,
  createCustomerUser,
  updateAdminUser,
  toggleBlockUser,
  deleteAdminUser,
  getUserById,
  clearSelected,
} from "../../features/users/adminUsersSlice";
import DataTable from "../../components/common/DataTable";
import UserFormModal from "../../components/common/UserFormModal";
import ConfirmDelete from "../../components/common/ConfirmDelete";
import toast from "react-hot-toast";
import {
  MdAdd, MdSearch, MdEdit, MdDelete, MdBlock, MdCheckCircle,
  MdPeople, MdAdminPanelSettings, MdWork, MdGroups, MdClose,
  MdEmail, MdPhone, MdCalendarToday, MdVerifiedUser, MdInfo,
  MdLockOutline,
} from "react-icons/md";
import { formatDate, formatDateTime } from "../../utils/Methods";

const TABS = [
  { id: "super_admin", label: "Super Admins", icon: MdAdminPanelSettings, color: "text-red-600" },
  { id: "admin",       label: "Admins",       icon: MdGroups,             color: "text-purple-600" },
  { id: "employee",    label: "Employees",    icon: MdWork,               color: "text-blue-600" },
  { id: "customer",    label: "Customers",    icon: MdPeople,             color: "text-green-600" },
];

const ROLE_BADGE = {
  super_admin: "bg-red-100 text-red-700",
  admin:       "bg-purple-100 text-purple-700",
  employee:    "bg-blue-100 text-blue-700",
  customer:    "bg-green-100 text-green-700",
};

const AdminUsers = () => {
  const dispatch = useDispatch();
  const {
    admins, employees, customers,
    superAdminCount, adminCount,
    status, mutating,
  } = useSelector((s) => s.adminUsers);
  const loading = status === "loading";

  const [activeTab, setActiveTab] = useState("super_admin");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showForm, setShowForm]   = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [viewUser, setViewUser]   = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  const isAdminTab    = activeTab === "super_admin" || activeTab === "admin";
  const isEmployeeTab = activeTab === "employee";
  const isCustomerTab = activeTab === "customer";
  // Super Admin tab = view only, no add button
  const canCreate     = activeTab !== "super_admin";
  const canEdit       = !isCustomerTab;
  const currentData   = isEmployeeTab ? employees : isCustomerTab ? customers : admins;

  // ── Stats — always show accurate per-role count ───────────────────────────
  const statItems = [
    { label: "Super Admins", value: superAdminCount, icon: MdAdminPanelSettings, bg: "bg-red-50",    color: "text-red-600",    tab: "super_admin" },
    { label: "Admins",       value: adminCount,       icon: MdGroups,             bg: "bg-purple-50", color: "text-purple-600", tab: "admin"       },
    { label: "Employees",    value: employees.total,  icon: MdWork,               bg: "bg-blue-50",   color: "text-blue-600",   tab: "employee"    },
    { label: "Customers",    value: customers.total,  icon: MdPeople,             bg: "bg-green-50",  color: "text-green-600",  tab: "customer"    },
  ];

  // ── Tab badge count ───────────────────────────────────────────────────────
  const tabCount = (tabId) => {
    if (tabId === "super_admin") return superAdminCount;
    if (tabId === "admin")       return adminCount;
    if (tabId === "employee")    return employees.total;
    return customers.total;
  };

  // ── Data loading ──────────────────────────────────────────────────────────
  const load = (p = page) => {
    if (activeTab === "employee")       dispatch(fetchAllEmployees({ search, page: p, per_page: 10 }));
    else if (activeTab === "customer")  dispatch(fetchAllCustomers({ search, page: p, per_page: 10 }));
    else dispatch(fetchAdminUsers({ search, page: p, per_page: 10, role_slug: activeTab }));
  };

  // On mount — load all counts for stats cards
  useEffect(() => {
    dispatch(fetchSuperAdminCount());
    dispatch(fetchAdminCount());
    dispatch(fetchAllEmployees({ page: 1, per_page: 1 }));   // just for count
    dispatch(fetchAllCustomers({ page: 1, per_page: 1 }));   // just for count
  }, [dispatch]);

  // Reset search + page when tab changes
  useEffect(() => { setPage(1); setSearch(""); }, [activeTab]);

  // Reload on tab/page change
  useEffect(() => { load(page); }, [activeTab, page]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);


  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditUser(null); setShowForm(true); };
  const openEdit   = (user) => { setEditUser(user); setShowForm(true); };
  const openView  = (user) => { setViewUser(user); dispatch(getUserById(user._id)); };
  const closeForm = () => { setShowForm(false); setEditUser(null); };
  const closeView = () => { setViewUser(null); dispatch(clearSelected()); };

  const onSubmit = async (data) => {
    try {
      let res;
      if (editUser)          res = await dispatch(updateAdminUser({ id: editUser._id, data })).unwrap();
      else if (isAdminTab)   res = await dispatch(createAdminUser(data)).unwrap();
      else if (isCustomerTab) res = await dispatch(createCustomerUser(data)).unwrap();
      else                   res = await dispatch(createEmployeeUser(data)).unwrap();

      if (res?.success) {
        toast.success(editUser ? "User updated!" : "User created!");
        closeForm();
        load(1);
        // Refresh relevant count after create
        if (!editUser) {
          if (isAdminTab)    { dispatch(fetchSuperAdminCount()); dispatch(fetchAdminCount()); }
          if (isCustomerTab) { dispatch(fetchAllCustomers({ page: 1, per_page: 1 })); }
        }
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
    // Guard: super_admin cannot be blocked — both UI and as a safety net
    if (user.role_id?.slug === "super_admin") {
      toast.error("Super Admin cannot be blocked");
      return;
    }
    try {
      const res = await dispatch(toggleBlockUser(user._id)).unwrap();
      if (res?.success) {
        toast.success(user.block_status ? "User unblocked successfully" : "User blocked successfully");
        load(page);
        // Close drawer and refresh if open
        if (viewUser?._id === user._id) closeView();
      }
    } catch (err) {
      toast.error(err?.message || "Action failed");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await dispatch(deleteAdminUser(deleteId)).unwrap();
      if (res?.success) {
        toast.success("User deleted successfully");
        setDeleteId(null);
        load(page);
        dispatch(fetchSuperAdminCount());
        dispatch(fetchAdminCount());
      }
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    } finally { setDeleting(false); }
  };


  // ── Table columns ─────────────────────────────────────────────────────────
  const isSuperAdmin = (row) => row.role_id?.slug === "super_admin";

  const columns = [
    {
      key: "name", label: "Name",
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
            {row.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              {row.name}
              {isSuperAdmin(row) && (
                <MdLockOutline size={13} className="text-red-400" title="Super Admin — cannot be blocked" />
              )}
            </p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "contact_no", label: "Phone", render: (v) => v || "–" },
    {
      key: "role_id", label: "Role",
      render: (v) => (
        <span className={`badge ${ROLE_BADGE[v?.slug] || "bg-gray-100 text-gray-700"}`}>
          {v?.name || "–"}
        </span>
      ),
    },
    {
      key: "is_email_verified", label: "Verified",
      render: (v) => (
        <span className={`badge ${v ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {v ? "✓ Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "block_status", label: "Status",
      render: (v, row) => isSuperAdmin(row)
        ? <span className="badge bg-blue-100 text-blue-700">Protected</span>
        : <span className={`badge ${v ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{v ? "Blocked" : "Active"}</span>,
    },
    {
      key: "last_login", label: "Last Login",
      render: (v) => <span className="text-xs text-gray-400">{v ? formatDate(v) : "Never"}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="View details">
            <MdInfo size={16} />
          </button>
          {canEdit && (
            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" title="Edit">
              <MdEdit size={16} />
            </button>
          )}
          {/* Block/Unblock — disabled and greyed out for super_admin */}
          {isSuperAdmin(row) ? (
            <button
              disabled
              className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed"
              title="Super Admin cannot be blocked"
            >
              <MdBlock size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleToggleBlock(row)}
              className={`p-1.5 rounded-lg ${row.block_status ? "text-green-600 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50"}`}
              title={row.block_status ? "Unblock user" : "Block user"}
            >
              {row.block_status ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
            </button>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900">Admins & Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all admin users, employees and customers</p>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <MdAdd size={18} />
            {activeTab === "admin"    ? "Add Admin"    :
             activeTab === "employee" ? "Add Employee" :
             "Add Customer"}
          </button>
        )}
      </div>

      {/* Stats Cards — each has its own accurate count */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statItems.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveTab(s.tab)}
            className={`bg-white rounded-xl p-4 shadow-card flex items-center gap-3 text-left transition-all hover:shadow-md ${
              activeTab === s.tab ? "ring-2 ring-primary-400" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value ?? 0}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Table Card with Tabs */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? `border-primary-600 ${tab.color}`
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon size={17} />
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
              }`}>
                {tabCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Search + meta */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
              className="input-field pl-9 w-60 text-sm py-2"
            />
          </div>
          <p className="text-xs text-gray-400">
            Total: <span className="font-semibold text-gray-700">{currentData.total}</span> records
          </p>
        </div>

        <DataTable
          columns={columns}
          data={currentData.list}
          loading={loading}
          currentPage={currentData.current_page}
          totalPages={currentData.total_pages}
          total={currentData.total}
          perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>


      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <UserFormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={onSubmit}
        editUser={editUser}
        roleLabel={
          activeTab === "admin"    ? "Admin"    :
          activeTab === "employee" ? "Employee" : "Customer"
        }
        roleBadge={
          activeTab === "admin"    ? "bg-purple-50 border-purple-200 text-purple-700" :
          activeTab === "employee" ? "bg-blue-50 border-blue-200 text-blue-700" :
          "bg-green-50 border-green-200 text-green-700"
        }
        roleIcon={
          activeTab === "admin"    ? MdGroups :
          activeTab === "employee" ? MdWork   : MdPeople
        }
        isMutating={mutating}
      />


      {/* ── View Drawer ────────────────────────────────────────────────── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={closeView} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
              <button onClick={closeView} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <MdClose size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl">
                  {viewUser.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    {viewUser.name}
                    {isSuperAdmin(viewUser) && (
                      <MdLockOutline size={16} className="text-red-400" title="Super Admin — cannot be blocked" />
                    )}
                  </h4>
                  <span className={`badge mt-1 ${ROLE_BADGE[viewUser.role_id?.slug] || "bg-gray-100 text-gray-700"}`}>
                    {viewUser.role_id?.name || "–"}
                  </span>
                </div>
              </div>

              {/* Status chips */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {isSuperAdmin(viewUser) ? (
                  <span className="badge bg-blue-100 text-blue-700 flex items-center gap-1">
                    <MdLockOutline size={12} /> Protected — Cannot be blocked
                  </span>
                ) : (
                  <span className={`badge ${viewUser.block_status ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {viewUser.block_status ? "Blocked" : "Active"}
                  </span>
                )}
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
                  { icon: MdVerifiedUser,  label: "User ID",    value: viewUser._id },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Icon size={16} className="text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-700 font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              {canEdit && (
                <button onClick={() => { closeView(); openEdit(viewUser); }} className="flex-1 btn-primary text-sm py-2">
                  <MdEdit size={15} className="inline mr-1.5" /> Edit User
                </button>
              )}
              {/* Block button disabled + tooltip for super_admin */}
              {isSuperAdmin(viewUser) ? (
                <button
                  disabled
                  className="flex-1 text-sm py-2 rounded-xl font-medium border border-gray-200 text-gray-300 cursor-not-allowed"
                  title="Super Admin cannot be blocked"
                >
                  <MdLockOutline size={15} className="inline mr-1" /> Protected
                </button>
              ) : (
                <button
                  onClick={() => handleToggleBlock(viewUser)}
                  disabled={mutating}
                  className={`flex-1 text-sm py-2 rounded-xl font-medium border transition-colors disabled:opacity-50 ${
                    viewUser.block_status
                      ? "border-green-300 text-green-700 hover:bg-green-50"
                      : "border-orange-300 text-orange-700 hover:bg-orange-50"
                  }`}
                >
                  {mutating ? "Please wait..." : viewUser.block_status ? "Unblock User" : "Block User"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete ─────────────────────────────────────────────── */}
      <ConfirmDelete
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

    </div>
  );
};

export default AdminUsers;
