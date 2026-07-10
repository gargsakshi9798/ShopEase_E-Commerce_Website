import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchDashboardStats } from "../../../features/dashboard/dashboardSlice";
import { formatCurrency, formatDate } from "../../../utils/Methods";
import { IDS } from "../../../utils/IDS";
import {
  MdAttachMoney, MdShoppingCart, MdPeople, MdInventory,
  MdArrowUpward, MdDownload, MdPendingActions, MdWarning,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const StatCard = ({ icon: Icon, label, value, change, sub, color, iconBg }) => (
  <div className="bg-white rounded-xl p-5 shadow-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className="flex items-center gap-0.5 text-green-500 text-xs font-semibold mt-1">
            <MdArrowUpward size={12} />{change}% <span className="text-gray-400 font-normal ml-1">{sub}</span>
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg || "bg-primary-50"}`}>
        <Icon size={22} className={color || "text-primary-600"} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((s) => s.dashboard);
  const { data: adminData } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchDashboardStats()); }, [dispatch]);

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const topProducts  = data?.top_products  || [];

  const lineData = {
    labels: DAYS,
    datasets: [
      { label: "This Week", data: [35000, 52000, 45000, 68000, 72000, 90000, 82000], borderColor: "#4f46e5", backgroundColor: "rgba(79,70,229,0.06)", tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#4f46e5" },
      { label: "Last Week", data: [28000, 40000, 36000, 52000, 58000, 72000, 66000], borderColor: "#c7d2fe", backgroundColor: "transparent", tension: 0.4, borderDash: [5,5], pointRadius: 0 },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f8fafc" }, ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}K` } },
      x: { grid: { display: false } },
    },
  };

  const orderStatus = [
    { label: "Delivered",  value: 685, pct: 55, color: "#22c55e" },
    { label: "Processing", value: 280, pct: 22, color: "#4f46e5" },
    { label: "Shipped",    value: 165, pct: 13, color: "#f59e0b" },
    { label: "Cancelled",  value: 75,  pct: 6,  color: "#ef4444" },
    { label: "Returned",   value: 40,  pct: 4,  color: "#94a3b8" },
  ];
  const doughnutData = {
    labels: orderStatus.map((o) => o.label),
    datasets: [{ data: orderStatus.map((o) => o.pct), backgroundColor: orderStatus.map((o) => o.color), borderWidth: 0, hoverOffset: 6 }],
  };
  const doughnutOptions = {
    responsive: true, cutout: "65%",
    plugins: { legend: { display: false } },
  };

  const newCustomers = [
    { name: "Anjali Mehta", email: "anjali@email.com", joined: "26 May, 2026", avatar: "A" },
    { name: "Vikram Joshi", email: "vikram@email.com", joined: "26 May, 2026", avatar: "V" },
    { name: "Simran Kaur",  email: "simran@email.com", joined: "25 May, 2026", avatar: "S" },
    { name: "Deepak Yadav", email: "deepak@email.com", joined: "25 May, 2026", avatar: "D" },
    { name: "Pooja Sharma", email: "pooja@email.com",  joined: "25 May, 2026", avatar: "P" },
  ];

  const lowStock = [
    { name: "Boat Rockerz 450 Pro", stock: 5  },
    { name: "Nike Air Max Sneakers", stock: 8  },
    { name: "HP Pavilion 15 Laptop", stock: 3  },
    { name: "Men's Casual Blue Shirt", stock: 7 },
    { name: "boAt Airdopes 141",     stock: 4  },
  ];

  const modules = [
    { icon: MdPeople,      label: "User Management",    sub: "Manage all users and assign roles",        color: "bg-blue-50 text-blue-600",   link: "/admin/customers" },
    { icon: MdInventory,   label: "Product Management", sub: "Add, update and manage products",           color: "bg-green-50 text-green-600",  link: "/admin/products" },
    { icon: MdShoppingCart,label: "Order Management",   sub: "View and manage all customer orders",       color: "bg-orange-50 text-orange-600",link: "/admin/orders" },
    { icon: MdAttachMoney, label: "Report & Analytics", sub: "Track sales and business performance",      color: "bg-pink-50 text-pink-600",    link: "/admin/reports" },
    { icon: MdPendingActions,label:"System Settings",   sub: "Configure system preferences",              color: "bg-purple-50 text-purple-600",link: "/admin/settings" },
    { icon: MdWarning,     label: "Coupons & Offers",   sub: "Create and manage discount coupons",       color: "bg-red-50 text-red-600",      link: "/admin/coupons" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminData?.name?.split(" ")[0] || "Admin"}! 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            📅 20 May – 26 May 2026
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">
            <MdDownload size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { icon: MdAttachMoney, label: "Total Sales",       value: formatCurrency(stats.total_revenue || 2458350), change: "18.5", sub: "vs last month", iconBg: "bg-primary-50", color: "text-primary-600" },
          { icon: MdShoppingCart,label: "Total Orders",      value: (stats.total_orders || 1245).toLocaleString(),  change: "12.7", sub: "vs last month", iconBg: "bg-blue-50",    color: "text-blue-600" },
          { icon: MdPeople,      label: "Total Customers",   value: (stats.total_users || 8652).toLocaleString(),   change: "9.3",  sub: "vs last month", iconBg: "bg-green-50",   color: "text-green-600" },
          { icon: MdPendingActions,label:"Pending Orders",   value: (stats.pending_orders || 85).toLocaleString(), change: "5.6",  sub: "vs yesterday",  iconBg: "bg-orange-50",  color: "text-orange-600" },
          { icon: MdWarning,     label: "Return Requests",   value: "18",                                           change: "2.4",  sub: "vs yesterday",  iconBg: "bg-red-50",     color: "text-red-600" },
          { icon: MdAttachMoney, label: "Total Revenue",     value: formatCurrency(stats.total_revenue || 2458350), change: "18.5", sub: "vs last month", iconBg: "bg-purple-50",  color: "text-purple-600" },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Line */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Sales Overview</h3>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none">
              <option>This Week</option>
            </select>
          </div>
          <Line data={lineData} options={lineOptions} height={140} />
        </div>

        {/* Orders Doughnut */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Orders Status</h3>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none">
              <option>This Week</option>
            </select>
          </div>
          <div className="flex justify-center mb-4 relative">
            <div className="w-36 h-36 relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-900">1,245</p>
                <p className="text-[10px] text-gray-400">Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {orderStatus.map((o) => (
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

        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-400 border-b border-gray-100"><th className="pb-2 text-left font-semibold">Product</th><th className="pb-2 text-right font-semibold">Sold</th><th className="pb-2 text-right font-semibold">Revenue</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(topProducts.length > 0 ? topProducts : [
                { name:"Boat Rockerz 450 Pro Headphone", total_sold:850 },
                { name:"Nike Air Max Sneakers", total_sold:620 },
                { name:"Men's Casual Blue Shirt", total_sold:520 },
                { name:"Fire-Boltt Phoenix Pro Smartwatch", total_sold:410 },
                { name:"HP Pavilion 15 Laptop", total_sold:390 },
              ]).map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-700 truncate max-w-[130px]">{p.name}</td>
                  <td className="py-2 text-right text-gray-600">{p.total_sold}</td>
                  <td className="py-2 text-right font-semibold text-gray-800">{formatCurrency((p.total_sold || 0) * 999)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders + New Customers + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-400 border-b border-gray-100 text-left"><th className="pb-2">Order ID</th><th className="pb-2">Customer</th><th className="pb-2">Date</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(recentOrders.length > 0 ? recentOrders.slice(0,5) : [
                { order_number:"#ORD12345", user_id:{name:"Rohit Sharma"}, total_amount:2499, order_status:"delivered", createdAt: new Date() },
                { order_number:"#ORD12344", user_id:{name:"Priya Verma"}, total_amount:1899, order_status:"processing", createdAt: new Date() },
                { order_number:"#ORD12343", user_id:{name:"Amit Kumar"}, total_amount:4599, order_status:"shipped", createdAt: new Date() },
                { order_number:"#ORD12342", user_id:{name:"Neha Singh"}, total_amount:999, order_status:"cancelled", createdAt: new Date() },
                { order_number:"#ORD12341", user_id:{name:"Karan Patel"}, total_amount:3299, order_status:"delivered", createdAt: new Date() },
              ]).map((o, i) => {
                const st = IDS.ORDER_STATUS[o.order_status] || { label: o.order_status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 font-mono text-primary-600 font-semibold">{o.order_number}</td>
                    <td className="py-2 text-gray-700">{o.user_id?.name}</td>
                    <td className="py-2 text-gray-400">{formatDate(o.createdAt)}</td>
                    <td className="py-2 font-semibold text-gray-800">{formatCurrency(o.total_amount)}</td>
                    <td className="py-2"><span className={`badge text-[10px] ${st.color}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">New Customers</h3>
            <Link to="/admin/customers" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {newCustomers.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">{c.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email}</p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">{c.joined}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Low Stock Products</h3>
            <Link to="/admin/inventory" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-400 border-b border-gray-100 text-left"><th className="pb-2">Product</th><th className="pb-2 text-right">Stock</th><th className="pb-2 text-right">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {lowStock.map((p) => (
                <tr key={p.name} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-700 truncate max-w-[130px]">{p.name}</td>
                  <td className="py-2 text-right text-gray-600">{p.stock}</td>
                  <td className="py-2 text-right"><span className={`badge text-[10px] ${p.stock <= 4 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>{p.stock <= 4 ? "Critical" : "Low Stock"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {modules.map((m) => (
            <Link key={m.label} to={m.link} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.color}`}>
                <m.icon size={22} />
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{m.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{m.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
