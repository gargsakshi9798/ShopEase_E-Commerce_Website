import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchOrderById, updateOrderStatus, assignEmployee,
} from "../../features/orders/orderSlice";
import { fetchEmployees } from "../../features/users/employeeSlice";
import { IDS } from "../../utils/IDS";
import { formatCurrency, formatDateTime, formatDate, getImgUrl } from "../../utils/Methods";
import toast from "../../utils/toast";
import {
  MdArrowBack, MdLocalShipping, MdCheckCircle, MdPerson,
  MdLocationOn, MdPayment, MdInventory, MdHistory,
  MdEdit, MdPhone, MdEmail, MdContentCopy,
} from "react-icons/md";

const STATUS_FLOW = [
  "pending", "confirmed", "processing", "packed",
  "shipped", "out_for_delivery", "delivered",
];

const StatusBadge = ({ status }) => {
  const cfg = IDS.ORDER_STATUS[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return <span className={`badge ${cfg.color} text-xs font-semibold`}>{cfg.label}</span>;
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 font-medium">{label}</span>
    <span className={`text-sm font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
  </div>
);

const OrderDetail = () => {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { selected, mutating } = useSelector((s) => s.order);
  const { list: employees }    = useSelector((s) => s.employee);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus,       setNewStatus]       = useState("");
  const [statusNote,      setStatusNote]      = useState("");
  const [trackingId,      setTrackingId]      = useState("");
  const [courierName,     setCourierName]     = useState("");
  const [estDelivery,     setEstDelivery]     = useState("");
  const [cancelReason,    setCancelReason]    = useState("");
  const [assignEmpId,     setAssignEmpId]     = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchOrderById(id));
    dispatch(fetchEmployees({ per_page: 100 }));
  }, [id, dispatch]);

  useEffect(() => {
    if (selected) {
      setNewStatus(selected.order_status);
      setTrackingId(selected.tracking_id || "");
      setCourierName(selected.courier_name || "");
      setAssignEmpId(selected.assigned_employee_id?._id || selected.assigned_employee_id || "");
    }
  }, [selected]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      const payload = {
        order_status: newStatus,
        note:         statusNote,
        tracking_id:  trackingId,
        courier_name: courierName,
      };
      if (estDelivery)   payload.estimated_delivery = estDelivery;
      if (cancelReason)  payload.cancel_reason      = cancelReason;

      const res = await dispatch(updateOrderStatus({ id, data: payload })).unwrap();
      if (res?.success) {
        toast.success("Order status updated!");
        setShowStatusModal(false);
        setStatusNote(""); setCancelReason("");
        dispatch(fetchOrderById(id));
      }
    } catch (err) { toast.error(err?.message || "Update failed"); }
  };

  const handleAssignEmployee = async () => {
    if (!assignEmpId) return;
    try {
      const res = await dispatch(assignEmployee({ id, employee_id: assignEmpId })).unwrap();
      if (res?.success) { toast.success("Employee assigned!"); dispatch(fetchOrderById(id)); }
    } catch { toast.error("Assignment failed"); }
  };

  const copyOrderNumber = () => {
    if (selected?.order_number) {
      navigator.clipboard.writeText(selected.order_number);
      toast.success("Order # copied");
    }
  };

  if (!selected) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isTerminal = ["delivered","cancelled","returned","refunded"].includes(selected.order_status);
  const currentStep = STATUS_FLOW.indexOf(selected.order_status);

  return (
    <div className="space-y-6">

      {/* Back + Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <MdArrowBack size={18} /> Orders
          </button>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{selected.order_number}</h1>
            <button onClick={copyOrderNumber} className="p-1 text-gray-400 hover:text-primary-600">
              <MdContentCopy size={15} />
            </button>
          </div>
          <StatusBadge status={selected.order_status} />
        </div>
        <button
          onClick={() => setShowStatusModal(true)}
          disabled={isTerminal}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MdEdit size={16} /> Update Status
        </button>
      </div>

      {/* ── Order Progress Timeline ────────────────────────────────────────── */}
      {!["cancelled","returned","refunded"].includes(selected.order_status) && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute left-0 top-5 h-1 bg-gray-200 w-full rounded-full" />
            <div
              className="absolute left-0 top-5 h-1 bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStep / (STATUS_FLOW.length - 1)) * 100)}%` }}
            />
            {STATUS_FLOW.map((step, i) => {
              const done    = i < currentStep;
              const current = i === currentStep;
              const cfg     = IDS.ORDER_STATUS[step] || {};
              return (
                <div key={step} className="flex flex-col items-center gap-1 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                    current ? "border-primary-600 bg-primary-600 text-white shadow-lg scale-110" :
                    done    ? "border-primary-400 bg-primary-100 text-primary-600" :
                              "border-gray-200 bg-white text-gray-400"
                  }`}>
                    {done ? <MdCheckCircle size={18} /> : <span>{i + 1}</span>}
                  </div>
                  <span className={`text-[10px] font-medium text-center max-w-[64px] leading-tight ${
                    current ? "text-primary-700 font-bold" : done ? "text-primary-500" : "text-gray-400"
                  }`}>{cfg.label || step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cancelled / Returned Banner ──────────────────────────────────── */}
      {["cancelled","returned","refunded"].includes(selected.order_status) && (
        <div className={`rounded-xl p-4 border flex items-start gap-3 ${
          selected.order_status === "cancelled" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
        }`}>
          <StatusBadge status={selected.order_status} />
          <div>
            {selected.cancel_reason && <p className="text-sm font-medium text-gray-700">Reason: {selected.cancel_reason}</p>}
            {selected.cancelled_at   && <p className="text-xs text-gray-500">At: {formatDateTime(selected.cancelled_at)}</p>}
          </div>
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT (2/3) ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MdInventory size={18} className="text-primary-600" /> Order Items ({selected.items?.length})
            </h3>
            <div className="space-y-3">
              {selected.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    <img
                      src={item.product_image ? getImgUrl(item.product_image) : "/placeholder.png"}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "/placeholder.png"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: <strong>{item.quantity}</strong> × {formatCurrency(item.price)}
                    </p>
                    {item.return_requested && (
                      <span className="badge bg-orange-100 text-orange-700 text-[10px] mt-1">Return Requested</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{formatCurrency(item.total)}</p>
                    {item.mrp > item.price && (
                      <p className="text-xs text-gray-400 line-through">{formatCurrency(item.mrp * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{selected.shipping_charge > 0 ? formatCurrency(selected.shipping_charge) : "FREE"}</span>
              </div>
              {selected.coupon_discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon {selected.coupon_id?.code && `(${selected.coupon_id.code})`}</span>
                  <span>−{formatCurrency(selected.coupon_discount)}</span>
                </div>
              )}
              {selected.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span><span>−{formatCurrency(selected.discount)}</span>
                </div>
              )}
              {selected.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (GST)</span><span>{formatCurrency(selected.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t pt-2 text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary-600 text-lg">{formatCurrency(selected.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {(selected.tracking_id || selected.courier_name) && (
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MdLocalShipping size={18} className="text-cyan-600" /> Shipping Info
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tracking ID",    value: selected.tracking_id, mono: true },
                  { label: "Courier",        value: selected.courier_name },
                  { label: "Est. Delivery",  value: selected.estimated_delivery ? formatDate(selected.estimated_delivery) : null },
                  { label: "Delivered At",   value: selected.delivered_at ? formatDateTime(selected.delivered_at) : null },
                ].filter((r) => r.value).map(({ label, value, mono }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`text-sm font-medium text-gray-800 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          {selected.status_history?.length > 0 && (
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MdHistory size={18} className="text-gray-500" /> Status History
              </h3>
              <div className="space-y-0">
                {[...selected.status_history].reverse().map((h, i, arr) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                        i === 0 ? "bg-primary-600 ring-2 ring-primary-200" : "bg-gray-300"
                      }`} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 min-h-[24px] mt-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={h.status} />
                        <span className="text-xs text-gray-400">{formatDateTime(h.changed_at)}</span>
                      </div>
                      {h.note && <p className="text-xs text-gray-500 mt-1">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT (1/3) ────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MdPerson size={18} className="text-blue-600" /> Customer
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                {selected.user_id?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{selected.user_id?.name}</p>
                <p className="text-xs text-gray-400">{selected.user_id?.email}</p>
              </div>
            </div>
            {selected.user_id?.contact_no && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MdPhone size={13} /> {selected.user_id.contact_no}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MdLocationOn size={18} className="text-red-500" /> Delivery Address
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">{selected.address?.full_name}</p>
              {selected.address?.contact_no && (
                <p className="flex items-center gap-1 text-xs"><MdPhone size={12} /> {selected.address.contact_no}</p>
              )}
              <p>{selected.address?.address_line1}</p>
              {selected.address?.address_line2 && <p>{selected.address.address_line2}</p>}
              {selected.address?.landmark && <p className="text-gray-400">Near: {selected.address.landmark}</p>}
              <p>{selected.address?.city}, {selected.address?.state} — {selected.address?.pincode}</p>
              {selected.address?.country && <p>{selected.address.country}</p>}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MdPayment size={18} className="text-green-600" /> Payment
            </h3>
            <div className="space-y-1">
              <InfoRow label="Method" value={selected.payment_method?.toUpperCase()} mono />
              <InfoRow label="Status" value={
                <span className={`badge ${
                  selected.payment_status === "paid" || selected.payment_status === "cod"
                    ? "bg-green-100 text-green-700"
                    : selected.payment_status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>{selected.payment_status}</span>
              } />
              {selected.razorpay_payment_id && (
                <InfoRow label="Payment ID" value={selected.razorpay_payment_id} mono />
              )}
              {selected.invoice_no && (
                <InfoRow label="Invoice #" value={selected.invoice_no} mono />
              )}
              <InfoRow label="Order Date" value={formatDate(selected.createdAt)} />
            </div>
          </div>

          {/* Assign Employee */}
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Assign Employee</h3>
            <div className="space-y-3">
              {selected.assigned_employee_id && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <MdPerson size={14} className="text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    {selected.assigned_employee_id?.name || "Assigned"}
                  </p>
                </div>
              )}
              <select value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)}
                className="input-field text-sm">
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
              <button onClick={handleAssignEmployee} disabled={!assignEmpId || mutating}
                className="btn-primary w-full text-sm py-2 disabled:opacity-50">
                {mutating ? "Assigning..." : "Assign Employee"}
              </button>
            </div>
          </div>

          {/* Notes */}
          {selected.notes && (
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-gray-800 mb-2">Order Notes</h3>
              <p className="text-sm text-gray-600">{selected.notes}</p>
            </div>
          )}

        </div>
      </div>

      {/* ── Update Status Modal ──────────────────────────────────────────── */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Update Order Status</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status <span className="text-red-500">*</span></label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
                {Object.entries(IDS.ORDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Show tracking fields when shipping */}
            {["shipped","out_for_delivery"].includes(newStatus) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                  <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
                    className="input-field" placeholder="e.g. BM123456789IN" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
                  <input value={courierName} onChange={(e) => setCourierName(e.target.value)}
                    className="input-field" placeholder="e.g. BlueDart" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
                  <input type="date" value={estDelivery} onChange={(e) => setEstDelivery(e.target.value)}
                    className="input-field" />
                </div>
              </div>
            )}

            {/* Cancel reason */}
            {newStatus === "cancelled" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancel Reason</label>
                <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  className="input-field" placeholder="Reason for cancellation" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <textarea rows={2} value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add an internal note..." className="input-field resize-none" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={mutating}
                className="btn-primary flex-1 text-sm py-2 disabled:opacity-50">
                {mutating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetail;
