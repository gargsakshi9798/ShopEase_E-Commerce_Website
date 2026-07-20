import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "../../utils/toast";
import { FaGift } from "react-icons/fa";
import {
  MdArrowForward, MdCheck, MdContentCopy, MdCreditCard,
  MdLocalOffer, MdHistory, MdShoppingCart, MdRefresh,
} from "react-icons/md";
import {
  initiateGiftCardPayment, verifyGiftCardPayment,
  fetchMyGiftCards, checkGiftCardBalance,
  resetPurchase, clearCheckedCard,
} from "../../features/public/publicGiftCardSlice";
import AccountLayout from "../../components/public/layout/AccountLayout";
import { formatDate } from "../../utils/Methods";

const AMOUNTS   = [500, 1000, 2000, 5000, 10000];
const OCCASIONS = ["Birthday 🎂","Anniversary 💑","Diwali 🪔","New Year 🎊","Thank You 🙏","Loyalty Reward 🏆","General 🎁"];
const DESIGNS   = [
  { id:"festive",   label:"Festive",   emoji:"🎉", gradient:"from-rose-500 to-pink-600" },
  { id:"birthday",  label:"Birthday",  emoji:"🎂", gradient:"from-amber-500 to-orange-600" },
  { id:"premium",   label:"Premium",   emoji:"✨", gradient:"from-violet-600 to-purple-700" },
  { id:"corporate", label:"Corporate", emoji:"🏢", gradient:"from-blue-600 to-indigo-700" },
  { id:"wedding",   label:"Wedding",   emoji:"💒", gradient:"from-pink-400 to-rose-500" },
  { id:"minimal",   label:"Minimal",   emoji:"🌿", gradient:"from-teal-500 to-cyan-600" },
];

const STATUS_CFG = {
  pending_review:    { label:"Under Review",    color:"bg-amber-100 text-amber-800" },
  pending_approval:  { label:"Pending Approval", color:"bg-blue-100 text-blue-800" },
  active:            { label:"Active ✅",         color:"bg-green-100 text-green-800" },
  partially_redeemed:{ label:"Partial",          color:"bg-indigo-100 text-indigo-800" },
  redeemed:          { label:"Fully Used",       color:"bg-gray-100 text-gray-600" },
  rejected:          { label:"Rejected",         color:"bg-red-100 text-red-700" },
  expired:           { label:"Expired",          color:"bg-gray-100 text-gray-500" },
  cancelled:         { label:"Cancelled",        color:"bg-red-100 text-red-700" },
};

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true); s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const GiftCards = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isLogin } = useSelector((s) => s.customerAuth);
  const { myCards, paymentStatus, purchaseResult, checkedCard, balanceStatus } =
    useSelector((s) => s.publicGiftCard);

  const [tab, setTab]       = useState("buy");    // "buy" | "my_cards" | "balance"
  const [step, setStep]     = useState(1);
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [design, setDesign] = useState("festive");
  const [occasion, setOccasion] = useState("Birthday 🎂");
  const [toName, setToName]     = useState("");
  const [toEmail, setToEmail]   = useState("");
  const [fromName, setFromName] = useState("");
  const [message, setMessage]   = useState("");
  const [balanceCode, setBalanceCode] = useState("");
  const [copiedCode, setCopiedCode]   = useState("");

  const finalAmt    = custom ? Number(custom) : amount;
  const selectedDsg = DESIGNS.find((d) => d.id === design) || DESIGNS[0];
  const processing  = paymentStatus === "loading" || paymentStatus === "verifying" || paymentStatus === "initiated";

  useEffect(() => {
    if (isLogin && tab === "my_cards") dispatch(fetchMyGiftCards());
    return () => { dispatch(resetPurchase()); dispatch(clearCheckedCard()); };
  }, [tab, isLogin, dispatch]);

  const handlePay = async () => {
    if (!isLogin) { toast.error("Please login to purchase a gift card"); navigate("/login"); return; }
    if (finalAmt < 100 || finalAmt > 50000) { toast.error("Amount must be between ₹100 and ₹50,000"); return; }
    if (!toName.trim()) { toast.error("Recipient name is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) { toast.error("Valid recipient email required"); return; }

    const loaded = await loadRazorpay();
    if (!loaded) { toast.error("Payment gateway failed to load"); return; }

    const res = await dispatch(initiateGiftCardPayment({
      amount: finalAmt, recipient_email: toEmail, recipient_name: toName,
      sender_name: fromName, occasion, design, message,
    }));
    if (!res.payload?.success) { toast.error(res.payload?.message || "Failed to initiate payment"); return; }

    const { razorpay_order_id, amount: rzpAmt, currency, key_id } = res.payload.data;

    new window.Razorpay({
      key: key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: rzpAmt, currency,
      name: "ShopEase Gift Card",
      description: `₹${finalAmt} Gift Card for ${toName}`,
      order_id: razorpay_order_id,
      handler: async (response) => {
        const verifyRes = await dispatch(verifyGiftCardPayment({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          amount: finalAmt, recipient_email: toEmail, recipient_name: toName,
          sender_name: fromName, occasion, design, message,
        }));
        if (verifyRes.payload?.success) { setStep(4); }
        else { toast.error(verifyRes.payload?.message || "Payment verification failed"); }
      },
      prefill: {},
      theme: { color: "#6d28d9" },
      modal: { ondismiss: () => toast.error("Payment was cancelled") },
    }).open();
  };

  const handleCheckBalance = () => {
    if (!balanceCode.trim()) { toast.error("Enter a gift card code"); return; }
    dispatch(checkGiftCardBalance(balanceCode.trim().toUpperCase()));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code); toast.success("Code copied!");
      setTimeout(() => setCopiedCode(""), 2000);
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white">
        <div className="max-w-[960px] mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaGift size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Gift Cards</h1>
          <p className="text-white/75 text-sm max-w-md mx-auto">
            Give the gift of choice. Redeemable across 20L+ products.
          </p>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mt-6">
            {[
              { id:"buy",      label:"Buy a Gift Card" },
              { id:"my_cards", label:"My Gift Cards" },
              { id:"balance",  label:"Check Balance" },
            ].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setStep(1); dispatch(resetPurchase()); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id ? "bg-white text-purple-700 shadow" : "bg-white/15 text-white hover:bg-white/25"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-8">

        {/* ── BUY TAB ── */}
        {tab === "buy" && (
          <>
            {step < 4 && (
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  {/* Step 1: Amount & Design */}
                  {step === 1 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                      <h2 className="text-base font-extrabold text-gray-900">Choose Amount</h2>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {AMOUNTS.map((a) => (
                          <button key={a} onClick={() => { setAmount(a); setCustom(""); }}
                            className={`py-3 rounded-xl text-sm font-extrabold border-2 transition-all ${
                              !custom && amount === a
                                ? "border-primary-500 bg-primary-50 text-primary-700"
                                : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}>
                            ₹{a.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Custom Amount (₹100–₹50,000)</label>
                        <input type="number" value={custom} onChange={(e) => setCustom(e.target.value)}
                          placeholder="Enter custom amount"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500" />
                      </div>
                      <h3 className="text-sm font-extrabold text-gray-900">Choose Design</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {DESIGNS.map((d) => (
                          <button key={d.id} onClick={() => setDesign(d.id)}
                            className={`rounded-xl overflow-hidden border-2 transition-all ${
                              design === d.id ? "border-primary-500 scale-105 shadow" : "border-transparent"
                            }`}>
                            <div className={`bg-gradient-to-br ${d.gradient} h-14 flex items-center justify-center text-2xl`}>{d.emoji}</div>
                            <p className="text-[10px] font-bold text-gray-600 py-1 text-center bg-white">{d.label}</p>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setStep(2)} disabled={!finalAmt || finalAmt < 100}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2">
                        Continue <MdArrowForward size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Personalise */}
                  {step === 2 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <h2 className="text-base font-extrabold text-gray-900">Personalise Your Gift</h2>
                      <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map((o) => (
                          <button key={o} onClick={() => setOccasion(o)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              occasion === o ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-200 text-gray-600 hover:border-primary-400"
                            }`}>
                            {o}
                          </button>
                        ))}
                      </div>
                      {[
                        { label:"Recipient Name *", val:toName,   set:setToName,   ph:"Friend or family name" },
                        { label:"Recipient Email *",val:toEmail,  set:setToEmail,  ph:"their@email.com"       },
                        { label:"Your Name",        val:fromName, set:setFromName, ph:"Your name"             },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-xs font-bold text-gray-500 mb-1 block">{f.label}</label>
                          <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Personal Message (optional)</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
                          placeholder="Write a heartfelt message…"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 resize-none" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 text-sm">Back</button>
                        <button onClick={() => setStep(3)} disabled={!toName || !toEmail}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                          Preview & Pay <MdArrowForward size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirm & Pay */}
                  {step === 3 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                      <h2 className="text-base font-extrabold text-gray-900">Confirm & Pay</h2>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                        {[
                          ["Amount",   `₹${finalAmt.toLocaleString()}`],
                          ["Design",   selectedDsg.label],
                          ["Occasion", occasion],
                          ["To",       `${toName} (${toEmail})`],
                          ["From",     fromName || "—"],
                          ["Message",  message || "—"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-gray-500 font-medium">{k}</span>
                            <span className="text-gray-900 font-semibold text-right max-w-[60%] truncate">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                        ⏳ Gift cards are activated after payment verification (usually instantly, may take up to a few hours for high-value cards).
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 text-sm">Back</button>
                        <button onClick={handlePay} disabled={processing}
                          className="flex-1 bg-gradient-to-r from-rose-600 to-purple-700 hover:opacity-90 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                          {processing ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <MdCreditCard size={16} />}
                          Pay ₹{finalAmt.toLocaleString()} & Send 🎁
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-2">
                  <div className="sticky top-24 space-y-3">
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Live Preview</p>
                    <div className={`bg-gradient-to-br ${selectedDsg.gradient} rounded-3xl p-7 text-white shadow-xl`}>
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">ShopEase Gift Card</span>
                        <span className="text-3xl">{selectedDsg.emoji}</span>
                      </div>
                      <p className="text-5xl font-extrabold mb-2">₹{finalAmt > 0 ? finalAmt.toLocaleString() : "—"}</p>
                      <p className="text-white/70 text-sm">{occasion}</p>
                      {toName && <p className="text-white/90 text-sm mt-1 font-semibold">For: {toName}</p>}
                      {fromName && <p className="text-white/60 text-xs mt-0.5">From: {fromName}</p>}
                      {message && <p className="text-white/70 text-xs italic mt-3 bg-white/10 rounded-xl px-3 py-2">"{message}"</p>}
                      <p className="text-white/40 text-[10px] mt-5">Valid for 12 months from activation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && purchaseResult && (
              <div className="max-w-lg mx-auto space-y-5">
                <div className={`bg-gradient-to-br ${selectedDsg.gradient} rounded-3xl p-10 text-white shadow-2xl text-center`}>
                  <span className="text-6xl block mb-4">{selectedDsg.emoji}</span>
                  <p className="text-sm font-semibold text-white/80 mb-1">ShopEase Gift Card</p>
                  <p className="text-5xl font-extrabold mb-2">₹{purchaseResult.amount?.toLocaleString()}</p>
                  <p className="text-white/70 text-sm">For {purchaseResult.recipient_name}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                  {purchaseResult.is_active ? (
                    <>
                      <p className="text-green-700 font-bold text-center text-sm">🎉 Gift Card Activated!</p>
                      <p className="text-xs text-gray-500 text-center">
                        The code has been sent to <strong>{purchaseResult.recipient_email}</strong>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="flex-1 font-extrabold text-xl text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 tracking-widest text-center font-mono">
                          {purchaseResult.code}
                        </span>
                        <button onClick={() => copyCode(purchaseResult.code)}
                          className="w-11 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center">
                          {copiedCode === purchaseResult.code ? <MdCheck size={17} /> : <MdContentCopy size={17} />}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <p className="text-amber-800 font-bold text-sm">⏳ Under Review</p>
                      <p className="text-amber-700 text-xs mt-1">
                        Your purchase is confirmed. The gift card will be activated after review (usually a few hours).
                        You'll receive an email confirmation once it's active.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setStep(1); dispatch(resetPurchase()); }}
                    className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-50">
                    Send Another
                  </button>
                  <Link to="/my-orders" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                    <MdShoppingCart size={16} /> Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MY CARDS TAB ── */}
        {tab === "my_cards" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <MdHistory size={20} className="text-primary-600" /> My Gift Cards
              </h2>
              <button onClick={() => dispatch(fetchMyGiftCards())}
                className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold">
                <MdRefresh size={16} /> Refresh
              </button>
            </div>
            {!isLogin ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                <FaGift size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">Please login to view your gift cards</p>
                <Link to="/login" className="mt-3 inline-block bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Login</Link>
              </div>
            ) : myCards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                <FaGift size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No gift cards yet</p>
                <button onClick={() => setTab("buy")} className="mt-3 inline-block bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                  Buy a Gift Card
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myCards.map((card) => {
                  const dsg = DESIGNS.find((d) => d.id === card.design) || DESIGNS[0];
                  const cfg = STATUS_CFG[card.status] || { label: card.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={card._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className={`bg-gradient-to-br ${dsg.gradient} p-5 text-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">Gift Card</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <p className="text-3xl font-extrabold">₹{card.amount?.toLocaleString()}</p>
                        <p className="text-white/70 text-xs mt-1">Balance: ₹{card.balance?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-gray-500">For: <span className="font-semibold text-gray-800">{card.recipient_name}</span></p>
                        <p className="text-xs text-gray-500">Expires: <span className="font-semibold">{formatDate(card.expiry_date)}</span></p>
                        {(card.status === "active" || card.status === "partially_redeemed") && card.code && (
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                            <span className="flex-1 font-mono font-bold text-sm text-gray-800 tracking-widest">{card.code}</span>
                            <button onClick={() => copyCode(card.code)}
                              className="w-7 h-7 flex items-center justify-center bg-primary-600 text-white rounded-lg">
                              {copiedCode === card.code ? <MdCheck size={13} /> : <MdContentCopy size={13} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BALANCE TAB ── */}
        {tab === "balance" && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <MdLocalOffer size={18} className="text-primary-600" /> Check Gift Card Balance
              </h2>
              <div className="flex gap-2">
                <input value={balanceCode} onChange={(e) => setBalanceCode(e.target.value.toUpperCase())}
                  placeholder="Enter gift card code (e.g. GIFT-XXXXXXXX)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 font-mono uppercase"
                  onKeyDown={(e) => e.key === "Enter" && handleCheckBalance()} />
                <button onClick={handleCheckBalance} disabled={balanceStatus === "loading"}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                  Check
                </button>
              </div>
              {balanceStatus === "succeeded" && checkedCard && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                  {[
                    ["Code",            checkedCard.code],
                    ["Original Value",  `₹${checkedCard.original_amount?.toLocaleString()}`],
                    ["Available Balance", `₹${checkedCard.balance?.toLocaleString()}`],
                    ["Status",          checkedCard.status?.replace(/_/g, " ")],
                    ["Expires",         formatDate(checkedCard.expiry_date)],
                    ["Usable",          checkedCard.is_usable ? "✅ Yes" : "❌ No"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">{k}</span>
                      <span className="text-gray-800 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {balanceStatus === "failed" && (
                <p className="text-red-500 text-sm text-center">Gift card not found. Please check the code.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GiftCards;
