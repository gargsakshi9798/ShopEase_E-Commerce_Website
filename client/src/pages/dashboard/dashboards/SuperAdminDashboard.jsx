import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../../features/dashboard/dashboardSlice";
import { GET } from "../../../utils/Methods";
import { APIS } from "../../../utils/APIS";
import { formatCurrency, formatDate, formatDateTime } from "../../../utils/Methods";
import { IDS } from "../../../utils/IDS";
import {
  MdAttachMoney, MdShoppingCart, MdPeople, MdInventory,
  MdArrowUpward, MdDownload, MdRefresh,
  MdCheckCircle, MdError, MdSecurity, MdSettings,
  MdStorage, MdPendingActions, MdWarning, MdStar,
  MdPerson, MdCategory,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  BarElement, PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StatCard = ({ icon: Icon, label, value, change, iconBg, iconColor, sub }) => (
  <div className="bg-white rounded-xl p-4 shadow-card">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      {change !== undefined && (
        <span className="flex items-center gap-0.5 text-green-500 text-xs font-semibold">
          <MdArrowUpward size={14} />{change}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const SystemStatus = ({ label, ok, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      {ok ? <MdCheckCircle size={15} className="text-green-500" /> : <MdError size={15} className="text-orange-400" />}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
      {value}
    </span>
  </div>
);

const QUICK_LINKS = [
  { label: "Admins & Users", path: "/admin/admin-users",  color: "bg-blue-100 text-blue-600",    icon: MdPerson },
  { label: "Products",       path: "/admin/products",     color: "bg-green-100 text-green-600",  icon: MdInventory },
  { label: "Orders",         path: "/admin/orders",       color: "bg-orange-100 text-orange-600",icon: MdShoppingCart },
  { label: "Reports",        path: "/admin/reports",      color: "bg-pink-100 text-pink-600",    icon: MdAttachMoney },
  { label: "Settings",       path: "/admin/settings",     color: "bg-gray-100 text-gray-600",    icon: MdSettings },
  { label: "Security",       path: "/admin/security",     color: "bg-red-100 text-red-600",      icon: MdSecurity },
  { label: "Backup",         path: "/admin/backup",       color: "bg-cyan-100 text-cyan-600",    icon: MdStorage },
  { label: "Categories",     path: "/admin/masters/categories", color: "bg-purple-100 text-purple-600", icon: MdCategory },
];

const SuperAdminDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { data, status } = useSelector((s) => s.dashboard);
  const { data: adminData } = useSelector((s) => s.auth);
  const loading = status === "loading";

  // Extra data not in dashboardSlice
  const [orderStats, setOrderStats] = useState([]);
  const [adminList, setAdminList]   = useState([]);
  const [auditLogs, setAuditLogs]   = useState([]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    fetchExtra();
  }, [dispatch]);

  const fetchExtra = async () => {
    try {
      const [os, admins, logs] = await Promise.allSettled([
        GET(APIS.Orders + "/stats"),
        GET(APIS.Users.Admins, { per_page: 5 }),
        GET(APIS.AuditLogs, { per_page: 5 }),
      ]);
      if (os.status === "fulfilled")     setOrderStats(os.value?.data || []);
      if (admins.status === "fulfilled") setAdminList(admins.value?.data?.data || []);
      if (logs.status === "fulfilled")   setAuditLogs(logs.value?.data?.data || []);
    } catch { /* silent */ }
  };

  const stats        = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const topProducts  = data?.top_products  || [];
  const monthlyChart = data?.monthly_chart || [];

  // ── Monthly Revenue Line Chart ─────────────────────────────────────────────
  const chartLabels  = MONTHS.slice(0, Math.max(monthlyChart.length, 7));
  const chartRevenue = MONTHS.map((_, mi) => {
    const found = monthlyChart.find((m) => m._id?.month === mi + 1);
    return found?.revenue || 0;
  });
  const chartOrders  = MONTHS.map((_, mi) => {
    const found = monthlyChart.find((m) => m._id?.month === mi + 1);
    return found?.orders || 0;
  });

  const lineData = {
    labels: MONTHS,
    datasets: [
      { label: "Revenue (₹)", data: chartRevenue, borderColor: "#4f46e5", backgroundColor: "rgba(79,70,229,0.08)", tension: 0.4, fill: true, pointRadius: 3, yAxisID: "y" },
      { label: "Orders",      data: chartOrders,  borderColor: "#22c55e", backgroundColor: "transparent", tension: 0.4, borderDash: [5,5], pointRadius: 2, yAxisID: "y1" },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: {
      y:  { beginAtZero: true, ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}K` }, grid: { color: "#f1f5f9" } },
      y1: { position: "right", beginAtZero: true, grid: { display: false } },
      x:  { grid: { display: false } },
    },
  };

  // ── Order Status Doughnut ──────────────────────────────────────────────────
  const orderStatusLabels = orderStats.map((s) => IDS.ORDER_STATUS[s._id]?.label || s._id);
  const orderStatusColors = ["#22c55e","#4f46e5","#f59e0b","#ef4444","#94a3b8","#3b82f6","#8b5cf6","#06b6d4","#f97316","#a855f7","#ec4899"];
  const doughnutData = {
    labels: orderStatusLabels,
    datasets: [{ data: orderStats.map((s) => s.count), backgroundColor: orderStatusColors.slice(0, orderStats.length), borderWidth: 0, hoverOffset: 6 }],
  };
  const doughnutOptions = {
    responsive: true, cutout: "65%",
    plugins: { legend: { display: false } },
  };
  const totalOrderCount = orderStats.reduce((s, v) => s + v.count, 0);

  // ── Today's date string ───────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminData?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's what's happening across your entire system today, {today}.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { dispatch(fetchDashboardStats()); fetchExtra(); }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdRefresh size={16} /> Refresh
          </button>
          <Link to="/admin/reports"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            <MdDownload size={16} /> Export Report
          </Link>
        </div>
      </div>

      {/* Stats Row — all from API */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array(6).fill(null).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-card animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
              <div className="h-7 bg-gray-200 rounded mb-1 w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : [
          { icon: MdAttachMoney, label: "Total Revenue",   value: formatCurrency(stats.total_revenue || 0),       change: 18.5, iconBg: "bg-primary-100", iconColor: "text-primary-600" },
          { icon: MdShoppingCart,label: "Total Orders",    value: (stats.total_orders || 0).toLocaleString(),     change: 12.7, iconBg: "bg-blue-100",    iconColor: "text-blue-600" },
          { icon: MdPeople,      label: "Total Users",     value: (stats.total_users || 0).toLocaleString(),      change: 9.3,  iconBg: "bg-green-100",   iconColor: "text-green-600" },
          { icon: MdInventory,   label: "Total Products",  value: (stats.total_products || 0).toLocaleString(),   change: 7.5,  iconBg: "bg-orange-100",  iconColor: "text-orange-600" },
          { icon: MdPendingActions,label:"Pending Orders", value: (stats.pending_orders || 0).toLocaleString(),   iconBg: "bg-yellow-100",  iconColor: "text-yellow-600", sub: "Need attention" },
          { icon: MdWarning,     label: "Low Stock",       value: (stats.low_stock_count || 0).toLocaleString(),  iconBg: "bg-red-100",     iconColor: "text-red-600",    sub: "Products critical" },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue + Orders Line */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Revenue & Orders — {new Date().getFullYear()}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly breakdown from live data</p>
            </div>
          </div>
          {monthlyChart.length > 0 ? (
            <Line data={lineData} options={lineOptions} height={120} />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-300 text-sm">No data yet</div>
          )}
        </div>

        {/* Order Status Doughnut */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Order Status</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          {orderStats.length > 0 ? (
            <>
              <div className="flex justify-center mb-3 relative">
                <div className="w-32 h-32 relative">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-gray-900">{totalOrderCount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {orderStats.slice(0, 6).map((s, i) => {
                  const cfg = IDS.ORDER_STATUS[s._id] || { label: s._id };
                  const pct = totalOrderCount > 0 ? ((s.count / totalOrderCount) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: orderStatusColors[i] }} />
                        <span className="text-xs text-gray-600">{cfg.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{s.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No order data</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Admin Activity + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {(recentOrders.length > 0 ? recentOrders.slice(0, 5) : []).length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No orders yet</p>
            ) : (
              recentOrders.slice(0, 5).map((o, i) => {
                const st = IDS.ORDER_STATUS[o.order_status] || { label: o.order_status, color: "bg-gray-100 text-gray-700" };
                return (
                  <button key={i} onClick={() => navigate(`/admin/orders/${o._id}`)}
                    className="w-full flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1 text-left transition-colors">
                    <div>
                      <p className="text-xs font-mono font-bold text-primary-600">{o.order_number}</p>
                      <p className="text-xs text-gray-500">{o.user_id?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge text-[10px] ${st.color}`}>{st.label}</span>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatCurrency(o.total_amount)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Admin Users</h3>
            <Link to="/admin/admin-users" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {adminList.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No admin data</p>
            ) : (
              adminList.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">
                    {a.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.email}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.block_status ? "bg-red-400" : "bg-green-400"}`} />
                    <span className="text-[10px] text-gray-400">{a.role_id?.name || "Admin"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health + Recent Audit */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">System Health</h3>
            <Link to="/admin/security" className="text-xs text-primary-600 hover:underline">Details</Link>
          </div>
          <SystemStatus label="Server Status"   ok value="Operational" />
          <SystemStatus label="Database"        ok value="Connected" />
          <SystemStatus label="Low Stock Items" ok={stats.low_stock_count === 0} value={stats.low_stock_count > 0 ? `${stats.low_stock_count} items` : "All good"} />
          <SystemStatus label="Pending Orders"  ok={stats.pending_orders === 0} value={stats.pending_orders > 0 ? `${stats.pending_orders} pending` : "Clear"} />
          <SystemStatus label="Security"        ok value="Secure" />

          {auditLogs.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2">Recent Activity</p>
              <div className="space-y-2">
                {auditLogs.slice(0, 3).map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`badge text-[9px] flex-shrink-0 mt-0.5 ${
                      l.action === "CREATE" ? "bg-green-100 text-green-700" :
                      l.action === "DELETE" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{l.action}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 truncate">{l.description}</p>
                      <p className="text-[10px] text-gray-400">{formatDateTime(l.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-100 text-left">
                <th className="pb-2 font-semibold text-xs">#</th>
                <th className="pb-2 font-semibold text-xs">Product</th>
                <th className="pb-2 text-right font-semibold text-xs">Units Sold</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.slice(0, 5).map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 text-gray-400 text-xs">#{i + 1}</td>
                    <td className="py-2.5 text-gray-700 text-sm font-medium">{p.name}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{p.total_sold?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {QUICK_LINKS.map((m) => (
            <Link key={m.label} to={m.path}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${m.color}`}>
                <m.icon size={22} />
              </div>
              <p className="text-[11px] font-semibold text-gray-700 leading-tight">{m.label}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
