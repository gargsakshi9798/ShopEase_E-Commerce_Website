import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  MdLocationOn, MdPayment, MdCheckCircle, MdArrowBack,
  MdArrowForward, MdHome, MdWork, MdPerson,
  MdPhone, MdEdit, MdCheck, MdLock, MdSecurity,
  MdLocalShipping,
} from "react-icons/md";
import { clearCart } from "../../features/public/publicCartSlice";

// ─── Step indicator ───────────────────────────────────────────────────────────
const steps = [
  { id: 1, label: "Address",  icon: MdLocationOn },
  { id: 2, label: "Payment",  icon: MdPayment },
  { id: 3, label: "Confirm",  icon: MdCheckCircle },
];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {steps.map((s, i) => {
      const done    = current > s.id;
      const active  = current === s.id;
      return (
        <div key={s.id} className="flex items-center">
          <div className={`flex flex-col items-center gap-1`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              done   ? "bg-green-500 text-white" :
              active ? "bg-primary-600 text-white shadow-lg shadow-primary-200" :
                       "bg-gray-100 text-gray-400"
            }`}>
              {done ? <MdCheck size={18} /> : <s.icon size={18} />}
            </div>
            <span className={`text-[11px] font-semibold ${active ? "text-primary-600" : done ? "text-green-600" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-20 sm:w-32 h-0.5 mx-2 mb-5 transition-all ${current > s.id ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Price Summary (right sidebar) ───────────────────────────────────────────
const PriceSummary = ({ items, couponDiscount = 0 }) => {
  const mrpTotal  = items.reduce((s, i) => s + (i.mrp ?? i.price) * i.qty, 0);
  const subtotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const savings   = mrpTotal - subtotal;
  const delivery  = subtotal >= 499 ? 0 : 49;
  const grand     = subtotal - couponDiscount + delivery;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Order Summary</h3>
      <div className="space-y-2.5 text-sm border-b border-gray-100 pb-4 mb-4 max-h-52 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item._id}-${item.selectedSize}`} className="flex items-center gap-2">
            <span className="text-2xl flex-shrink-0">{item.img}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
              <p className="text-[11px] text-gray-400">Qty: {item.qty}</p>
            </div>
            <span className="text-xs font-bold text-gray-800 flex-shrink-0">₹{(item.price * item.qty).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>MRP Total</span><span>₹{mrpTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span><span>− ₹{savings.toLocaleString()}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon</span><span>− ₹{couponDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
        </div>
        <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span><span>₹{grand.toLocaleString()}</span>
        </div>
      </div>
      {(savings + couponDiscount) > 0 && (
        <p className="mt-3 text-xs text-green-600 font-semibold bg-green-50 rounded-xl px-3 py-2 text-center">
          🎉 You save ₹{(savings + couponDiscount).toLocaleString()} on this order!
        </p>
      )}
    </div>
  );
};

// ─── STEP 1: Address Form ─────────────────────────────────────────────────────
const AddressStep = ({ onNext, savedAddress }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: savedAddress || {},
  });
  const [addrType, setAddrType] = useState("home");

  const onSubmit = (data) => onNext({ ...data, addrType });

  const field = (label, name, rules, placeholder, type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${
          errors[name] ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        }`}
        {...register(name, rules)}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MdLocationOn size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
      </div>

      {/* Address type */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Address Type</label>
        <div className="flex gap-3">
          {[
            { val: "home",  icon: MdHome,   label: "Home" },
            { val: "work",  icon: MdWork,   label: "Work" },
            { val: "other", icon: MdPerson, label: "Other" },
          ].map(({ val, icon: Icon, label }) => (
            <button key={val} type="button" onClick={() => setAddrType(val)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                addrType === val ? "border-primary-600 bg-primary-50 text-primary-600" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {field("First Name *", "first_name", { required: "Required" }, "First name")}
        {field("Last Name *", "last_name", { required: "Required" }, "Last name")}
      </div>
      {field("Mobile Number *", "mobile", {
        required: "Required",
        pattern: { value: /^[6-9]\d{9}$/, message: "Valid 10-digit number required" }
      }, "10-digit mobile number", "tel")}
      {field("Address Line 1 *", "address1", { required: "Required" }, "House / Flat no., Building, Street")}
      {field("Address Line 2", "address2", {}, "Area, Colony, Locality (optional)")}
      <div className="grid grid-cols-2 gap-4">
        {field("City *", "city", { required: "Required" }, "City")}
        {field("State *", "state", { required: "Required" }, "State")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("Pincode *", "pincode", {
          required: "Required",
          pattern: { value: /^[1-9][0-9]{5}$/, message: "Valid 6-digit pincode required" }
        }, "6-digit pincode")}
        {field("Landmark", "landmark", {}, "Nearby landmark (optional)")}
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 mt-2">
        Continue to Payment <MdArrowForward size={18} />
      </button>
    </form>
  );
};

// ─── STEP 2: Payment ─────────────────────────────────────────────────────────
const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    icon: "🔷",
    desc: "Google Pay, PhonePe, Paytm, BHIM",
    fields: [{ name: "upi_id", label: "UPI ID", placeholder: "yourname@upi", pattern: /^[\w.\-]+@[\w]+$/, patternMsg: "Invalid UPI ID" }],
  },
  {
    id: "card_visa",
    label: "VISA Card",
    icon: "💳",
    iconClass: "text-blue-700 font-extrabold",
    desc: "Visa Credit / Debit Card",
    fields: [
      { name: "card_number", label: "Card Number", placeholder: "1234 5678 9012 3456", maxLen: 19 },
      { name: "card_name",   label: "Name on Card", placeholder: "As printed on card" },
      { name: "expiry",      label: "Expiry (MM/YY)", placeholder: "MM/YY", maxLen: 5 },
      { name: "cvv",         label: "CVV", placeholder: "•••", maxLen: 3, type: "password" },
    ],
  },
  {
    id: "card_mc",
    label: "Mastercard",
    icon: "🔴",
    desc: "Mastercard Credit / Debit Card",
    fields: [
      { name: "card_number", label: "Card Number", placeholder: "1234 5678 9012 3456", maxLen: 19 },
      { name: "card_name",   label: "Name on Card", placeholder: "As printed on card" },
      { name: "expiry",      label: "Expiry (MM/YY)", placeholder: "MM/YY", maxLen: 5 },
      { name: "cvv",         label: "CVV", placeholder: "•••", maxLen: 3, type: "password" },
    ],
  },
  {
    id: "rupay",
    label: "RuPay",
    icon: "🟠",
    desc: "RuPay Debit / Credit Card",
    fields: [
      { name: "card_number", label: "Card Number", placeholder: "1234 5678 9012 3456", maxLen: 19 },
      { name: "card_name",   label: "Name on Card", placeholder: "As printed on card" },
      { name: "expiry",      label: "Expiry (MM/YY)", placeholder: "MM/YY", maxLen: 5 },
      { name: "cvv",         label: "CVV", placeholder: "•••", maxLen: 3, type: "password" },
    ],
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "💵",
    desc: "Pay with cash when your order arrives",
    fields: [],
  },
];

const PaymentStep = ({ onNext, onBack, grandTotal }) => {
  const [selected,  setSelected]  = useState("");
  const [fieldVals, setFieldVals] = useState({});
  const [errors,    setErrors]    = useState({});
  const [processing, setProcessing] = useState(false);

  const method = paymentMethods.find((m) => m.id === selected);

  const handleFieldChange = (name, value) => {
    let v = value;
    if (name === "card_number") v = v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
    if (name === "expiry")      v = v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);
    setFieldVals((p) => ({ ...p, [name]: v }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    if (!selected) { toast.error("Please select a payment method"); return false; }
    if (!method?.fields?.length) return true; // COD
    const errs = {};
    method.fields.forEach((f) => {
      const val = (fieldVals[f.name] || "").trim();
      if (!val) errs[f.name] = `${f.label} is required`;
      else if (f.pattern && !f.pattern.test(val)) errs[f.name] = f.patternMsg || "Invalid value";
    });
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const handlePay = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onNext({ method: selected, methodLabel: method.label, details: fieldVals });
    }, 1800); // simulate payment processing
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MdPayment size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold text-gray-900">Select Payment Method</h2>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((pm) => (
          <div key={pm.id}
            onClick={() => { setSelected(pm.id); setFieldVals({}); setErrors({}); }}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
              selected === pm.id ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-gray-300 bg-white"
            }`}>
            <div className="flex items-center gap-3">
              {/* Radio */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                selected === pm.id ? "border-primary-600" : "border-gray-300"
              }`}>
                {selected === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
              </div>
              <span className="text-xl">{pm.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{pm.label}</p>
                <p className="text-xs text-gray-400">{pm.desc}</p>
              </div>
              {pm.id === "cod" && (
                <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-lg">+₹49 fee</span>
              )}
            </div>

            {/* Expanded fields */}
            {selected === pm.id && pm.fields.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-primary-200 pt-4">
                {pm.fields.map((f) => (
                  <div key={f.name} className={f.name === "card_number" || f.name === "card_name" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                    <div className="relative">
                      <input
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={fieldVals[f.name] || ""}
                        onChange={(e) => handleFieldChange(f.name, e.target.value)}
                        maxLength={f.maxLen}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${
                          errors[f.name] ? "border-red-400 ring-1 ring-red-400" : "border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        }`}
                      />
                      {f.name === "cvv" && <MdLock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                    </div>
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* COD note */}
            {selected === pm.id && pm.id === "cod" && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700 border-t border-primary-200">
                💡 A ₹49 COD handling fee will be added to your order total. Pay in cash when the delivery arrives.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Secure badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
        <MdSecurity size={16} className="text-green-500 flex-shrink-0" />
        All payments are 256-bit SSL encrypted and 100% secure.
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-3 rounded-xl transition-colors">
          <MdArrowBack size={16} /> Back
        </button>
        <button onClick={handlePay} disabled={!selected || processing}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200">
          {processing ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <MdLock size={16} />
              {selected === "cod" ? "Place Order (COD)" : `Pay ₹${grandTotal.toLocaleString()}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── STEP 3: Order Confirmed ──────────────────────────────────────────────────
const ConfirmStep = ({ address, payment, items, grandTotal }) => {
  const orderId = `SE${Date.now().toString().slice(-8)}`;
  const eta = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="text-center space-y-6">
      {/* Success animation */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <MdCheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Order Placed! 🎉</h2>
        <p className="text-gray-500 text-sm">
          Your order <span className="font-bold text-gray-800">#{orderId}</span> has been placed successfully.
        </p>
      </div>

      {/* Delivery ETA */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
        <MdLocalShipping size={24} className="text-primary-600 flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm font-bold text-gray-800">Expected Delivery</p>
          <p className="text-xs text-gray-500">{eta}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <MdLocationOn size={14} className="text-primary-600" /> Delivery Address
          </p>
          <p className="text-sm font-semibold text-gray-800">{address.first_name} {address.last_name}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {address.address1}{address.address2 ? `, ${address.address2}` : ""}<br />
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MdPhone size={11} /> {address.mobile}
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <MdPayment size={14} className="text-primary-600" /> Payment
          </p>
          <p className="text-sm font-semibold text-gray-800">{payment.methodLabel}</p>
          <p className="text-xs text-gray-500 mt-1">
            {payment.method === "cod" ? "Pay on delivery" : "Payment confirmed ✓"}
          </p>
          <p className="text-base font-extrabold text-primary-600 mt-2">₹{grandTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          {items.length} Item{items.length > 1 ? "s" : ""} Ordered
        </p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item._id}-${item.selectedSize}`} className="flex items-center gap-3">
              <span className="text-3xl">{item.img}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400">Qty: {item.qty} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}</p>
              </div>
              <span className="text-sm font-bold text-gray-800">₹{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
          <MdHome size={16} /> Back to Home
        </Link>
        <Link to="/fashion"
          className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors">
          Continue Shopping <MdArrowForward size={16} />
        </Link>
      </div>
    </div>
  );
};

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const Checkout = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector((s) => s.publicCart);
  const customer  = useSelector((s) => s.customerAuth?.user);

  const [step,     setStep]    = useState(1);
  const [address,  setAddress] = useState(null);
  const [payment,  setPayment] = useState(null);

  // Redirect if not logged in
  if (!customer) {
    toast.error("Please login to checkout");
    navigate("/login");
    return null;
  }

  // Redirect if cart empty
  if (items.length === 0 && step < 3) {
    navigate("/cart");
    return null;
  }

  const subtotal       = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : 49;
  const mrpTotal       = items.reduce((s, i) => s + (i.mrp ?? i.price) * i.qty, 0);
  const savings        = mrpTotal - subtotal;
  const codFee         = payment?.method === "cod" ? 49 : 0;
  const grandTotal     = subtotal + deliveryCharge + codFee;

  const handleAddressDone = (addr) => {
    setAddress(addr);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentDone = (pay) => {
    setPayment(pay);
    dispatch(clearCart());
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

          {/* ── Left: Step content ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">

              {step === 1 && (
                <AddressStep onNext={handleAddressDone} savedAddress={address} />
              )}

              {step === 2 && (
                <>
                  {/* Address summary bar */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center justify-between border border-gray-100">
                    <div className="flex items-start gap-2">
                      <MdLocationOn size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-700">{address?.first_name} {address?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {address?.address1}, {address?.city}, {address?.state} - {address?.pincode}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setStep(1)}
                      className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline flex-shrink-0 ml-2">
                      <MdEdit size={13} /> Change
                    </button>
                  </div>
                  <PaymentStep
                    onNext={handlePaymentDone}
                    onBack={() => setStep(1)}
                    grandTotal={grandTotal}
                  />
                </>
              )}

              {step === 3 && address && payment && (
                <ConfirmStep
                  address={address}
                  payment={payment}
                  items={items.length > 0 ? items : JSON.parse(sessionStorage.getItem("last_order_items") || "[]")}
                  grandTotal={grandTotal}
                />
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          {step < 3 && (
            <div className="lg:w-80 flex-shrink-0">
              <PriceSummary items={items} couponDiscount={0} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;