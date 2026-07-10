import { useState } from "react";
import { MdArrowForward, MdCheck, MdContentCopy } from "react-icons/md";
import { FaRupeeSign, FaUsers, FaLink, FaChartLine } from "react-icons/fa";

const tiers = [
  { name:"Starter",   commission:"Up to 5%", threshold:"0 – ₹50,000",     color:"border-gray-200 bg-gray-50"       },
  { name:"Silver",    commission:"Up to 7%", threshold:"₹50,001 – ₹2L",   color:"border-blue-200 bg-blue-50"       },
  { name:"Gold",      commission:"Up to 9%", threshold:"₹2L – ₹5L",        color:"border-amber-200 bg-amber-50"     },
  { name:"Platinum",  commission:"Up to 12%",threshold:"Above ₹5L",        color:"border-purple-200 bg-purple-50",  badge:"Top Earner" },
];

const howItWorks = [
  { icon:"🔗", title:"Get Your Link",    desc:"Sign up and get a unique referral link for any ShopEase product or page." },
  { icon:"📢", title:"Share & Promote",  desc:"Share on your blog, YouTube, Instagram or WhatsApp — anywhere your audience is." },
  { icon:"🛒", title:"Earn on Every Sale",desc:"Earn commission every time someone buys through your link, within 30-day cookie window." },
  { icon:"💸", title:"Get Paid Monthly", desc:"Withdraw earnings to your bank account or UPI once you hit the ₹500 threshold." },
];

const Affiliate = () => {
  const [form, setForm]     = useState({ name:"", email:"", website:"", type:"" });
  const [submitted, setSub] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f7971e] to-[#ffd200] text-gray-900">
        <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-black/10 rounded-full px-4 py-1.5 text-xs font-bold mb-5">
            <FaRupeeSign size={10}/> Earn up to 12% commission on every sale
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Turn Your Audience Into Income
          </h1>
          <p className="text-gray-700 text-sm max-w-lg mx-auto mb-8">
            Join 10,000+ content creators, bloggers and influencers earning with the ShopEase Affiliate Program. Share links. Earn money. Simple.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {["Free to Join","Up to 12% Commission","30-Day Cookie Window","Monthly Payouts","Real-Time Dashboard"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 bg-black/10 rounded-full px-3 py-1.5 text-xs font-bold"><MdCheck size={12}/> {f}</span>
            ))}
          </div>
          <a href="#signup" className="inline-flex items-center gap-2 bg-gray-900 text-white font-extrabold px-7 py-3.5 rounded-xl text-sm hover:bg-gray-800 transition-colors shadow-xl">
            Join for Free <MdArrowForward size={16}/>
          </a>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-12">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon:<FaUsers size={22} className="text-blue-600"/>,     stat:"10,000+", label:"Active Affiliates",   bg:"bg-blue-50 border-blue-100"   },
            { icon:<FaRupeeSign size={22} className="text-green-600"/>, stat:"₹5Cr+",   label:"Paid to Affiliates",  bg:"bg-green-50 border-green-100"  },
            { icon:<FaLink size={22} className="text-purple-600"/>,     stat:"20L+",    label:"Products to Promote", bg:"bg-purple-50 border-purple-100"},
            { icon:<FaChartLine size={22} className="text-amber-500"/>, stat:"12%",     label:"Max Commission",      bg:"bg-amber-50 border-amber-100"  },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm`}>
              {s.icon}<p className="text-xl font-extrabold text-gray-900">{s.stat}</p><p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-amber-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center">{i+1}</div>
                <span className="text-4xl">{s.icon}</span>
                <p className="text-sm font-extrabold text-gray-900 mt-4 mb-2">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commission Tiers */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-2">Commission Tiers</h2>
          <p className="text-sm text-gray-500 text-center mb-6">The more you earn, the higher your commission rate</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((t) => (
              <div key={t.name} className={`${t.color} border-2 rounded-2xl p-5 text-center relative`}>
                {t.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full">{t.badge}</span>}
                <p className="text-base font-extrabold text-gray-900">{t.name}</p>
                <p className="text-2xl font-extrabold text-primary-600 my-2">{t.commission}</p>
                <p className="text-xs text-gray-500">Monthly Sales: {t.threshold}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">* Commission rates vary by category. Electronics: up to 3%, Fashion: up to 10%, Books: up to 12%.</p>
        </section>

        {/* Signup Form */}
        <section id="signup" className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Apply to Join</h2>
          <p className="text-sm text-gray-500 mb-6">Applications are reviewed within 48 hours. No minimum follower count required.</p>
          {submitted ? (
            <div className="text-center py-10">
              <span className="text-5xl">🎉</span>
              <h3 className="text-lg font-extrabold text-gray-900 mt-4 mb-2">Application Submitted!</h3>
              <p className="text-sm text-gray-500">We'll review your application and get back to you at <strong>{form.email}</strong> within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSub(true); }} className="grid sm:grid-cols-2 gap-4">
              {[
                { name:"name",    label:"Full Name *",            placeholder:"Your name",             type:"text"  },
                { name:"email",   label:"Email Address *",        placeholder:"you@email.com",          type:"email" },
                { name:"website", label:"Website / Channel URL *",placeholder:"https://yourblog.com",  type:"url"   },
                { name:"type",    label:"Content Type *",         placeholder:"Blog / YouTube / Insta", type:"text"  },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                    required placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500"/>
                </div>
              ))}
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-md">
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
export default Affiliate;
