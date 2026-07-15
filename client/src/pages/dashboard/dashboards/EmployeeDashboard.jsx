import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { GET, formatDate } from "../../../utils/Methods";
import { APIS } from "../../../utils/APIS";
import { IDS } from "../../../utils/IDS";
import {
  MdShoppingCart, MdLocalShipping, MdDoneAll, MdUndo,
  MdCheckBox, MdCheckBoxOutlineBlank, MdMoreVert,
  MdRefresh, MdWarning, MdAssignment,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement
);

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLORS = {
  processing:       "#f59e0b",
  packed:           "#4f46e5",
  shipped:          "#3b82f6",
  delivered:        "#22c55e",
  cancelled:        "#ef4444",
  pending:          "#94a3b8",
  confirmed:        "#06b6d4",
  out_for_delivery: "#f97316",
  return_requested: "#ec4899",
  returned:         "#64748b",
};

const prioColor = {
  High:   "bg-red-100 text-red-600",
  Medium: "bg-orange-100 text-orange-600",
  Low:    "bg-green-100 text-green-600",
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, iconBg, color, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl p-5 shadow-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-7 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gray-200 flex-shrink-0 ml-3" />
      </div>
    </div>
  );
  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeDashboard = () => {
  const { data: adminData } = useSelector((s) => s.auth);

  const [empData,    setEmpData]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch employee-scoped dashboard data ─────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GET(APIS.EmployeeDashboard);
      setEmpData(res?.data || null);
    } catch (err) {
      console.error("Employee dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  // ── Destructure response ──────────────────────────────────────────────────
  const stats        = empData?.stats         || {};
  const statusStats  = empData?.status_stats  || [];
  const recentOrders = empData?.recent_orders || [];
  const topProducts  = empData?.top_products  || [];
  const weeklyChart  = empData?.weekly_chart  || [];

  // ── Doughnut data from status_stats ──────────────────────────────────────
  const totalDist = statusStats.reduce((s, x) => s + (x.count || 0), 0) || 0;
  const orderDist = statusStats.map((s) => ({
    label: IDS.ORDER_STATUS[s._id]?.label || s._id,
    value: s.count || 0,
    pct:   totalDist > 0 ? +((s.count / totalDist) * 100).toFixed(1) : 0,
    color: STATUS_COLORS[s._id] || "#94a3b8",
  }));

  const doughnutData = {
    labels: orderDist.map((o) => o.label),
    datasets: [{
      data:            orderDist.map((o) => o.value),
      backgroundColor: orderDist.map((o) => o.color),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const doughnutOptions = {
    responsive: true,
    cutout: "65%",
    plugins: { legend: { display: false } },
  };

  // ── Line chart from weekly_chart (day-of-week counts) ─────────────────────
  // MongoDB $dayOfWeek: 1=Sun … 7=Sat — remap to Mon(0)…Sun(6)
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = new Array(7).fill(0);
  weeklyChart.forEach((w) => {
    const dow = w._id; // 1=Sun … 7=Sat
    const idx = dow === 1 ? 6 : dow - 2; // Sun→6, Mon→0, Tue→1 ...
    if (idx >= 0 && idx < 7) dayCounts[idx] = w.count || 0;
  });

  const lineData = {
    labels: DAYS,
    datasets: [{
      label:               "My Orders",
      data:                dayCounts,
      borderColor:         "#4f46e5",
      tension:             0.4,
      fill:                false,
      pointRadius:         4,
      pointBackgroundColor:"#4f46e5",
    }],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f8fafc" } },
      x: { grid: { display: false } },
    },
  };

  // ── Date range label ──────────────────────────────────────────────────────
  const today   = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  const dateRangeLabel = `${weekAgo.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} – ${today.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;

  // ── Announcements (static, no API yet) ───────────────────────────────────
  const announcements = [
    { icon: "📋", title: "New Shipping Policy",  msg: "Please follow the new shipping guidelines effective from the start of this month.", time: "2 hours ago", color: "bg-blue-100 text-blue-700" },
    { icon: "🔧", title: "System Maintenance",   msg: "System will be under maintenance this Sunday from 12:00 AM to 2:00 AM.",           time: "1 day ago",  color: "bg-yellow-100 text-yellow-700" },
    { icon: "🏆", title: "Performance Update",   msg: "Great job! The team has achieved 98% order processing accuracy this week.",         time: "2 days ago", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminData?.name?.split(" ")[0] || "Employee"}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <MdRefresh size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
          <span className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
            📅 {dateRangeLabel}
          </span>
        </div>
      </div>

      {/* ── Stats (scoped to this employee's assigned orders only) ─────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          loading={loading}
          icon={MdAssignment}
          label="Assigned Orders"
          value={stats.total_assigned}
          sub="Total assigned to me"
          iconBg="bg-primary-50"
          color="text-primary-600"
        />
        <StatCard
          loading={loading}
          icon={MdShoppingCart}
          label="Pending Orders"
          value={stats.pending_orders}
          sub="Awaiting my action"
          iconBg="bg-orange-50"
          color="text-orange-600"
        />
        <StatCard
          loading={loading}
          icon={MdDoneAll}
          label="Today's Orders"
          value={stats.today_orders}
          sub="Assigned today"
          iconBg="bg-green-50"
          color="text-green-600"
        />
        <StatCard
          loading={loading}
          icon={MdLocalShipping}
          label="Delivered"
          value={stats.delivered_orders}
          sub="Completed by me"
          iconBg="bg-blue-50"
          color="text-blue-600"
        />
        <StatCard
          loading={loading}
          icon={MdUndo}
          label="Return Requests"
          value={stats.return_requests}
          sub="Needs review"
          iconBg="bg-red-50"
          color="text-red-600"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Line Chart — my assigned orders this week */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Orders Overview</h3>
            <span className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500">This Week</span>
          </div>
          {loading ? (
            <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <Line data={lineData} options={lineOptions} height={160} />
          )}
        </div>

        {/* Doughnut — distribution of my assigned orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-800 mb-4">My Order Status Distribution</h3>
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : orderDist.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 flex-shrink-0">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-bold text-gray-900">{totalDist}</p>
                  <p className="text-[10px] text-gray-400">Assigned</p>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                {orderDist.map((o) => (
                  <div key={o.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: o.color }} />
                      <span className="text-xs text-gray-600">{o.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{o.value} ({o.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No orders assigned yet</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Announcements</h3>
            <Link to="/admin/notifications" className="text-xs text-primary-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${a.color}`}>
                  {a.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── My Assigned Orders + Tasks + Top Products ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* My Assigned Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Assigned Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-100 rounded w-2/3" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((o) => {
                const st = IDS.ORDER_STATUS[o.order_status] || { label: o.order_status, color: "bg-gray-100 text-gray-700" };
                return (
                  <div key={o._id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs flex-shrink-0">📦</div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-primary-600">
                          #{o.order_number || String(o._id).slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {o.user_id?.name || "Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`badge text-[10px] ${st.color}`}>{st.label}</span>
                      <Link to="/admin/orders" className="text-gray-400 hover:text-gray-600" title="View Orders">
                        <MdMoreVert size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No orders assigned to you yet</p>
          )}
        </div>

        {/* My Tasks — derived from my assigned pending/processing orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Tasks</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">
              View Pending
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (() => {
            const taskOrders = recentOrders
              .filter((o) => ["pending", "confirmed", "processing", "packed"].includes(o.order_status))
              .slice(0, 4);

            if (taskOrders.length === 0) {
              return <p className="text-xs text-gray-400 text-center py-6">No pending tasks 🎉</p>;
            }

            return (
              <div className="space-y-3">
                {taskOrders.map((o, idx) => {
                  const isDone   = o.order_status === "packed";
                  const taskLabel =
                    o.order_status === "pending"    ? `Confirm Order #${o.order_number || String(o._id).slice(-6).toUpperCase()}` :
                    o.order_status === "confirmed"  ? `Process Order #${o.order_number || String(o._id).slice(-6).toUpperCase()}` :
                    o.order_status === "processing" ? `Pack Order #${o.order_number    || String(o._id).slice(-6).toUpperCase()}` :
                                                     `Ship Order #${o.order_number     || String(o._id).slice(-6).toUpperCase()}`;
                  const priority = idx === 0 ? "High" : idx === 1 ? "High" : idx === 2 ? "Medium" : "Low";
                  return (
                    <div key={o._id} className="flex items-start gap-2">
                      {isDone
                        ? <MdCheckBox size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                        : <MdCheckBoxOutlineBlank size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {taskLabel}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-gray-400">{formatDate(o.createdAt)}</p>
                          <span className={`badge text-[9px] ${prioColor[priority]}`}>{priority} Priority</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Top Products to Ship (from my assigned orders) */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Products to Ship</h3>
            <Link to="/admin/inventory" className="text-xs text-primary-600 hover:underline">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
            </div>
          ) : topProducts.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 text-left">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.slice(0, 5).map((p, idx) => {
                  const priority = idx < 2 ? "High" : idx < 4 ? "Medium" : "Low";
                  return (
                    <tr key={p._id || idx} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700 truncate max-w-[120px]">
                        {p.name || "—"}
                      </td>
                      <td className="py-2 text-right text-gray-600">{p.total_sold}</td>
                      <td className="py-2 text-right">
                        <span className={`badge text-[10px] ${prioColor[priority]}`}>{priority}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No product data</p>
          )}
        </div>
      </div>

      {/* ── Bottom Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Assigned Orders",   value: loading ? null : stats.total_assigned,   sub: "Total assigned to me"   },
          { label: "Pending",           value: loading ? null : stats.pending_orders,   sub: "Awaiting my action"     },
          { label: "Delivered",         value: loading ? null : stats.delivered_orders, sub: "Completed by me"        },
          { label: "Return Requests",   value: loading ? null : stats.return_requests,  sub: "Needs review"           },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MdDoneAll size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              {loading
                ? <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                : <p className="text-xl font-bold text-gray-900">{s.value ?? "—"}</p>
              }
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default EmployeeDashboard;
