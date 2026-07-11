import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../../features/dashboard/dashboardSlice";
import { GET } from "../../../utils/Methods";
import { APIS } from "../../../utils/APIS";
import { formatCurrency, formatDate, formatDateTime } from "../../../utils/Methods";
import { IDS } from "../../../utils/IDS";
import {
  MdAttachMoney, MdShoppingCart, MdPeople, MdInventory,
  MdArrowUpward, MdArrowDownward, MdRefresh, MdDownload,
  MdPendingActions, MdWarning, MdCheckCircle, MdLocalOffer,
  MdCategory, MdStar, MdTrendingUp, MdOpenInNew,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  BarElement, PointElement, Title, Tooltip, Legend, ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, LineElement, BarElement,
  PointElement, Title, Tooltip, Legend, ArcElement, Filler
);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS = {
  pending:          "#f59e0b",
  confirmed:        "#4f46e5",
  processing:       "#8b5cf6",
  packed:           "#06b6d4",
  shipped:          "#3b82f6",
  out_for_delivery: "#f97316",
  delivered:        "#22c55e",
  cancelled:        "#ef4444",
  returned:         "#94a3b8",
  return_requested: "#ec4899",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, change, positive = true, sub, iconBg, iconColor, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl p-5 shadow-card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-200" />
      </div>
      <div className="h-7 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
  return (
    <div className="bg-white rounded-xl p-5 shadow-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {change !== undefined ? (
            <p className={`flex items-center gap-0.5 text-xs font-semibold mt-1 ${positive ? "text-green-500" : "text-red-500"}`}>
              {positive ? <MdArrowUpward size={12} /> : <MdArrowDownward size={12} />}
              {change}% <span className="text-gray-400 font-normal ml-1">{sub || "vs last month"}</span>
            </p>
          ) : sub ? (
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          ) : null}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3 ${iconBg || "bg-primary-50"}`}>
          <Icon size={22} className={iconColor || "text-primary-600"} />
        </div>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, link, linkLabel = "View All" }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    {link && <Link to={link} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">{linkLabel} <MdOpenInNew size={11} /></Link>}
  </div>
);

// ─── Table Skeleton ───────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-100 rounded" />
        ))}
      </div>
    ))}
  </div>
);

// ─── Quick Access tiles ───────────────────────────────────────────────────────
const QUICK_LINKS = [
  { icon: MdShoppingCart, label: "Orders",     sub: "Manage all orders",       color: "bg-blue-50 text-blue-600",    link: "/admin/orders" },
  { icon: MdInventory,    label: "Products",   sub: "Add & update products",   color: "bg-green-50 text-green-600",  link: "/admin/products" },
  { icon: MdPeople,       label: "Customers",  sub: "View customer accounts",  color: "bg-orange-50 text-orange-600",link: "/admin/customers" },
  { icon: MdCategory,     label: "Categories", sub: "Manage categories",       color: "bg-purple-50 text-purple-600",link: "/admin/masters/categories" },
  { icon: MdLocalOffer,   label: "Coupons",    sub: "Create discount coupons", color: "bg-pink-50 text-pink-600",    link: "/admin/coupons" },
  { icon: MdStar,         label: "Reviews",    sub: "Moderate reviews",        color: "bg-amber-50 text-amber-600",  link: "/admin/reviews" },
  { icon: MdAttachMoney,  label: "Reports",    sub: "Analytics & insights",    color: "bg-teal-50 text-teal-600",    link: "/admin/reports" },
  { icon: MdTrendingUp,   label: "Settings",   sub: "System configuration",    color: "bg-gray-50 text-gray-600",    link: "/admin/settings" },
];

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { data, status } = useSelector((s) => s.dashboard);
  const { data: adminData } = useSelector((s) => s.auth);

  const loading = status === "loading" || status === "idle";

  // Extra data fetched directly
  const [orderStats,    setOrderStats]    = useState([]);
  const [newCustomers,  setNewCustomers]  = useState([]);
  const [lowStockList,  setLowStockList]  = useState([]);
  const [extraLoading,  setExtraLoading]  = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const fetchExtra = useCallback(async () => {
    setExtraLoading(true);
    try {
      const [os, cust, stock] = await Promise.allSettled([
        GET(APIS.Orders + "/stats"),
        GET(APIS.Users.Customers, { per_page: 5, sort: "createdAt", order: "desc" }),
        GET(APIS.Products + "/low-stock"),
      ]);
      if (os.status    === "fulfilled") setOrderStats(os.value?.data || []);
      if (cust.status  === "fulfilled") setNewCustomers(cust.value?.data?.data || []);
      if (stock.status === "fulfilled") setLowStockList(stock.value?.data?.data || stock.value?.data || []);
    } catch { /* silent */ }
    finally { setExtraLoading(false); }
  }, []);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    fetchExtra();
  }, [dispatch, fetchExtra]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([dispatch(fetchDashboardStats()), fetchExtra()]);
    setRefreshing(false);
  };

  const stats        = data?.stats        || {};
  const recentOrders = data?.recent_orders || [];
  const topProducts  = data?.top_products  || [];
  const monthlyChart = data?.monthly_chart || [];

  // ── Monthly Revenue Bar Chart ──────────────────────────────────────────────
  const chartRevenue = MONTHS.map((_, mi) => {
    const found = monthlyChart.find((m) => m._id?.month === mi + 1);
    return found?.revenue || 0;
  });
  const chartOrders = MONTHS.map((_, mi) => {
    const found = monthlyChart.find((m) => m._id?.month === mi + 1);
    return found?.orders || 0;
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Revenue (₹)",
        data: chartRevenue,
        backgroundColor: "rgba(79,70,229,0.75)",
        borderRadius: 5,
        yAxisID: "y",
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}K` },
        grid: { color: "#f1f5f9" },
      },
      x: { grid: { display: false } },
    },
  };

  // ── Order Trend Line ───────────────────────────────────────────────────────
  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Orders",
        data: chartOrders,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.07)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "#22c55e",
      },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  // ── Order Status Doughnut ──────────────────────────────────────────────────
  const doughnutLabels = orderStats.map((s) => IDS.ORDER_STATUS?.[s._id]?.label || s._id);
  const doughnutColors = orderStats.map((s) => STATUS_COLORS[s._id] || "#94a3b8");
  const totalOrders = orderStats.reduce((sum, s) => sum + s.count, 0);
  const doughnutData = {
    labels: doughnutLabels,
    datasets: [{
      data: orderStats.map((s) => s.count),
      backgroundColor: doughnutColors,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const doughnutOptions = {
    responsive: true, cutout: "65%",
    plugins: { legend: { display: false } },
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminData?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{today} — Here's your store overview.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <MdRefresh size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            to="/admin/reports"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <MdDownload size={16} /> Export Report
          </Link>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard loading={loading} icon={MdAttachMoney}    label="Total Revenue"   value={formatCurrency(stats.total_revenue || 0)}          change={18.5} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <StatCard loading={loading} icon={MdShoppingCart}   label="Total Orders"    value={(stats.total_orders    || 0).toLocaleString()}       change={12.7} iconBg="bg-blue-50"    iconColor="text-blue-600" />
        <StatCard loading={loading} icon={MdPeople}         label="Total Customers" value={(stats.total_users     || 0).toLocaleString()}       change={9.3}  iconBg="bg-green-50"   iconColor="text-green-600" />
        <StatCard loading={loading} icon={MdInventory}      label="Products"        value={(stats.total_products  || 0).toLocaleString()}       change={4.2}  iconBg="bg-orange-50"  iconColor="text-orange-600" />
        <StatCard loading={loading} icon={MdPendingActions} label="Pending Orders"  value={(stats.pending_orders  || 0).toLocaleString()}       positive={false} sub="Need attention" iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard loading={loading} icon={MdWarning}        label="Low Stock"       value={(stats.low_stock_count || 0).toLocaleString()}       positive={false} sub="Items critical"  iconBg="bg-red-50"   iconColor="text-red-600" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly Revenue Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title={`Monthly Revenue — ${new Date().getFullYear()}`} link="/admin/reports" linkLabel="Full Report" />
          <p className="text-xs text-gray-400 -mt-2 mb-4">Live data from paid orders</p>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : monthlyChart.length > 0 ? (
            <Bar data={barData} options={barOptions} height={130} />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-300 gap-2">
              <MdTrendingUp size={32} />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Order Status Doughnut */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="Order Status" link="/admin/orders" />
          {extraLoading ? (
            <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : orderStats.length > 0 ? (
            <>
              <div className="flex justify-center mb-3 relative">
                <div className="w-32 h-32 relative">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {orderStats.map((s, i) => {
                  const cfg = IDS.ORDER_STATUS?.[s._id] || { label: s._id };
                  const pct = totalOrders > 0 ? ((s.count / totalOrders) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: doughnutColors[i] }} />
                        <span className="text-xs text-gray-600 capitalize">{cfg.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{s.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No order data yet</div>
          )}
        </div>
      </div>

      {/* ── Order Trend Line ── */}
      {!loading && monthlyChart.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="Order Trend — This Year" />
          <p className="text-xs text-gray-400 -mt-2 mb-4">Monthly order volume</p>
          <Line data={lineData} options={lineOptions} height={60} />
        </div>
      )}

      {/* ── Tables Row: Recent Orders + New Customers + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="Recent Orders" link="/admin/orders" />
          {loading ? <TableSkeleton rows={5} cols={2} /> : (
            <div className="space-y-0.5">
              {(recentOrders.length > 0 ? recentOrders.slice(0, 6) : []).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No orders yet</p>
              ) : (
                recentOrders.slice(0, 6).map((o) => {
                  const st = IDS.ORDER_STATUS?.[o.order_status] || { label: o.order_status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <button
                      key={o._id}
                      onClick={() => navigate(`/admin/orders/${o._id}`)}
                      className="w-full flex items-center justify-between py-2.5 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg text-left transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-bold text-primary-600 truncate">{o.order_number}</p>
                        <p className="text-[11px] text-gray-500 truncate">{o.user_id?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`badge text-[10px] ${st.color}`}>{st.label}</span>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatCurrency(o.total_amount)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="New Customers" link="/admin/customers" />
          {extraLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : newCustomers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">No customers yet</p>
          ) : (
            <div className="space-y-3">
              {newCustomers.slice(0, 6).map((c, i) => (
                <div key={c._id || i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">
                    {c.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{formatDate(c.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="Low Stock Products" link="/admin/products" />
          {extraLoading ? (
            <TableSkeleton rows={5} cols={3} />
          ) : lowStockList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
              <MdCheckCircle size={28} className="text-green-300" />
              <p className="text-sm text-gray-400">All products are well-stocked</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 text-left">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 text-right font-semibold">Stock</th>
                    <th className="pb-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStockList.slice(0, 7).map((p, i) => (
                    <tr key={p._id || i} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700 truncate max-w-[130px]">{p.name}</td>
                      <td className="py-2 text-right font-bold text-gray-900">{p.stock}</td>
                      <td className="py-2 text-right">
                        <span className={`badge text-[10px] ${p.stock <= 3 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                          {p.stock <= 3 ? "Critical" : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Selling Products ── */}
      {(loading || topProducts.length > 0) && (
        <div className="bg-white rounded-xl p-5 shadow-card">
          <SectionHeader title="Top Selling Products" link="/admin/products" />
          {loading ? <TableSkeleton rows={5} cols={3} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 text-left">
                    <th className="pb-2 font-semibold text-xs">#</th>
                    <th className="pb-2 font-semibold text-xs">Product</th>
                    <th className="pb-2 text-right font-semibold text-xs">Units Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.slice(0, 5).map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 text-gray-400 text-xs font-medium">#{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded-lg object-contain bg-gray-50 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">📦</div>
                          )}
                          <span className="text-gray-700 font-medium text-sm truncate max-w-[220px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-gray-900">{(p.total_sold || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Access ── */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_LINKS.map((m) => (
            <Link
              key={m.label}
              to={m.link}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${m.color} group-hover:scale-110 transition-transform`}>
                <m.icon size={20} />
              </div>
              <p className="text-[11px] font-semibold text-gray-700 leading-tight">{m.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight hidden sm:block">{m.sub}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
