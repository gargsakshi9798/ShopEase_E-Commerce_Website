import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdLocationOn, MdPayment, MdCheckCircle, MdArrowBack,
  MdArrowForward, MdEdit, MdCheck, MdLock, MdSecurity,
  MdLocalShipping, MdAdd, MdPhone, MdCurrencyRupee,
  MdReceipt, MdCardGiftcard, MdSmartphone, MdVerified,
  MdShoppingBag,
} from "react-icons/md";
import { SiPhonepe, SiGooglepay, SiPaytm, SiRazorpay } from "react-icons/si";
import { FaAmazonPay } from "react-icons/fa";
import { fetchAddresses, addAddress } from "../../features/public/publicAddressSlice";
import {
  validateCheckout, createRazorpayOrder,
  verifyRazorpayPayment, placeCODOrder, resetPayment,
} from "../../features/public/publicPaymentSlice";
import { clearCart } from "../../features/public/publicCartSlice";
import { customerLogout } from "../../features/public/customerAuthSlice";
import { getImgUrl } from "../../utils/Methods";

// ─── Smart image ──────────────────────────────────────────────────────────────
const ItemImg = ({ src, alt, className = "w-10 h-10" }) => {
  const [broken, setBroken] = useState(false);
  if (!src) return <span className={`${className} flex items-center justify-center text-lg`}>🛒</span>;
  const isUrl = src.startsWith("http") || src.startsWith("/");
  if (!isUrl || broken)
    return <span className={`${className} flex items-center justify-center text-lg leading-none`}>{src}</span>;
  return (
    <img src={getImgUrl(src)} alt={alt || ""} className={`${className} object-cover`}
      onError={() => setBroken(true)} />
  );
};

// ─── Load Razorpay SDK ────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Address",   icon: MdLocationOn },
  { id: 2, label: "Review",    icon: MdReceipt },
  { id: 3, label: "Payment",   icon: MdPayment },
  { id: 4, label: "Confirmed", icon: MdCheckCircle },
];

// ─── Step Bar ─────────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-center mb-10 px-2">
    {STEPS.map((s, i) => {
      const done   = current > s.id;
      const active = current === s.id;
      return (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
              ${done   ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              : active ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-300 scale-110"
              :          "bg-gray-100 text-gray-400"}`}>
              {done ? <MdCheck size={20} /> : <s.icon size={18} />}
              {active && (
                <span className="absolute -inset-1 rounded-full border-2 border-blue-400 opacity-60 animate-ping" />
              )}
            </div>
            <span className={`text-[11px] font-bold tracking-wide transition-colors
              ${active ? "text-blue-600" : done ? "text-emerald-600" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-14 sm:w-20 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-500
              ${current > s.id ? "bg-gradient-to-r from-emerald-400 to-emerald-300" : "bg-gray-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Price Summary Sidebar ────────────────────────────────────────────────────
const PriceSummary = ({ summary, cartItems }) => {
  const savings = cartItems.reduce(
    (s, i) => s + ((i.mrp ?? i.price) - i.price) * (i.qty || i.quantity || 1), 0
  );
  const subtotal = summary?.subtotal ?? cartItems.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping = summary?.shipping_charge ?? (subtotal >= 500 ? 0 : 49);
  const coupon   = summary?.coupon_discount ?? 0;
  const tax      = summary?.tax ?? 0;
  const total    = summary?.total_amount ?? (subtotal + shipping + tax);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">Order Summary</h3>
        <p className="text-2xl font-black text-white mt-1">₹{total.toLocaleString()}</p>
      </div>

      {/* Items */}
      <div className="px-5 pt-4 pb-2 max-h-52 overflow-y-auto space-y-3 border-b border-gray-100">
        {cartItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
              <ItemImg src={item.thumbnail || item.img} alt={item.name} className="w-10 h-10 rounded-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-[11px] text-gray-400">Qty {item.qty || item.quantity || 1}</p>
            </div>
            <span className="text-xs font-bold text-gray-900 flex-shrink-0">
              ₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Price rows */}
      <div className="px-5 py-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="text-gray-800 font-medium">₹{subtotal.toLocaleString()}</span></div>
        {savings > 0 && <div className="flex justify-between text-emerald-600 font-medium"><span>Product Savings</span><span>−₹{Math.round(savings).toLocaleString()}</span></div>}
        {coupon > 0   && <div className="flex justify-between text-emerald-600 font-medium"><span>Coupon Discount</span><span>−₹{coupon.toLocaleString()}</span></div>}
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-emerald-600 font-semibold" : "text-gray-800 font-medium"}>
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </span>
        </div>
        {tax > 0 && <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span className="text-gray-800 font-medium">₹{tax.toLocaleString()}</span></div>}
        <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-extrabold text-gray-900 text-base">
          <span>Total Payable</span>
          <span className="text-blue-600">₹{total.toLocaleString()}</span>
        </div>
      </div>

      {(savings + coupon) > 0 && (
        <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-emerald-500 text-base">🎉</span>
          <p className="text-xs font-bold text-emerald-700">You save ₹{(Math.round(savings) + coupon).toLocaleString()} on this order!</p>
        </div>
      )}

      {/* Trust badges */}
      <div className="px-5 pb-5 flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1 text-[11px] text-gray-400"><MdLock size={12} className="text-emerald-500" /> SSL Secure</div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400"><MdVerified size={12} className="text-blue-500" /> Verified</div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400"><MdShoppingBag size={12} className="text-purple-400" /> Easy Returns</div>
      </div>
    </div>
  );
};

// ─── STEP 1: Address ─────────────────────────────────────────────────────────
const AddressStep = ({ onNext }) => {
  const dispatch = useDispatch();
  const { addresses, status } = useSelector((s) => s.publicAddress);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    full_name: "", contact_no: "", address_line1: "", address_line2: "",
    landmark: "", city: "", state: "", pincode: "", country: "India", address_type: "home",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(fetchAddresses()); }, [dispatch]);
  useEffect(() => {
    if (addresses.length > 0 && !selected) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelected(def._id);
    }
  }, [addresses, selected]);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name required";
    if (!/^[6-9]\d{9}$/.test(form.contact_no)) e.contact_no = "Valid 10-digit mobile required";
    if (!form.address_line1.trim()) e.address_line1 = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (!form.state.trim()) e.state = "State required";
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const r = await dispatch(addAddress(form));
    setSaving(false);
    if (r.payload?.success) {
      toast.success("Address saved");
      setShowForm(false);
      setSelected(r.payload.data._id);
    } else toast.error(r.payload?.errors || "Failed to save address");
  };

  const inp = (label, key, ph, type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} placeholder={ph} value={form[key]}
        onChange={(e) => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-gray-50 focus:bg-white
          ${errors[key] ? "border-red-400 ring-1 ring-red-300" : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"}`} />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <MdLocationOn size={18} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
          <MdAdd size={16} /> Add New
        </button>
      </div>

      {status === "loading" && (
        <div className="text-center py-10 text-gray-400">
          <div className="w-7 h-7 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading addresses…</p>
        </div>
      )}

      {/* Saved addresses */}
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr._id} onClick={() => setSelected(addr._id)}
            className={`group border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200
              ${selected === addr._id
                ? "border-blue-500 bg-blue-50/60 shadow-md shadow-blue-100"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"}`}>
            <div className="flex items-start gap-3">
              {/* Radio */}
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                ${selected === addr._id ? "border-blue-600 bg-white" : "border-gray-300"}`}>
                {selected === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-bold text-gray-900">{addr.full_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize
                    ${addr.address_type === "home" ? "bg-blue-100 text-blue-700"
                    : addr.address_type === "work" ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"}`}>{addr.address_type}</span>
                  {addr.is_default && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}{addr.landmark ? `, Near ${addr.landmark}` : ""}<br />
                  {addr.city}, {addr.state} – {addr.pincode}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <MdPhone size={11} className="text-gray-400" /> {addr.contact_no}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New address form */}
      {showForm && (
        <div className="border-2 border-dashed border-blue-200 rounded-2xl p-5 bg-blue-50/30 space-y-3">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <MdAdd size={16} className="text-blue-600" /> New Address
          </p>
          <div className="flex gap-2">
            {[{ v: "home", l: "🏠 Home" }, { v: "work", l: "💼 Work" }, { v: "other", l: "📍 Other" }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => setForm(p => ({ ...p, address_type: v }))}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all
                  ${form.address_type === v ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-blue-300 bg-white"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inp("Full Name *", "full_name", "Your name")}
            {inp("Mobile *", "contact_no", "10-digit number", "tel")}
          </div>
          {inp("Address Line 1 *", "address_line1", "House/Flat no., Street")}
          {inp("Address Line 2", "address_line2", "Area, Colony (optional)")}
          <div className="grid grid-cols-2 gap-3">
            {inp("City *", "city", "City")} {inp("State *", "state", "State")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inp("Pincode *", "pincode", "6-digit pincode")} {inp("Landmark", "landmark", "Nearby landmark")}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 bg-white">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-60 shadow-sm">
              {saving ? "Saving…" : "Save Address"}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => { if (!selected) { toast.error("Please select a delivery address"); return; } onNext(selected); }}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 text-sm mt-2">
        Continue to Review <MdArrowForward size={18} />
      </button>
    </div>
  );
};

// ─── STEP 2: Order Review ─────────────────────────────────────────────────────
const SummaryStep = ({ addressId, onNext, onBack }) => {
  const dispatch = useDispatch();
  const { addresses } = useSelector((s) => s.publicAddress);
  const { checkoutSummary, checkoutStatus } = useSelector((s) => s.publicPayment);
  const { items: cartItems, syncing } = useSelector((s) => s.publicCart);
  const address = addresses.find((a) => a._id === addressId);
  const hasValidated = useRef(false);

  useEffect(() => {
    if (!addressId || cartItems.length === 0 || syncing || hasValidated.current) return;
    hasValidated.current = true;
    dispatch(validateCheckout({ address_id: addressId, cart_items: cartItems }));
  }, [dispatch, addressId, cartItems.length, syncing]);

  const Spinner = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  );

  if (syncing || cartItems.length === 0) return <Spinner text="Loading your cart…" />;
  if (checkoutStatus === "loading" || checkoutStatus === "idle") return <Spinner text="Validating your cart…" />;

  if (checkoutStatus === "failed") return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">😕</span>
      </div>
      <p className="text-gray-800 font-bold mb-1">Checkout validation failed</p>
      <p className="text-sm text-gray-500 mb-6">Please go back and check your cart or address.</p>
      <div className="flex justify-center gap-3">
        <button onClick={onBack} className="px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50">Go Back</button>
        <button onClick={() => { hasValidated.current = false; dispatch(validateCheckout({ address_id: addressId, cart_items: cartItems })); }}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">Retry</button>
      </div>
    </div>
  );

  const s = checkoutSummary;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
          <MdReceipt size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Review Your Order</h2>
      </div>

      {/* Address card */}
      {address && (
        <div className="rounded-2xl border border-gray-200 p-4 bg-white flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MdLocationOn size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivering To</p>
              <p className="text-sm font-bold text-gray-900">{address.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {address.address_line1}, {address.city}, {address.state} – {address.pincode}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MdPhone size={10} /> {address.contact_no}</p>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors">
            <MdEdit size={12} /> Change
          </button>
        </div>
      )}

      {/* Shipping banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0">
          <MdLocalShipping size={20} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">
            Standard Delivery — {s?.shipping_charge === 0
              ? <span className="text-emerald-600">FREE</span>
              : <span>₹{s?.shipping_charge}</span>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Estimated {s?.estimated_delivery_days || 3}–5 business days</p>
        </div>
        {s?.serviceable && (
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-xl flex items-center gap-1 flex-shrink-0">
            <MdCheck size={12} /> Serviceable
          </span>
        )}
      </div>

      {/* Price breakdown */}
      {s && (
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Details</p>
          </div>
          <div className="px-4 py-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-800">₹{s.subtotal.toLocaleString()}</span></div>
            {s.coupon_discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium"><span>Coupon Discount</span><span>−₹{s.coupon_discount.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className={s.shipping_charge === 0 ? "text-emerald-600 font-semibold" : "text-gray-800 font-medium"}>
                {s.shipping_charge === 0 ? "FREE" : `₹${s.shipping_charge}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span className="font-medium text-gray-800">₹{s.tax.toLocaleString()}</span></div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
              <span className="font-extrabold text-gray-900 text-base">Total Payable</span>
              <span className="font-extrabold text-blue-600 text-base flex items-center gap-0.5">
                <MdCurrencyRupee size={17} />{s.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <button onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 text-sm">
        Continue to Payment <MdArrowForward size={18} />
      </button>
    </div>
  );
};

// ─── UPI apps ─────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "phonepe",   label: "PhonePe",    icon: <SiPhonepe   size={26} className="text-[#5f259f]" />, bg: "bg-purple-50" },
  { id: "gpay",      label: "Google Pay", icon: <SiGooglepay  size={26} className="text-[#4285F4]" />, bg: "bg-blue-50"   },
  { id: "paytm",     label: "Paytm",      icon: <SiPaytm      size={26} className="text-[#00baf2]" />, bg: "bg-sky-50"    },
  { id: "amazonpay", label: "Amazon Pay", icon: <FaAmazonPay  size={26} className="text-[#f90]"    />, bg: "bg-yellow-50" },
];

// ─── STEP 3: Payment ──────────────────────────────────────────────────────────
const PaymentStep = ({ addressId, onSuccess, onBack, paymentInProgress }) => {
  const dispatch = useDispatch();
  const { checkoutSummary, orderStatus } = useSelector((s) => s.publicPayment);
  const { items: cartItems } = useSelector((s) => s.publicCart);
  const [section,   setSection]  = useState("");
  const [upiApp,    setUpiApp]   = useState("");
  const [upiId,     setUpiId]    = useState("");
  const [upiIdErr,  setUpiIdErr] = useState("");
  const [giftCode,  setGiftCode] = useState("");
  const [giftErr,   setGiftErr]  = useState("");
  const [cardNum,   setCardNum]  = useState("");
  const [cardName,  setCardName] = useState("");
  const [cardExp,   setCardExp]  = useState("");
  const [cardCvv,   setCardCvv]  = useState("");
  const [emiMonths, setEmiMonths]= useState(3);

  const totalAmount = checkoutSummary?.total_amount || 0;
  const processing  = orderStatus === "loading";

  const handleRazorpay = async (method_hint = "razorpay") => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Payment gateway failed to load."); return; }
    if (paymentInProgress) paymentInProgress.current = true;

    const res = await dispatch(createRazorpayOrder({ address_id: addressId, cart_items: cartItems }));
    if (!res.payload?.success) {
      if (paymentInProgress) paymentInProgress.current = false;
      if (res.payload?.sessionExpired) {
        toast.error("Session expired. Please log in again.", { duration: 4000 });
        if (paymentInProgress) paymentInProgress.current = true;
        dispatch(customerLogout());
        setTimeout(() => { window.location.href = "/login"; }, 1500);
        return;
      }
      toast.error(res.payload?.errors || res.payload?.message || "Failed to initiate payment");
      return;
    }

    const { razorpay_order_id, amount, currency, key_id } = res.payload.data;
    new window.Razorpay({
      key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount, currency,
      name: "ShopEase",
      description: "Order Payment",
      order_id: razorpay_order_id,
      method: method_hint === "upi" ? { upi: true } : undefined,
      handler: async (response) => {
        const verifyRes = await dispatch(verifyRazorpayPayment({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          address_id: addressId, payment_method: method_hint, cart_items: cartItems,
        }));
        if (verifyRes.payload?.success) onSuccess(verifyRes.payload.data);
        else toast.error(verifyRes.payload?.errors || "Payment verification failed");
      },
      prefill: {},
      theme: { color: "#2563eb" },
      modal: { ondismiss: () => { if (paymentInProgress) paymentInProgress.current = false; toast.error("Payment was cancelled"); } },
    }).open();
  };

  const handleCOD = async () => {
    const res = await dispatch(placeCODOrder({ address_id: addressId, cart_items: cartItems }));
    if (res.payload?.success) onSuccess(res.payload.data);
    else toast.error(res.payload?.errors || "Failed to place order");
  };

  const handlePay = () => {
    if (!section) { toast.error("Please select a payment method"); return; }
    if (section === "upi") {
      if (!upiApp) { toast.error("Select a UPI app or enter UPI ID"); return; }
      if (upiApp === "other") {
        if (!upiId.trim()) { setUpiIdErr("Enter your UPI ID"); return; }
        if (!/^[\w.\-]+@[\w]+$/.test(upiId.trim())) { setUpiIdErr("Invalid UPI ID format"); return; }
      }
      handleRazorpay("upi");
    } else if (section === "card") { handleRazorpay("card"); }
    else if (section === "emi")    { handleRazorpay("emi");  }
    else if (section === "razorpay") { handleRazorpay("razorpay"); }
    else if (section === "cod")    { handleCOD(); }
    else if (section === "gift")   {
      if (!giftCode.trim()) { setGiftErr("Enter your gift card code"); return; }
      toast("Gift card redemption coming soon!", { icon: "🎁" });
    }
  };

  // ── Payment method card row ─────────────────────────────────────────────
  const PayRow = ({ id, icon, label, sub, badge, accent = "blue" }) => {
    const active = section === id;
    const accentMap = {
      blue:   "border-blue-500 bg-blue-50/70 shadow-blue-100",
      green:  "border-emerald-500 bg-emerald-50/70 shadow-emerald-100",
      amber:  "border-amber-500 bg-amber-50/70 shadow-amber-100",
      purple: "border-purple-500 bg-purple-50/70 shadow-purple-100",
    };
    return (
      <div onClick={() => setSection(id)}
        className={`flex items-center gap-3.5 border-2 rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-200 select-none
          ${active ? `${accentMap[accent]} shadow-md` : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"}`}>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${active ? "border-blue-600 scale-110" : "border-gray-300"}`}>
          {active && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
        </div>
        <div className="text-2xl flex-shrink-0 leading-none">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold transition-colors ${active ? "text-gray-900" : "text-gray-700"}`}>{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl flex-shrink-0 ${badge.cls}`}>{badge.text}</span>
        )}
      </div>
    );
  };

  // ── Expandable panel wrapper ─────────────────────────────────────────────
  const Panel = ({ children }) => (
    <div className="border border-blue-100 rounded-2xl p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 -mt-1.5 space-y-3.5">
      {children}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
          <MdPayment size={18} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
      </div>

      {/* Amount chip */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-5 py-4 flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Amount to Pay</p>
          <p className="text-3xl font-black text-white mt-0.5 flex items-center gap-0.5">
            <MdCurrencyRupee size={24} />{totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
          <MdLock size={22} className="text-white/80" />
        </div>
      </div>

      {/* ─── UPI ─── */}
      <PayRow id="upi" icon="📲" label="UPI" sub="PhonePe • Google Pay • Paytm • Amazon Pay"
        badge={{ text: "Recommended", cls: "bg-emerald-100 text-emerald-700" }} accent="green" />
      {section === "upi" && (
        <Panel>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select UPI App</p>
          <div className="grid grid-cols-4 gap-2">
            {UPI_APPS.map((app) => (
              <button key={app.id} type="button" onClick={() => { setUpiApp(app.id); setUpiIdErr(""); }}
                className={`flex flex-col items-center gap-2 rounded-xl py-3 border-2 transition-all
                  ${upiApp === app.id ? "border-blue-500 bg-white shadow-sm scale-105" : `${app.bg} border-transparent hover:border-gray-200`}`}>
                {app.icon}
                <span className="text-[10px] font-bold text-gray-700">{app.label}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { setUpiApp("other"); setUpiIdErr(""); }}
            className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-2.5 transition-all bg-white
              ${upiApp === "other" ? "border-blue-500" : "border-dashed border-gray-300 hover:border-blue-300"}`}>
            <MdSmartphone size={17} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700 flex-1">Other UPI ID</span>
            {upiApp === "other" && <MdCheck size={16} className="text-blue-600" />}
          </button>
          {upiApp === "other" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Enter UPI ID</label>
              <input value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiIdErr(""); }}
                placeholder="yourname@upi"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white transition-all
                  ${upiIdErr ? "border-red-400 ring-1 ring-red-300" : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"}`} />
              {upiIdErr && <p className="text-red-500 text-xs mt-1">{upiIdErr}</p>}
            </div>
          )}
        </Panel>
      )}

      {/* ─── Card ─── */}
      <PayRow id="card" icon="💳" label="Credit / Debit / ATM Card" sub="Visa • Mastercard • RuPay • Amex" />
      {section === "card" && (
        <Panel>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Card Details</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
            <input value={cardNum} maxLength={19}
              onChange={(e) => setCardNum(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim())}
              placeholder="0000 0000 0000 0000"
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 rounded-xl px-3.5 py-2.5 text-sm outline-none tracking-widest bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name on Card</label>
            <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name as on card"
              className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
              <input value={cardExp} maxLength={5}
                onChange={(e) => { const v=e.target.value.replace(/\D/g,""); setCardExp(v.length>2?v.slice(0,2)+"/"+v.slice(2):v); }}
                placeholder="MM/YY" className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
              <input value={cardCvv} maxLength={4} type="password" onChange={(e) => setCardCvv(e.target.value.replace(/\D/g,""))}
                placeholder="•••" className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-2">
            <MdLock size={12} className="text-emerald-500" /> Card details are securely processed via Razorpay. We never store card data.
          </p>
        </Panel>
      )}

      {/* ─── EMI ─── */}
      <PayRow id="emi" icon="🏦" label="EMI" sub="No-cost EMI on select cards • 3 to 24 months" />
      {section === "emi" && (
        <Panel>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Choose EMI Tenure</p>
          <div className="grid grid-cols-3 gap-2">
            {[3,6,9,12,18,24].map((m) => (
              <button key={m} type="button" onClick={() => setEmiMonths(m)}
                className={`flex flex-col items-center border-2 rounded-xl py-3 transition-all bg-white
                  ${emiMonths === m ? "border-blue-500 shadow-sm scale-105" : "border-gray-200 hover:border-blue-300"}`}>
                <span className="text-sm font-black text-gray-900">{m} mo</span>
                <span className="text-[10px] text-gray-400 mt-0.5">₹{Math.ceil(totalAmount/m).toLocaleString()}/mo</span>
                {m === 3 && <span className="text-[9px] font-bold text-emerald-600 mt-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">No Cost</span>}
              </button>
            ))}
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            ℹ️ EMI availability depends on your card/bank. Final EMI terms shown at checkout.
          </p>
        </Panel>
      )}

      {/* ─── Razorpay ─── */}
      <PayRow id="razorpay" icon={<SiRazorpay size={22} className="text-[#072654]" />}
        label="Razorpay Checkout" sub="Cards • UPI • Netbanking • Wallets • EMI"
        badge={{ text: "All Methods", cls: "bg-blue-100 text-blue-700" }} accent="blue" />
      {section === "razorpay" && (
        <Panel>
          <p className="text-xs text-gray-600 leading-relaxed">
            You'll be taken to Razorpay's secure checkout to pay using any method — UPI, card, netbanking, wallet, or EMI.
          </p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-2">
            <MdLock size={12} className="text-emerald-500" /> Secured by Razorpay. Your data is encrypted end-to-end.
          </p>
        </Panel>
      )}

      {/* ─── COD ─── */}
      <PayRow id="cod" icon="💵" label="Cash on Delivery" sub="Pay when your order arrives"
        badge={totalAmount > 10000 ? { text: "Not available", cls: "bg-red-100 text-red-600" } : null}
        accent="amber" />
      {section === "cod" && (
        <Panel>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-amber-800">📋 Things to note:</p>
            <ul className="space-y-0.5 text-xs text-amber-700 list-disc list-inside">
              <li>Keep exact change ready at the time of delivery.</li>
              <li>COD is available for orders up to ₹10,000.</li>
              <li>COD returns are issued as store credit.</li>
            </ul>
          </div>
        </Panel>
      )}

      {/* ─── Gift Card ─── */}
      <PayRow id="gift" icon="🎁" label="Gift Card" sub="Redeem your ShopEase gift card" accent="purple" />
      {section === "gift" && (
        <Panel>
          <label className="block text-xs font-semibold text-gray-600">Gift Card / Promo Code</label>
          <div className="flex gap-2">
            <input value={giftCode} onChange={(e) => { setGiftCode(e.target.value.toUpperCase()); setGiftErr(""); }}
              placeholder="Enter 16-digit code"
              className={`flex-1 border rounded-xl px-3.5 py-2.5 text-sm outline-none tracking-widest font-mono bg-white transition-all
                ${giftErr ? "border-red-400 ring-1 ring-red-300" : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200"}`} />
            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 rounded-xl text-sm transition-colors">
              Apply
            </button>
          </div>
          {giftErr && <p className="text-red-500 text-xs">{giftErr}</p>}
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <MdCardGiftcard size={13} className="text-blue-400" />
            Find your code in the email or on the physical card.
          </p>
        </Panel>
      )}

      {/* Security badge */}
      <div className="flex items-center justify-center gap-6 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium"><MdSecurity size={14} className="text-emerald-500" /> 256-bit SSL</span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium"><MdVerified size={14} className="text-blue-500" /> PCI Compliant</span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium"><MdLock size={14} className="text-indigo-500" /> Secure Pay</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button onClick={onBack} disabled={processing}
          className="flex items-center gap-1.5 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-3 rounded-2xl transition-colors disabled:opacity-50 bg-white">
          <MdArrowBack size={16} /> Back
        </button>
        <button onClick={handlePay} disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 text-sm">
          {processing ? (
            <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
          ) : (
            <><MdLock size={16} />
              {section === "cod" ? "Place COD Order" : section === "gift" ? "Apply & Continue" : `Pay ₹${totalAmount.toLocaleString()}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── STEP 4: Order Confirmed ──────────────────────────────────────────────────
const ConfirmedStep = ({ result }) => {
  const eta = result?.estimated_delivery
    ? new Date(result.estimated_delivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    : null;
  const isOnline = result?.payment_method !== "cod";

  return (
    <div className="text-center space-y-6 py-4">
      {/* Success icon */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
            <MdCheckCircle size={52} className="text-white" />
          </div>
          <div className="absolute -inset-2 rounded-full border-4 border-emerald-200 opacity-50 animate-ping" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Order Confirmed!</h2>
          <p className="text-gray-500 text-sm mt-1">
            Order <span className="font-bold text-gray-800">#{result?.order_number}</span> placed successfully 🎉
          </p>
        </div>
      </div>

      {/* Delivery ETA */}
      {eta && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MdLocalShipping size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Expected Delivery</p>
            <p className="text-xs text-gray-500 mt-0.5">{eta}</p>
          </div>
          <MdVerified size={20} className="text-blue-500 ml-auto flex-shrink-0" />
        </div>
      )}

      {/* Order & Payment cards */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center">
              <MdReceipt size={14} className="text-blue-600" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</p>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold">Order No</p>
          <p className="text-sm font-bold text-gray-900 break-all mt-0.5">{result?.order_number}</p>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">Invoice</p>
          <p className="text-xs font-semibold text-gray-600 break-all mt-0.5">{result?.invoice_number}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isOnline ? "bg-emerald-100" : "bg-amber-100"}`}>
              <MdPayment size={14} className={isOnline ? "text-emerald-600" : "text-amber-600"} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{result?.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {result?.payment_status === "paid" ? "✅ Confirmed" : result?.payment_status === "cod" ? "📦 Pay on delivery" : "Pending"}
          </p>
          <p className="text-xl font-black text-blue-600 mt-2">₹{result?.total_amount?.toLocaleString()}</p>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <Link to="/my-orders"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl transition-colors text-sm bg-white">
          View Orders
        </Link>
        <Link to="/"
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-200 text-sm">
          Shop More <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
};

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items }   = useSelector((s) => s.publicCart);
  const { isLogin } = useSelector((s) => s.customerAuth);
  const { checkoutSummary } = useSelector((s) => s.publicPayment);

  const [step,        setStep]        = useState(1);
  const [addressId,   setAddressId]   = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const paymentInProgress = useRef(false);

  useEffect(() => { dispatch(resetPayment()); }, [dispatch]);

  useEffect(() => {
    if (isLogin && items.length === 0 && step < 4) navigate("/cart");
  }, [items, isLogin, step, navigate]);

  if (!isLogin && !paymentInProgress.current)
    return <Navigate to="/login" state={{ from: "/checkout" }} replace />;

  const handleAddressDone = (id) => { setAddressId(id); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSummaryDone = ()   => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handlePaymentSuccess = (result) => {
    paymentInProgress.current = false;
    setOrderResult(result);
    dispatch(clearCart());
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link to="/cart"
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-medium transition-colors">
            <MdArrowBack size={16} /> Cart
          </Link>
          <span className="text-gray-300 font-bold">/</span>
          <span className="text-gray-900 font-bold">Checkout</span>
        </div>

        <StepBar current={step} />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: step card */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              {step === 1 && <AddressStep onNext={handleAddressDone} />}
              {step === 2 && <SummaryStep addressId={addressId} onNext={handleSummaryDone} onBack={() => setStep(1)} />}
              {step === 3 && (
                <PaymentStep addressId={addressId} onSuccess={handlePaymentSuccess}
                  onBack={() => setStep(2)} paymentInProgress={paymentInProgress} />
              )}
              {step === 4 && orderResult && <ConfirmedStep result={orderResult} />}
            </div>
          </div>

          {/* Right: price summary */}
          {step < 4 && (
            <div className="lg:w-[340px] flex-shrink-0 w-full">
              <PriceSummary summary={checkoutSummary} cartItems={items} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
