import { useEffect, useState } from "react";
import { GET } from "../../utils/Methods";
import { APIS } from "../../utils/APIS";
import { formatCurrency, formatDate, getImgUrl } from "../../utils/Methods";
import toast from "react-hot-toast";
import {
  MdAttachMoney, MdShoppingCart, MdPeople, MdInventory,
  MdTrendingUp, MdRefresh, MdDownload, MdDateRange,
  MdBarChart, MdStar,
} from "react-icons/md";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  BarElement, PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend, ArcElement);

const TABS = [
  { id: "overview",  label: "Overview",       icon: MdBarChart },
  { id: "sales",     label: "Sales Report",   icon: MdTrendingUp },
  { id: "products",  label: "Top Products",   icon: MdInventory },
  { id: "customers", label: "Customer Report",icon: MdPeople },
];

const Reports = () => {
  const [activeTab, setActiveTab]   = useState("overview");
  const [revenue, setRevenue]       = useState(null);
  const [salesData, setSalesData]   = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [groupBy, setGroupBy]       = useState("day");
  const [startDate, setStartDate]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // ── Fetch All ─────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rev, sales, products] = await Promise.all([
        GET(APIS.Reports.Revenue),
        GET(APIS.Reports.Sales, { start_date: startDate, end_date: endDate, group_by: groupBy }),
        GET(APIS.Reports.TopProducts),
      ]);
      setRevenue(rev?.data || {});
      setSalesData(sales?.data || []);
      setTopProducts(products?.data || []);
    } catch { toast.error("Failed to load reports"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [startDate, endDate, groupBy]);

  // ── Chart Data ────────────────────────────────────────────────────────────
  const labels = salesData.map((d) => String(d._id));
  const lineData = {
    labels,
    datasets: [
      { label: "Revenue (₹)", data: salesData.map((d) => d.revenue || 0), borderColor: "#4f46e5", backgroundColor: "rgba(79,70,229,0.08)", tension: 0.4, fill: true, pointRadius: 4 },
      { label: "Orders",      data: salesData.map((d) => d.orders || 0),  borderColor: "#22c55e", backgroundColor: "transparent", tension: 0.4, borderDash: [5, 5], pointRadius: 3, yAxisID: "y1" },
    ],
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } } },
    scales: {
      y:  { beginAtZero: true, ticks: { callback: (v) => `₹${(v / 1000).toFixed(0)}K` }, grid: { color: "#f1f5f9" } },
      y1: { position: "right", beginAtZero: true, grid: { display: false } },
      x:  { grid: { display: false } },
    },
  };

  const barData = {
    labels: topProducts.slice(0, 10).map((p) => p.name?.slice(0, 15) + "…"),
    datasets: [
      { label: "Units Sold", data: topProducts.slice(0, 10).map((p) => p.total_sold), backgroundColor: "rgba(79,70,229,0.8)", borderRadius: 6 },
    ],
  };
  const barOptions = {
    responsive: true, indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, grid: { color: "#f1f5f9" } }, y: { grid: { display: false } } },
  };

  const exportCSV = () => {
    if (!salesData.length) return;
    const rows = [["Period", "Revenue", "Orders", "Avg Order Value"],
      ...salesData.map((d) => [d._id, d.revenue || 0, d.orders || 0, (d.avg_order_value || 0).toFixed(2)])
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "sales_report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track business performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdDownload size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue",   value: formatCurrency(revenue?.total || 0),   icon: MdAttachMoney, bg: "bg-primary-50",  color: "text-primary-600" },
          { label: "This Month",      value: formatCurrency(revenue?.monthly || 0), icon: MdTrendingUp,  bg: "bg-green-50",    color: "text-green-600" },
          { label: "This Year",       value: formatCurrency(revenue?.yearly || 0),  icon: MdBarChart,    bg: "bg-blue-50",     color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={24} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* ── Overview ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Date filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <MdDateRange size={16} className="text-gray-400" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
                  <span className="text-gray-400 text-xs">to</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
                </div>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="input-field text-sm py-1.5 w-32">
                  <option value="day">Daily</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue & Orders Trend</h3>
                  <Line data={lineData} options={lineOptions} height={90} />
                </div>
              )}
              {/* Summary Table */}
              {salesData.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Detailed Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Period</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Orders</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Revenue</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 text-right">Avg. Order</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {salesData.map((d, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-700">{d._id}</td>
                            <td className="px-4 py-2 text-right text-gray-600">{d.orders}</td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(d.revenue || 0)}</td>
                            <td className="px-4 py-2 text-right text-gray-500">{formatCurrency(d.avg_order_value || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Sales ────────────────────────────────────────────────── */}
          {activeTab === "sales" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <MdDateRange size={16} className="text-gray-400" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
                  <span className="text-gray-400 text-xs">to</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
                </div>
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="input-field text-sm py-1.5 w-32">
                  <option value="day">Daily</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : salesData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No sales data for selected period</div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Orders",   value: salesData.reduce((s, d) => s + (d.orders || 0), 0) },
                      { label: "Total Revenue",  value: formatCurrency(salesData.reduce((s, d) => s + (d.revenue || 0), 0)) },
                      { label: "Avg Order Value",value: formatCurrency(salesData.reduce((s, d) => s + (d.avg_order_value || 0), 0) / (salesData.length || 1)) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Line data={lineData} options={lineOptions} height={100} />
                </>
              )}
            </div>
          )}

          {/* ── Top Products ─────────────────────────────────────────── */}
          {activeTab === "products" && (
            <div className="space-y-5">
              {loading ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">No product data available</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 10 by Units Sold</h3>
                      <Bar data={barData} options={barOptions} height={200} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 5 by Revenue</h3>
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Sold</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Revenue</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {topProducts.slice(0, 10).map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 text-gray-400 font-medium">#{i + 1}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  {p.thumbnail && <img src={getImgUrl(p.thumbnail)} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                                  <span className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-600">{p.total_sold}</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(p.revenue || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Customer Report ──────────────────────────────────────── */}
          {activeTab === "customers" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <MdDateRange size={16} className="text-gray-400" />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
                <span className="text-gray-400">to</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm py-1.5 w-36" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Data Points", value: salesData.length, color: "text-primary-600", bg: "bg-primary-50" },
                  { label: "Best Day Revenue",  value: formatCurrency(Math.max(...salesData.map((d) => d.revenue || 0), 0)), color: "text-green-600", bg: "bg-green-50" },
                  { label: "Total Orders",      value: salesData.reduce((s, d) => s + (d.orders || 0), 0), color: "text-blue-600", bg: "bg-blue-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl p-5 ${bg}`}>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-sm text-gray-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 text-center pt-4">
                Detailed customer analytics requires additional server-side aggregation. Connect with the analytics API for full reports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
