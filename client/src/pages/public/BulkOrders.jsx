import { useState } from "react";
import { MdArrowForward, MdCheck, MdGroups } from "react-icons/md";
import { FaBoxes, FaRupeeSign, FaHandshake, FaHeadset } from "react-icons/fa";

const categories = ["Electronics & Gadgets","Fashion & Apparel","Home & Office Supplies","Grocery & FMCG","Sports & Fitness","Books & Stationery","Beauty & Personal Care","Automotive Accessories"];

const benefits = [
  { icon:<FaRupeeSign size={24} className="text-green-600"/>, title:"Exclusive Bulk Pricing",     desc:"Discounts up to 35% off on bulk quantities with tiered pricing.", bg:"bg-green-50 border-green-100" },
  { icon:<FaBoxes size={24} className="text-blue-600"/>,      title:"Custom Packaging",            desc:"Branded boxes, inserts and gift wrapping available for corporate orders.", bg:"bg-blue-50 border-blue-100" },
  { icon:<FaHandshake size={24} className="text-purple-600"/>,title:"Dedicated Account Manager",   desc:"A single point of contact to manage your orders, reorders and queries.", bg:"bg-purple-50 border-purple-100" },
  { icon:<FaHeadset size={24} className="text-amber-600"/>,   title:"Priority Support & Delivery",  desc:"Express delivery and priority customer support for all bulk orders.", bg:"bg-amber-50 border-amber-100" },
];

const useCases = [
  { emoji:"🏢", title:"Corporate Gifting",    desc:"Employee rewards, client gifts, event giveaways and festive hampers." },
  { emoji:"🎓", title:"Educational Institutes",desc:"Books, stationery, uniform and equipment for schools and colleges." },
  { emoji:"🏪", title:"Retailers & Resellers", desc:"Stock your store with bulk inventory at wholesale prices." },
  { emoji:"🎪", title:"Events & Conferences",  desc:"Branded merchandise, tech accessories and promo items for events." },
  { emoji:"🏥", title:"Healthcare & NGOs",     desc:"Medical supplies, hygiene products and essentials in bulk." },
  { emoji:"🚀", title:"Startups & SMBs",       desc:"Office setup, gadgets and supplies for growing businesses." },
];

const BulkOrders = () => {
  const [form, setForm]     = useState({ name:"", email:"", phone:"", company:"", category:"", qty:"", message:"" });
  const [submitted, setSub] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-[1100px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur">
              <FaBoxes size={12} className="text-cyan-400"/> 5,000+ Corporate Clients Served
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Bulk Orders &amp; <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Corporate Gifting</span>
            </h1>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              Order in bulk and save big. Exclusive pricing, dedicated account managers and pan-India delivery for businesses of all sizes.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Up to 35% Off","Custom Branding","GST Invoicing","Dedicated Manager","Free Delivery"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <MdCheck size={12} className="text-cyan-400"/> {f}
                </span>
              ))}
            </div>
            <a href="#enquiry" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-xl">
              Get a Free Quote <MdArrowForward size={16}/>
            </a>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { stat:"5,000+",label:"Corporate Clients",  icon:"🏢" },
              { stat:"35%",   label:"Max Bulk Discount",  icon:"💰" },
              { stat:"48hrs", label:"Quote Turnaround",   icon:"⚡" },
              { stat:"100%",  label:"GST Compliant",      icon:"🧾" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5 text-center min-w-[120px]">
                <span className="text-3xl">{s.icon}</span>
                <p className="text-2xl font-extrabold mt-2">{s.stat}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10 space-y-12">
        {/* Benefits */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-7">Why Choose ShopEase for Bulk?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className={`${b.bg} border rounded-2xl p-6 shadow-sm`}>
                {b.icon}
                <p className="text-sm font-extrabold text-gray-900 mt-4 mb-2">{b.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">Bulk Pricing Tiers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-extrabold text-gray-500 uppercase">Order Value</th>
                  <th className="text-left py-2 px-3 text-xs font-extrabold text-gray-500 uppercase">Discount</th>
                  <th className="text-left py-2 px-3 text-xs font-extrabold text-gray-500 uppercase">Account Manager</th>
                  <th className="text-left py-2 px-3 text-xs font-extrabold text-gray-500 uppercase">Custom Branding</th>
                  <th className="text-left py-2 px-3 text-xs font-extrabold text-gray-500 uppercase">GST Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["&#8377;10,000 – &#8377;50,000",  "10%",  "Email",       "&#10005;","&#10003;"],
                  ["&#8377;50,001 – &#8377;2,00,000","20%",  "Phone + Email","&#10005;","&#10003;"],
                  ["&#8377;2L – &#8377;10L",          "28%",  "Dedicated",   "&#10003;","&#10003;"],
                  ["Above &#8377;10L",                "35%",  "Senior Manager","&#10003;","&#10003;"],
                ].map(([val, disc, mgr, brand, gst], i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i === 3 ? "bg-primary-50" : ""}`}>
                    <td className="py-3 px-3 font-semibold text-gray-800" dangerouslySetInnerHTML={{__html:val}}/>
                    <td className="py-3 px-3 font-extrabold text-green-600">{disc}</td>
                    <td className="py-3 px-3 text-gray-600">{mgr}</td>
                    <td className="py-3 px-3" dangerouslySetInnerHTML={{__html:`<span class="${brand==="✓"?"text-green-500":"text-gray-300"} font-extrabold text-base">${brand}</span>`}}/>
                    <td className="py-3 px-3 text-green-500 font-extrabold text-base" dangerouslySetInnerHTML={{__html:gst}}/>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-7">Who Orders in Bulk?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((u) => (
              <div key={u.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-4xl">{u.emoji}</span>
                <p className="text-sm font-extrabold text-gray-900 mt-3 mb-1">{u.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enquiry Form */}
        <section id="enquiry" className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Get a Free Quote</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in your requirements and our bulk sales team will respond within 24 hours.</p>
          {submitted ? (
            <div className="text-center py-12">
              <span className="text-5xl">🎉</span>
              <h3 className="text-lg font-extrabold text-gray-900 mt-4 mb-2">Enquiry Received!</h3>
              <p className="text-sm text-gray-500">Our bulk sales team will contact <strong>{form.email}</strong> within 24 hours with a custom quote.</p>
              <button onClick={() => setSub(false)} className="mt-4 text-sm text-primary-600 font-semibold hover:underline">Submit another enquiry</button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSub(true); }} className="grid sm:grid-cols-2 gap-4">
              {[
                { name:"name",    label:"Full Name *",           ph:"Your name",           type:"text"  },
                { name:"email",   label:"Work Email *",          ph:"you@company.com",     type:"email" },
                { name:"phone",   label:"Phone Number *",        ph:"+91 98765 43210",     type:"tel"   },
                { name:"company", label:"Company Name *",        ph:"Your company",        type:"text"  },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handle} required placeholder={f.ph}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500"/>
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Product Category *</label>
                <select name="category" value={form.category} onChange={handle} required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Estimated Quantity *</label>
                <input name="qty" value={form.qty} onChange={handle} required placeholder="e.g. 500 units"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-600 mb-1 block">Additional Requirements</label>
                <textarea name="message" value={form.message} onChange={handle} rows={3} placeholder="Custom branding, delivery timeline, product specs…"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 resize-none"/>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-md">
                  Submit Bulk Enquiry
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
export default BulkOrders;
