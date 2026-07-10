import { Link } from "react-router-dom";
import { MdArrowForward, MdVerified } from "react-icons/md";
import { FaUsers, FaShoppingBag, FaTruck, FaStar } from "react-icons/fa";

const team = [
  { name: "Arjun Sharma",   role: "Founder & CEO",          emoji: "👨‍💼" },
  { name: "Priya Nair",     role: "Co-Founder & CTO",        emoji: "👩‍💻" },
  { name: "Rohit Mehta",    role: "VP — Operations",         emoji: "👨‍🔧" },
  { name: "Kavya Iyer",     role: "Head — Customer Success", emoji: "👩‍🎯" },
  { name: "Siddharth Das",  role: "Head — Seller Growth",    emoji: "👨‍📊" },
  { name: "Ananya Joshi",   role: "Head — Product & Design", emoji: "👩‍🎨" },
];

const milestones = [
  { year: "2018", event: "ShopEase founded in Gurugram with 500 products" },
  { year: "2019", event: "Expanded to 10,000+ products, launched mobile app" },
  { year: "2020", event: "Crossed 1 million registered customers" },
  { year: "2021", event: "Launched same-day delivery in 6 metro cities" },
  { year: "2022", event: "Series B funding — $50M raised, reached 50K sellers" },
  { year: "2023", event: "Launched ShopEase Business & Bulk Orders portal" },
  { year: "2024", event: "Surpassed 10 million customers, launched AI recommendations" },
  { year: "2026", event: "Today — 20L+ products, 50K+ sellers, pan-India" },
];

const AboutUs = () => (
  <div className="bg-gray-50 min-h-screen">
    {/* Hero */}
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-10 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"/><div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"/></div>
      <div className="relative max-w-[1000px] mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur">
          <FaShoppingBag size={12} className="text-yellow-400" /> Founded 2018 · Gurugram, India
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
          India's Most Loved<br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Online Marketplace</span>
        </h1>
        <p className="text-white/65 max-w-2xl mx-auto text-sm leading-relaxed">
          ShopEase was born with a single mission — make quality products accessible to every Indian at the best price, delivered fast. From a small team of 5 in 2018 to over 1,200 employees today, we're just getting started.
        </p>
      </div>
    </div>

    <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-12">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <FaUsers size={24} className="text-blue-600" />,       stat: "10M+",   label: "Happy Customers",  bg: "bg-blue-50 border-blue-100" },
          { icon: <FaShoppingBag size={24} className="text-purple-600" />,stat: "20L+",   label: "Products Listed",  bg: "bg-purple-50 border-purple-100" },
          { icon: <FaTruck size={24} className="text-green-600" />,       stat: "50K+",   label: "Trusted Sellers",  bg: "bg-green-50 border-green-100" },
          { icon: <FaStar size={24} className="text-amber-500" />,        stat: "4.8★",  label: "Average Rating",   bg: "bg-amber-50 border-amber-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-sm`}>
            {s.icon}
            <p className="text-2xl font-extrabold text-gray-900">{s.stat}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <section className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <span className="text-4xl">🎯</span>
          <h2 className="text-lg font-extrabold text-gray-900 mt-4 mb-3">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            To democratise e-commerce in India — giving every customer access to the widest selection of quality products at competitive prices, with a seamless shopping experience and world-class delivery.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <span className="text-4xl">🚀</span>
          <h2 className="text-lg font-extrabold text-gray-900 mt-4 mb-3">Our Vision</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            To be the most customer-centric e-commerce platform in South Asia — a place where customers can find, discover and buy anything they want at any time, from anywhere in India.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-6">Our Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🤝", title: "Customer First",   desc: "Every decision starts with what's best for our customers." },
            { icon: "🔍", title: "Transparency",     desc: "Honest pricing, honest reviews, honest communication." },
            { icon: "⚡", title: "Speed & Innovation",desc: "We move fast and embrace technology to stay ahead." },
            { icon: "🌿", title: "Sustainability",   desc: "Committed to eco-friendly packaging and carbon-neutral delivery." },
          ].map((v) => (
            <div key={v.title} className="bg-gray-50 rounded-xl p-4 text-center">
              <span className="text-3xl">{v.icon}</span>
              <p className="text-sm font-extrabold text-gray-800 mt-3 mb-1">{v.title}</p>
              <p className="text-xs text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-6">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-[58px] top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-5">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-16 text-right flex-shrink-0">
                  <span className="text-xs font-extrabold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{m.year}</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary-600 flex-shrink-0 mt-2 z-10 relative" />
                <p className="text-sm text-gray-700 pt-0.5">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section>
        <h2 className="text-lg font-extrabold text-gray-900 mb-5">Our Leadership</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {team.map((m) => (
            <div key={m.name} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{m.emoji}</div>
              <p className="text-xs font-extrabold text-gray-900">{m.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
        <h2 className="text-2xl font-extrabold mb-2">Join the ShopEase Family</h2>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">Whether you're a customer, seller or want to join our team — we'd love to connect.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/become-seller" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow">Become a Seller <MdArrowForward size={15} /></Link>
          <Link to="/careers" className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/25 transition-colors">View Careers <MdArrowForward size={15} /></Link>
        </div>
      </section>
    </div>
  </div>
);
export default AboutUs;
