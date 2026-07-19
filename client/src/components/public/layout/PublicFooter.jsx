import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp,
} from "react-icons/fa";
import {
  MdEmail, MdLock, MdLanguage, MdPhone, MdLocationOn,
  MdLocalShipping, MdSecurity, MdUndo, MdSupportAgent,
  MdVerified, MdPriceCheck, MdChevronRight, MdArrowForward,
} from "react-icons/md";
import { useSettings } from "../../../hooks/useSettings";
import { getImgUrl } from "../../../utils/Methods";

// ─── Nav data ────────────────────────────────────────────────────────────────
const topCategories = [
  { label: "Fashion",          path: "/fashion"      },
  { label: "Electronics",      path: "/electronics"  },
  { label: "Mobiles",          path: "/mobiles"      },
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
  { label: "My Orders",           path: "/account/orders"      },
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

// ─── Trust features ───────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MdLocalShipping, title: "Free Delivery",   sub: "On orders above ₹499",        color: "text-blue-600",    bg: "bg-blue-50"    },
  { icon: MdSecurity,      title: "Secure Payments", sub: "256-bit SSL encryption",       color: "text-green-600",   bg: "bg-green-50"   },
  { icon: MdUndo,          title: "Easy Returns",    sub: "7-day hassle-free returns",    color: "text-orange-600",  bg: "bg-orange-50"  },
  { icon: MdPriceCheck,    title: "Best Price",      sub: "Guaranteed lowest prices",     color: "text-primary-600", bg: "bg-primary-50" },
  { icon: MdSupportAgent,  title: "24/7 Support",    sub: "Round-the-clock assistance",   color: "text-purple-600",  bg: "bg-purple-50"  },
  { icon: MdVerified,      title: "100% Genuine",    sub: "Authenticated products only",  color: "text-red-600",     bg: "bg-red-50"     },
];

const DEFAULT_STATS = [
  { stat: "10M+",  label: "Happy Customers", icon: "😊" },
  { stat: "20L+",  label: "Products",        icon: "🛍️" },
  { stat: "50K+",  label: "Trusted Sellers", icon: "🤝" },
  { stat: "99.9%", label: "Secure Payments", icon: "🛡️" },
];

const parseStat = (raw, def) => {
  if (!raw) return def;
  const [stat, label] = raw.split("|").map((v) => v.trim());
  return { stat: stat || def.stat, label: label || def.label, icon: def.icon };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="group flex items-center gap-0.5 text-sm text-gray-700 font-medium hover:text-primary-600 transition-colors duration-200"
  >
    <MdChevronRight
      size={14}
      className="opacity-0 group-hover:opacity-100 -ml-1 transition-opacity flex-shrink-0 text-primary-500"
    />
    {children}
  </Link>
);

const SocialBtn = ({ icon: Icon, color, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 ${color}
      hover:border-current hover:bg-gray-50 hover:scale-110 transition-all duration-200`}
  >
    <Icon size={15} />
  </a>
);

// ─── Component ────────────────────────────────────────────────────────────────
const PublicFooter = () => {
  const { s } = useSettings();
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const siteName      = s("site_name",        "ShopEase");
  const siteLogo      = s("logo",             "");
  const halfLen       = Math.ceil(siteName.length / 2);
  const namePart1     = siteName.slice(0, halfLen);
  const namePart2     = siteName.slice(halfLen);
  const footerTagline = s("footer_tagline",   "Your one-stop destination for online shopping — best products, best prices, best experience.");
  const supportPhone  = s("support_phone",    "1800-123-4567 (Free)");
  const supportEmail  = s("support_email",    "support@shopease.in");
  const supportAddr   = s("support_address",  "Sector 62, Noida, Uttar Pradesh — 201309");
  const copyrightTpl  = s("footer_copyright", "© {year} ShopEase Technologies Pvt. Ltd. All rights reserved.");
  const copyright     = copyrightTpl.replace("{year}", new Date().getFullYear());
  const appPlaystore  = s("app_playstore_url", "#");
  const appAppstore   = s("app_appstore_url",  "#");
  const appHeadline   = s("app_headline",  `Download the ${siteName} App`);
  const appSubtitle   = s("app_subtitle",  "Exclusive deals, faster checkout and real-time order tracking.");

  const footerStats = [
    parseStat(s("footer_stat_1", ""), DEFAULT_STATS[0]),
    parseStat(s("footer_stat_2", ""), DEFAULT_STATS[1]),
    parseStat(s("footer_stat_3", ""), DEFAULT_STATS[2]),
    parseStat(s("footer_stat_4", ""), DEFAULT_STATS[3]),
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-white border-t border-gray-100">

      {/* ── Trust / Features Bar ─────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{f.title}</p>
                  <p className="text-xs text-gray-600 font-medium mt-0.5 leading-snug">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Left */}
            <div className="flex-shrink-0">
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1">Newsletter</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Stay in the loop</h3>
              <p className="text-sm text-gray-600 font-medium mt-1 max-w-xs leading-relaxed">
                Get exclusive deals, new arrivals and flash sales — straight to your inbox.
              </p>
            </div>

            {/* Right */}
            <div className="flex-1 w-full max-w-lg">
              {subscribed ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm font-bold text-green-700">You're subscribed!</p>
                    <p className="text-xs text-green-600 mt-0.5">Great deals are on their way to your inbox.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}
                  className="flex rounded-2xl overflow-hidden border border-gray-300 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                  <div className="relative flex-1">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full h-12 pl-11 pr-4 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    Subscribe <MdArrowForward size={16} />
                  </button>
                </form>
              )}
              <p className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-2.5">
                <MdLock size={12} /> We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Links + Brand ───────────────────────────────────────────── */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">

            {/* ── Brand column ── */}
            <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:bg-primary-700 transition-colors">
                  {siteLogo
                    ? <img src={getImgUrl(siteLogo)} alt={siteName} className="w-full h-full object-contain p-1" />
                    : <FaShoppingBag size={16} className="text-white" />}
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  <span className="text-primary-600">{namePart1}</span>
                  <span className="text-gray-900">{namePart2}</span>
                </span>
              </Link>

              <p className="text-sm text-gray-700 font-medium leading-relaxed mb-5 max-w-xs">{footerTagline}</p>

              {/* Contact */}
              <div className="space-y-2.5 mb-5">
                <a href={`tel:${supportPhone}`}
                  className="flex items-center gap-2.5 text-sm text-gray-700 font-medium hover:text-primary-600 transition-colors">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdPhone size={14} className="text-green-600" />
                  </div>
                  {supportPhone}
                </a>
                <a href={`mailto:${supportEmail}`}
                  className="flex items-center gap-2.5 text-sm text-gray-700 font-medium hover:text-primary-600 transition-colors">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdEmail size={14} className="text-blue-600" />
                  </div>
                  {supportEmail}
                </a>
                <div className="flex items-start gap-2.5 text-sm text-gray-600 font-medium">
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MdLocationOn size={14} className="text-red-500" />
                  </div>
                  <span className="leading-relaxed">{supportAddr}</span>
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-2 flex-wrap">
                <SocialBtn icon={FaFacebook}  color="text-blue-600"  href={s("social_facebook",  "#")} label="Facebook"  />
                <SocialBtn icon={FaInstagram} color="text-pink-600"  href={s("social_instagram", "#")} label="Instagram" />
                <SocialBtn icon={FaTwitter}   color="text-sky-500"   href={s("social_twitter",   "#")} label="Twitter"   />
                <SocialBtn icon={FaYoutube}   color="text-red-600"   href={s("social_youtube",   "#")} label="YouTube"   />
                <SocialBtn icon={FaWhatsapp}  color="text-green-600" href={s("social_whatsapp",  "#")} label="WhatsApp"  />
              </div>
            </div>

            {/* ── Top Categories ── */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Categories</h4>
              <ul className="space-y-2.5">
                {topCategories.map((c) => (
                  <li key={c.path}><FooterLink to={c.path}>{c.label}</FooterLink></li>
                ))}
                <li className="pt-1">
                  <Link to="/categories"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                    All Categories <MdArrowForward size={13} />
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Customer Service ── */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Customer Service</h4>
              <ul className="space-y-2.5">
                {customerService.map((c) => (
                  <li key={c.path}><FooterLink to={c.path}>{c.label}</FooterLink></li>
                ))}
              </ul>
            </div>

            {/* ── Company ── */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                {company.map((c) => (
                  <li key={c.path}><FooterLink to={c.path}>{c.label}</FooterLink></li>
                ))}
              </ul>
            </div>

            {/* ── Payments & Delivery ── */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-widest">Payments</h4>
              <div className="flex flex-wrap gap-2 mb-5">
                {["VISA", "MC", "RuPay", "UPI", "EMI", "COD"].map((p) => (
                  <div key={p}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 shadow-sm">
                    {p}
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-widest">Delivery Partners</h4>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Delhivery", "BlueDart", "Ekart", "XpressBees"].map((d) => (
                  <div key={d}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-semibold text-gray-600 shadow-sm">
                    {d}
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-widest">For Business</h4>
              <ul className="space-y-2.5">
                <li><FooterLink to="/become-seller">Become a Seller</FooterLink></li>
                <li><FooterLink to="/affiliate">Affiliate Program</FooterLink></li>
                <li><FooterLink to="/bulk-orders">Bulk Orders</FooterLink></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── App Download + Stats ─────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">

            {/* App CTA */}
            <div className="w-full lg:flex-1 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 p-6 sm:p-8 flex items-center gap-6 shadow-md shadow-primary-100">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary-100 uppercase tracking-widest mb-1.5">Shop On The Go</p>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">{appHeadline}</h3>
                <p className="text-sm text-primary-100 mb-5 leading-relaxed">{appSubtitle}</p>
                <div className="flex gap-3 flex-wrap">
                  <a href={appPlaystore} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-white text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <span className="text-xl leading-none">🤖</span>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-semibold leading-none">Get it on</p>
                      <p className="text-sm font-bold leading-tight">Google Play</p>
                    </div>
                  </a>
                  <a href={appAppstore} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-white text-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <span className="text-xl leading-none">🍎</span>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-semibold leading-none">Download on the</p>
                      <p className="text-sm font-bold leading-tight">App Store</p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="hidden sm:flex w-24 flex-shrink-0 items-center justify-center">
                <div className="w-20 h-36 bg-white/20 border border-white/30 rounded-2xl shadow-xl flex items-center justify-center text-4xl">📱</div>
              </div>
            </div>

            {/* Stats */}
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
              {footerStats.map((st) => (
                <div key={st.label}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm min-w-[110px]">
                  <span className="text-2xl mb-1.5">{st.icon}</span>
                  <p className="text-xl font-extrabold text-gray-900 leading-none">{st.stat}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1 leading-snug">{st.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-xs text-gray-600 font-medium text-center sm:text-left">{copyright}</p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <button className="flex items-center gap-1.5 text-xs text-gray-600 font-medium hover:text-gray-800 transition-colors">
                <MdLanguage size={14} /> India (English)
              </button>
              {[
                { label: "Sitemap",       path: "/sitemap"       },
                { label: "Store Locator", path: "/store-locator" },
                { label: "Bulk Orders",   path: "/bulk-orders"   },
                { label: "Gift Cards",    path: "/gift-cards"    },
              ].map((l) => (
                <Link key={l.path} to={l.path}
                  className="text-xs text-gray-600 font-medium hover:text-primary-600 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
};

export default PublicFooter;
