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
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80",
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
    img: "https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=120",
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
    img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=120&q=80",
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
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=120&q=80",
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
  { label: "Electronics",    discount: "Up to 50% off", img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=80", path: "/electronics", color: "from-blue-600 to-indigo-700" },
  { label: "Fashion",        discount: "Min 40% off",   img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=120&q=80", path: "/fashion",     color: "from-pink-500 to-rose-600"  },
  { label: "Books",          discount: "Flat 30% off",  img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=120&q=80", path: "/books",       color: "from-orange-500 to-red-600" },
  { label: "Grocery",        discount: "10% off",       img: "https://images.unsplash.com/photo-1543168256-418811576931?w=120&q=80",   path: "/grocery",     color: "from-lime-600 to-green-700" },
];

const topBrands = [
  { name: "Apple",     img: "https://images.unsplash.com/photo-1611186871525-7d8daa84e5f8?w=80&q=80",  path: "/mobiles"     },
  { name: "Samsung",   img: "https://images.unsplash.com/photo-1610945264803-c22b62831e6f?w=80&q=80",  path: "/electronics" },
  { name: "Nike",      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&q=80",     path: "/sports"      },
  { name: "LEGO",      img: "https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=80", path: "/toys" },
  { name: "Prestige",  img: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=80&q=80",  path: "/home-kitchen"},
  { name: "Lakme",     img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80&q=80",  path: "/beauty"      },
  { name: "Amul",      img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&q=80",     path: "/grocery"     },
  { name: "Michelin",  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80",     path: "/automotive"  },
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
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-tight text-white">
            Shop <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Everything</span><br />You Love
          </h1>
          <p className="text-white/60 max-w-xl text-sm leading-relaxed mb-8">
            Explore India's widest selection of categories — from the latest gadgets and fashion to daily essentials. Huge savings, trusted sellers and fast delivery on every order.
          </p>

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
                <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-25 group-hover:opacity-40 transition-opacity select-none overflow-hidden rounded-xl">
                  <img src={d.img} alt="" onError={(e) => { e.target.style.display="none"; }} className="w-full h-full object-cover" />
                </div>
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
                      {/* Background image watermark */}
                      <div className="absolute -right-3 -bottom-3 w-28 h-28 opacity-20 group-hover:opacity-30 transition-opacity select-none overflow-hidden rounded-xl">
                        <img src={cat.img} alt="" onError={(e) => { e.target.style.display="none"; }} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 shadow-inner overflow-hidden">
                          <img src={cat.img} alt={cat.name} onError={(e) => { e.target.style.display="none"; }} className="w-full h-full object-cover" />
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
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img src={b.img} alt={b.name} onError={(e) => { e.target.style.display="none"; }} className="w-full h-full object-cover" />
                </div>
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
