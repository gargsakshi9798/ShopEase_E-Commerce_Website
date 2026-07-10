import { useState } from "react";
import { Link } from "react-router-dom";
import { MdSearch, MdArrowForward, MdExpandMore, MdHeadset, MdLocalShipping, MdLoop, MdPayment, MdSecurity, MdShoppingCart } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const faqs = [
  { q: "How do I track my order?", a: "Go to My Orders in your account, click on the order and select 'Track Order'. You'll get real-time updates via SMS and email too.", cat: "Orders" },
  { q: "What is the return policy?", a: "Most items can be returned within 7 days of delivery. Items must be unused, in original packaging with all tags intact.", cat: "Returns" },
  { q: "How long does delivery take?", a: "Standard delivery takes 2–5 business days. Express delivery (available in select cities) takes 1–2 days.", cat: "Delivery" },
  { q: "How do I cancel my order?", a: "You can cancel an order before it ships from 'My Orders'. Once shipped, you'll need to wait for delivery and then raise a return request.", cat: "Orders" },
  { q: "What payment methods are accepted?", a: "We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, EMI and Cash on Delivery.", cat: "Payments" },
  { q: "How do I apply a coupon code?", a: "Add items to cart, proceed to checkout, and enter your coupon code in the 'Apply Coupon' box before payment.", cat: "Payments" },
  { q: "Is my payment information secure?", a: "Yes. We use 256-bit SSL encryption and are PCI-DSS compliant. We never store your full card details.", cat: "Security" },
  { q: "Can I change my delivery address?", a: "You can change the address before the order is shipped. Go to My Orders → Edit Delivery Address.", cat: "Delivery" },
  { q: "How do I contact customer support?", a: "You can reach us via live chat (24/7), email at support@shopease.in, or call 1800-123-4567 (9am–9pm).", cat: "Support" },
  { q: "What if I receive a damaged product?", a: "Take photos immediately and raise a complaint within 48 hours via My Orders → Report Issue. We'll arrange a free replacement.", cat: "Returns" },
];

const helpTopics = [
  { icon: <MdShoppingCart size={28} className="text-blue-600" />,    title: "Orders",         desc: "Track, manage & cancel",     path: "/track-order",    bg: "bg-blue-50",    border: "border-blue-100" },
  { icon: <MdLocalShipping size={28} className="text-green-600" />,  title: "Shipping",       desc: "Delivery info & timelines",  path: "/shipping-policy",bg: "bg-green-50",   border: "border-green-100" },
  { icon: <MdLoop size={28} className="text-orange-600" />,          title: "Returns",        desc: "Return & refund policy",     path: "/returns",        bg: "bg-orange-50",  border: "border-orange-100" },
  { icon: <MdPayment size={28} className="text-purple-600" />,       title: "Payments",       desc: "Payment methods & EMI",      path: "/contact-us",     bg: "bg-purple-50",  border: "border-purple-100" },
  { icon: <MdSecurity size={28} className="text-rose-600" />,        title: "Account",        desc: "Profile, password & privacy",path: "/contact-us",     bg: "bg-rose-50",    border: "border-rose-100" },
  { icon: <MdHeadset size={28} className="text-cyan-600" />,         title: "Contact Us",     desc: "Chat, email or call",        path: "/contact-us",     bg: "bg-cyan-50",    border: "border-cyan-100" },
];

const cats = ["All", "Orders", "Returns", "Delivery", "Payments", "Security", "Support"];

const HelpCenter = () => {
  const [search, setSearch]   = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [openIdx, setOpenIdx] = useState(null);

  const filtered = faqs.filter((f) => {
    const matchCat = activeCat === "All" || f.cat === activeCat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 text-white">
        <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MdHeadset size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">How can we help you?</h1>
          <p className="text-white/70 text-sm mb-8">Search our help center or browse topics below.</p>
          <div className="relative max-w-lg mx-auto">
            <MdSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help (e.g. track order, return item…)"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-800 text-sm outline-none shadow-xl focus:ring-2 focus:ring-white/50" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Track my order", "Return item", "Cancel order", "Payment failed"].map((s) => (
              <button key={s} onClick={() => setSearch(s)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full text-xs font-semibold backdrop-blur transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-10">
        {/* Help Topics */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {helpTopics.map((t) => (
              <Link key={t.title} to={t.path}
                className={`${t.bg} ${t.border} border rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all group`}>
                {t.icon}
                <p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">{t.title}</p>
                <p className="text-[11px] text-gray-500">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-5">
            {cats.map((c) => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCat === c ? "bg-primary-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center">
                <span className="text-4xl">🔍</span>
                <p className="text-gray-500 mt-3 text-sm">No results found. <button onClick={() => { setSearch(""); setActiveCat("All"); }} className="text-primary-600 font-semibold hover:underline">Clear filters</button></p>
              </div>
            ) : filtered.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-800">{f.q}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{f.cat}</span>
                    <MdExpandMore size={18} className={`text-gray-400 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Still need help */}
        <section className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold mb-2">Still need help?</h2>
              <p className="text-white/70 text-sm">Our support team is available 24/7 to assist you.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact-us" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow">
                <MdHeadset size={17} /> Contact Support
              </Link>
              <a href="https://wa.me/911800123456" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow">
                <FaWhatsapp size={17} /> WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
