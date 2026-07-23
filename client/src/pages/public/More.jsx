import { Link } from "react-router-dom";
import {
  MdArrowForward, MdLocalOffer, MdStar, MdFlashOn,
  MdVerified, MdTrendingUp, MdHeadset, MdCardGiftcard,
  MdShield, MdLoop, MdLocalShipping,
} from "react-icons/md";
import {
  FaMobileAlt, FaBolt, FaTshirt, FaHome, FaSpa,
  FaRunning, FaBook, FaGamepad, FaLeaf, FaCar,
  FaHeart, FaPercent, FaGift, FaFire, FaStar,
} from "react-icons/fa";

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { name: "Fashion",        path: "/fashion",      img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=120&q=80",  gradient: "from-pink-500 to-rose-600",      count: "2.4L+"  },
  { name: "Electronics",    path: "/electronics",  img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=120&q=80",  gradient: "from-blue-500 to-indigo-600",    count: "1.8L+"  },
  { name: "Mobiles",        path: "/mobiles",      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&q=80",  gradient: "from-violet-500 to-purple-700",  count: "1.2L+"  },
  { name: "Home & Kitchen", path: "/home-kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=120&q=80",  gradient: "from-amber-500 to-orange-600",   count: "3.1L+"  },
  { name: "Appliances",     path: "/appliances",   img: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=120&q=80",  gradient: "from-cyan-500 to-blue-600",      count: "85K+"   },
  { name: "Beauty",         path: "/beauty",       img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=120&q=80", gradient: "from-rose-500 to-pink-700",      count: "1.6L+"  },
  { name: "Sports",         path: "/sports",       img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=120&q=80", gradient: "from-green-500 to-emerald-700",  count: "95K+"   },
  { name: "Books",          path: "/books",        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&q=80", gradient: "from-orange-500 to-red-600",     count: "5.2L+"  },
  { name: "Toys",           path: "/toys",         img: "https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=120", gradient: "from-purple-500 to-fuchsia-700", count: "72K+" },
  { name: "Grocery",        path: "/grocery",      img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=120&q=80", gradient: "from-lime-500 to-green-600",     count: "4.8L+"  },
  { name: "Automotive",     path: "/automotive",   img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=120&q=80", gradient: "from-slate-600 to-zinc-800",     count: "48K+"   },
  { name: "All Categories", path: "/categories",   img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=120&q=80", gradient: "from-primary-500 to-indigo-600", count: "20L+"   },
];

const flashDeals = [
  { name: "iPhone 15 Pro Max",        category: "Mobiles",     path: "/mobiles",      img: "https://images.unsplash.com/photo-1696426022946-2d5f4a0fd9bf?w=200&q=80", originalPrice: 159900, salePrice: 119900, rating: 4.8, reviews: 12400, badge: "68% off" },
  { name: "Samsung 55\" QLED 4K TV",  category: "Electronics", path: "/electronics",  img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&q=80", originalPrice: 89999,  salePrice: 54999,  rating: 4.6, reviews: 6230,  badge: "39% off" },
  { name: "Adidas Tiro Track Pants",  category: "Sports",      path: "/sports",       img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&q=80", originalPrice: 2799,   salePrice: 1499,   rating: 4.5, reviews: 7890,  badge: "46% off" },
  { name: "Atomic Habits",            category: "Books",       path: "/books",        img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80",     originalPrice: 699,    salePrice: 399,    rating: 4.8, reviews: 45200, badge: "43% off" },
  { name: "Lakme Matte Lipstick",     category: "Beauty",      path: "/beauty",       img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",  originalPrice: 499,    salePrice: 299,    rating: 4.4, reviews: 15600, badge: "40% off" },
  { name: "LEGO Classic 900pcs",      category: "Toys",        path: "/toys",         img: "https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=200", originalPrice: 3999, salePrice: 2499, rating: 4.8, reviews: 14300, badge: "38% off" },
  { name: "Castrol EDGE 5W-30 3.5L",  category: "Automotive",  path: "/automotive",   img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=80",  originalPrice: 2100,   salePrice: 1499,   rating: 4.6, reviews: 17800, badge: "29% off" },
  { name: "Tata Salt 1kg x6",         category: "Grocery",     path: "/grocery",      img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80",  originalPrice: 180,    salePrice: 149,    rating: 4.7, reviews: 89400, badge: "17% off" },
];

const offerZones = [
  {
    title: "Electronics Fest",
    subtitle: "Laptops, TVs & Cameras",
    offer: "Up to 50% off",
    path: "/electronics",
    gradient: "from-[#0c1445] via-[#1a2980] to-[#26d0ce]",
    img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300&q=80",
    cta: "Shop Electronics",
  },
  {
    title: "Fashion Week",
    subtitle: "Clothing, Shoes & Accessories",
    offer: "Min 40% off",
    path: "/fashion",
    gradient: "from-[#fc5c7d] to-[#6a3093]",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=300&q=80",
    cta: "Shop Fashion",
  },
  {
    title: "Fresh Grocery",
    subtitle: "Staples, Dairy & Snacks",
    offer: "Up to 40% off",
    path: "/grocery",
    gradient: "from-[#134e5e] to-[#71b280]",
    img: "https://images.unsplash.com/photo-1543168256-418811576931?w=300&q=80",
    cta: "Shop Grocery",
  },
];

const trendingSearches = [
  "iPhone 15", "Samsung S24", "LEGO Set", "Yoga Mat", "Atomic Habits",
  "Tata Salt", "Adidas Shoes", "Barbie Dreamhouse", "Pressure Cooker",
  "Car Battery", "Nescafe Coffee", "Harry Potter", "Wireless Earbuds",
  "Running Shoes", "Bosch Battery", "Neutrogena Lotion",
];

const services = [
  { icon: <MdLocalShipping size={24} />, title: "Free Delivery",    desc: "On orders above ₹499",    color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: <MdLoop size={24} />,          title: "Easy Returns",     desc: "7-day hassle-free returns",color: "text-green-600",  bg: "bg-green-50"  },
  { icon: <MdShield size={24} />,        title: "Secure Payments",  desc: "100% safe & encrypted",   color: "text-violet-600", bg: "bg-violet-50" },
  { icon: <MdHeadset size={24} />,       title: "24/7 Support",     desc: "Always here to help",     color: "text-rose-600",   bg: "bg-rose-50"   },
  { icon: <MdCardGiftcard size={24} />,  title: "Gift Cards",       desc: "Send love to anyone",     color: "text-amber-600",  bg: "bg-amber-50"  },
  { icon: <MdVerified size={24} />,      title: "Genuine Products", desc: "100% authentic items",    color: "text-cyan-600",   bg: "bg-cyan-50"   },
];

// ─── Flash Deal Card ─────────────────────────────────────────────────────────
const FlashCard = ({ deal }) => {
  const disc = Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100);
  return (
    <Link to={deal.path}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group flex flex-col">
      <div className="relative h-36 bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {deal.img
          ? <img src={deal.img} alt={deal.name} onError={(e) => { e.target.style.display = "none"; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-6xl">{deal.emoji}</span>
        }
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
          {deal.badge}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 font-medium">{deal.category}</p>
        <p className="text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1">{deal.name}</p>
        <div className="flex items-center gap-0.5 mt-1.5">
          <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
            {deal.rating} <MdStar size={9} />
          </div>
          <span className="text-[10px] text-gray-400 ml-1">({deal.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-sm font-extrabold text-gray-900">&#8377;{deal.salePrice.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">&#8377;{deal.originalPrice.toLocaleString()}</span>
          <span className="text-[10px] text-green-600 font-bold">{disc}% off</span>
        </div>
      </div>
    </Link>
  );
};

// ─── Main More Page ───────────────────────────────────────────────────────────
const More = () => {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-4 backdrop-blur">
                <FaFire className="text-orange-400" size={12} /> Limited Time Offers
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight text-white">
                More Deals.<br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  More Savings.
                </span>
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Discover exclusive flash deals, special offer zones, new arrivals and everything else
                ShopEase has to offer — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/categories"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
                  &#128722; All Categories <MdArrowForward size={15} />
                </Link>
                <Link to="/grocery"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors backdrop-blur">
                  &#127820; Grocery Deals
                </Link>
              </div>
            </div>
            {/* Floating stat cards */}
            <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { value: "20L+",  label: "Products",       icon: "🛍️", color: "from-blue-500/20 to-blue-600/30" },
                { value: "50K+",  label: "Sellers",        icon: "✅", color: "from-green-500/20 to-green-600/30" },
                { value: "70%",   label: "Max Discount",   icon: "🏷️", color: "from-rose-500/20 to-rose-600/30" },
                { value: "4.8★", label: "Avg Rating",     icon: "⭐", color: "from-amber-500/20 to-amber-600/30" },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} backdrop-blur border border-white/10 rounded-2xl p-4 text-center min-w-[110px]`}>
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-xl font-extrabold mt-1">{s.value}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-12">

        {/* ── Offer Zones ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <FaPercent className="text-rose-500" size={18} /> Exclusive Offer Zones
            </h2>
            <Link to="/categories" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              View All <MdArrowForward size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offerZones.map((zone) => (
              <Link key={zone.title} to={zone.path}
                className={`relative bg-gradient-to-br ${zone.gradient} rounded-2xl p-7 text-white overflow-hidden group hover:scale-[1.02] hover:shadow-xl transition-all duration-300`}>
                <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-20 group-hover:opacity-30 transition-opacity select-none overflow-hidden rounded-2xl">
                  <img src={zone.img} alt="" onError={(e) => { e.target.style.display="none"; }} className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    <FaFire size={10} /> Special Zone
                  </span>
                  <h3 className="text-2xl font-extrabold mb-1">{zone.title}</h3>
                  <p className="text-white/70 text-sm mb-1">{zone.subtitle}</p>
                  <p className="text-xl font-extrabold text-yellow-300 mb-5">{zone.offer}</p>
                  <span className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-4 py-2 text-sm font-bold transition-colors">
                    {zone.cta} <MdArrowForward size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Flash Deals ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <MdFlashOn className="text-yellow-500" size={22} /> Flash Deals
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">Limited Time</span>
            </h2>
            <Link to="/categories" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              All Deals <MdArrowForward size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {flashDeals.map((deal) => <FlashCard key={deal.name} deal={deal} />)}
          </div>
        </section>

        {/* ── All Categories Quick Access ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              &#128722; Shop by Category
            </h2>
            <Link to="/categories" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
              View All <MdArrowForward size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.path}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
                <div className={`bg-gradient-to-br ${cat.gradient} h-20 flex items-center justify-center relative overflow-hidden`}>
                  <img src={cat.img} alt={cat.name} onError={(e) => { e.target.style.display="none"; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-2.5 text-center">
                  <p className="text-xs font-bold text-gray-800 group-hover:text-primary-600 transition-colors leading-tight">{cat.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </section>



        {/* ── Trending Searches ── */}
        <section>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5 flex items-center gap-2">
            <MdTrendingUp className="text-rose-500" size={22} /> Trending Searches
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <Link key={term} to="/categories"
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm">
                <MdTrendingUp size={12} className="text-rose-400" /> {term}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default More;
