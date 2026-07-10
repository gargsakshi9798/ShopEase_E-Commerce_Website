import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  MdSearch, MdLocalShipping, MdCheck, MdLocationOn,
  MdHome, MdArrowForward, MdHeadset, MdRefresh,
  MdCancel, MdPendingActions, MdCheckCircle, MdReceipt,
  MdPayment,
} from "react-icons/md";
import { trackOrder, clearTracked } from "../../features/public/publicOrderSlice";
import { formatDate, formatCurrency } from "../../utils/Methods";

// ─── Order status config ──────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pending",          label: "Order Placed",     icon: "📦" },
  { key: "confirmed",        label: "Confirmed",        icon: "✅" },
  { key: "processing",       label: "Processing",       icon: "🔧" },
  { key: "packed",           label: "Packed",           icon: "📫" },
  { key: "shipped",          label: "Shipped",          icon: "🚚" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "📍" },
  { key: "delivered",        label: "Delivered",        icon: "🎉" },
];

const STEP_KEYS = STATUS_STEPS.map((s) => s.key);

const statusColors = {
  pending:          "text-amber-600 bg-amber-50 border-amber-200",
  confirmed:        "text-blue-600 bg-blue-50 border-blue-200",
  processing:       "text-purple-600 bg-purple-50 border-purple-200",
  packed:           "text-cyan-600 bg-cyan-50 border-cyan-200",
  shipped:          "text-indigo-600 bg-indigo-50 border-indigo-200",
  out_for_delivery: "text-orange-600 bg-orange-50 border-orange-200",
  delivered:        "text-green-600 bg-green-50 border-green-200",
  cancelled:        "text-red-600 bg-red-50 border-red-200",
  return_requested: "text-pink-600 bg-pink-50 border-pink-200",
  returned:         "text-gray-600 bg-gray-100 border-gray-200",
};

// ─── Tracker Stepper ──────────────────────────────────────────────────────────
const OrderTracker = ({ orderStatus, statusHistory }) => {
  const s = orderStatus?.toLowerCase() ?? "";
  const isBad = s === "cancelled" || s === "returned" || s === "return_requested";
  const curIdx = STEP_KEYS.indexOf(s);

  if (isBad) {
    return (
      <div className={`rounded-2xl px-5 py-4 flex items-center gap-3 border ${statusColors[s] || "bg-red-50 border-red-200"}`}>
        <MdCancel size={22} className="flex-shrink-0" />
        <div>
          <p className="text-sm font-bold capitalize">Order {s.replace(/_/g, " ")}</p>
          {statusHistory?.slice(-1)[0]?.note && (
            <p className="text-xs opacity-70 mt-0.5">{statusHistory.slice(-1)[0].note}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start min-w-max gap-0 py-2">
        {STATUS_STEPS.map((step, i) => {
          const done   = i <= curIdx;
          const active = i === curIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-2 w-20">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 transition-all z-10 shadow-sm ${
                  done
                    ? "bg-primary-600 border-primary-600 shadow-primary-200"
                    : "bg-white border-gray-200"
                } ${active ? "ring-4 ring-primary-100 scale-110" : ""}`}>
                  {done && i < curIdx
                    ? <MdCheck size={22} className="text-white" />
                    : <span>{step.icon}</span>}
                </div>
                <p className={`text-[10px] font-bold text-center leading-tight ${done ? "text-primary-700" : "text-gray-400"}`}>
                  {step.label}
                </p>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 w-10 mb-7 rounded-full transition-all ${i < curIdx ? "bg-primary-500" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Result Card ──────────────────────────────────────────────────────────────
const TrackResult = ({ order }) => {
  const eta = order.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">Order Number</p>
          <p className="font-extrabold text-gray-900 text-lg font-mono">{order.order_number}</p>
          <p className="text-xs text-gray-500 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusColors[order.order_status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
            <MdLocalShipping size={13} />
            {order.order_status?.replace(/_/g, " ")}
          </span>
          {eta && (
            <p className="text-xs text-gray-500 mt-1.5">Est. Delivery: <span className="font-semibold">{eta}</span></p>
          )}
        </div>
      </div>

      {/* Tracker */}
      <div className="px-6 py-6 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tracking Progress</p>
        <OrderTracker orderStatus={order.order_status} statusHistory={order.status_history} />
      </div>

      {/* Order Items */}
      {order.items?.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <MdReceipt size={12} /> {order.items.length} Item{order.items.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.product_image
                    ? <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "📦"; }}
                      />
                    : <span className="text-lg">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                  <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-700">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-gray-100 bg-gray-50">
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Payment</p>
          <p className="text-sm font-bold text-gray-700 capitalize flex items-center gap-1">
            <MdPayment size={14} className="text-primary-500" />
            {order.payment_method === "cod" ? "Cash on Delivery" : "Online"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 mb-0.5">Amount</p>
          <p className="text-sm font-bold text-primary-600">{formatCurrency(order.total_amount)}</p>
        </div>
        {order.tracking_id && (
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Tracking ID</p>
            <p className="text-sm font-bold text-gray-700 font-mono">{order.tracking_id}</p>
          </div>
        )}
        {order.courier_name && (
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Courier</p>
            <p className="text-sm font-bold text-gray-700">{order.courier_name}</p>
          </div>
        )}
        {order.invoice_no && (
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Invoice</p>
            <p className="text-xs font-semibold text-gray-600 font-mono">{order.invoice_no}</p>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MdLocationOn size={12} className="text-primary-500" /> Delivering To
          </p>
          <p className="text-sm font-semibold text-gray-800">{order.address.full_name}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {order.address.address_line1}
            {order.address.address_line2 ? `, ${order.address.address_line2}` : ""}
            {order.address.landmark ? `, Near ${order.address.landmark}` : ""}
            {" "} — {order.address.city}, {order.address.state} {order.address.pincode}
          </p>
        </div>
      )}

      {/* Full detail link */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <Link to={`/my-orders`} className="flex items-center justify-center gap-2 text-sm text-primary-600 font-semibold hover:underline">
          View All Orders <MdArrowForward size={15} />
        </Link>
      </div>
    </div>
  );
};

// ─── Main TrackOrder Page ─────────────────────────────────────────────────────
const TrackOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tracked, trackStatus, error } = useSelector((s) => s.publicOrder);
  const { isLogin } = useSelector((s) => s.customerAuth);

  const [input, setInput] = useState(searchParams.get("order") || "");

  useEffect(() => {
    // Auto-track if order number passed in URL
    const orderParam = searchParams.get("order");
    if (orderParam && isLogin) {
      dispatch(trackOrder(orderParam.trim().toUpperCase()));
    }
    return () => { dispatch(clearTracked()); };
  }, []);

  const handleTrack = () => {
    const val = input.trim().toUpperCase();
    if (!val) return;
    if (!isLogin) {
      navigate("/login", { state: { from: "/track-order" } });
      return;
    }
    dispatch(trackOrder(val));
  };

  const loading = trackStatus === "loading";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdLocalShipping size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Track Your Order</h1>
          <p className="text-white/70 text-sm mb-8">
            Enter your Order Number (e.g. SE-ORD-...) to get live status updates.
            {!isLogin && <span className="block text-white/50 text-xs mt-1">Login required to track orders.</span>}
          </p>

          {/* Search bar */}
          <div className="flex max-w-lg mx-auto gap-2 shadow-2xl rounded-2xl overflow-hidden">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Enter your order number…"
              className="flex-1 px-4 py-4 text-gray-800 text-sm outline-none bg-white"
            />
            <button
              onClick={handleTrack}
              disabled={loading || !input.trim()}
              className="px-6 py-4 bg-white text-primary-700 font-extrabold hover:bg-gray-50 transition-colors text-sm whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                : <MdSearch size={18} />}
              {loading ? "Tracking…" : "Track"}
            </button>
          </div>

          {!isLogin && (
            <p className="mt-4 text-white/60 text-xs">
              <Link to="/login" className="text-white font-semibold underline">Login</Link> to track your orders
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Fetching order details…</p>
          </div>
        )}

        {/* Error / Not found */}
        {!loading && trackStatus === "failed" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-700 font-bold">Order not found</p>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              {error?.errors || error?.message || "Please check the order number and try again."}
            </p>
            <Link to="/my-orders"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              View My Orders <MdArrowForward size={15} />
            </Link>
          </div>
        )}

        {/* Result */}
        {!loading && trackStatus === "succeeded" && tracked && (
          <TrackResult order={tracked} />
        )}

        {/* How it works */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 mb-5">How Order Tracking Works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: "📧", title: "Email Updates",  desc: "We send tracking details to your email after each status update." },
              { icon: "🔔", title: "Notifications",  desc: "Check your ShopEase notifications for real-time order updates." },
              { icon: "🔍", title: "Track Anytime",  desc: "Use your Order Number above to check status 24/7 from any device." },
            ].map((s) => (
              <div key={s.title} className="flex gap-3">
                <span className="text-3xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "↩️", title: "Returns & Refunds",  path: "/returns",             desc: "Start a return or refund" },
            { icon: "❌", title: "Cancel Order",        path: "/cancellation-policy", desc: "Understand cancellation policy" },
            { icon: "🎧", title: "Contact Support",     path: "/contact-us",          desc: "We're here to help" },
          ].map((l) => (
            <Link key={l.title} to={l.path}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
              <span className="text-3xl">{l.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">{l.title}</p>
                <p className="text-xs text-gray-500">{l.desc}</p>
              </div>
              <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
