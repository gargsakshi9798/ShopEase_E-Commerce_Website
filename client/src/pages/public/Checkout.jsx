import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdLocationOn, MdPayment, MdCheckCircle, MdArrowBack,
  MdArrowForward, MdHome, MdWork, MdPerson, MdEdit,
  MdCheck, MdLock, MdSecurity, MdLocalShipping, MdAdd,
  MdPhone, MdCurrencyRupee, MdReceipt, MdCardGiftcard,
  MdSmartphone, MdCreditCard, MdAccountBalance,
} from "react-icons/md";
import { SiPhonepe, SiGooglepay, SiPaytm } from "react-icons/si";
import { FaAmazonPay } from "react-icons/fa";
import { fetchAddresses, addAddress } from "../../features/public/publicAddressSlice";
import {
  validateCheckout,
  createRazorpayOrder,
  verifyRazorpayPayment,
  placeCODOrder,
  resetPayment,
} from "../../features/public/publicPaymentSlice";
import { clearCart } from "../../features/public/publicCartSlice";
import { getImgUrl } from "../../utils/Methods";

// ─── Smart image — handles emoji, URL, broken images ─────────────────────────
const ItemImg = ({ src, alt, className = "w-8 h-8" }) => {
  const [broken, setBroken] = useState(false);
  if (!src) return <span className={`${className} flex items-center justify-center text-base`}>🛒</span>;
  const isUrl = src.startsWith("http") || src.startsWith("/");
  if (!isUrl || broken) {
    return <span className={`${className} flex items-center justify-center text-base leading-none`}>{src}</span>;
  }
  return (
    <img
      src={getImgUrl(src)}
      alt={alt || ""}
      className={`${className} object-cover`}
      onError={() => setBroken(true)}
    />
  );
};

// ─── Load Razorpay SDK ────────────────────────────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── Step Bar ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Address",  icon: MdLocationOn },
  { id: 2, label: "Summary",  icon: MdReceipt },
  { id: 3, label: "Payment",  icon: MdPayment },
  { id: 4, label: "Confirmed",icon: MdCheckCircle },
];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((s, i) => {
      const done   = current > s.id;
      const active = current === s.id;
      return (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              done   ? "bg-green-500 text-white" :
              active ? "bg-primary-600 text-white shadow-lg shadow-blue-200" :
                       "bg-gray-100 text-gray-400"
            }`}>
              {done ? <MdCheck size={18} /> : <s.icon size={18} />}
            </div>
            <span className={`text-[11px] font-semibold ${active ? "text-primary-600" : done ? "text-green-600" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all ${current > s.id ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Price Summary Sidebar ────────────────────────────────────────────────────
const PriceSummary = ({ summary, cartItems }) => {
  if (summary) {
    const { subtotal, shipping_charge, coupon_discount, tax, total_amount } = summary;
    const savings = cartItems.reduce((s, i) => s + ((i.mrp ?? i.price) - i.price) * (i.qty || i.quantity || 1), 0);
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm border-b border-gray-100 pb-4 mb-4 max-h-44 overflow-y-auto pr-1">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                <ItemImg src={item.thumbnail || item.img} alt={item.name} className="w-8 h-8 rounded-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400">Qty: {item.qty || item.quantity || 1}</p>
              </div>
              <span className="text-xs font-bold text-gray-800 flex-shrink-0">
                ₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          {savings > 0 && <div className="flex justify-between text-green-600"><span>Product Savings</span><span>−₹{Math.round(savings).toLocaleString()}</span></div>}
          {coupon_discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>−₹{coupon_discount.toLocaleString()}</span></div>}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className={shipping_charge === 0 ? "text-green-600 font-semibold" : ""}>{shipping_charge === 0 ? "FREE" : `₹${shipping_charge}`}</span>
          </div>
          <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{tax.toLocaleString()}</span></div>
          <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span><span>₹{total_amount.toLocaleString()}</span>
          </div>
        </div>
        {(savings + coupon_discount) > 0 && (
          <p className="mt-3 text-xs text-green-600 font-semibold bg-green-50 rounded-xl px-3 py-2 text-center">
            🎉 You save ₹{(Math.round(savings) + coupon_discount).toLocaleString()} on this order!
          </p>
        )}
      </div>
    );
  }
  // Fallback: compute from cart items
  const subtotal = cartItems.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping = subtotal >= 500 ? 0 : 49;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Cart Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span><span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold"><span>Estimated Total</span><span>₹{(subtotal + shipping).toLocaleString()}</span></div>
      </div>
    </div>
  );
};

// ─── STEP 1: Select / Add Delivery Address ────────────────────────────────────
const AddressStep = ({ onNext }) => {
  const dispatch   = useDispatch();
  const { addresses, status } = useSelector((s) => s.publicAddress);
  const [selected, setSelected]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [form,     setForm]       = useState({
    full_name: "", contact_no: "", address_line1: "", address_line2: "",
    landmark: "", city: "", state: "", pincode: "", country: "India", address_type: "home",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selected) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelected(def._id);
    }
  }, [addresses, selected]);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())       errs.full_name     = "Name required";
    if (!/^[6-9]\d{9}$/.test(form.contact_no)) errs.contact_no = "Valid 10-digit mobile required";
    if (!form.address_line1.trim())   errs.address_line1 = "Address required";
    if (!form.city.trim())            errs.city          = "City required";
    if (!form.state.trim())           errs.state         = "State required";
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = await dispatch(addAddress(form));
    setSaving(false);
    if (result.payload?.success) {
      toast.success("Address saved");
      setShowForm(false);
      setSelected(result.payload.data._id);
    } else {
      toast.error(result.payload?.errors || "Failed to save address");
    }
  };

  const handleContinue = () => {
    if (!selected) { toast.error("Please select a delivery address"); return; }
    onNext(selected);
  };

  const inp = (label, key, ph, type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input type={type} placeholder={ph} value={form[key]}
        onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: "" })); }}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${errors[key] ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MdLocationOn size={20} className="text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:underline">
          <MdAdd size={16} /> Add New
        </button>
      </div>

      {status === "loading" && (
        <div className="text-center py-8 text-gray-400 text-sm">Loading addresses…</div>
      )}

      {/* Saved addresses */}
      {addresses.map((addr) => (
        <div key={addr._id} onClick={() => setSelected(addr._id)}
          className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${selected === addr._id ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected === addr._id ? "border-primary-600" : "border-gray-300"}`}>
              {selected === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-800">{addr.full_name}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg capitalize ${
                  addr.address_type === "home" ? "bg-blue-50 text-blue-600" :
                  addr.address_type === "work" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                }`}>{addr.address_type}</span>
                {addr.is_default && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600">Default</span>}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}{addr.landmark ? `, Near ${addr.landmark}` : ""}<br />
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MdPhone size={11} /> {addr.contact_no}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* New address form */}
      {showForm && (
        <div className="border border-dashed border-primary-300 rounded-2xl p-4 bg-primary-50/30 space-y-3">
          <p className="text-sm font-bold text-gray-700">New Address</p>
          <div className="flex gap-3 mb-1">
            {[{ v: "home", label: "Home" }, { v: "work", label: "Work" }, { v: "other", label: "Other" }].map(({ v, label }) => (
              <button key={v} type="button" onClick={() => setForm((p) => ({ ...p, address_type: v }))}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${form.address_type === v ? "border-primary-600 bg-primary-600 text-white" : "border-gray-300 text-gray-600"}`}>
                {label}
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
            {inp("City *", "city", "City")}
            {inp("State *", "state", "State")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inp("Pincode *", "pincode", "6-digit pincode")}
            {inp("Landmark", "landmark", "Nearby landmark")}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSaveAddress} disabled={saving}
              className="flex-1 bg-primary-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-primary-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save Address"}
            </button>
          </div>
        </div>
      )}

      <button onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 mt-2">
        Continue to Summary <MdArrowForward size={18} />
      </button>
    </div>
  );
};

// ─── STEP 2: Order Summary Review ────────────────────────────────────────────
const SummaryStep = ({ addressId, onNext, onBack }) => {
  const dispatch  = useDispatch();
  const { addresses } = useSelector((s) => s.publicAddress);
  const { checkoutSummary, checkoutStatus } = useSelector((s) => s.publicPayment);
  const { items: cartItems } = useSelector((s) => s.publicCart);

  const address = addresses.find((a) => a._id === addressId);

  useEffect(() => {
    dispatch(validateCheckout({ address_id: addressId, cart_items: cartItems }));
  }, [dispatch, addressId]);

  if (checkoutStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Validating your cart…</p>
      </div>
    );
  }

  if (checkoutStatus === "failed") {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold mb-4">Checkout validation failed. Please check your cart.</p>
        <button onClick={onBack} className="text-primary-600 underline text-sm">Go Back</button>
      </div>
    );
  }

  const s = checkoutSummary;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <MdReceipt size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
      </div>

      {/* Delivery Address */}
      {address && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <MdLocationOn size={16} className="text-primary-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivering To</p>
                <p className="text-sm font-bold text-gray-800">{address.full_name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{address.address_line1}, {address.city}, {address.state} - {address.pincode}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MdPhone size={11} /> {address.contact_no}</p>
              </div>
            </div>
            <button onClick={onBack} className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              <MdEdit size={12} /> Change
            </button>
          </div>
        </div>
      )}

      {/* Shipping Method */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
        <MdLocalShipping size={22} className="text-primary-600" />
        <div>
          <p className="text-sm font-bold text-gray-800">
            Standard Delivery {s?.shipping_charge === 0 ? <span className="text-green-600">FREE</span> : <span>₹{s?.shipping_charge}</span>}
          </p>
          <p className="text-xs text-gray-500">Estimated delivery in {s?.estimated_delivery_days || 3}–5 business days</p>
        </div>
        {s?.serviceable && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-lg">✓ Serviceable</span>
        )}
      </div>

      {/* Price Breakdown */}
      {s && (
        <div className="rounded-2xl border border-gray-100 p-4 space-y-2.5 text-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price Details</p>
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{s.subtotal.toLocaleString()}</span></div>
          {s.coupon_discount > 0 && (
            <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>−₹{s.coupon_discount.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className={s.shipping_charge === 0 ? "text-green-600 font-semibold" : ""}>{s.shipping_charge === 0 ? "FREE" : `₹${s.shipping_charge}`}</span>
          </div>
          <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{s.tax.toLocaleString()}</span></div>
          <div className="border-t border-dashed pt-2.5 flex justify-between font-extrabold text-gray-900 text-base">
            <span>Total Payable</span>
            <span className="text-primary-600 flex items-center gap-0.5"><MdCurrencyRupee size={16} />{s.total_amount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200">
        Continue to Payment <MdArrowForward size={18} />
      </button>
    </div>
  );
};

// ─── UPI App button ───────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "phonepe",   label: "PhonePe",   icon: <SiPhonepe   size={28} className="text-[#5f259f]" />, color: "bg-purple-50  border-purple-200" },
  { id: "gpay",      label: "Google Pay", icon: <SiGooglepay  size={28} className="text-[#4285F4]" />, color: "bg-blue-50   border-blue-200"   },
  { id: "paytm",     label: "Paytm",     icon: <SiPaytm      size={28} className="text-[#00baf2]" />, color: "bg-sky-50    border-sky-200"    },
  { id: "amazonpay", label: "Amazon Pay", icon: <FaAmazonPay  size={28} className="text-[#f90]"    />, color: "bg-yellow-50 border-yellow-200" },
];

// ─── STEP 3: Payment ──────────────────────────────────────────────────────────
const PaymentStep = ({ addressId, onSuccess, onBack }) => {
  const dispatch = useDispatch();
  const { checkoutSummary, orderStatus } = useSelector((s) => s.publicPayment);
  const { items: cartItems } = useSelector((s) => s.publicCart);
  const [section,    setSection]    = useState("");  // upi | card | emi | cod | gift
  const [upiApp,     setUpiApp]     = useState("");  // phonepe | gpay | paytm | amazonpay | other
  const [upiId,      setUpiId]      = useState("");
  const [upiIdErr,   setUpiIdErr]   = useState("");
  const [giftCode,   setGiftCode]   = useState("");
  const [giftErr,    setGiftErr]    = useState("");
  const [cardNum,    setCardNum]    = useState("");
  const [cardName,   setCardName]   = useState("");
  const [cardExp,    setCardExp]    = useState("");
  const [cardCvv,    setCardCvv]    = useState("");
  const [emiMonths,  setEmiMonths]  = useState(3);

  const totalAmount = checkoutSummary?.total_amount || 0;

  // ── Razorpay (UPI / Card / EMI routed via Razorpay) ──────────────────────
  const handleRazorpay = async (method_hint = "razorpay") => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Payment gateway failed to load."); return; }

    const res = await dispatch(createRazorpayOrder({ address_id: addressId, cart_items: cartItems }));
    if (!res.payload?.success) {
      toast.error(res.payload?.errors || "Failed to initiate payment"); return;
    }

    const { razorpay_order_id, amount, currency, key_id } = res.payload.data;
    const options = {
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
          address_id: addressId,
          payment_method: method_hint,
          cart_items: cartItems,
        }));
        if (verifyRes.payload?.success) onSuccess(verifyRes.payload.data);
        else toast.error(verifyRes.payload?.errors || "Payment verification failed");
      },
      prefill: {},
      theme: { color: "#2563eb" },
      modal: { ondismiss: () => toast.error("Payment was cancelled") },
    };
    new window.Razorpay(options).open();
  };

  // ── COD ──────────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    const res = await dispatch(placeCODOrder({ address_id: addressId, cart_items: cartItems }));
    if (res.payload?.success) onSuccess(res.payload.data);
    else toast.error(res.payload?.errors || "Failed to place order");
  };

  // ── Validate & pay ────────────────────────────────────────────────────────
  const handlePay = () => {
    if (!section) { toast.error("Please select a payment method"); return; }
    if (section === "upi") {
      if (!upiApp) { toast.error("Select a UPI app or enter UPI ID"); return; }
      if (upiApp === "other") {
        if (!upiId.trim()) { setUpiIdErr("Enter your UPI ID"); return; }
        if (!/^[\w.\-]+@[\w]+$/.test(upiId.trim())) { setUpiIdErr("Invalid UPI ID format"); return; }
      }
      handleRazorpay("upi");
    } else if (section === "card") {
      handleRazorpay("card");
    } else if (section === "emi") {
      handleRazorpay("emi");
    } else if (section === "cod") {
      handleCOD();
    } else if (section === "gift") {
      if (!giftCode.trim()) { setGiftErr("Enter your gift card code"); return; }
      toast("Gift card redemption coming soon!", { icon: "🎁" });
    }
  };

  const processing = orderStatus === "loading";

  // ── Radio row helper ──────────────────────────────────────────────────────
  const RadioRow = ({ id, icon, label, sub, badge }) => (
    <div onClick={() => setSection(id)}
      className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3.5 cursor-pointer transition-all
        ${section === id ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
        ${section === id ? "border-primary-600" : "border-gray-300"}`}>
        {section === id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
      </div>
      <div className="text-xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${badge.cls}`}>{badge.text}</span>}
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Header + amount */}
      <div className="flex items-center gap-2 mb-1">
        <MdPayment size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
      </div>
      <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-2xl px-5 py-3 mb-1">
        <p className="text-xs text-gray-500">Amount to Pay</p>
        <p className="text-2xl font-extrabold text-primary-700 flex items-center gap-0.5">
          <MdCurrencyRupee size={20} />{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* ── 1. UPI ───────────────────────────────────────────────────── */}
      <RadioRow id="upi" icon="📲" label="UPI"
        sub="PhonePe • Google Pay • Paytm • Amazon Pay"
        badge={{ text: "Recommended", cls: "bg-green-100 text-green-700" }} />

      {section === "upi" && (
        <div className="border border-primary-200 rounded-2xl p-4 bg-primary-50/40 space-y-4 -mt-1">
          {/* App grid */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select UPI App</p>
          <div className="grid grid-cols-4 gap-2">
            {UPI_APPS.map((app) => (
              <button key={app.id} type="button" onClick={() => { setUpiApp(app.id); setUpiIdErr(""); }}
                className={`flex flex-col items-center gap-1.5 border-2 rounded-xl py-3 transition-all
                  ${upiApp === app.id ? "border-primary-600 bg-white shadow-sm" : `${app.color} hover:border-gray-300`}`}>
                {app.icon}
                <span className="text-[10px] font-semibold text-gray-700">{app.label}</span>
              </button>
            ))}
          </div>

          {/* Other UPI ID */}
          <button type="button" onClick={() => { setUpiApp("other"); setUpiIdErr(""); }}
            className={`w-full flex items-center gap-3 border-2 rounded-xl px-4 py-2.5 transition-all
              ${upiApp === "other" ? "border-primary-600 bg-white" : "border-dashed border-gray-300 hover:border-gray-400 bg-white"}`}>
            <MdSmartphone size={18} className="text-gray-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">Other UPI ID</span>
            {upiApp === "other" && <MdCheck size={16} className="ml-auto text-primary-600" />}
          </button>

          {upiApp === "other" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Enter UPI ID</label>
              <input value={upiId} onChange={(e) => { setUpiId(e.target.value); setUpiIdErr(""); }}
                placeholder="yourname@upi"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all
                  ${upiIdErr ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"}`} />
              {upiIdErr && <p className="text-red-500 text-xs mt-1">{upiIdErr}</p>}
            </div>
          )}
        </div>
      )}

      {/* ── 2. Credit / Debit / ATM Card ─────────────────────────────── */}
      <RadioRow id="card" icon="💳" label="Credit / Debit / ATM Card"
        sub="Visa • Mastercard • RuPay • Amex" />

      {section === "card" && (
        <div className="border border-primary-200 rounded-2xl p-4 bg-primary-50/40 space-y-3 -mt-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Card Details</p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
            <input value={cardNum} maxLength={19}
              onChange={(e) => setCardNum(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim())}
              placeholder="0000 0000 0000 0000"
              className="w-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3 py-2.5 text-sm outline-none tracking-widest" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name on Card</label>
            <input value={cardName} onChange={(e) => setCardName(e.target.value)}
              placeholder="Full name as on card"
              className="w-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
              <input value={cardExp} maxLength={5}
                onChange={(e) => { const v=e.target.value.replace(/\D/g,""); setCardExp(v.length>2?v.slice(0,2)+"/"+v.slice(2):v); }}
                placeholder="MM/YY"
                className="w-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
              <input value={cardCvv} maxLength={4} type="password" onChange={(e) => setCardCvv(e.target.value.replace(/\D/g,""))}
                placeholder="•••"
                className="w-full border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <MdLock size={12} className="text-green-500" /> Card details are securely processed via Razorpay. We never store your card information.
          </p>
        </div>
      )}

      {/* ── 3. EMI ───────────────────────────────────────────────────── */}
      <RadioRow id="emi" icon="🏦" label="EMI"
        sub="No-cost EMI on select cards • 3 to 24 months" />

      {section === "emi" && (
        <div className="border border-primary-200 rounded-2xl p-4 bg-primary-50/40 space-y-3 -mt-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose EMI Tenure</p>
          <div className="grid grid-cols-3 gap-2">
            {[3,6,9,12,18,24].map((m) => {
              const monthly = Math.ceil(totalAmount / m);
              return (
                <button key={m} type="button" onClick={() => setEmiMonths(m)}
                  className={`flex flex-col items-center border-2 rounded-xl py-2.5 px-1 transition-all
                    ${emiMonths === m ? "border-primary-600 bg-white shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <span className="text-sm font-extrabold text-gray-800">{m} mo</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">₹{monthly.toLocaleString()}/mo</span>
                  {m === 3 && <span className="text-[9px] text-green-600 font-bold mt-0.5">No Cost</span>}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            ℹ️ EMI availability depends on your card/bank. Final EMI terms will be shown at payment.
          </p>
        </div>
      )}

      {/* ── 4. Cash on Delivery ───────────────────────────────────────── */}
      <RadioRow id="cod" icon="💵" label="Cash on Delivery"
        sub="Pay when your order arrives at your door"
        badge={totalAmount > 10000 ? { text: "Not available", cls: "bg-red-100 text-red-600" } : null} />

      {section === "cod" && (
        <div className="border border-primary-200 rounded-2xl p-4 bg-amber-50/60 -mt-1 text-xs text-amber-800 space-y-1">
          <p className="font-bold">Things to note:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-700">
            <li>Keep exact change ready at the time of delivery.</li>
            <li>COD is available for orders up to ₹10,000.</li>
            <li>Refunds for COD returns are issued as store credit.</li>
          </ul>
        </div>
      )}

      {/* ── 5. Gift Card ─────────────────────────────────────────────── */}
      <RadioRow id="gift" icon="🎁" label="Gift Card"
        sub="Redeem your ShopEase gift card" />

      {section === "gift" && (
        <div className="border border-primary-200 rounded-2xl p-4 bg-primary-50/40 space-y-3 -mt-1">
          <label className="block text-xs font-semibold text-gray-600">Gift Card / Promo Code</label>
          <div className="flex gap-2">
            <input value={giftCode} onChange={(e) => { setGiftCode(e.target.value.toUpperCase()); setGiftErr(""); }}
              placeholder="Enter 16-digit code"
              className={`flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none tracking-widest font-mono transition-all
                ${giftErr ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"}`} />
            <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 rounded-xl text-sm transition-colors">
              Apply
            </button>
          </div>
          {giftErr && <p className="text-red-500 text-xs">{giftErr}</p>}
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MdCardGiftcard size={13} className="text-primary-400" />
            Find your gift card code in the email you received or on the physical card.
          </p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <MdSecurity size={16} className="text-green-500 flex-shrink-0" />
        All transactions are 256-bit SSL encrypted and 100% secure.
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button onClick={onBack} disabled={processing}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50">
          <MdArrowBack size={16} /> Back
        </button>
        <button onClick={handlePay} disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200">
          {processing ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
          ) : (
            <><MdLock size={16} />{section === "cod" ? "Place COD Order" : section === "gift" ? "Apply & Continue" : `Pay ₹${totalAmount.toLocaleString()}`}</>
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

  return (
    <div className="text-center space-y-6 py-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-once">
          <MdCheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Order Confirmed! 🎉</h2>
        <p className="text-gray-500 text-sm">
          Your order <span className="font-bold text-gray-800">#{result?.order_number}</span> has been placed successfully.
        </p>
      </div>

      {eta && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-left">
          <MdLocalShipping size={24} className="text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-800">Expected Delivery</p>
            <p className="text-xs text-gray-500">{eta}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
            <MdReceipt size={12} className="text-primary-600" /> Order
          </p>
          <p className="text-xs text-gray-500">Order No</p>
          <p className="text-sm font-bold text-gray-800 break-all">{result?.order_number}</p>
          <p className="text-xs text-gray-500 mt-2">Invoice</p>
          <p className="text-xs font-semibold text-gray-700 break-all">{result?.invoice_number}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
            <MdPayment size={12} className="text-primary-600" /> Payment
          </p>
          <p className="text-sm font-bold text-gray-800 capitalize">{result?.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
          <p className="text-xs text-gray-500 mt-1">
            {result?.payment_status === "paid" ? "Payment confirmed ✅" : result?.payment_status === "cod" ? "Pay on delivery 📦" : "Pending"}
          </p>
          <p className="text-lg font-extrabold text-primary-600 mt-2">₹{result?.total_amount?.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/my-orders"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
          View Orders
        </Link>
        <Link to="/"
          className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Continue Shopping <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
};

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items }    = useSelector((s) => s.publicCart);
  const { isLogin }  = useSelector((s) => s.customerAuth);
  const { checkoutSummary } = useSelector((s) => s.publicPayment);

  const [step,      setStep]      = useState(1);
  const [addressId, setAddressId] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    dispatch(resetPayment());
  }, [dispatch]);

  // Auth guard
  useEffect(() => {
    if (!isLogin) {
      toast.error("Please login to checkout");
      navigate("/login");
    }
  }, [isLogin, navigate]);

  // Cart guard
  useEffect(() => {
    if (isLogin && items.length === 0 && step < 4) {
      navigate("/cart");
    }
  }, [items, isLogin, step, navigate]);

  const handleAddressDone = (addrId) => {
    setAddressId(addrId);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSummaryDone = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSuccess = (result) => {
    setOrderResult(result);
    dispatch(clearCart());
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isLogin) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/cart" className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
            <MdArrowBack size={16} /> Cart
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800 font-semibold">Checkout</span>
        </div>

        <StepBar current={step} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Step Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {step === 1 && <AddressStep onNext={handleAddressDone} />}
              {step === 2 && <SummaryStep addressId={addressId} onNext={handleSummaryDone} onBack={() => setStep(1)} />}
              {step === 3 && <PaymentStep addressId={addressId} onSuccess={handlePaymentSuccess} onBack={() => setStep(2)} />}
              {step === 4 && orderResult && <ConfirmedStep result={orderResult} />}
            </div>
          </div>

          {/* Right: Summary */}
          {step < 4 && (
            <div className="lg:w-80 flex-shrink-0">
              <PriceSummary summary={checkoutSummary} cartItems={items} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
