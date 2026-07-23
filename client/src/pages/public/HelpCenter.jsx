import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdExpandMore, MdHeadset, MdLocalShipping, MdLoop,
  MdPayment, MdSecurity, MdShoppingCart, MdEmail, MdPhone,
  MdCheckCircleOutline,
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const faqs = [
  { q: "How do I track my order?",           a: "Go to My Orders in your account, click on the order and select 'Track Order'. You'll receive real-time updates via SMS and email.",          cat: "Orders" },
  { q: "What is the return policy?",          a: "Most items are eligible for return within 7 days of delivery. Items must be unused, in original packaging with all tags intact.",              cat: "Returns" },
  { q: "How long does delivery take?",        a: "Standard delivery takes 2–5 business days. Express delivery (available in select cities) is fulfilled within 1–2 business days.",             cat: "Delivery" },
  { q: "How do I cancel my order?",           a: "Orders can be cancelled before shipment from 'My Orders'. Once dispatched, you will need to wait for delivery and initiate a return request.", cat: "Orders" },
  { q: "What payment methods are accepted?",  a: "We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, EMI options, and Cash on Delivery.",                               cat: "Payments" },
  { q: "How do I apply a coupon code?",       a: "Add items to your cart, proceed to checkout, and enter the coupon code in the 'Apply Coupon' field before completing payment.",               cat: "Payments" },
  { q: "Is my payment information secure?",   a: "Yes. All transactions are protected by 256-bit SSL encryption and we are PCI-DSS compliant. Full card details are never stored on our servers.", cat: "Security" },
  { q: "Can I change my delivery address?",   a: "Delivery addresses can be updated before the order is dispatched. Navigate to My Orders and select 'Edit Delivery Address'.",                  cat: "Delivery" },
  { q: "How do I contact customer support?",  a: "Our team is reachable via email at support@shopease.in or by phone at 1800-123-4567 (9 AM – 9 PM, Mon–Sat).",                                cat: "Support" },
  { q: "What if I receive a damaged product?",a: "Photograph the item immediately and raise a complaint within 48 hours via My Orders → Report Issue. We will arrange a free replacement.",     cat: "Returns" },
];

const helpTopics = [
  { icon: <MdShoppingCart size={24} className="text-blue-600" />,   title: "Orders",     desc: "Track, manage & cancel",      path: "/track-order",     bg: "bg-blue-50",   border: "border-blue-100",   accent: "text-blue-600" },
  { icon: <MdLocalShipping size={24} className="text-emerald-600"/>,title: "Shipping",   desc: "Delivery info & timelines",   path: "/shipping-policy", bg: "bg-emerald-50",border: "border-emerald-100",accent: "text-emerald-600" },
  { icon: <MdLoop size={24} className="text-orange-600" />,         title: "Returns",    desc: "Return & refund policy",      path: "/returns",         bg: "bg-orange-50", border: "border-orange-100", accent: "text-orange-600" },
  { icon: <MdPayment size={24} className="text-violet-600" />,      title: "Payments",   desc: "Payment methods & EMI",       path: "/contact-us",      bg: "bg-violet-50", border: "border-violet-100", accent: "text-violet-600" },
  { icon: <MdSecurity size={24} className="text-rose-600" />,       title: "Account",    desc: "Profile, password & privacy", path: "/contact-us",      bg: "bg-rose-50",   border: "border-rose-100",   accent: "text-rose-600" },
  { icon: <MdHeadset size={24} className="text-cyan-600" />,        title: "Contact Us", desc: "Email, phone or chat",        path: "/contact-us",      bg: "bg-cyan-50",   border: "border-cyan-100",   accent: "text-cyan-600" },
];

const cats = ["All", "Orders", "Returns", "Delivery", "Payments", "Security", "Support"];

const stats = [
  { value: "24/7",   label: "Support Available" },
  { value: "< 2h",  label: "Average Response Time" },
  { value: "98%",   label: "Issues Resolved" },
  { value: "4.9★",  label: "Customer Satisfaction" },
];

const HelpCenter = () => {
  const [activeCat, setActiveCat] = useState("All");
  const [openIdx,   setOpenIdx]   = useState(null);

  const filtered = faqs.filter((f) => activeCat === "All" || f.cat === activeCat);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-900 to-primary-700 text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <MdHeadset size={13} /> Support Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight text-white">
            How can we help you?
          </h1>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl py-4 px-3 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[11px] text-white/60 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12 space-y-12">

        {/* ── Browse by Topic ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Browse by Topic</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {helpTopics.map((t) => (
              <Link key={t.title} to={t.path}
                className={`${t.bg} ${t.border} border rounded-2xl p-5 flex flex-col items-center text-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`}>
                <div className={`w-11 h-11 rounded-xl ${t.bg} border ${t.border} flex items-center justify-center shadow-sm`}>
                  {t.icon}
                </div>
                <p className={`text-sm font-bold text-gray-800 group-hover:${t.accent}`}>{t.title}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQs ─────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Frequently Asked Questions</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map((c) => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCat === c
                    ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center shadow-sm">
                <p className="text-gray-400 text-sm">No articles found for this category.</p>
                <button onClick={() => setActiveCat("All")}
                  className="mt-3 text-primary-600 text-sm font-semibold hover:underline">
                  View all topics
                </button>
              </div>
            ) : filtered.map((f, i) => (
              <div key={i}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                  openIdx === i ? "border-primary-200 shadow-primary-50" : "border-gray-100"
                }`}>
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left group">
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors pr-4">
                    {f.q}
                  </span>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="hidden sm:inline text-[10px] font-bold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                      {f.cat}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      openIdx === i ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      <MdExpandMore size={16} className={`transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    <div className="flex items-start gap-2.5">
                      <MdCheckCircleOutline size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                      <p>{f.a}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact channels ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Get in Touch</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Email */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                <MdEmail size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Email Support</p>
                <p className="text-xs text-gray-500 mt-0.5">Response within 2 hours</p>
              </div>
              <a href="mailto:support@shopease.in"
                className="text-xs font-semibold text-blue-600 hover:underline mt-auto">
                support@shopease.in
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                <MdPhone size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Phone Support</p>
                <p className="text-xs text-gray-500 mt-0.5">Mon – Sat, 9 AM – 9 PM</p>
              </div>
              <a href="tel:18001234567"
                className="text-xs font-semibold text-emerald-600 hover:underline mt-auto">
                1800-123-4567 (Toll free)
              </a>
            </div>

            {/* WhatsApp */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center">
                <FaWhatsapp size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-500 mt-0.5">Available 24/7</p>
              </div>
              <a href="https://wa.me/911800123456" target="_blank" rel="noreferrer"
                className="text-xs font-semibold text-green-600 hover:underline mt-auto">
                Chat with us →
              </a>
            </div>
          </div>
        </section>

        {/* ── Still need help CTA ──────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Need more help?</p>
            <h2 className="text-xl md:text-2xl font-black">Our support team is always here.</h2>
            <p className="text-white/70 text-sm mt-1">Open a ticket and we'll get back to you within 2 hours.</p>
          </div>
          <Link to="/contact-us"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
            <MdHeadset size={17} /> Contact Support
          </Link>
        </section>

      </div>
    </div>
  );
};

export default HelpCenter;
