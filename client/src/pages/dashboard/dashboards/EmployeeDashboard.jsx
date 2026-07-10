import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IDS } from "../../../utils/IDS";
import { formatCurrency } from "../../../utils/Methods";
import {
  MdShoppingCart, MdLocalShipping, MdDoneAll, MdUndo,
  MdArrowUpward, MdCheckBox, MdCheckBoxOutlineBlank, MdMoreVert,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const StatCard = ({ icon: Icon, label, value, sub, iconBg, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => {
  const { data: adminData } = useSelector((s) => s.auth);

  const lineData = {
    labels: DAYS,
    datasets: [
      { label: "Assigned",  data: [8,12,6,15,10,18,14], borderColor: "#4f46e5", tension: 0.4, fill: false, pointRadius: 4, pointBackgroundColor: "#4f46e5" },
      { label: "Completed", data: [6,10,5,12,8,15,11],  borderColor: "#22c55e", tension: 0.4, fill: false, pointRadius: 4, pointBackgroundColor: "#22c55e" },
      { label: "Shipped",   data: [4,8,4,9,6,12,9],     borderColor: "#3b82f6", tension: 0.4, fill: false, pointRadius: 4, pointBackgroundColor: "#3b82f6" },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: { y: { beginAtZero: true, grid: { color: "#f8fafc" } }, x: { grid: { display: false } } },
  };

  const doughnutData = {
    labels: ["Processing","Ready to Ship","Shipped","Delivered","Cancelled"],
    datasets: [{ data: [35.6,24.4,26.7,8.9,4.4], backgroundColor: ["#f59e0b","#4f46e5","#3b82f6","#22c55e","#ef4444"], borderWidth: 0, hoverOffset: 6 }],
  };
  const doughnutOptions = { responsive: true, cutout: "65%", plugins: { legend: { display: false } } };

  const orderDist = [
    { label: "Processing",    value: 16, pct: 35.6, color: "#f59e0b" },
    { label: "Ready to Ship", value: 11, pct: 24.4, color: "#4f46e5" },
    { label: "Shipped",       value: 12, pct: 26.7, color: "#3b82f6" },
    { label: "Delivered",     value: 4,  pct: 8.9,  color: "#22c55e" },
    { label: "Cancelled",     value: 2,  pct: 4.4,  color: "#ef4444" },
  ];

  const myOrders = [
    { id:"#ORD12345", customer:"Rohi Sharma",  product:"Boat Rockerz 450", status:"processing",     priority:"High" },
    { id:"#ORD12344", customer:"Priya Verma",  product:"Nike Air Max",     status:"processing",     priority:"High" },
    { id:"#ORD12343", customer:"Amit Kumar",   product:"HP Pavilion 15",   status:"out_for_delivery",priority:"Medium" },
    { id:"#ORD12342", customer:"Neha Singh",   product:"Men's Casual Shirt",status:"shipped",        priority:"Medium" },
    { id:"#ORD12341", customer:"Karan Patel",  product:"Fire-Boltt Phoenix",status:"processing",     priority:"Low" },
  ];

  const myTasks = [
    { label:"Process Order #ORD12345", due:"Due in 30 mins", priority:"High",   done: false },
    { label:"Pack Order #ORD12344",    due:"Due in 1 hour",  priority:"Medium",  done: false },
    { label:"Update Shipment #ORD12343",due:"Due in 2 hours",priority:"Medium",  done: false },
    { label:"Verify Return Request #RET123",due:"Due in 1 day",priority:"Low",   done: true  },
  ];

  const toShip = [
    { name:"Boat Rockerz 450", toShip:8, priority:"High" },
    { name:"Nike Air Max Sneakers", toShip:6, priority:"High" },
    { name:"HP Pavilion 15 Laptop", toShip:5, priority:"Medium" },
    { name:"Men's Casual Blue Shirt", toShip:4, priority:"Medium" },
    { name:"boAt Airdopes 141", toShip:3, priority:"Low" },
  ];

  const announcements = [
    { icon:"📋", title:"New Shipping Policy", msg:"Please follow the new shipping guidelines effective from 25 May 2026.", time:"2 hours ago", color:"bg-blue-100 text-blue-700" },
    { icon:"🔧", title:"System Maintenance",  msg:"System will be under maintenance on 28 May 2026 from 12:00 AM to 2:00 AM.", time:"1 day ago", color:"bg-yellow-100 text-yellow-700" },
    { icon:"🏆", title:"Performance Update",  msg:"Great job! Your team has achieved 98% order processing this week.", time:"2 days ago", color:"bg-green-100 text-green-700" },
  ];

  const prioColor = { High: "bg-red-100 text-red-600", Medium: "bg-orange-100 text-orange-600", Low: "bg-green-100 text-green-600" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminData?.name?.split(" ")[0] || "Sakshi"}! 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening in your workspace today.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          📅 20 May – 26 May 2026
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={MdShoppingCart}    label="Assigned Orders"  value="12" sub="To be processed"  iconBg="bg-primary-50" color="text-primary-600" />
        <StatCard icon={MdLocalShipping}   label="Orders Processing"value="7"  sub="In progress"      iconBg="bg-orange-50"  color="text-orange-600" />
        <StatCard icon={MdDoneAll}         label="Ready to Ship"    value="5"  sub="Ready for pickup"  iconBg="bg-green-50"   color="text-green-600" />
        <StatCard icon={MdLocalShipping}   label="Shipped Orders"   value="18" sub="This week"         iconBg="bg-blue-50"    color="text-blue-600" />
        <StatCard icon={MdUndo}            label="Returns"          value="3"  sub="Return requests"   iconBg="bg-red-50"     color="text-red-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Orders Overview</h3>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"><option>This Week</option></select>
          </div>
          <Line data={lineData} options={lineOptions} height={160} />
        </div>

        {/* Doughnut */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 flex-shrink-0">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-900">45</p>
                <p className="text-[10px] text-gray-400">Total</p>
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
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Announcements</h3>
            <button className="text-xs text-primary-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${a.color}`}>{a.icon}</div>
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

      {/* My Orders + Tasks + Top to Ship */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Assigned Orders */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Assigned Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {myOrders.map((o) => {
              const st = IDS.ORDER_STATUS[o.status] || { label: o.status, color: "bg-gray-100 text-gray-700" };
              return (
                <div key={o.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs flex-shrink-0">📦</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary-600">{o.id}</p>
                      <p className="text-[11px] text-gray-500 truncate">{o.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`badge text-[10px] ${st.color}`}>{st.label}</span>
                    <button className="text-gray-400 hover:text-gray-600"><MdMoreVert size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Tasks</h3>
            <button className="text-xs text-primary-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {myTasks.map((t) => (
              <div key={t.label} className="flex items-start gap-2">
                {t.done
                  ? <MdCheckBox size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                  : <MdCheckBoxOutlineBlank size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${t.done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-gray-400">{t.due}</p>
                    <span className={`badge text-[9px] ${prioColor[t.priority]}`}>{t.priority} Priority</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products to Ship */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Products to Ship</h3>
            <button className="text-xs text-primary-600 hover:underline">View All</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="text-gray-400 border-b border-gray-100 text-left"><th className="pb-2">Product</th><th className="pb-2 text-right">To Ship</th><th className="pb-2 text-right">Priority</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {toShip.map((p) => (
                <tr key={p.name} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-700 truncate max-w-[120px]">{p.name}</td>
                  <td className="py-2 text-right text-gray-600">{p.toShip}</td>
                  <td className="py-2 text-right"><span className={`badge text-[10px] ${prioColor[p.priority]}`}>{p.priority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Average Processing Time", value: "2.4 hrs", sub: "This Week" },
          { label: "Order Accuracy",           value: "98.6%",  sub: "This Week" },
          { label: "Orders Completed",         value: "23",     sub: "This Week" },
          { label: "Customer Satisfaction",    value: "4.7 / 5",sub: "This Week" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <MdDoneAll size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
