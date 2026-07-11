import { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingBag, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdLock, MdLanguage, MdPhone } from "react-icons/md";
import { useSettings } from "../../../hooks/useSettings";
import { getImgUrl } from "../../../utils/Methods";

// ─── Static nav link arrays (links don't change via CMS) ─────────────────────
const topCategories = [
  { label: "Fashion",          path: "/fashion"      },
  { label: "Electronics",      path: "/electronics"  },
  { label: "Home & Kitchen",   path: "/home-kitchen" },
  { label: "Beauty",           path: "/beauty"       },
  { label: "Sports & Fitness", path: "/sports"       },
  { label: "Toys & Games",     path: "/toys"         },
  { label: "Automotive",       path: "/automotive"   },
];

const customerService = [
  { label: "Help Center",         path: "/help-center"         },
  { label: "Track Your Order",    path: "/track-order"         },
  { label: "Returns & Refunds",   path: "/returns"             },
  { label: "Shipping Policy",     path: "/shipping-policy"     },
  { label: "Cancellation Policy", path: "/cancellation-policy" },
  { label: "Contact Us",          path: "/contact-us"          },
];

const company = [
  { label: "About Us",           path: "/about-us"         },
  { label: "Careers",            path: "/careers"          },
  { label: "Press & Media",      path: "/press-media"      },
  { label: "Become a Seller",    path: "/become-seller"    },
  { label: "Affiliate Program",  path: "/affiliate"        },
  { label: "Terms & Conditions", path: "/terms-conditions" },
  { label: "Privacy Policy",     path: "/privacy-policy"   },
];

const bottomLinks = [
  { label: "Sitemap",       path: "/sitemap"       },
  { label: "Store Locator", path: "/store-locator" },
  { label: "Bulk Orders",   path: "/bulk-orders"   },
  { label: "Gift Cards",    path: "/gift-cards"    },
];

// ─── Default values ───────────────────────────────────────────────────────────
const DEFAULT_FEATURES = [
  { icon: "🚚", title: "Free Delivery",       sub: "On orders above ₹499"          },
  { icon: "🔒", title: "Secure Payments",      sub: "256-bit SSL encryption"        },
  { icon: "↩️", title: "Easy Returns",         sub: "7-day hassle-free returns"     },
  { icon: "💰", title: "Best Price Guarantee", sub: "Lowest prices, always"         },
  { icon: "🎧", title: "24/7 Support",         sub: "Round-the-clock assistance"    },
  { icon: "🛡️", title: "100% Genuine",         sub: "Authenticated seller products" },
];

const DEFAULT_STATS = [
  { stat: "10M+",  label: "Happy Customers", icon: "😊" },
  { stat: "20L+",  label: "Products",         icon: "🛍️" },
  { stat: "50K+",  label: "Trusted Sellers",  icon: "🤝" },
  { stat: "99.9%", label: "Secure Payments",  icon: "🛡️" },
];

// Parse "stat|label" pipe value
const parseStat = (raw, def) => {
  if (!raw) return def;
  const [stat, label] = raw.split("|").map((v) => v.trim());
  return { stat: stat || def.stat, label: label || def.label, icon: def.icon };
};

const PublicFooter = () => {
  const { s } = useSettings();
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // ── Dynamic values from settings ─────────────────────────────────────────
  const siteName      = s("site_name",       "ShopEase");
  const siteLogo      = s("logo",            "");
  const halfLen       = Math.ceil(siteName.length / 2);
  const namePart1     = siteName.slice(0, halfLen);
  const namePart2     = siteName.slice(halfLen);

  const footerTagline = s("footer_tagline",  "Your one-stop destination for online shopping. Best products, best prices, best experience.");
  const supportPhone  = s("support_phone",   "1800-123-4567 (Free)");
  const supportEmail  = s("support_email",   "support@shopease.in");
  const copyrightTpl  = s("footer_copyright","© {year} ShopEase Technologies Pvt. Ltd. All rights reserved.");
  const copyright     = copyrightTpl.replace("{year}", new Date().getFullYear());

  // Social links
  const socialFb   = s("social_facebook",  "#");
  const socialIg   = s("social_instagram", "#");
  const socialTw   = s("social_twitter",   "#");
  const socialYt   = s("social_youtube",   "#");
  const socialWa   = s("social_whatsapp",  "#");

  // App download
  const appPlaystore = s("app_playstore_url", "#");
  const appAppstore  = s("app_appstore_url",  "#");
  const appHeadline  = s("app_headline",  `Download the ${siteName} App`);
  const appSubtitle  = s("app_subtitle",  "Exclusive app offers, faster checkout and real-time tracking.");

  // Footer stats
  const footerStats = [
    parseStat(s("footer_stat_1", ""), DEFAULT_STATS[0]),
    parseStat(s("footer_stat_2", ""), DEFAULT_STATS[1]),
    parseStat(s("footer_stat_3", ""), DEFAULT_STATS[2]),
    parseStat(s("footer_stat_4", ""), DEFAULT_STATS[3]),
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-white">

      {/* ── Features Bar ── */}
      <div className="border-y border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DEFAULT_FEATURES.map((f) => (
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

      {/* ── Newsletter ── */}
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-3xl">✉️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subscribe to Our Newsletter</h3>
                <p className="text-sm text-gray-500 mt-0.5">Exclusive deals, new arrivals and special discounts in your inbox.</p>
              </div>
            </div>
            <div className="flex-1 w-full">
              {subscribed ? (
                <div className="max-w-lg flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="text-xl">✅</span>
                  <p className="text-sm font-semibold text-green-700">You're subscribed! Great deals are coming your way.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-lg">
                  <div className="relative flex-1">
                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-l-xl text-sm outline-none focus:border-primary-500 bg-white"
                    />
                  </div>
                  <button type="submit" className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-r-xl transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </form>
              )}
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <MdLock size={12} /> We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── App Download + Stats ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6"
              style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" }}>
              <div className="flex-1 z-10 relative">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">SHOP ON THE GO</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{appHeadline}</h3>
                <p className="text-sm text-gray-600 mb-4">{appSubtitle}</p>
                <div className="flex gap-3 flex-wrap">
                  <a href={appPlaystore} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-900 transition-colors">
                    <span className="text-lg">🤖</span>
                    <div><p className="text-[9px] opacity-70 leading-none">GET IT ON</p><p className="text-sm font-bold leading-tight">Google Play</p></div>
                  </a>
                  <a href={appAppstore} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-900 transition-colors">
                    <span className="text-lg">🍎</span>
                    <div><p className="text-[9px] opacity-70 leading-none">Download on the</p><p className="text-sm font-bold leading-tight">App Store</p></div>
                  </a>
                </div>
              </div>
              <div className="hidden sm:block w-32 flex-shrink-0">
                <div className="w-28 h-48 bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-5xl">📱</div>
              </div>
            </div>
            <div className="flex gap-8 flex-wrap justify-center lg:justify-end">
              {footerStats.map((s) => (
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

      {/* ── Main Footer Links ── */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center overflow-hidden">
                  {siteLogo
                    ? <img src={getImgUrl(siteLogo)} alt={siteName} className="w-full h-full object-contain p-0.5" />
                    : <FaShoppingBag size={15} className="text-white" />}
                </div>
                <span className="text-lg font-bold">
                  <span className="text-primary-600">{namePart1}</span>
                  <span className="text-gray-900">{namePart2}</span>
                </span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{footerTagline}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <MdPhone size={13} className="text-green-500" /> {supportPhone}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                <MdEmail size={13} className="text-blue-500" /> {supportEmail}
              </div>
              {/* Social icons */}
              <div className="flex gap-2">
                {[
                  { icon: FaFacebook,  color: "text-blue-600",  href: socialFb },
                  { icon: FaInstagram, color: "text-pink-600",  href: socialIg },
                  { icon: FaTwitter,   color: "text-sky-500",   href: socialTw },
                  { icon: FaYoutube,   color: "text-red-600",   href: socialYt },
                  { icon: FaWhatsapp,  color: "text-green-600", href: socialWa },
                ].map(({ icon: Icon, color, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    className={`w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center ${color} hover:border-primary-300 transition-colors`}>
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Top Categories</h4>
              <ul className="space-y-2">
                {topCategories.map((c) => (
                  <li key={c.path}>
                    <Link to={c.path} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">{c.label}</Link>
                  </li>
                ))}
                <li><Link to="/categories" className="text-xs text-primary-600 font-semibold hover:underline">View All Categories →</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Customer Service</h4>
              <ul className="space-y-2">
                {customerService.map((c) => (
                  <li key={c.path}>
                    <Link to={c.path} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                {company.map((c) => (
                  <li key={c.path}>
                    <Link to={c.path} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">{c.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment & Delivery */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Payment Methods</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {["VISA","MC","RuPay","UPI","EMI","COD"].map((p) => (
                  <div key={p} className="px-2 py-1 border border-gray-200 rounded text-[10px] font-bold text-gray-600 bg-gray-50">{p}</div>
                ))}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">We Deliver With</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Delhivery","Blue Dart","Ekart","XpressBees"].map((d) => (
                  <div key={d} className="px-2 py-1 border border-gray-200 rounded text-[10px] font-semibold text-gray-600 bg-gray-50">{d}</div>
                ))}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">For Business</h4>
              <ul className="space-y-1.5">
                <li><Link to="/become-seller" className="text-xs text-gray-500 hover:text-primary-600 transition-colors">Become a Seller</Link></li>
                <li><Link to="/affiliate"     className="text-xs text-gray-500 hover:text-primary-600 transition-colors">Affiliate Program</Link></li>
                <li><Link to="/bulk-orders"   className="text-xs text-gray-500 hover:text-primary-600 transition-colors">Bulk Orders</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">{copyright}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
              <MdLanguage size={14} /> India (English)
            </button>
            {bottomLinks.map((l) => (
              <Link key={l.path} to={l.path} className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default PublicFooter;
