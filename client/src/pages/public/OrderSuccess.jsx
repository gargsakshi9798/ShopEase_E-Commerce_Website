import { useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../../features/public/publicOrderSlice";
import { resetPayment } from "../../features/public/publicPaymentSlice";
import { clearCart } from "../../features/public/publicCartSlice";
import {
  MdCheckCircle, MdLocalShipping, MdLocationOn,
  MdPayment, MdArrowForward, MdReceipt, MdShoppingBag,
} from "react-icons/md";

// ── Confetti particle ─────────────────────────────────────────────────────────
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6", "#f97316"];

const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x:     Math.random() * canvas.width,
      y:     -20 - Math.random() * canvas.height * 0.5,
      w:     6 + Math.random() * 8,
      h:     10 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:   Math.random() * 360,
      vx:    (Math.random() - 0.5) * 2,
      vy:    2 + Math.random() * 3,
      vr:    (Math.random() - 0.5) * 6,
      alpha: 1,
    }));

    let animId;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      pieces.forEach((p) => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.vr;
        if (frame > 120) p.alpha = Math.max(0, p.alpha - 0.008);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (pieces.some((p) => p.alpha > 0)) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderSuccess = () => {
  const { id } = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { detail, detailStatus } = useSelector((s) => s.publicOrder);
  const { isLogin } = useSelector((s) => s.customerAuth);

  useEffect(() => {
    if (!isLogin) { navigate("/login"); return; }
    if (id) {
      dispatch(fetchOrderById(id));
      dispatch(resetPayment());
      dispatch(clearCart());
    }
  }, [dispatch, id, isLogin, navigate]);

  if (detailStatus === "loading" || detailStatus === "idle") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading your order…</p>
        </div>
      </div>
    );
  }

  const order   = detail;
  const isOnline = order?.payment_method !== "cod";
  const eta = order?.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long",
      })
    : "3–5 business days";

  return (
    <>
      {/* Confetti — only fires once on mount */}
      <ConfettiCanvas />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 py-10 px-4">
        <div className="max-w-lg mx-auto space-y-5">

          {/* ── Congratulations Header ────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-8 text-center space-y-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent pointer-events-none" />

            {/* Animated check icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200 animate-bounce-once">
                <MdCheckCircle size={52} className="text-white" />
              </div>
              <span className="absolute -inset-3 rounded-full border-4 border-emerald-200 opacity-40 animate-ping" />
            </div>

            <div className="relative">
              <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-1">
                🎉 Congratulations!
              </p>
              <h1 className="text-3xl font-black text-gray-900">Order Confirmed!</h1>
              {order && (
                <p className="text-sm text-gray-500 mt-2">
                  Order{" "}
                  <span className="font-bold text-gray-800">#{order.order_number}</span>{" "}
                  placed successfully
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>

          {/* ── Delivery ETA ─────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-blue-200">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <MdLocalShipping size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                Expected Delivery
              </p>
              <p className="text-sm font-bold text-white mt-0.5">{eta}</p>
            </div>
            <span className="text-xs bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl capitalize flex-shrink-0">
              {order?.order_status || "Confirmed"}
            </span>
          </div>

          {/* ── Order Details Card ───────────────────────────────────── */}
          {order && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Order & Payment info */}
              <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MdReceipt size={14} className="text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold">Order No</p>
                  <p className="text-sm font-bold text-gray-900 break-all mt-0.5">#{order.order_number}</p>
                  {order.invoice_no && (
                    <>
                      <p className="text-[10px] text-gray-400 font-semibold mt-3">Invoice</p>
                      <p className="text-xs font-semibold text-gray-600 break-all mt-0.5">{order.invoice_no}</p>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isOnline ? "bg-emerald-100" : "bg-amber-100"}`}>
                      <MdPayment size={14} className={isOnline ? "text-emerald-600" : "text-amber-600"} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.payment_status === "paid" ? "✅ Paid" :
                     order.payment_status === "cod"  ? "📦 Pay on Delivery" : "Pending"}
                  </p>
                  <p className="text-xl font-black text-indigo-600 mt-2">
                    ₹{order.total_amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Delivery Address */}
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MdLocationOn size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivering To</p>
                  <p className="text-sm font-bold text-gray-900">{order.address?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {order.address?.address_line1}, {order.address?.city},{" "}
                    {order.address?.state} – {order.address?.pincode}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Items */}
              <div className="p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <MdShoppingBag size={12} className="text-indigo-500" />
                  {order.items?.length} Item{order.items?.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.product_image
                          ? <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement.innerText = "📦";
                              }}
                            />
                          : <span className="w-full h-full flex items-center justify-center text-xl">📦</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-800 flex-shrink-0">
                        ₹{item.total?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CTA Buttons ──────────────────────────────────────────── */}
          <div className="flex gap-3">
            <Link
              to="/my-orders"
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 font-bold py-4 rounded-2xl transition-all text-sm bg-white"
            >
              <MdReceipt size={16} /> My Orders
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 text-sm"
            >
              Shop More <MdArrowForward size={16} />
            </Link>
          </div>

          {/* ── Track order note ─────────────────────────────────────── */}
          <p className="text-center text-xs text-gray-400 pb-4">
            You can track your order anytime from{" "}
            <Link to="/my-orders" className="text-indigo-600 font-semibold hover:underline">
              My Orders
            </Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
