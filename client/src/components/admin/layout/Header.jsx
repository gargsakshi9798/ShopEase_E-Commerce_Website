import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { logout } from "../../../features/auth/authSlice";
import {
  fetchNotifications, markAllRead, markAllReadLocal,
} from "../../../features/notifications/notificationSlice";
import { formatDateTime } from "../../../utils/Methods";
import {
  MdMenu, MdSearch, MdNotifications, MdSettings,
  MdLogout, MdPerson, MdOpenInNew, MdDoneAll,
  MdCircle, MdDashboard, MdBarChart, MdSecurity,
  MdAssignment, MdAdminPanelSettings, MdHistory,
} from "react-icons/md";

// ── Page title map ────────────────────────────────────────────────────────────
const pageTitles = {
  "/admin/dashboard":          "Dashboard",
  "/admin/products":           "Products",
  "/admin/products/create":    "Add Product",
  "/admin/inventory":          "Inventory & Stock",
  "/admin/orders":             "Orders",
  "/admin/customers":          "Customers",
  "/admin/employees":          "Employees",
  "/admin/admin-users":        "Admins & Users",
  "/admin/coupons":            "Coupons & Offers",
  "/admin/gift-cards":         "Gift Card Management",
  "/admin/reviews":            "Reviews",
  "/admin/masters/categories": "Categories",
  "/admin/masters/brands":     "Brands",
  "/admin/cms/banners":        "Banners",
  "/admin/cms/faqs":           "FAQs",
  "/admin/reports":            "Reports & Analytics",
  "/admin/audit-logs":         "Audit Logs",
  "/admin/security":           "Security Center",
  "/admin/backup":             "Backup & Restore",
  "/admin/support":            "Support Tickets",
  "/admin/messages":           "Contact Messages",
  "/admin/roles":              "Roles & Permissions",
  "/admin/settings":           "System Settings",
  "/admin/profile":            "My Profile",
};

const getTitle = (pathname) => {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith("/admin/orders/"))         return "Order Details";
  if (pathname.startsWith("/admin/products/edit/"))  return "Edit Product";
  return "ShopEase";
};

const NOTIF_ICON_MAP = {
  order:   "🛒",
  payment: "💳",
  warning: "⚠️",
  general: "🔔",
  account: "👤",
  return:  "↩️",
};

// ── Header Component ──────────────────────────────────────────────────────────
const Header = ({ onMenuClick }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { data, role_slug }  = useSelector((s) => s.auth);
  const { list: notifications, total_unread } =
    useSelector((s) => s.notifications);

  const [profileOpen, setProfileOpen]    = useState(false);
  const [notifOpen, setNotifOpen]        = useState(false);
  const [searchQuery, setSearchQuery]    = useState("");
  const profileRef  = useRef(null);
  const notifRef    = useRef(null);

  const title = getTitle(location.pathname);

  // ── Fetch notifications on mount + 60s refresh ───────────────────────────
  useEffect(() => {
    dispatch(fetchNotifications({ per_page: 20 }));
    const t = setInterval(() => dispatch(fetchNotifications({ per_page: 20 })), 60000);
    return () => clearInterval(t);
  }, [dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  const handleMarkAllRead = () => {
    dispatch(markAllReadLocal());
    dispatch(markAllRead());
  };

  const handleNotifClick = (notif) => {
    if (notif.link) navigate(notif.link);
    setNotifOpen(false);
  };

  // Search (basic navigate)
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">

      {/* Left — Menu toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <MdMenu size={22} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 leading-none">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
            ShopEase Admin
            {title !== "ShopEase" && (
              <> / <span className="text-gray-600">{title}</span></>
            )}
          </p>
        </div>
      </div>

      {/* Right — Search + Notif + Profile */}
      <div className="flex items-center gap-1.5">

        {/* Search */}
        <div className="relative hidden md:block">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            type="text"
            placeholder="Search... (Enter)"
            className="pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 transition-all"
          />
        </div>

        {/* View Store */}
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-colors"
          title="View public store">
          <MdOpenInNew size={15} /> Store
        </a>

        {/* ── Notification Bell ───────────────────────────────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <MdNotifications size={22} />
            {total_unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {total_unread > 99 ? "99+" : total_unread}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <MdNotifications size={17} className="text-primary-600" />
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {total_unread > 0 && (
                    <span className="badge bg-red-100 text-red-600 text-[10px]">{total_unread} new</span>
                  )}
                </div>
                {total_unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium"
                  >
                    <MdDoneAll size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                    <MdNotifications size={32} />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <button
                      key={n._id || i}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !n.is_read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${n.color || "bg-gray-100"}`}>
                        {NOTIF_ICON_MAP[n.type] || n.icon || "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-semibold truncate ${!n.is_read ? "text-gray-900" : "text-gray-700"}`}>
                            {n.title}
                          </p>
                          {!n.is_read && <MdCircle size={6} className="text-primary-600 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(n.time)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => { dispatch(fetchNotifications({ per_page: 20 })); }}
                  className="w-full text-center text-xs text-primary-600 hover:text-primary-800 font-medium py-1"
                >
                  Refresh notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile Dropdown ────────────────────────────────────────── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {data?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 leading-none">{data?.name || "Admin"}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{data?.role || "Admin"}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {data?.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{data?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{data?.email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`badge text-[9px] ${
                        role_slug === "super_admin" ? "bg-red-100 text-red-700" :
                        role_slug === "admin"       ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {data?.role || "Admin"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-green-600">
                        <MdCircle size={7} /> Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary actions */}
              <div className="py-1">
                <Link to="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <MdPerson size={16} className="text-gray-400" /> My Profile
                </Link>
                <Link to="/admin/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <MdDashboard size={16} className="text-gray-400" /> Dashboard
                </Link>
                <Link to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <MdSettings size={16} className="text-gray-400" /> System Settings
                </Link>
              </div>

              {/* Super Admin extras */}
              {(role_slug === "super_admin" || role_slug === "admin") && (
                <>
                  <div className="border-t border-gray-100 py-1">
                    <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Tools</p>
                    <Link to="/admin/reports"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdBarChart size={16} className="text-gray-400" /> Reports & Analytics
                    </Link>
                    {role_slug === "super_admin" && (
                      <>
                        <Link to="/admin/audit-logs"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <MdHistory size={16} className="text-gray-400" /> Audit Logs
                        </Link>
                        <Link to="/admin/security"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <MdSecurity size={16} className="text-gray-400" /> Security Center
                        </Link>
                        <Link to="/admin/admin-users"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <MdAdminPanelSettings size={16} className="text-gray-400" /> Manage Admins
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* View Store + Logout */}
              <div className="border-t border-gray-100 py-1">
                <a href="/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <MdOpenInNew size={16} className="text-gray-400" /> View Live Store
                </a>
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <MdLogout size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
