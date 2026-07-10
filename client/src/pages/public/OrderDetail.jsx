import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdArrowBack, MdShoppingBag, MdLocationOn, MdLocalShipping,
  MdCheckCircle, MdCancel, MdPendingActions, MdRefresh,
  MdReceipt,
} from "react-icons/md";
import AccountLayout from "../../components/public/layout/AccountLayout";
import {
  fetchOrderById,
  cancelOrder,
  returnOrder,
  clearOrderDetail,
} from "../../features/public/publicOrderSlice";
import { formatDate, formatCurrency } from "../../utils/Methods";

// ── Status helpers ────────────────────────────────────────────────────────────
const statusConfig = {
  pending:    { label: "Pending",    icon: MdPendingActions, color: "text-amber-600 bg-amber-50 border-amber-200" },
  confirmed:  { label: "Confirmed",  icon: MdCheckCircle,    color: "text-blue-600 bg-blue-50 border-blue-200" },
  processing: { label: "Processing", icon: MdRefresh,        color: "text-purple-600 bg-purple-50 border-purple-200" },
  shipped:    { label: "Shipped",    icon: MdLocalShipping,  color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  delivered:  { label: "Delivered",  icon: MdCheckCircle,    color: "text-green-600 bg-green-50 border-green-200" },
  cancelled:  { label: "Cancelled",  icon: MdCancel,         color: "text-red-600 bg-red-50 border-red-200" },
  returned:   { label: "Returned",   icon: MdRefresh,        color: "text-gray-600 bg-gray-100 border-gray-200" },
};

const StatusBadge = ({ status }) => {
  const cfg  = statusConfig[status?.toLowerCase()] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${cfg.color}`}>
      <Icon size={14} /> {cfg.label}
    </span>
  );
};

// ── Tracking stepper ──────────────────────────────────────────────────────────
const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const OrderTracker = ({ status }) => {
  const s      = status?.toLowerCase() ?? "";
  const isBad  = s === "cancelled" || s === "returned";
  const curIdx = STEPS.indexOf(s);

  if (isBad) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <MdCancel size={22} className="text-red-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-700 capitalize">Order {s}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const done    = i <= curIdx;
        const active  = i === curIdx;
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-gray-200 text-gray-300"
                } ${active ? "ring-4 ring-primary-100" : ""}`}
              >
                {done ? <MdCheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <p className={`text-[10px] font-semibold mt-1 capitalize whitespace-nowrap ${done ? "text-primary-600" : "text-gray-400"}`}>
                {step}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 mx-1 mb-4 rounded ${i < curIdx ? "bg-primary-600" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const OrderDetail = () => {
  const dispatch = useDispatch();
  const { id }   = useParams();
  const { detail, detailStatus, actionStatus } = useSelector((s) => s.publicOrder);

  const [cancelReason, setCancelReason]   = useState("");
  const [returnReason, setReturnReason]   = useState("");
  const [showCancel,   setShowCancel]     = useState(false);
  const [showReturn,   setShowReturn]     = useState(false);

  const acting = actionStatus === "loading";

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearOrderDetail());
  }, [dispatch, id]);

  const handleCancel = () => {
    if (!cancelReason.trim()) { toast.error("Please provide a reason for cancellation"); return; }
    dispatch(cancelOrder({ id, reason: cancelReason })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Order cancelled successfully");
        setShowCancel(false);
        setCancelReason("");
      } else {
        toast.error("Failed to cancel order");
      }
    });
  };

  const handleReturn = () => {
    if (!returnReason.trim()) { toast.error("Please provide a return reason"); return; }
    dispatch(returnOrder({ id, reason: returnReason })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Return request submitted");
        setShowReturn(false);
        setReturnReason("");
      } else {
        toast.error("Failed to submit return request");
      }
    });
  };

  const order      = detail;
  const orderStatus = (order?.order_status || order?.status || "").toLowerCase();
  const canCancel  = ["pending", "confirmed"].includes(orderStatus);
  const canReturn  = orderStatus === "delivered";

  return (
    <AccountLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/orders"
              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <MdArrowBack size={18} className="text-gray-600" />
            </Link>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <MdReceipt size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
              {order && (
                <p className="text-xs text-gray-400 font-mono">#{order.order_number || order._id?.slice(-8).toUpperCase()}</p>
              )}
            </div>
          </div>
          {order && <StatusBadge status={order.order_status || order.status} />}
        </div>

        {/* Loading */}
        {detailStatus === "loading" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Not found */}
        {detailStatus === "failed" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <MdShoppingBag size={48} className="text-gray-200" />
            <p className="text-gray-500 font-semibold">Order not found</p>
            <Link to="/orders" className="text-sm text-primary-600 font-semibold hover:underline">
              Go back to Orders
            </Link>
          </div>
        )}

        {detailStatus === "succeeded" && order && (
          <>
            {/* Tracking */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 mb-4">Order Progress</p>
              <OrderTracker status={order.order_status || order.status} />
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 mb-4">
                Items ({order.items?.length ?? 0})
              </p>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item._id ?? item.product_id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {item.product_image
                        ? <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "📦"; }}
                          />
                        : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.product_name ?? item.name ?? "Product"}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variant}</p>
                      )}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 mb-4">Price Summary</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>− {formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.coupon_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>− {formatCurrency(order.coupon_discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5%)</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span>{(order.shipping_charge > 0) ? formatCurrency(order.shipping_charge) : <span className="text-green-600 font-semibold">FREE</span>}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
              {order.payment_method && (
                <p className="mt-3 text-xs text-gray-400">
                  Payment: <span className="font-semibold text-gray-600 capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</span>
                  {order.payment_status && (
                    <span className={`ml-2 font-bold ${order.payment_status === "paid" ? "text-green-600" : order.payment_status === "cod" ? "text-amber-600" : "text-gray-500"}`}>
                      ({order.payment_status === "cod" ? "Pay on delivery" : order.payment_status})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Delivery address */}
            {order.address && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MdLocationOn size={18} className="text-gray-500" />
                  <p className="text-sm font-bold text-gray-700">Delivery Address</p>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-900">{order.address.full_name}</p>
                  <p>{order.address.address_line1}{order.address.address_line2 ? `, ${order.address.address_line2}` : ""}</p>
                  {order.address.landmark && <p>Near: {order.address.landmark}</p>}
                  <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                  <p>📞 {order.address.contact_no}</p>
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 mb-3">Order Info</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Order Placed</p>
                  <p className="font-semibold text-gray-700">{formatDate(order.createdAt)}</p>
                </div>
                {(order.estimated_delivery || order.expected_delivery) && (
                  <div>
                    <p className="text-xs text-gray-400">Expected Delivery</p>
                    <p className="font-semibold text-gray-700">{formatDate(order.estimated_delivery || order.expected_delivery)}</p>
                  </div>
                )}
                {order.invoice_no && (
                  <div>
                    <p className="text-xs text-gray-400">Invoice No</p>
                    <p className="font-semibold text-gray-700 font-mono text-xs">{order.invoice_no}</p>
                  </div>
                )}
                {order.tracking_id && (
                  <div>
                    <p className="text-xs text-gray-400">Tracking ID</p>
                    <p className="font-semibold text-gray-700 font-mono">{order.tracking_id}</p>
                  </div>
                )}
                {order.courier_name && (
                  <div>
                    <p className="text-xs text-gray-400">Courier</p>
                    <p className="font-semibold text-gray-700">{order.courier_name}</p>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <p className="text-xs text-gray-400">Delivered On</p>
                    <p className="font-semibold text-gray-700">{formatDate(order.delivered_at)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {(canCancel || canReturn) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <p className="text-sm font-bold text-gray-700">Actions</p>

                {canCancel && !showCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MdCancel size={16} /> Cancel Order
                  </button>
                )}

                {canReturn && !showReturn && (
                  <button
                    onClick={() => setShowReturn(true)}
                    className="flex items-center gap-2 border border-amber-200 hover:bg-amber-50 text-amber-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MdRefresh size={16} /> Request Return
                  </button>
                )}

                {/* Cancel form */}
                {showCancel && (
                  <div className="border border-red-100 bg-red-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-700">Why do you want to cancel?</p>
                    <textarea
                      rows={3}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Enter reason for cancellation..."
                      className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={acting}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        {acting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        Confirm Cancel
                      </button>
                      <button onClick={() => setShowCancel(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                        Go Back
                      </button>
                    </div>
                  </div>
                )}

                {/* Return form */}
                {showReturn && (
                  <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-700">Return reason</p>
                    <textarea
                      rows={3}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Describe why you want to return this order..."
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReturn}
                        disabled={acting}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        {acting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        Submit Return
                      </button>
                      <button onClick={() => setShowReturn(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AccountLayout>
  );
};

export default OrderDetail;
