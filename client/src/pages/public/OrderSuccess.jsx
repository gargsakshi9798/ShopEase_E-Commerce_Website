import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../../features/public/publicOrderSlice";
import {
  MdCheckCircle, MdLocalShipping, MdLocationOn,
  MdPayment, MdArrowForward, MdReceipt,
} from "react-icons/md";

const OrderSuccess = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail, detailStatus } = useSelector((s) => s.publicOrder);
  const { isLogin } = useSelector((s) => s.customerAuth);

  useEffect(() => {
    if (!isLogin) { navigate("/login"); return; }
    if (id) dispatch(fetchOrderById(id));
  }, [dispatch, id, isLogin, navigate]);

  if (detailStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const order = detail;
  const eta = order?.estimated_delivery
    ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : "3–5 business days";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Success Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-3">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <MdCheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order Confirmed! 🎉</h1>
          {order && (
            <p className="text-sm text-gray-500">
              Order <span className="font-bold text-gray-800">#{order.order_number}</span> placed successfully
            </p>
          )}
        </div>

        {/* Delivery ETA */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <MdLocalShipping size={24} className="text-primary-600" />
          <div>
            <p className="text-sm font-bold text-gray-800">Expected Delivery</p>
            <p className="text-xs text-gray-500">{eta}</p>
          </div>
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-lg capitalize">
            {order?.order_status || "Confirmed"}
          </span>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            {/* Address */}
            <div className="flex items-start gap-2">
              <MdLocationOn size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivering To</p>
                <p className="text-sm font-semibold text-gray-800">{order.address?.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.address?.address_line1}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Payment */}
            <div className="flex items-start gap-2">
              <MdPayment size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 capitalize">
                    {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                    order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                    order.payment_status === "cod"  ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {order.payment_status === "paid" ? "Paid ✅" : order.payment_status === "cod" ? "Pay on Delivery" : order.payment_status}
                  </span>
                </div>
                <p className="text-lg font-extrabold text-primary-600 mt-1">₹{order.total_amount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Items */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MdReceipt size={12} className="text-primary-600" />
                {order.items?.length} Item{order.items?.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.product_image
                        ? <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerText = "📦"; }}
                          />
                        : <span className="w-full h-full flex items-center justify-center text-lg">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-700">₹{item.total?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/my-orders"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
            Track Orders
          </Link>
          <Link to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
            Shop More <MdArrowForward size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
