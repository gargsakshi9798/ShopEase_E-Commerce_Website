import { Link } from "react-router-dom";
import { MdDownload, MdArrowForward, MdEmail } from "react-icons/md";
import { FaNewspaper } from "react-icons/fa";

const pressReleases = [
  { date:"Jul 1, 2026",  headline:"ShopEase Surpasses 10 Million Registered Customers",                cat:"Milestone",  tag:"bg-green-100 text-green-700"  },
  { date:"May 15, 2026", headline:"ShopEase Launches AI-Powered Personalised Recommendations Feature",  cat:"Product",    tag:"bg-blue-100 text-blue-700"    },
  { date:"Mar 10, 2026", headline:"ShopEase Partners with Delhivery for Same-Day Delivery in 20 Cities",cat:"Partnership",tag:"bg-purple-100 text-purple-700" },
  { date:"Jan 20, 2026", headline:"ShopEase Raises $120M Series C Led by Tiger Global",                cat:"Funding",    tag:"bg-amber-100 text-amber-700"  },
  { date:"Nov 3, 2025",  headline:"ShopEase Diwali Sale 2025: ₹500 Crore in GMV in 3 Days",            cat:"Milestone",  tag:"bg-rose-100 text-rose-700"    },
  { date:"Sep 18, 2025", headline:"ShopEase Launches Seller University — Free Training for 1L Sellers", cat:"Sellers",    tag:"bg-cyan-100 text-cyan-700"    },
];

const coverage = [
  { outlet:"Economic Times", headline:"ShopEase redefines online retail for Tier-2 India",    emoji:"📰" },
  { outlet:"TechCrunch",     headline:"How ShopEase is winning India's e-commerce war",        emoji:"🌐" },
  { outlet:"Mint",           headline:"ShopEase hits profitability in under 8 years",          emoji:"📈" },
  { outlet:"NDTV Profit",    headline:"ShopEase's logistics network now covers 27,000 pincodes",emoji:"📺"},
  { outlet:"Forbes India",   headline:"ShopEase founders named in 30 Under 30 — 2024",        emoji:"⭐" },
  { outlet:"Business Today", headline:"The secret behind ShopEase's 4.8-star customer rating",emoji:"🏆" },
];

const PressMedia = () => (
  <div className="bg-gray-50 min-h-screen">
    {/* Hero */}
    <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><FaNewspaper size={30} className="text-white"/></div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Press &amp; Media</h1>
        <p className="text-white/65 text-sm max-w-lg mx-auto mb-6">The latest news, press releases and media resources from ShopEase.</p>
        <a href="mailto:press@shopease.in"
          className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
          <MdEmail size={16}/> press@shopease.in
        </a>
      </div>
    </div>

    <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-10">
      {/* By The Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { stat:"10M+",    label:"Customers",       emoji:"👥" },
          { stat:"₹2,000Cr",label:"Annual GMV",      emoji:"💰" },
          { stat:"50K+",    label:"Seller Partners", emoji:"🤝" },
          { stat:"2018",    label:"Year Founded",    emoji:"📅" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
            <span className="text-3xl">{s.emoji}</span>
            <p className="text-xl font-extrabold text-gray-900 mt-2">{s.stat}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Press Releases */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-900">Latest Press Releases</h2>
          <a href="mailto:press@shopease.in" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
            Media Inquiries <MdArrowForward size={15}/>
          </a>
        </div>
        <div className="space-y-3">
          {pressReleases.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.tag}`}>{p.cat}</span>
                  <span className="text-xs text-gray-400">{p.date}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{p.headline}</p>
              </div>
              <MdArrowForward size={16} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0"/>
            </div>
          ))}
        </div>
      </section>

      {/* Media Coverage */}
      <section>
        <h2 className="text-lg font-extrabold text-gray-900 mb-5">In The News</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coverage.map((c) => (
            <div key={c.outlet} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">{c.outlet}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors leading-snug">{c.headline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Kit */}
      <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-2">Media &amp; Brand Kit</h2>
        <p className="text-sm text-gray-500 mb-5">Download official ShopEase logos, brand guidelines and product screenshots for media use.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title:"Logo Pack",       desc:"SVG, PNG (dark & light)",         emoji:"🎨" },
            { title:"Brand Guidelines",desc:"Colors, fonts, usage rules",       emoji:"📐" },
            { title:"Product Screenshots",desc:"App & website screenshots",     emoji:"📱" },
          ].map((k) => (
            <div key={k.title} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">{k.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-gray-800">{k.title}</p>
                <p className="text-[11px] text-gray-500">{k.desc}</p>
              </div>
              <button className="flex-shrink-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors">
                <MdDownload size={15}/>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white text-center">
        <h2 className="text-xl font-extrabold mb-2">Media Inquiries</h2>
        <p className="text-white/65 text-sm mb-5">For interviews, press releases or media partnerships, reach our communications team directly.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="mailto:press@shopease.in" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow">
            <MdEmail size={16}/> press@shopease.in
          </a>
          <Link to="/contact-us" className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/25 transition-colors">
            Contact Form <MdArrowForward size={15}/>
          </Link>
        </div>
      </section>
    </div>
  </div>
);
export default PressMedia;
