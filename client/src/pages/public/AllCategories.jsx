import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdSearch, MdArrowForward, MdLocalOffer, MdStar,
  MdTrendingUp, MdVerified, MdFlashOn,
} from "react-icons/md";
import {
  FaMobileAlt, FaBolt, FaTshirt, FaHome, FaSpa,
  FaRunning, FaBook, FaGamepad, FaShoppingBasket,
  FaCar, FaLeaf, FaHeart,
} from "react-icons/fa";

// ─── Category Data ────────────────────────────────────────────────────────────
const allCategories = [
  {
    id: 1,
    name: "Fashion",
    path: "/fashion",
    icon: FaTshirt,
    emoji: "👗",
    gradient: "from-pink-500 to-rose-600",
    lightBg: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    description: "Clothing, shoes, accessories & jewellery",
    totalProducts: "2.4L+",
    badge: "Trending",
    badgeColor: "bg-rose-500",
    subcategories: ["Men", "Women", "Kids", "Ethnic Wear", "Footwear", "Accessories", "Jewellery", "Bags"],
    offer: "Up to 70% off",
    topBrands: ["Zara", "H&M", "Fabindia", "Myntra"],
  },
  {
    id: 2,
    name: "Electronics",
    path: "/electronics",
    icon: MdFlashOn,
    emoji: "💻",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    description: "Laptops, TVs, cameras, audio & more",
    totalProducts: "1.8L+",
    badge: "Best Deals",
    badgeColor: "bg-blue-600",
    subcategories: ["Laptops", "Smart TVs", "Cameras", "Audio", "Tablets", "Gaming", "Wearables", "Printers"],
    offer: "Up to 50% off",
    topBrands: ["Apple", "Samsung", "Sony", "Dell"],
  },
  {
    id: 3,
    name: "Mobiles",
    path: "/mobiles",
    icon: FaMobileAlt,
    emoji: "📱",
    gradient: "from-violet-500 to-purple-700",
    lightBg: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    description: "Smartphones, tablets & accessories",
    totalProducts: "1.2L+",
    badge: "Hot",
    badgeColor: "bg-violet-600",
    subcategories: ["5G Phones", "Flagship", "Mid-Range", "Budget", "Tablets", "Chargers", "Cases", "Earphones"],
    offer: "Up to 40% off",
    topBrands: ["Apple", "Samsung", "OnePlus", "Xiaomi"],
  },
  {
    id: 4,
    name: "Home & Kitchen",
    path: "/home-kitchen",
    icon: FaHome,
    emoji: "🏠",
    gradient: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    description: "Cookware, storage, dining & furniture",
    totalProducts: "3.1L+",
    badge: "New Arrivals",
    badgeColor: "bg-amber-500",
    subcategories: ["Cookware", "Storage", "Dining", "Furniture", "Decor", "Bedding", "Cleaning", "Lighting"],
    offer: "Up to 60% off",
    topBrands: ["Prestige", "Milton", "IKEA", "Wonderchef"],
  },
  {
    id: 5,
    name: "Appliances",
    path: "/appliances",
    icon: FaBolt,
    emoji: "⚡",
    gradient: "from-cyan-500 to-blue-600",
    lightBg: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    description: "Fridges, ACs, washing machines & fans",
    totalProducts: "85K+",
    badge: "No-Cost EMI",
    badgeColor: "bg-cyan-600",
    subcategories: ["Refrigerators", "ACs", "Washing Machines", "Microwaves", "Fans", "Heaters", "Air Purifiers", "Water Purifiers"],
    offer: "Up to 50% off",
    topBrands: ["LG", "Samsung", "Voltas", "Whirlpool"],
  },
  {
    id: 6,
    name: "Beauty",
    path: "/beauty",
    icon: FaSpa,
    emoji: "🌸",
    gradient: "from-rose-500 to-pink-700",
    lightBg: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    description: "Skincare, makeup, hair care & wellness",
    totalProducts: "1.6L+",
    badge: "Free Gift",
    badgeColor: "bg-rose-500",
    subcategories: ["Skincare", "Makeup", "Hair Care", "Bath & Body", "Fragrances", "Nail Care", "Men's Grooming", "Organic"],
    offer: "Up to 60% off",
    topBrands: ["Lakme", "Maybelline", "The Ordinary", "Mamaearth"],
  },
  {
    id: 7,
    name: "Sports",
    path: "/sports",
    icon: FaRunning,
    emoji: "⚽",
    gradient: "from-green-500 to-emerald-700",
    lightBg: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    description: "Cricket, fitness, outdoor & sportswear",
    totalProducts: "95K+",
    badge: "Top Rated",
    badgeColor: "bg-green-600",
    subcategories: ["Cricket", "Fitness", "Football", "Badminton", "Swimming", "Cycling", "Yoga", "Sportswear"],
    offer: "Up to 55% off",
    topBrands: ["Adidas", "Nike", "Yonex", "SG"],
  },
  {
    id: 8,
    name: "Books",
    path: "/books",
    icon: FaBook,
    emoji: "📚",
    gradient: "from-orange-500 to-red-600",
    lightBg: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    description: "Bestsellers, textbooks, fiction & more",
    totalProducts: "5.2L+",
    badge: "Bestsellers",
    badgeColor: "bg-orange-500",
    subcategories: ["Fiction", "Self Help", "Business", "Academic", "Children", "Biography", "Finance", "Non-Fiction"],
    offer: "Up to 50% off",
    topBrands: ["Penguin", "HarperCollins", "Arihant", "NCERT"],
  },
  {
    id: 9,
    name: "Toys",
    path: "/toys",
    icon: FaGamepad,
    emoji: "🎲",
    gradient: "from-purple-500 to-fuchsia-700",
    lightBg: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    description: "LEGO, board games, RC toys & more",
    totalProducts: "72K+",
    badge: "Safe for Kids",
    badgeColor: "bg-purple-600",
    subcategories: ["Building Blocks", "Board Games", "RC Toys", "Dolls", "Educational", "Puzzles", "Arts & Crafts", "Outdoor"],
    offer: "Up to 45% off",
    topBrands: ["LEGO", "Hasbro", "Funskool", "Hot Wheels"],
  },
  {
    id: 10,
    name: "Grocery",
    path: "/grocery",
    icon: FaLeaf,
    emoji: "🛒",
    gradient: "from-lime-500 to-green-600",
    lightBg: "bg-lime-50",
    textColor: "text-lime-700",
    borderColor: "border-lime-200",
    description: "Staples, dairy, snacks & beverages",
    totalProducts: "4.8L+",
    badge: "Next-Day Delivery",
    badgeColor: "bg-lime-600",
    subcategories: ["Staples", "Dairy", "Beverages", "Snacks", "Oils & Ghee", "Spices", "Instant Food", "Organic"],
    offer: "Up to 40% off",
    topBrands: ["Tata", "Amul", "Haldiram's", "Nescafe"],
  },
  {
    id: 11,
    name: "Automotive",
    path: "/automotive",
    icon: FaCar,
    emoji: "🚗",
    gradient: "from-slate-600 to-zinc-800",
    lightBg: "bg-slate-50",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
    description: "Tyres, batteries, car care & accessories",
    totalProducts: "48K+",
    badge: "Genuine Parts",
    badgeColor: "bg-slate-600",
    subcategories: ["Tyres", "Batteries", "Car Care", "Helmets", "Lighting", "GPS & Dash Cam", "Oils & Fluids", "Accessories"],
    offer: "Up to 45% off",
    topBrands: ["Bosch", "Michelin", "Castrol", "3M"],
  },
  {
    id: 12,
    name: "Health & Wellness",
    path: "/more",
    icon: FaHeart,
    emoji: "💊",
    gradient: "from-teal-500 to-cyan-700",
    lightBg: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    description: "Vitamins, supplements & health devices",
    totalProducts: "38K+",
    badge: "Certified",
    badgeColor: "bg-teal-600",
    subcategories: ["Vitamins", "Protein", "Health Devices", "Ayurveda", "Personal Care", "Baby Care", "Diet Food", "Medical"],
    offer: "Up to 35% off",
    topBrands: ["Himalaya", "Dabur", "Patanjali", "Healthkart"],
  },
];

const featuredDeals = [
  { label: "Electronics",    discount: "Up to 50% off", emoji: "💻", path: "/electronics", color: "from-blue-600 to-indigo-700" },
  { label: "Fashion",        discount: "Min 40% off",   emoji: "👗", path: "/fashion",     color: "from-pink-500 to-rose-600"  },
  { label: "Books",          discount: "Flat 30% off",  emoji: "📚", path: "/books",       color: "from-orange-500 to-red-600" },
  { label: "Grocery",        discount: "10% off",       emoji: "🛒", path: "/grocery",     color: "from-lime-600 to-green-700" },
];

const topBrands = [
  { name: "Apple",     emoji: "🍎", path: "/mobiles"     },
  { name: "Samsung",   emoji: "📱", path: "/electronics" },
  { name: "Nike",      emoji: "👟", path: "/sports"      },
  { name: "LEGO",      emoji: "🧱", path: "/toys"        },
  { name: "Prestige",  emoji: "🍳", path: "/home-kitchen"},
  { name: "Lakme",     emoji: "💄", path: "/beauty"      },
  { name: "Amul",      emoji: "🥛", path: "/grocery"     },
  { name: "Michelin",  emoji: "🛞", path: "/automotive"  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const AllCategories = () => {
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);

  const filtered = search.trim()
    ? allCategories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subcategories.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
    : allCategories;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-4 py-14 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur">
            <MdLocalOffer size={14} className="text-yellow-400" /> 12 Categories · 20L+ Products
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight text-white">
            Shop <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Everything</span><br />You Love
          </h1>
          <p className="text-white/60 max-w-xl text-sm leading-relaxed mb-8">
            Explore India's widest selection of categories — from the latest gadgets and fashion to daily essentials. Huge savings, trusted sellers and fast delivery on every order.
          </p>

          {/* Search */}
          <div className="w-full max-w-lg relative">
            <MdSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories or products…"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-gray-800 text-sm font-medium outline-none shadow-xl focus:ring-2 focus:ring-violet-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors text-xs font-bold">
                ✕
              </button>
            )}
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["Electronics", "Fashion", "Mobiles", "Grocery", "Books", "Sports"].map((q) => (
              <button key={q} onClick={() => setSearch(q)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-semibold transition-all backdrop-blur">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "🛍️", value: "20L+",     label: "Total Products"     },
            { icon: "✅", value: "50K+",     label: "Trusted Sellers"    },
            { icon: "🚀", value: "2-5 Days", label: "Delivery Nationwide" },
            { icon: "🔒", value: "100%",     label: "Secure Payments"    },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-base font-extrabold text-gray-900 leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-12">

        {/* ── Featured Deals Banner Strip ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MdFlashOn size={22} className="text-yellow-500" /> Today's Top Deals
            </h2>
            <Link to="/more" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              All Deals <MdArrowForward size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredDeals.map((d) => (
              <Link key={d.label} to={d.path}
                className={`relative bg-gradient-to-br ${d.color} rounded-2xl p-5 text-white overflow-hidden group hover:scale-[1.02] transition-transform`}>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 group-hover:opacity-30 transition-opacity select-none">{d.emoji}</div>
                <p className="text-xs font-semibold text-white/80 mb-1">{d.label}</p>
                <p className="text-lg font-extrabold leading-tight">{d.discount}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
                  Shop Now <MdArrowForward size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── All Categories Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                All Categories
                {search && <span className="text-sm font-medium text-gray-400 ml-2">· {filtered.length} results</span>}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Click any category to explore products</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
              <span className="text-6xl">🔍</span>
              <p className="text-gray-500 mt-4 font-medium">No categories found for "{search}"</p>
              <button onClick={() => setSearch("")} className="mt-3 text-primary-600 font-semibold text-sm hover:underline">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    onMouseEnter={() => setHovered(cat.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Card Header */}
                    <div className={`relative bg-gradient-to-br ${cat.gradient} p-6 flex items-center justify-between overflow-hidden`}>
                      {/* Background emoji */}
                      <div className="absolute -right-3 -bottom-3 text-8xl opacity-20 select-none group-hover:opacity-30 transition-opacity">
                        {cat.emoji}
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                          {cat.emoji}
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-white leading-tight">{cat.name}</h3>
                          <p className="text-white/75 text-xs mt-0.5">{cat.totalProducts} products</p>
                        </div>
                      </div>
                      <span className={`relative z-10 ${cat.badgeColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>
                        {cat.badge}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-sm text-gray-500 mb-3">{cat.description}</p>

                      {/* Subcategories */}
                      <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                        {cat.subcategories.slice(0, 6).map((sub) => (
                          <span key={sub} className={`${cat.lightBg} ${cat.textColor} text-[11px] font-semibold px-2 py-1 rounded-lg border ${cat.borderColor}`}>
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 6 && (
                          <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold px-2 py-1 rounded-lg">
                            +{cat.subcategories.length - 6} more
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <MdLocalOffer size={14} className="text-green-600" />
                          <span className="text-xs font-bold text-green-600">{cat.offer}</span>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-bold ${cat.textColor} group-hover:gap-2 transition-all`}>
                          Explore <MdArrowForward size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Top Brands ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MdVerified size={22} className="text-blue-500" /> Top Brands
            </h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {topBrands.map((b) => (
              <Link key={b.name} to={b.path}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all group">
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-xs font-bold text-gray-700 group-hover:text-primary-600 text-center">{b.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Why Shop With Us ── */}
        <section className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold mb-2">Why Shop at ShopEase?</h2>
            <p className="text-white/70 text-sm mb-8 max-w-lg">India's most trusted online marketplace with millions of products across every category you love.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: "🚀", title: "Fast Delivery",      desc: "2–5 days across India"       },
                { icon: "🔒", title: "Secure Payments",    desc: "100% safe & encrypted"       },
                { icon: "🔄", title: "Easy Returns",       desc: "7-day hassle-free returns"   },
                { icon: "🎯", title: "Best Prices",        desc: "Lowest prices guaranteed"    },
              ].map((f) => (
                <div key={f.title} className="flex flex-col gap-2">
                  <span className="text-3xl">{f.icon}</span>
                  <p className="font-bold text-sm">{f.title}</p>
                  <p className="text-white/60 text-xs">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trending Searches ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5 flex items-center gap-2">
            <MdTrendingUp size={22} className="text-rose-500" /> Trending Right Now
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "iPhone 15 Pro", "Samsung S24 Ultra", "LEGO Classic", "Atomic Habits",
              "Adidas Track Pants", "Yoga Mat", "Tata Salt", "Car Dash Cam",
              "Nescafe Coffee", "Yonex Badminton Racket", "Barbie Dreamhouse",
              "Neutrogena Body Lotion", "Bosch Car Battery", "Harry Potter Set",
              "Fitkit Treadmill", "Pressure Cooker", "NCERT Books",
            ].map((term) => (
              <button key={term} onClick={() => setSearch(term)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm">
                <MdTrendingUp size={12} className="text-rose-400" /> {term}
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AllCategories;
