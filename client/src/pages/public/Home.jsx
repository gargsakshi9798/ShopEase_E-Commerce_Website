import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdChevronLeft, MdChevronRight, MdArrowForward } from "react-icons/md";
import { FaTruck, FaUndo, FaShieldAlt, FaTag, FaHeadset } from "react-icons/fa";

// ─── Static data (will be replaced by API later) ────────────────────────────

const heroBanners = [
  {
    id: 1,
    title: "Big Savings on",
    highlight: "Top Brands!",
    sub: "Shop the best products at unbeatable prices.",
    badge: "UP TO\n60%\nOFF",
    badgeBg: "bg-orange-500",
    bg: "from-[#eef2ff] to-[#e0e7ff]",
    img: "🛒",
    cta: "Shop Now",
    ctaLink: "/products",
  },
  {
    id: 2,
    title: "New Arrivals in",
    highlight: "Electronics!",
    sub: "Latest gadgets at the best prices.",
    badge: "UP TO\n50%\nOFF",
    badgeBg: "bg-red-500",
    bg: "from-[#fff7ed] to-[#ffedd5]",
    img: "📱",
    cta: "Explore Now",
    ctaLink: "/products?category=Electronics",
  },
];

const shopCategories = [
  { icon: "👕", label: "Fashion",        link: "/fashion" },
  { icon: "📱", label: "Mobiles",        link: "/products?category=Mobiles" },
  { icon: "💻", label: "Electronics",    link: "/products?category=Electronics" },
  { icon: "🏠", label: "Home & Kitchen", link: "/products?category=Home" },
  { icon: "🔌", label: "Appliances",     link: "/products?category=Appliances" },
  { icon: "💄", label: "Beauty",         link: "/products?category=Beauty" },
  { icon: "🏋️", label: "Sports & Fitness", link: "/products?category=Sports" },
  { icon: "🛒", label: "Grocery",        link: "/products?category=Grocery" },
  { icon: "📚", label: "Books",          link: "/products?category=Books" },
  { icon: "🧸", label: "Toys",           link: "/products?category=Toys" },
  { icon: "🚗", label: "Automotive",     link: "/products?category=Automotive" },
  { icon: "⊞",  label: "More",           link: "/products" },
];

const featureStrip = [
  { icon: FaTruck, label: "Free Delivery", sub: "On orders above ₹499" },
  { icon: FaUndo, label: "Easy Returns", sub: "7 days return policy" },
  { icon: FaShieldAlt, label: "Secure Payments", sub: "100% secure payments" },
  { icon: FaTag, label: "Best Price Guarantee", sub: "Find a lower price? We'll match it" },
  { icon: FaHeadset, label: "24/7 Support", sub: "We are here to help" },
];

const dealCategories = [
  { label: "Smartphones", sub: "From top brands", badge: "Up to 40% OFF", bg: "#f1f5ff", img: "📱" },
  { label: "Laptops", sub: "Best Performance", badge: "Up to 35% OFF", bg: "#f0fff4", img: "💻" },
  { label: "Men's Fashion", sub: "Trendy Collection", badge: "Up to 60% OFF", bg: "#fdf4ff", img: "👔" },
  { label: "Home Appliances", sub: "Make life easier", badge: "Up to 45% OFF", bg: "#fff7ed", img: "🏠" },
  { label: "Beauty & Personal Care", sub: "Top Brands", badge: "Up to 50% OFF", bg: "#fff1f2", img: "💄" },
  { label: "Sports & Fitness", sub: "Stay Fit, Stay Healthy", badge: "Up to 40% OFF", bg: "#f0fdfa", img: "🏋️" },
];

const bottomFeatures = [
  { icon: "📦", label: "Wide Range", sub: "Millions of products" },
  { icon: "⭐", label: "Top Brands", sub: "100% Original Products" },
  { icon: "🔒", label: "Secure Checkout", sub: "Multiple payment options" },
  { icon: "🚚", label: "Track Order", sub: "Real-time order tracking" },
  { icon: "🎁", label: "Exclusive Offers", sub: "Best deals & discounts" },
];

// ─── Deal of the Day countdown ───────────────────────────────────────────────
const useCountdown = (h = 12, m = 45, s = 30) => {
  const [time, setTime] = useState({ h, m, s });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 23, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
};

const pad = (n) => String(n).padStart(2, "0");

// ─── Component ───────────────────────────────────────────────────────────────
const Home = () => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const countdown = useCountdown(12, 45, 30);
  const banner = heroBanners[bannerIdx];

  const prevBanner = () => setBannerIdx((i) => (i - 1 + heroBanners.length) % heroBanners.length);
  const nextBanner = () => setBannerIdx((i) => (i + 1) % heroBanners.length);

  return (
    <div className="bg-gray-50">

      {/* ── Hero + Deal of the Day ── */}
      <div className="max-w-[1280px] mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-4">

          {/* Hero Slider */}
          <div className={`flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br ${banner.bg} min-h-[260px] flex items-center px-10 py-8`}>
            {/* Text */}
            <div className="flex-1 z-10 relative">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {banner.title}
              </h1>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-600 leading-tight">
                {banner.highlight}
              </h1>
              <p className="text-gray-600 mt-2 mb-5 text-sm max-w-xs">{banner.sub}</p>
              <Link
                to={banner.ctaLink}
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                {banner.cta}
              </Link>
            </div>

            {/* Badge */}
            <div className={`absolute top-6 right-6 ${banner.badgeBg} text-white text-center px-4 py-3 rounded-2xl font-extrabold text-xs leading-tight shadow-lg z-10`}>
              {banner.badge.split("\n").map((l, i) => (
                <p key={i} className={i === 1 ? "text-2xl" : ""}>{l}</p>
              ))}
            </div>

            {/* Hero graphic */}
            <div className="hidden sm:flex items-end justify-center w-48 text-8xl pb-2 select-none">
              {banner.img}
            </div>

            {/* Nav arrows */}
            <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <MdChevronLeft size={20} />
            </button>
            <button onClick={nextBanner} className="absolute right-16 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-all">
              <MdChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {heroBanners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? "bg-primary-600 w-5" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Deal of the Day */}
          <div className="hidden lg:flex flex-col w-64 bg-white rounded-2xl shadow-card overflow-hidden flex-shrink-0">
            {/* Header */}
            <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏰</span>
                <span className="text-sm font-bold text-gray-800">Deal of the Day</span>
              </div>
              <div className="flex items-center gap-1 text-primary-600 font-bold text-sm">
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.h)}</span>
                <span>:</span>
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.m)}</span>
                <span>:</span>
                <span className="bg-primary-600 text-white px-1.5 py-0.5 rounded text-xs">{pad(countdown.s)}</span>
              </div>
            </div>
            {/* Product */}
            <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
              <div className="text-7xl mb-3">🎧</div>
              <p className="text-sm font-semibold text-gray-800">boAt Airdopes 141</p>
              <p className="text-xs text-gray-500 mb-3">Wireless Earbuds</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900">₹999</span>
                <span className="text-sm text-gray-400 line-through">₹1,999</span>
                <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">50% OFF</span>
              </div>
            </div>
            <div className="px-4 pb-4">
              <Link to="/products" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shop by Category ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-sm text-primary-600 font-semibold flex items-center gap-0.5 hover:underline">
            View All <MdArrowForward size={16} />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
            {shopCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-full flex items-center justify-center text-2xl transition-colors">
                  {cat.icon}
                </div>
                <span className="text-[11px] text-gray-600 group-hover:text-primary-600 text-center leading-tight font-medium">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature Strip ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {featureStrip.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best Deals on Top Categories ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Best Deals on Top Categories</h2>
          <div className="flex gap-2">
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <MdChevronLeft size={18} />
            </button>
            <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {dealCategories.map((d) => (
            <Link
              key={d.label}
              to={`/products?category=${encodeURIComponent(d.label)}`}
              className="rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group"
              style={{ backgroundColor: d.bg }}
            >
              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 leading-tight">{d.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.sub}</p>
                <p className="text-xs text-green-600 font-bold mt-2">{d.badge}</p>
                <span className="inline-block mt-2 text-xs text-primary-600 font-semibold group-hover:underline">
                  Shop Now →
                </span>
              </div>
              <div className="flex justify-end pr-4 pb-2 text-5xl">
                {d.img}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Feature Strip ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {bottomFeatures.map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
