import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, fetchOrderStats } from "../../features/orders/orderSlice";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import { IDS } from "../../utils/IDS";
import { formatCurrency, formatDateTime, formatDate } from "../../utils/Methods";
import {
  MdSearch, MdVisibility, MdShoppingCart, MdCheckCircle,
  MdLocalShipping, MdPending, MdCancel, MdRefresh,
  MdFilterList, MdDownload, MdDateRange,
} from "react-icons/md";

const STATUS_TABS = [
  { key: "",                label: "All",           color: "text-gray-600" },
  { key: "pending",         label: "Pending",       color: "text-yellow-600" },
  { key: "confirmed",       label: "Confirmed",     color: "text-blue-600" },
  { key: "processing",      label: "Processing",    color: "text-purple-600" },
  { key: "shipped",         label: "Shipped",       color: "text-cyan-600" },
  { key: "out_for_delivery",label: "Out for Delivery",color: "text-orange-600" },
  { key: "delivered",       label: "Delivered",     color: "text-green-600" },
  { key: "cancelled",       label: "Cancelled",     color: "text-red-600" },
  { key: "returned",        label: "Returned",      color: "text-gray-600" },
];

const exportCSV = (list) => {
  if (!list.length) return;
  const headers = ["Order#","Customer","Email","Amount","Payment","Status","Date"];
  const rows = list.map((o) => [
    o.order_number,
    o.user_id?.name || "",
    o.user_id?.email || "",
    o.total_amount,
    o.payment_status,
    o.order_status,
    formatDate(o.createdAt),
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "orders.csv"; a.click();
  URL.revokeObjectURL(url);
};

const Orders = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { list, total, current_page, total_pages, status, stats } =
    useSelector((s) => s.order);
  const loading = status === "loading";

  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [page, setPage]                 = useState(1);

  // ── Load ──────────────────────────────────────────────────────────────────
  const buildParams = (p = page) => {
    const params = { page: p, per_page: 10 };
    if (search)        params.search         = search;
    if (activeTab)     params.order_status   = activeTab;
    if (paymentFilter) params.payment_status = paymentFilter;
    if (startDate)     params.start_date     = startDate;
    if (endDate)       params.end_date       = endDate;
    return params;
  };

  const load = (p = page) => dispatch(fetchOrders(buildParams(p)));

  useEffect(() => {
    dispatch(fetchOrderStats());
  }, [dispatch]);

  useEffect(() => { load(page); }, [page, activeTab, paymentFilter, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const clearFilters = () => {
    setSearch(""); setActiveTab(""); setPaymentFilter("");
    setStartDate(""); setEndDate(""); setPage(1);
  };
  const hasFilter = search || activeTab || paymentFilter || startDate || endDate;

  // ── Stats from API ────────────────────────────────────────────────────────
  const getStatCount = (statusKey) => {
    const found = stats.find((s) => s._id === statusKey);
    return found?.count || 0;
  };
  const getStatRevenue = (statusKey) => {
    const found = stats.find((s) => s._id === statusKey);
    return found?.revenue || 0;
  };
  const totalRevenue  = stats.reduce((sum, s) => sum + (s.revenue || 0), 0);
  const totalOrders   = stats.reduce((sum, s) => sum + (s.count || 0), 0);
  const deliveredCnt  = getStatCount("delivered");
  const pendingCnt    = getStatCount("pending") + getStatCount("confirmed") + getStatCount("processing");
  const cancelledCnt  = getStatCount("cancelled");
  const shippedCnt    = getStatCount("shipped") + getStatCount("out_for_delivery");

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "order_number", label: "Order ID",
      render: (v) => (
        <span className="font-mono text-sm font-bold text-primary-600 tracking-wide">{v}</span>
      ),
    },
    {
      key: "user_id", label: "Customer",
      render: (v) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{v?.name || "—"}</p>
          <p className="text-xs text-gray-400">{v?.email || ""}</p>
        </div>
      ),
    },
    {
      key: "items", label: "Items",
      render: (v) => (
        <span className="text-sm text-gray-600">{v?.length || 0} item{v?.length !== 1 ? "s" : ""}</span>
      ),
    },
    {
      key: "total_amount", label: "Amount",
      render: (v) => <span className="font-bold text-gray-900 text-sm">{formatCurrency(v)}</span>,
    },
    {
      key: "payment_method", label: "Payment",
      render: (v, row) => (
        <div>
          <span className="uppercase text-xs font-semibold text-gray-700">{v}</span>
          <br />
          <span className={`badge text-[10px] mt-0.5 ${
            row.payment_status === "paid" || row.payment_status === "cod"
              ? "bg-green-100 text-green-700"
              : row.payment_status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
            {row.payment_status}
          </span>
        </div>
      ),
    },
    {
      key: "order_status", label: "Status",
      render: (v) => {
        const cfg = IDS.ORDER_STATUS[v] || { label: v, color: "bg-gray-100 text-gray-700" };
        return <span className={`badge ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: "createdAt", label: "Date",
      render: (v) => <span className="text-xs text-gray-400">{formatDateTime(v)}</span>,
    },
    {
      key: "actions", label: "",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/admin/orders/${row._id}`)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <MdVisibility size={14} /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { dispatch(fetchOrderStats()); load(page); }}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button onClick={() => exportCSV(list)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <MdDownload size={16} /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: formatCurrency(totalRevenue),  icon: MdShoppingCart,  bg: "bg-primary-50", color: "text-primary-600" },
          { label: "Total Orders",   value: totalOrders,                   icon: MdShoppingCart,  bg: "bg-blue-50",    color: "text-blue-600" },
          { label: "Delivered",      value: deliveredCnt,                  icon: MdCheckCircle,   bg: "bg-green-50",   color: "text-green-600" },
          { label: "In Transit",     value: shippedCnt,                    icon: MdLocalShipping, bg: "bg-cyan-50",    color: "text-cyan-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">

        {/* Status Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const cnt = tab.key ? getStatCount(tab.key) : totalOrders;
            return (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? `border-primary-600 ${tab.color}`
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {tab.label}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
                }`}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-50 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..." className="input-field pl-9 w-56 text-sm py-2" />
          </div>

          {/* Payment filter */}
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36">
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cod">COD</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <MdDateRange size={16} className="text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="input-field text-sm py-1.5 w-36" />
          </div>

          {hasFilter && (
            <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">Clear All</button>
          )}
          <div className="ml-auto text-xs text-gray-400">
            Total: <span className="font-semibold text-gray-700">{total}</span>
          </div>
        </div>

        <DataTable
          columns={columns} data={list} loading={loading}
          currentPage={current_page} totalPages={total_pages} total={total} perPage={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

    </div>
  );
};

export default Orders;
