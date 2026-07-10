import { useState } from "react";
import { Link } from "react-router-dom";
import { MdCancel, MdArrowForward, MdCheck, MdExpandMore } from "react-icons/md";

const faqs = [
  { q: "Can I cancel after the order is shipped?", a: "No. Once the order is shipped, you cannot cancel it. You will need to wait for delivery and then initiate a return request." },
  { q: "How long does it take to receive my refund after cancellation?", a: "Refunds are typically processed within 2–5 business days to the original payment method after cancellation is confirmed." },
  { q: "Will I get a full refund on cancellation?", a: "Yes, you will receive a 100% full refund including any shipping charges paid, as long as the order is cancelled before shipment." },
  { q: "Can the seller cancel my order?", a: "In rare cases a seller may cancel if the item is out of stock or unavailable. You will be notified and given a full refund immediately." },
];

const CancellationPolicy = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-red-600 to-rose-500 text-white">
        <div className="max-w-[900px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdCancel size={32} /></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Cancellation Policy</h1>
          <p className="text-white/75 text-sm max-w-md mx-auto">Cancel your order anytime before shipment and get a full, instant refund.</p>
        </div>
      </div>
      <div className="max-w-[900px] mx-auto px-4 py-10 space-y-8">
        {/* Key facts */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Instant Cancellation", desc: "Cancel before shipment in one click from My Orders", color: "bg-blue-50 border-blue-100" },
            { icon: "💯", title: "100% Refund",          desc: "Full refund including shipping charges if prepaid", color: "bg-green-50 border-green-100" },
            { icon: "⏱️", title: "2–5 Day Refund",       desc: "Refund credited to original payment method",        color: "bg-purple-50 border-purple-100" },
          ].map((f) => (
            <div key={f.title} className={`${f.color} border rounded-2xl p-5 text-center`}>
              <span className="text-4xl">{f.icon}</span>
              <p className="text-sm font-extrabold text-gray-900 mt-3">{f.title}</p>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 mb-6">How to Cancel an Order</h2>
          <div className="space-y-5">
            {[
              { icon: "🔑", step: "Sign in to your account and go to My Orders." },
              { icon: "🔍", step: "Find the order you want to cancel and click on it." },
              { icon: "❌", step: "Click 'Cancel Order' and select a reason for cancellation." },
              { icon: "✅", step: "Confirm cancellation. Your refund will be initiated immediately." },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
                <div className="flex-1 pt-1.5">
                  <span className="font-bold text-red-600 mr-2">Step {i + 1}.</span>
                  <span className="text-sm text-gray-700">{s.step}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* When can't cancel */}
        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-amber-800 mb-4">&#9888; When You Cannot Cancel</h2>
          <ul className="space-y-2">
            {[
              "Order has already been shipped (track via Track Order).",
              "Order is 'Out for Delivery' or 'Delivered' — raise a return request instead.",
              "Customised or personalised products once production has started.",
              "Digital goods and gift cards once redeemed.",
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="flex-shrink-0 mt-0.5">•</span> {p}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-base font-extrabold text-gray-900 mb-4">Cancellation FAQs</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800">{f.q}</span>
                  <MdExpandMore size={18} className={`text-gray-400 flex-shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{f.a}</div>}
              </div>
            ))}
          </div>
        </section>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/returns" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
            <span className="text-3xl">↩️</span>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Returns Policy</p><p className="text-xs text-gray-500">Already received your order?</p></div>
            <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
          </Link>
          <Link to="/contact-us" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
            <span className="text-3xl">🎧</span>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Contact Support</p><p className="text-xs text-gray-500">Get help with your cancellation</p></div>
            <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CancellationPolicy;
