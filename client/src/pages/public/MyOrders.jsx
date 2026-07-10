import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  MdShoppingBag, MdArrowForward, MdSearchOff,
  MdLocalShipping, MdCheckCircle, MdCancel,
  MdPendingActions, MdRefresh,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import { fetchMyOrders } from "../../features/public/publicOrderSlice";
import { formatDate, formatCurrency } from "../../utils/Methods";

// ── Status badge helper ───────────────────────────────────────────────────────
const statusConfig = {
  pending:    { label: "Pending",    icon: MdPendingActions, color: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed:  { label: "Confirmed",  icon: MdCheckCircle,    color: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Processing", icon: MdRefresh,        color: "bg-purple-50 text-purple-700 border-purple-200" },
  shipped:    { label: "Shipped",    icon: MdLocalShipping,  color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered:  { label: "Delivered",  icon: MdCheckCircle,    color: "bg-green-50 text-green-700 border-green-200" },
  cancelled:  { label: "Cancelled",  icon: MdCancel,         color: "bg-red-50 text-red-600 border-red-200" },
  returned:   { label: "Returned",   icon: MdRefresh,        color: "bg-gray-100 text-gray-600 border-gray-200" },
};

const StatusBadge = ({ status }) => {
  const cfg  = statusConfig[status?.toLowerCase()] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, total, status } = useSelector((s) => s.publicOrder);

  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const params = { page, per_page: PER_PAGE };
    if (activeFilter !== "All") params.order_status = activeFilter.toLowerCase();
    dispatch(fetchMyOrders(params));
  }, [dispatch, page, activeFilter]);

  const handleFilterChange = (f) => {
    setActiveFilter(f);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <MdShoppingBag size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
            <p className="text-xs text-gray-400">Track and manage your orders</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeFilter === f
                    ? "bg-primary-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {status !== "loading" && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <MdSearchOff size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No orders found</p>
            <p className="text-sm text-gray-400">
              {activeFilter !== "All" ? `No ${activeFilter.toLowerCase()} orders` : "You haven't placed any orders yet"}
            </p>
            <Link
              to="/fashion"
              className="mt-1 text-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order cards */}
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order</p>
                <p className="text-sm font-bold text-gray-800 font-mono">
                  {order.order_number ? `#${order.order_number}` : `#${order._id?.slice(-8).toUpperCase()}`}
                </p>
              </div>
              <StatusBadge status={order.order_status || order.status} />
            </div>

            {/* Items preview */}
            {order.items?.slice(0, 2).map((item) => (
              <div key={item._id ?? item.product_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {(item.product_image || item.image) ? (
                    <img
                      src={item.product_image || item.image}
                      alt={item.product_name || item.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "📦"; }}
                    />
                  ) : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name || item.name || "Product"}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            {order.items?.length > 2 && (
              <p className="text-xs text-gray-400 mt-2">+{order.items.length - 2} more item(s)</p>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400">Ordered on</p>
                <p className="text-sm text-gray-700 font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-base font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
              </div>
              <Link
                to={`/my-orders/${order._id}`}
                className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline"
              >
                View Details <MdArrowForward size={15} />
              </Link>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default MyOrders;
