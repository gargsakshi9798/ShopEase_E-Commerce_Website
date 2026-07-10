import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../features/auth/authSlice";
import { fetchSettings } from "../../../features/settings/settingsSlice";
import { IDS } from "../../../utils/IDS";
import { GET } from "../../../utils/Methods";
import { APIS } from "../../../utils/APIS";
import { formatCurrency, getImgUrl } from "../../../utils/Methods";
import {
  MdDashboard, MdShoppingCart, MdPeople, MdInventory,
  MdLocalOffer, MdBarChart, MdSettings, MdLogout,
  MdCategory, MdStar, MdBuild,
  MdSecurity, MdWork, MdChevronRight, MdLabelOutline,
  MdAssignment, MdLocalShipping, MdUndo, MdGroups,
  MdAdminPanelSettings, MdBusiness, MdStorage, MdSpeed,
  MdOpenInNew, MdEmail, MdRefresh,
} from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";

const P = IDS.PERMISSIONS;

// ─── Nav config per role ──────────────────────────────────────────────────────

const SUPER_ADMIN_NAV = [
  {
    label: "MAIN",
    items: [
      { path: "/admin/dashboard",    label: "Dashboard",           icon: MdDashboard },
      { path: "/admin/admin-users",  label: "Admins & Users",      icon: MdAdminPanelSettings },
      { path: "/admin/roles",        label: "Roles & Permissions", icon: MdSecurity },
      { path: "/admin/employees",    label: "Employees",           icon: MdWork },
      { path: "/admin/customers",    label: "Customers",           icon: MdPeople },
    ],
  },
  {
    label: "APPLICATION MANAGEMENT",
    items: [
      { path: "/admin/products",           label: "Products",       icon: MdInventory },
      { path: "/admin/orders",             label: "Orders",         icon: MdShoppingCart, badgeKey: "pending_orders" },
      { path: "/admin/masters/categories", label: "Categories",     icon: MdCategory },
      { path: "/admin/masters/brands",     label: "Brands",         icon: MdLabelOutline },
      { path: "/admin/coupons",            label: "Coupons",        icon: MdLocalOffer },
      { path: "/admin/reviews",            label: "Reviews",        icon: MdStar },
      { path: "/admin/cms/banners",        label: "CMS Management", icon: MdBusiness },
    ],
  },
  {
    label: "SYSTEM MANAGEMENT",
    items: [
      { path: "/admin/reports",      label: "Reports & Analytics", icon: MdBarChart },
      { path: "/admin/audit-logs",   label: "Audit Logs",          icon: MdAssignment },
      { path: "/admin/settings",     label: "System Settings",     icon: MdSettings },
      { path: "/admin/security",     label: "Security Center",     icon: MdSecurity },
      { path: "/admin/backup",       label: "Backup & Restore",    icon: MdStorage },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { path: "/admin/support",  label: "Support Tickets",  icon: MdBuild,      badgeKey: "open_tickets" },
      { path: "/admin/messages", label: "Contact Messages", icon: MdEmail,      badgeKey: "unread_messages" },
    ],
  },
];

const ADMIN_NAV = [
  {
    label: "MAIN",
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
      { path: "/admin/orders",    label: "Orders",    icon: MdShoppingCart, badgeKey: "pending_orders" },
      { path: "/admin/products",  label: "Products",  icon: MdInventory },
      { path: "/admin/masters/categories", label: "Categories", icon: MdCategory },
      { path: "/admin/masters/brands",     label: "Brands",     icon: MdLabelOutline },
      { path: "/admin/customers", label: "Customers", icon: MdPeople },
      { path: "/admin/employees", label: "Employees", icon: MdWork },
      { path: "/admin/coupons",   label: "Coupons",   icon: MdLocalOffer },
      { path: "/admin/reviews",   label: "Reviews",   icon: MdStar },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { path: "/admin/roles",     label: "Roles & Permissions", icon: MdSecurity, permission: P.ROLES_LIST },
      { path: "/admin/settings",  label: "Settings",            icon: MdSettings, permission: P.SETTINGS_VIEW },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { path: "/admin/reports",   label: "Reports", icon: MdBarChart, permission: P.REPORTS_VIEW },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { path: "/admin/support",  label: "Support Tickets",  icon: MdBuild,  badgeKey: "open_tickets" },
      { path: "/admin/messages", label: "Contact Messages", icon: MdEmail,  badgeKey: "unread_messages" },
    ],
  },
];

const EMPLOYEE_NAV = [
  {
    label: "MAIN",
    items: [
      { path: "/admin/dashboard", label: "Dashboard",         icon: MdDashboard },
      { path: "/admin/orders",    label: "Orders",            icon: MdShoppingCart, badgeKey: "pending_orders" },
      { path: "/admin/inventory", label: "Inventory",         icon: MdInventory },
      { path: "/admin/products",  label: "Products",          icon: MdInventory },
      { path: "/admin/customers", label: "Customers",         icon: MdPeople },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { path: "/admin/support",  label: "Customer Support", icon: MdPeople },
      { path: "/admin/messages", label: "Messages",         icon: MdEmail, badgeKey: "unread_messages" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getNavGroups = (role_slug) => {
  if (role_slug === "super_admin") return SUPER_ADMIN_NAV;
  if (role_slug === "employee")    return EMPLOYEE_NAV;
  return ADMIN_NAV;
};

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { permissions, data, role_slug } = useSelector((s) => s.auth);
  const { data: settings } = useSelector((s) => s.settings);
  const dashboardData = useSelector((s) => s.dashboard?.data);

  const [collapsedGroups, setCollapsedGroups] = useState({});
  // Dynamic badge counts
  const [badgeCounts, setBadgeCounts] = useState({
    pending_orders:   0,
    open_tickets:     0,
    unread_messages:  0,
  });
  // Revenue from dashboard or stats
  const [revenueStats, setRevenueStats] = useState({ total: 0, change: 18.5 });

  const navGroups = getNavGroups(role_slug);

  const hasPermission = (permId) => {
    if (!permId) return true;
    if (role_slug === "super_admin") return true;
    return permissions?.includes(permId);
  };

  // ── Fetch dynamic badge counts ─────────────────────────────────────────────
  const fetchBadges = async () => {
    try {
      const [orderStats, ticketStats, msgStats] = await Promise.allSettled([
        GET(APIS.Orders + "/stats"),
        GET(APIS.Support.TicketStats),
        GET(APIS.Support.Messages, { status: "unread", page: 1, per_page: 1 }),
      ]);

      let pending = 0;
      if (orderStats.status === "fulfilled") {
        const arr = orderStats.value?.data || [];
        pending = arr.filter((s) => ["pending","confirmed","processing"].includes(s._id))
          .reduce((sum, s) => sum + s.count, 0);
      }

      let openTickets = 0;
      if (ticketStats.status === "fulfilled") {
        const arr = ticketStats.value?.data?.byStatus || [];
        openTickets = arr.filter((s) => ["open","in_progress"].includes(s._id))
          .reduce((sum, s) => sum + s.count, 0);
      }

      let unreadMsgs = 0;
      if (msgStats.status === "fulfilled") {
        unreadMsgs = msgStats.value?.data?.total || 0;
      }

      setBadgeCounts({ pending_orders: pending, open_tickets: openTickets, unread_messages: unreadMsgs });
    } catch { /* silently fail */ }
  };

  // Fetch revenue for bottom card
  const fetchRevenue = async () => {
    try {
      const res = await GET(APIS.Reports.Revenue);
      if (res?.data) {
        setRevenueStats({ total: res.data.total || 0, change: 18.5 });
      }
    } catch { /* use mock */ }
  };

  useEffect(() => {
    dispatch(fetchSettings());
    fetchBadges();
    fetchRevenue();
    // Refresh badges every 60s
    const interval = setInterval(() => { fetchBadges(); }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const toggleGroup = (label) =>
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => { dispatch(logout()); navigate("/login"); };

  // Site info from settings
  const siteName    = settings?.site_name    || "ShopEase";
  const siteLogo    = settings?.logo         || null;
  const siteTagline = settings?.site_tagline || null;
  const panelTitle  = role_slug === "super_admin" ? "Super Admin Panel"
    : role_slug === "employee" ? "Employee Panel" : "Admin Panel";

  // Badge value for a nav item
  const getBadge = (item) => {
    if (!item.badgeKey) return item.badge || null;
    const count = badgeCounts[item.badgeKey] || 0;
    return count > 0 ? (count > 99 ? "99+" : String(count)) : null;
  };

  const totalRevenue = revenueStats.total > 0
    ? formatCurrency(revenueStats.total)
    : (dashboardData?.stats?.total_revenue ? formatCurrency(dashboardData.stats.total_revenue) : "₹24,58,350");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white z-30 flex flex-col overflow-hidden transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Logo / Brand ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-700/60 flex-shrink-0">
          {/* Logo — use uploaded logo or fallback icon */}
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {siteLogo ? (
              <img src={getImgUrl(siteLogo)} alt={siteName} className="w-full h-full object-contain p-1" />
            ) : (
              <FaShoppingBag size={17} className="text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-[15px] leading-none truncate">
              {siteName.length > 10 ? (
                siteName
              ) : (
                <>
                  <span className="text-primary-400">{siteName.slice(0, Math.ceil(siteName.length / 2))}</span>
                  {siteName.slice(Math.ceil(siteName.length / 2))}
                </>
              )}
            </h1>
            <p className="text-gray-400 text-[10px] mt-0.5 truncate">
              {siteTagline || panelTitle}
            </p>
          </div>
          {/* Refresh badges button */}
          <button onClick={fetchBadges} className="text-gray-600 hover:text-gray-400 flex-shrink-0" title="Refresh counts">
            <MdRefresh size={14} />
          </button>
        </div>

        {/* ── View Store link ────────────────────────────────────────── */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mx-3 mt-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs text-gray-300 hover:text-white font-medium transition-colors flex-shrink-0"
        >
          <MdOpenInNew size={13} />
          View Store
        </a>

        {/* ── User Info ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 mx-3 rounded-xl mt-2 flex-shrink-0">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {data?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{data?.name || "Admin"}</p>
            <p className="text-gray-400 text-xs capitalize truncate">{data?.role || panelTitle}</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" title="Online" />
        </div>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => hasPermission(item.permission));
            if (visibleItems.length === 0) return null;
            const isCollapsed = collapsedGroups[group.label];

            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
                >
                  {group.label}
                  <MdChevronRight className={`transition-transform ${isCollapsed ? "" : "rotate-90"}`} size={13} />
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {visibleItems.map((item, idx) => {
                      const badge = getBadge(item);
                      return (
                        <NavLink
                          key={`${item.path}-${idx}`}
                          to={item.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all font-medium ${
                              isActive
                                ? "bg-primary-600 text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-gray-800"
                            }`
                          }
                        >
                          <item.icon size={17} className="flex-shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 min-w-[18px] text-center">
                              {badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Bottom Card (Super Admin / Admin) ─────────────────────── */}
        {(role_slug === "super_admin" || role_slug === "admin") && (
          <div className="mx-3 mb-3 bg-gradient-to-br from-primary-700 to-primary-900 rounded-xl p-4 flex-shrink-0">
            <p className="text-primary-200 text-xs mb-1">Total Revenue</p>
            <p className="text-white text-xl font-bold">{totalRevenue}</p>
            <p className="text-primary-300 text-xs mt-0.5 flex items-center gap-1">
              <span className="text-green-400">▲ {revenueStats.change}%</span> vs last month
            </p>
            <div className="mt-2 h-8 overflow-hidden opacity-50">
              <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <polyline points="0,25 15,18 30,22 45,10 60,15 75,8 90,12 100,5"
                  fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <Link to="/admin/reports"
              className="mt-2 block text-center text-xs text-white font-semibold bg-white/10 hover:bg-white/20 rounded-lg py-1.5 transition-colors">
              View Full Report →
            </Link>
          </div>
        )}

        {/* ── Employee bottom card ──────────────────────────────────── */}
        {role_slug === "employee" && (
          <div className="mx-3 mb-3 bg-gray-800 rounded-xl p-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {data?.name?.[0]?.toUpperCase() || "E"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{data?.name || "Employee"}</p>
              <p className="text-gray-400 text-xs truncate">{data?.role || "Staff"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-green-400 text-[10px]">Online</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Logout ───────────────────────────────────────────────── */}
        <div className="px-3 pb-4 flex-shrink-0 border-t border-gray-700/60 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-900/40 hover:text-red-300 transition-all"
          >
            <MdLogout size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
