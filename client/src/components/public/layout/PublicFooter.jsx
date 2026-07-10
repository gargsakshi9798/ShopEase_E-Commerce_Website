import { Link } from "react-router-dom";
import { FaShoppingBag, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { MdEmail, MdLock, MdLanguage } from "react-icons/md";
import { useState } from "react";

const topCategories = ["Fashion", "Electronics", "Home & Kitchen", "Beauty & Personal Care", "Sports & Fitness", "Toys & Games", "Automotive"];
const customerService = ["Help Center", "Track Your Order", "Returns & Refunds", "Shipping Policy", "Cancellation Policy", "FAQs", "Contact Us"];
const company = ["About Us", "Careers", "Press & Media", "Become a Seller", "Affiliate Program", "Terms & Conditions", "Privacy Policy"];
const brands = ["Nike", "Adidas", "Puma", "Bose", "Samsung", "Apple", "OnePlus"];

const features = [
  { icon: "🚚", title: "Free Delivery", sub: "On orders above ₹499" },
  { icon: "🔒", title: "Secure Payments", sub: "100% secure payment methods" },
  { icon: "↩️", title: "Easy Returns", sub: "7 days return & replacement" },
  { icon: "💰", title: "Best Price Guarantee", sub: "We ensure you get the best price" },
  { icon: "🎧", title: "24/7 Support", sub: "Dedicated support round the clock" },
  { icon: "🛡️", title: "Trusted Platform", sub: "Millions of happy customers" },
];

const PublicFooter = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-white">
      {/* Features Bar */}
      <div className="border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Icon + text */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
                ✉️
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subscribe to Our Newsletter</h3>
                <p className="text-sm text-gray-500 mt-0.5">Get the latest updates on new products, exclusive offers and special discounts.</p>
              </div>
            </div>
            {/* Input */}
            <div className="flex-1 w-full">
              <div className="flex max-w-lg">
                <div className="relative flex-1">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-l-xl text-sm outline-none focus:border-primary-500 bg-white"
                  />
                </div>
                <button className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-r-xl transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <MdLock size={12} />
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Download + Stats */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* App Download */}
            <div
              className="flex-1 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6"
              style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" }}
            >
              <div className="flex-1 z-10 relative">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">SHOP ON THE GO</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download the ShopEase App</h3>
                <p className="text-sm text-gray-600 mb-4">Exclusive app offers, faster checkout and real-time order tracking.</p>
                <div className="flex gap-3 flex-wrap">
                  <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-900 transition-colors">
                    <span className="text-lg">🎮</span>
                    <div>
                      <p className="text-[9px] opacity-70 leading-none">GET IT ON</p>
                      <p className="text-sm font-bold leading-tight">Google Play</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-900 transition-colors">
                    <span className="text-lg">🍎</span>
                    <div>
                      <p className="text-[9px] opacity-70 leading-none">Download on the</p>
                      <p className="text-sm font-bold leading-tight">App Store</p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="hidden sm:block w-32 flex-shrink-0">
                <div className="w-28 h-48 bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-5xl">📱</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 flex-wrap justify-center lg:justify-end">
              {[
                { stat: "10M+", label: "Happy Customers", icon: "😊" },
                { stat: "1M+", label: "Products", icon: "🛍️" },
                { stat: "500+", label: "Brands", icon: "🌐" },
                { stat: "99.9%", label: "Secured Payments", icon: "🛡️" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center w-24">
                  <span className="text-3xl mb-1">{s.icon}</span>
                  <p className="text-xl font-bold text-gray-900">{s.stat}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaShoppingBag size={15} className="text-white" />
                </div>
                <span className="text-lg font-bold">
                  <span className="text-primary-600">Shop</span>
                  <span className="text-gray-900">Ease</span>
                </span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Your one-stop destination for online shopping. Best products, best prices, and best experience.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook, color: "text-blue-600", href: "#" },
                  { icon: FaInstagram, color: "text-pink-600", href: "#" },
                  { icon: FaTwitter, color: "text-sky-500", href: "#" },
                  { icon: FaYoutube, color: "text-red-600", href: "#" },
                ].map(({ icon: Icon, color, href }) => (
                  <a key={href + color} href={href} className={`w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center ${color} hover:border-primary-300 transition-colors`}>
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Top Categories</h4>
              <ul className="space-y-2">
                {topCategories.map((c) => (
                  <li key={c}>
                    <Link to={`/products?category=${c}`} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                      {c}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/products" className="text-xs text-primary-600 font-semibold hover:underline">
                    View All Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Customer Service</h4>
              <ul className="space-y-2">
                {customerService.map((c) => (
                  <li key={c}>
                    <Link to="#" className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                {company.map((c) => (
                  <li key={c}>
                    <Link to="#" className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Brands */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Popular Brands</h4>
              <ul className="space-y-2">
                {brands.map((b) => (
                  <li key={b}>
                    <Link to={`/products?brand=${b}`} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                      {b}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/products" className="text-xs text-primary-600 font-semibold hover:underline">
                    View All Brands
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment & Delivery */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Payment Methods</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {["VISA", "MC", "RuPay", "UPI"].map((p) => (
                  <div key={p} className="px-2 py-1 border border-gray-200 rounded text-[10px] font-bold text-gray-600 bg-gray-50">
                    {p}
                  </div>
                ))}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">We Deliver With</h4>
              <div className="flex flex-wrap gap-2">
                {["Delhivery", "Blue Dart", "Ekart", "XpressBees"].map((d) => (
                  <div key={d} className="px-2 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-600 bg-gray-50">
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2026 ShopEase. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
              <MdLanguage size={14} />
              India (English)
            </button>
            {["Sitemap", "Store Locator", "Bulk Orders", "Gift Cards"].map((l) => (
              <Link key={l} to="#" className="text-xs text-gray-500 hover:text-primary-600 hidden sm:block">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
