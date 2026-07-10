import { useState } from "react";
import { Link } from "react-router-dom";
import { MdSearch, MdLocalShipping, MdCheck, MdAccessTime, MdHome, MdArrowForward, MdHeadset } from "react-icons/md";

const steps = [
  { icon: "📦", label: "Order Placed",    desc: "Your order has been confirmed" },
  { icon: "🔧", label: "Processing",      desc: "Seller is preparing your order" },
  { icon: "🚚", label: "Shipped",         desc: "Your order is on the way" },
  { icon: "📍", label: "Out for Delivery",desc: "Arriving today" },
  { icon: "✅", label: "Delivered",       desc: "Delivered to your address" },
];

const demoOrders = [
  { id: "SE2024001", product: "Samsung Galaxy S24 Ultra", status: 3, date: "Jul 7, 2026", eta: "Jul 11, 2026", partner: "Delhivery", tracking: "DL9234567890" },
  { id: "SE2024002", product: "Nike Air Max 270",         status: 4, date: "Jul 5, 2026", eta: "Jul 9, 2026",  partner: "Blue Dart",  tracking: "BD7654321098" },
];

const TrackOrder = () => {
  const [input, setInput]       = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult]     = useState(null);

  const handleTrack = () => {
    setSearched(true);
    const found = demoOrders.find((o) => o.id.toLowerCase() === input.trim().toLowerCase() || o.tracking.toLowerCase() === input.trim().toLowerCase());
    setResult(found || null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white">
        <div className="max-w-[900px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdLocalShipping size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Track Your Order</h1>
          <p className="text-white/70 text-sm mb-8">Enter your Order ID or Tracking Number to get real-time updates.</p>
          <div className="flex max-w-lg mx-auto gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Order ID (e.g. SE2024001) or Tracking No."
              className="flex-1 px-4 py-4 rounded-2xl text-gray-800 text-sm outline-none shadow-xl focus:ring-2 focus:ring-white/50" />
            <button onClick={handleTrack}
              className="px-6 py-4 bg-white text-green-700 font-extrabold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl text-sm whitespace-nowrap">
              Track
            </button>
          </div>
          <p className="text-white/50 text-xs mt-3">Try: <button onClick={() => setInput("SE2024001")} className="underline">SE2024001</button> or <button onClick={() => setInput("SE2024002")} className="underline">SE2024002</button></p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-10 space-y-8">
        {/* Result */}
        {searched && (
          result ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Order ID</p>
                  <p className="font-extrabold text-gray-900 text-lg">{result.id}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{result.product}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    <MdLocalShipping size={13} /> {steps[result.status].label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Estimated: {result.eta}</p>
                </div>
              </div>
              {/* Stepper */}
              <div className="px-6 py-8">
                <div className="relative">
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-100 mx-8" />
                  <div
                    className="absolute top-8 left-0 h-0.5 bg-green-500 mx-8 transition-all"
                    style={{ width: `${(result.status / (steps.length - 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {steps.map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm z-10 relative border-2 transition-all ${i <= result.status ? "bg-green-500 border-green-500" : "bg-white border-gray-200"}`}>
                          {i < result.status ? <MdCheck size={24} className="text-white" /> : <span>{s.icon}</span>}
                        </div>
                        <p className={`text-xs font-bold text-center ${i <= result.status ? "text-green-700" : "text-gray-400"}`}>{s.label}</p>
                        <p className="text-[10px] text-gray-400 text-center hidden sm:block">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex flex-wrap gap-4">
                <div><p className="text-[11px] text-gray-400">Courier Partner</p><p className="text-sm font-bold text-gray-700">{result.partner}</p></div>
                <div><p className="text-[11px] text-gray-400">Tracking Number</p><p className="text-sm font-bold text-gray-700">{result.tracking}</p></div>
                <div><p className="text-[11px] text-gray-400">Order Date</p><p className="text-sm font-bold text-gray-700">{result.date}</p></div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <span className="text-5xl">📦</span>
              <p className="text-gray-700 font-bold mt-4">Order not found</p>
              <p className="text-sm text-gray-500 mt-1">Please check your Order ID or Tracking Number and try again.</p>
              <Link to="/contact-us" className="inline-flex items-center gap-2 mt-5 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <MdHeadset size={15} /> Contact Support
              </Link>
            </div>
          )
        )}

        {/* How it works */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 mb-5">How Order Tracking Works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: "📧", title: "Check Your Email", desc: "We send tracking details to your registered email after shipment." },
              { icon: "📱", title: "SMS Updates",      desc: "Get real-time SMS notifications at every delivery milestone." },
              { icon: "🔍", title: "Track Anytime",    desc: "Use your Order ID above to check status 24/7 from any device." },
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

        {/* Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "↩️", title: "Returns & Refunds", path: "/returns",          desc: "Start a return or refund" },
            { icon: "❌", title: "Cancel Order",      path: "/cancellation-policy",desc: "Cancel before shipment" },
            { icon: "🎧", title: "Contact Support",   path: "/contact-us",        desc: "We're here 24/7" },
          ].map((l) => (
            <Link key={l.title} to={l.path}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
              <span className="text-3xl">{l.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">{l.title}</p>
                <p className="text-xs text-gray-500">{l.desc}</p>
              </div>
              <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
