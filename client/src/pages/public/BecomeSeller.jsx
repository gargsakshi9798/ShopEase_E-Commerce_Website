import { useState } from "react";
import { Link } from "react-router-dom";
import { MdArrowForward, MdCheck, MdStorefront, MdStar } from "react-icons/md";
import { FaRupeeSign, FaUsers, FaBoxOpen, FaChartLine } from "react-icons/fa";

const steps = [
  { icon:"📝", title:"Register",         desc:"Create your seller account with basic business details in 5 minutes." },
  { icon:"📦", title:"List Products",    desc:"Upload your catalogue using our easy bulk upload tool or API." },
  { icon:"🚀", title:"Start Selling",    desc:"Go live and reach 10 million+ shoppers across India instantly." },
  { icon:"💰", title:"Get Paid",         desc:"Payments deposited directly to your bank every 7 days." },
];

const plans = [
  { name:"Starter",     price:"Free",   color:"border-gray-200",  badge:"",              features:["Up to 100 listings","Standard commission rates","Basic analytics","Email support","Standard delivery SLA"] },
  { name:"Growth",      price:"₹999/mo",color:"border-primary-400",badge:"Most Popular", features:["Unlimited listings","Reduced commission rates","Advanced analytics","Priority support","Express delivery options","Promotional tools","Featured badges"] },
  { name:"Enterprise",  price:"Custom", color:"border-purple-400", badge:"Best Value",   features:["Unlimited listings","Lowest commission rates","Dedicated account manager","API access","Custom SLA","Brand store page","Co-marketing opportunities"] },
];

const testimonials = [
  { name:"Ramesh Gupta",  biz:"Gupta Electronics, Delhi",     quote:"Joining ShopEase tripled my monthly revenue in 6 months. The platform is incredibly easy to use.", emoji:"👨‍💼", rating:5 },
  { name:"Sonal Jain",    biz:"Sonal Fashion, Surat",         quote:"The seller dashboard gives me full control. I process 200+ orders daily without any hassle.",         emoji:"👩‍💼", rating:5 },
  { name:"Anil Patel",    biz:"Nature's Basket, Pune",        quote:"ShopEase's pan-India logistics saved me from setting up my own delivery network.",                    emoji:"🧑‍💼", rating:5 },
];

const BecomeSeller = () => {
  const [form, setForm] = useState({ name:"", email:"", phone:"", biz:"", cat:"", city:"" });
  const [submitted, setSubmit] = useState(false);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => { e.preventDefault(); setSubmit(true); };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-5 right-5 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-[1100px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur">
              <FaUsers size={12} className="text-yellow-400"/> 50,000+ Active Sellers
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Sell to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">10 Million+</span><br/>Shoppers Across India
            </h1>
            <p className="text-white/65 text-sm leading-relaxed mb-6">
              List your products on ShopEase and instantly reach crores of customers. Zero listing fees, fast payments and India's most reliable logistics network.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["0% Listing Fee","7-Day Payments","Pan-India Reach","Dedicated Support","Easy Returns"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold"><MdCheck size={12} className="text-cyan-400"/> {f}</span>
              ))}
            </div>
            <a href="#register" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-xl">
              Start Selling for Free <MdArrowForward size={16}/>
            </a>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { icon:<FaRupeeSign size={22} className="text-green-400"/>,  stat:"₹2,000Cr+",label:"Annual Seller Payouts"  },
              { icon:<FaBoxOpen size={22} className="text-blue-400"/>,     stat:"20L+",      label:"Products Listed"       },
              { icon:<FaChartLine size={22} className="text-purple-400"/>, stat:"40%",       label:"Avg Revenue Growth"    },
              { icon:<FaUsers size={22} className="text-amber-400"/>,      stat:"50K+",      label:"Active Sellers"        },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-5 text-center min-w-[130px]">
                {s.icon}
                <p className="text-2xl font-extrabold mt-2">{s.stat}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10 space-y-12">
        {/* Steps */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-8">Start Selling in 4 Easy Steps</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-primary-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow">{i+1}</div>
                <span className="text-4xl">{s.icon}</span>
                <p className="text-sm font-extrabold text-gray-900 mt-4 mb-2">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-2">Choose Your Plan</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Start free and upgrade as your business grows</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {plans.map((p) => (
              <div key={p.name} className={`bg-white rounded-2xl border-2 ${p.color} p-6 shadow-sm relative ${p.badge ? "shadow-lg" : ""}`}>
                {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">{p.badge}</span>}
                <p className="text-base font-extrabold text-gray-900">{p.name}</p>
                <p className="text-2xl font-extrabold text-primary-600 mt-1 mb-4">{p.price}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <MdCheck size={14} className="text-green-500 flex-shrink-0 mt-0.5"/> {f}
                    </li>
                  ))}
                </ul>
                <a href="#register" className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition-colors ${p.badge ? "bg-primary-600 hover:bg-primary-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-6">What Our Sellers Say</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array(t.rating).fill(0).map((_,i) => <MdStar key={i} size={14} className="text-amber-400"/>)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl">{t.emoji}</div>
                  <div><p className="text-xs font-extrabold text-gray-800">{t.name}</p><p className="text-[10px] text-gray-500">{t.biz}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Registration Form */}
        <section id="register" className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Register as a Seller</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in your details and our team will contact you within 24 hours.</p>
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><MdCheck size={32} className="text-green-600"/></div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">Registration Submitted!</h3>
              <p className="text-sm text-gray-500">Our seller onboarding team will contact you at <strong>{form.email}</strong> within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              {[
                { name:"name",  label:"Full Name *",         placeholder:"Your full name",           type:"text" },
                { name:"email", label:"Email Address *",     placeholder:"business@email.com",       type:"email" },
                { name:"phone", label:"Phone Number *",      placeholder:"+91 98765 43210",          type:"tel" },
                { name:"biz",   label:"Business Name *",     placeholder:"Your company/brand name",  type:"text" },
                { name:"cat",   label:"Product Category *",  placeholder:"e.g. Electronics, Fashion",type:"text" },
                { name:"city",  label:"City / Location",     placeholder:"Your city",               type:"text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                    required={f.label.includes("*")} placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"/>
                </div>
              ))}
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-md text-sm">
                  Submit Registration
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
export default BecomeSeller;
