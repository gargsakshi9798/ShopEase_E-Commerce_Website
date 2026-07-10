import { Link } from "react-router-dom";
import { MdLocalShipping, MdArrowForward, MdCheck } from "react-icons/md";

const zones = [
  { zone: "Metro Cities",     time: "1–2 Business Days",  cities: "Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata",    color: "bg-green-50 border-green-200 text-green-700" },
  { zone: "Tier 1 Cities",    time: "2–3 Business Days",  cities: "Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Bhopal",    color: "bg-blue-50 border-blue-200 text-blue-700" },
  { zone: "Tier 2 & 3 Cities",time: "3–5 Business Days",  cities: "Most other cities & towns",                               color: "bg-amber-50 border-amber-200 text-amber-700" },
  { zone: "Remote Areas",     time: "5–7 Business Days",  cities: "Rural and remote pin codes",                              color: "bg-gray-50 border-gray-200 text-gray-700" },
];

const ShippingPolicy = () => (
  <div className="bg-gray-50 min-h-screen">
    <div className="bg-gradient-to-br from-blue-700 to-cyan-600 text-white">
      <div className="max-w-[900px] mx-auto px-4 py-14 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdLocalShipping size={32} /></div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Shipping Policy</h1>
        <p className="text-white/75 text-sm max-w-md mx-auto">Fast, reliable delivery across India with full tracking from checkout to doorstep.</p>
      </div>
    </div>
    <div className="max-w-[900px] mx-auto px-4 py-10 space-y-8">
      {/* Highlights */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: "🚀", title: "Free Delivery",       desc: "On all orders above ₹499" },
          { icon: "📍", title: "Pan-India Delivery",  desc: "We deliver to 27,000+ pin codes" },
          { icon: "🔔", title: "Real-Time Tracking",  desc: "Track your order every step of the way" },
        ].map((h) => (
          <div key={h.title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <span className="text-4xl">{h.icon}</span>
            <p className="text-sm font-extrabold text-gray-900 mt-3">{h.title}</p>
            <p className="text-xs text-gray-500 mt-1">{h.desc}</p>
          </div>
        ))}
      </div>

      {/* Delivery Timeline */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900 mb-5">Estimated Delivery Times</h2>
        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.zone} className={`${z.color} border rounded-xl p-4`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-bold">{z.zone}</p>
                  <p className="text-xs opacity-80 mt-0.5">{z.cities}</p>
                </div>
                <span className="text-sm font-extrabold px-3 py-1 bg-white/60 rounded-lg">{z.time}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">* Delivery times are estimates and may vary during sale periods, holidays, or adverse weather conditions.</p>
      </section>

      {/* Charges */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900 mb-5">Shipping Charges</h2>
        <div className="space-y-3">
          {[
            { label: "Order above ₹499",        charge: "FREE",  desc: "Standard delivery, free of charge" },
            { label: "Order below ₹499",         charge: "₹49",  desc: "Flat shipping fee" },
            { label: "Express Delivery",          charge: "₹99",  desc: "Next-day delivery (select cities only)" },
            { label: "Heavy / Oversized Items",   charge: "₹149+",desc: "Applicable on large appliances & furniture" },
          ].map((c) => (
            <div key={c.label} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
              <span className={`text-sm font-extrabold ${c.charge === "FREE" ? "text-green-600" : "text-gray-800"}`}>{c.charge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Points */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900 mb-5">Important Shipping Information</h2>
        <ul className="space-y-3">
          {[
            "Orders placed before 2 PM on business days are typically dispatched the same day.",
            "Sundays and public holidays are not counted as business days.",
            "You will receive an email and SMS with tracking details once your order is shipped.",
            "For orders with multiple items, partial shipments may occur if items are from different sellers.",
            "ShopEase is not responsible for delays caused by incorrect or incomplete delivery addresses.",
            "Deliveries require a signature or OTP confirmation for high-value orders above ₹5,000.",
          ].map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <MdCheck size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> {p}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/track-order" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
          <span className="text-3xl">📦</span>
          <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Track Your Order</p><p className="text-xs text-gray-500">Real-time order tracking</p></div>
          <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
        </Link>
        <Link to="/contact-us" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
          <span className="text-3xl">🎧</span>
          <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Delivery Issues?</p><p className="text-xs text-gray-500">Our team is here to help</p></div>
          <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
        </Link>
      </div>
    </div>
  </div>
);
export default ShippingPolicy;
