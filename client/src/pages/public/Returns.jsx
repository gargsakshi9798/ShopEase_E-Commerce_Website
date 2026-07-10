import { useState } from "react";
import { Link } from "react-router-dom";
import { MdLoop, MdCheck, MdArrowForward, MdHeadset, MdExpandMore } from "react-icons/md";

const returnSteps = [
  { icon: "📦", title: "Initiate Return",   desc: "Go to My Orders → Select item → Click 'Return'" },
  { icon: "📸", title: "Add Photos",        desc: "Upload photos of the item and packaging" },
  { icon: "🚚", title: "Pickup Scheduled",  desc: "Our courier picks up the item within 2–3 days" },
  { icon: "🔍", title: "Quality Check",     desc: "Item is inspected at our warehouse" },
  { icon: "💰", title: "Refund Processed",  desc: "Refund credited within 5–7 business days" },
];

const returnFAQs = [
  { q: "What items are eligible for return?", a: "Most items can be returned within 7 days if unused, in original packaging with all tags and accessories. Electronics carry a 10-day return window." },
  { q: "What cannot be returned?", a: "Perishable goods (grocery/food), innerwear, earrings, customised products, digital downloads and items marked 'Non-Returnable' cannot be returned." },
  { q: "How long does a refund take?", a: "After the item is picked up and quality-checked, refunds are credited to the original payment method within 5–7 business days." },
  { q: "Can I exchange instead of return?", a: "Yes. Select 'Exchange' instead of 'Return' in My Orders to get a replacement of the same item in a different size or colour." },
  { q: "Who bears the return shipping cost?", a: "Return shipping is free for defective, damaged or wrong items. For change-of-mind returns, a ₹49 reverse pickup fee may apply." },
];

const Returns = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-orange-600 to-amber-500 text-white">
        <div className="max-w-[900px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdLoop size={32} /></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Returns &amp; Refunds</h1>
          <p className="text-white/75 text-sm max-w-lg mx-auto">Easy, hassle-free returns within 7 days. We make it simple to get your money back.</p>
        </div>
      </div>
      <div className="max-w-[900px] mx-auto px-4 py-10 space-y-10">
        {/* Key Policies */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "📅", title: "7-Day Returns",       desc: "Return most items within 7 days of delivery",    color: "bg-orange-50 border-orange-100" },
            { icon: "💳", title: "Full Refund",          desc: "100% refund to original payment method",          color: "bg-green-50 border-green-100"  },
            { icon: "🚚", title: "Free Pickup",          desc: "We arrange free reverse pickup from your doorstep",color: "bg-blue-50 border-blue-100"    },
          ].map((p) => (
            <div key={p.title} className={`${p.color} border rounded-2xl p-5 text-center`}>
              <span className="text-4xl">{p.icon}</span>
              <p className="text-sm font-extrabold text-gray-900 mt-3">{p.title}</p>
              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Return Process */}
        <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900 mb-7">How to Return an Item</h2>
          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-7">
              {returnSteps.map((s, i) => (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className="w-14 h-14 bg-orange-50 border-2 border-orange-200 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 z-10 relative">{s.icon}</div>
                  <div className="pt-2">
                    <p className="text-sm font-bold text-gray-800">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <span className="ml-auto flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-extrabold flex items-center justify-center mt-1">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Non-Returnable Items */}
        <section className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-red-700 mb-4">&#10060; Non-Returnable Items</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {["Grocery & perishable food items","Innerwear & lingerie","Earrings & nose pins (hygiene)","Customised / personalised products","Digital downloads & software","Items marked Non-Returnable on product page"].map((i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                <span className="mt-0.5">•</span> {i}
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Return FAQs</h2>
          <div className="space-y-2">
            {returnFAQs.map((f, i) => (
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

        {/* CTA */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/track-order" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
            <span className="text-3xl">📦</span>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Track Your Return</p><p className="text-xs text-gray-500">Check return pickup status</p></div>
            <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
          </Link>
          <Link to="/contact-us" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:border-primary-200 transition-all group shadow-sm">
            <span className="text-3xl">🎧</span>
            <div className="flex-1"><p className="text-sm font-bold text-gray-800 group-hover:text-primary-600">Need Help?</p><p className="text-xs text-gray-500">Contact our support team</p></div>
            <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Returns;
