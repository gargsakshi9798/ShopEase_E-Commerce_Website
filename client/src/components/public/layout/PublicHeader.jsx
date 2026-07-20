import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MdSearch, MdShoppingCart, MdFavoriteBorder, MdFavorite,
  MdPerson, MdKeyboardArrowDown, MdMenu, MdClose,
  MdLogout, MdShoppingBag, MdAccountCircle, MdLocationOn,
  MdLocalOffer, MdStar, MdNotifications, MdSettings,
  MdCardGiftcard, MdSecurity, MdDashboard, MdDoneAll,
  MdCircle, MdLocalShipping, MdCheckCircle, MdInfo,
} from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { customerLogout } from "../../../features/public/customerAuthSlice";
import {
  fetchCustomerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markOneReadLocal,
  markAllReadLocal,
} from "../../../features/public/publicNotificationSlice";
import { useSettings } from "../../../hooks/useSettings";
import { getImgUrl, formatDateTime } from "../../../utils/Methods";

// ── Notification type config ──────────────────────────────────────────────────
const NOTIF_TYPE = {
  order:    { bg: "bg-blue-100",   text: "text-blue-600",   emoji: "🛒" },
  payment:  { bg: "bg-green-100",  text: "text-green-600",  emoji: "💳" },
  promo:    { bg: "bg-purple-100", text: "text-purple-600", emoji: "🎉" },
  return:   { bg: "bg-orange-100", text: "text-orange-600", emoji: "↩️" },
  account:  { bg: "bg-gray-100",   text: "text-gray-600",   emoji: "👤" },
  general:  { bg: "bg-primary-100","text": "text-primary-600", emoji: "🔔" },
};
const getNT = (type) => NOTIF_TYPE[type?.toLowerCase()] ?? NOTIF_TYPE.general;

const categories = [
  "Fashion", "Electronics", "Mobiles", "Home & Kitchen",
  "Appliances", "Beauty", "Sports", "Books",
  "Toys", "Grocery", "Automotive", "More",
];

const PublicHeader = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { s }     = useSettings();

  const siteName  = s("site_name",  "ShopEase");
  const siteLogo  = s("logo",       "");
  const halfLen   = Math.ceil(siteName.length / 2);
  const namePart1 = siteName.slice(0, halfLen);
  const namePart2 = siteName.slice(halfLen);

  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [accountDropdown,  setAccountDropdown]  = useState(false);
  const [notifOpen,        setNotifOpen]         = useState(false);

  const accountRef = useRef(null);
  const notifRef   = useRef(null);

  const cartCount     = useSelector((s) => s.publicCart?.count     ?? 0);
  const wishlistCount = useSelector((s) => s.publicWishlist?.count ?? 0);
  const customer      = useSelector((s) => s.customerAuth?.user    ?? null);
  const { notifications, unread: unreadNotifs } =
    useSelector((s) => s.publicNotification);

  // ── Auto-fetch notifications every 60s when logged in ──────────────────
  const loadNotifs = useCallback(() => {
    if (customer) dispatch(fetchCustomerNotifications({ per_page: 10 }));
  }, [customer, dispatch]);

  useEffect(() => {
    loadNotifs();
    const t = setInterval(loadNotifs, 60_000);
    return () => clearInterval(t);
  }, [loadNotifs]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setNotifOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(customerLogout());
    setAccountDropdown(false);
    navigate("/login");
  };

  const handleNotifClick = (n) => {
    if (!n.is_read) {
      dispatch(markOneReadLocal(n._id));
      dispatch(markNotificationRead(n._id));
    }
    setNotifOpen(false);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllReadLocal());
    dispatch(markAllNotificationsRead());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">

      {/* ── Main header row ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-3">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center overflow-hidden">
              {siteLogo
                ? <img src={getImgUrl(siteLogo)} alt={siteName} className="w-full h-full object-contain p-1" />
                : <FaShoppingBag size={17} className="text-white" />}
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-600">{namePart1}</span>
              <span className="text-gray-900">{namePart2}</span>
            </span>
          </Link>

          {/* Search bar — flex-1 takes all available space */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center min-w-0">

            {/* Category selector */}
            <div className="relative hidden md:flex items-center flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 pl-4 pr-8 border border-r-0 border-gray-300 rounded-l-xl bg-white text-sm text-gray-700 outline-none cursor-pointer appearance-none hover:bg-gray-50 transition-colors"
              >
                <option>All Categories</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <MdKeyboardArrowDown
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>

            {/* Text input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands and more..."
              className="flex-1 h-11 px-4 border border-gray-300 text-sm text-gray-700 placeholder-gray-400 outline-none bg-white min-w-0"
            />

            {/* Search button */}
            <button
              type="submit"
              className="h-11 w-12 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center rounded-r-xl transition-colors flex-shrink-0"
            >
              <MdSearch size={20} />
            </button>
          </form>

          {/* Right — Wishlist, Cart, Notifications, Account */}
          <div className="flex items-center gap-5 flex-shrink-0">

            {/* Wishlist */}
            <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 group">
              <div className="relative">
                {wishlistCount > 0
                  ? <MdFavorite size={24} className="text-primary-600" />
                  : <MdFavoriteBorder size={24} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                }
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-600 group-hover:text-primary-600 transition-colors leading-none">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex flex-col items-center gap-0.5 group">
              <div className="relative">
                <MdShoppingCart
                  size={24}
                  className={cartCount > 0 ? "text-primary-600" : "text-gray-600 group-hover:text-primary-600 transition-colors"}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-600 group-hover:text-primary-600 transition-colors leading-none">Cart</span>
            </Link>

            {/* ── Notification Bell (only when logged in) ───────────────── */}
            {customer && (
              <div className="relative flex flex-col items-center gap-0.5" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); setAccountDropdown(false); }}
                  className="relative flex flex-col items-center gap-0.5 group"
                  aria-label="Notifications"
                >
                  <div className="relative">
                    <MdNotifications
                      size={24}
                      className={unreadNotifs > 0 ? "text-primary-600" : "text-gray-600 group-hover:text-primary-600 transition-colors"}
                    />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none animate-pulse">
                        {unreadNotifs > 9 ? "9+" : unreadNotifs}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-600 group-hover:text-primary-600 transition-colors leading-none">Alerts</span>
                </button>

                {/* ── Notification Dropdown ──────────────────────────── */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <MdNotifications size={17} className="text-primary-600" />
                        <span className="text-sm font-bold text-gray-800">Notifications</span>
                        {unreadNotifs > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadNotifs}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotifs > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold"
                          >
                            <MdDoneAll size={13} /> Mark all read
                          </button>
                        )}
                        <button
                          onClick={loadNotifs}
                          className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          title="Refresh"
                        >
                          ↻
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2 text-gray-400">
                          <MdNotifications size={32} className="text-gray-200" />
                          <p className="text-sm font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => {
                          const nt = getNT(n.type);
                          return (
                            <button
                              key={n._id}
                              onClick={() => handleNotifClick(n)}
                              className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                !n.is_read ? "bg-primary-50/40" : ""
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${nt.bg}`}>
                                {nt.emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className={`text-xs font-semibold truncate ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}>
                                    {n.title ?? "Notification"}
                                  </p>
                                  {!n.is_read && <MdCircle size={6} className="text-primary-600 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-gray-300 mt-1">{formatDateTime(n.createdAt)}</p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <Link
                        to="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs font-semibold text-primary-600 hover:text-primary-800 py-1"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account */}
            {customer ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountDropdown((v) => !v)}
                  className="flex flex-col items-center gap-0.5 group"
                >
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {customer.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[11px] text-gray-600 group-hover:text-primary-600 transition-colors leading-none truncate max-w-[52px]">
                    {customer.name?.split(" ")[0]}
                  </span>
                </button>

                {accountDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 border-2 border-white/40 rounded-xl flex items-center justify-center text-white text-lg font-extrabold flex-shrink-0">
                          {customer.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-white truncate">{customer.name}</p>
                          <p className="text-xs text-white/70 truncate">{customer.email}</p>
                          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">🏆 Gold Member</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary links */}
                    <div className="py-1">
                      <Link to="/account" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                        <MdDashboard size={17} className="text-gray-400 group-hover:text-primary-600"/> My Account Dashboard
                      </Link>
                      <Link to="/my-profile" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                        <MdAccountCircle size={17} className="text-gray-400 group-hover:text-primary-600"/> My Profile
                      </Link>
                      <Link to="/my-orders" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                        <MdShoppingBag size={17} className="text-gray-400 group-hover:text-primary-600"/> My Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group">
                        <MdFavoriteBorder size={17} className="text-gray-400 group-hover:text-primary-600"/> My Wishlist
                      </Link>
                    </div>

                    {/* Secondary links */}
                    <div className="border-t border-gray-100 py-1">
                      <Link to="/my-addresses" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdLocationOn size={17} className="text-gray-400 group-hover:text-primary-600"/> My Addresses
                      </Link>
                      <Link to="/my-coupons" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdLocalOffer size={17} className="text-gray-400 group-hover:text-primary-600"/> My Coupons
                      </Link>
                      <Link to="/my-reviews" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdStar size={17} className="text-gray-400 group-hover:text-primary-600"/> My Reviews
                      </Link>
                      <Link to="/notifications" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdNotifications size={17} className="text-gray-400 group-hover:text-primary-600"/> Notifications
                        {unreadNotifs > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {unreadNotifs > 9 ? "9+" : unreadNotifs}
                          </span>
                        )}
                      </Link>
                      <Link to="/gift-cards" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdCardGiftcard size={17} className="text-gray-400 group-hover:text-primary-600"/> Gift Cards
                      </Link>
                      <Link to="/track-order" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdShoppingCart size={17} className="text-gray-400 group-hover:text-primary-600"/> Track Order
                      </Link>
                    </div>

                    {/* Settings & Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <Link to="/my-settings" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdSettings size={17} className="text-gray-400 group-hover:text-primary-600"/> Account Settings
                      </Link>
                      <Link to="/help-center" onClick={() => setAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group">
                        <MdSecurity size={17} className="text-gray-400 group-hover:text-primary-600"/> Help &amp; Support
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <MdLogout size={17}/> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex flex-col items-center gap-0.5 group">
                <MdPerson size={24} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                <span className="text-[11px] text-gray-600 group-hover:text-primary-600 transition-colors leading-none">Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 text-gray-600"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Category nav bar (Desktop) ── */}
      <div className="hidden md:block border-t border-gray-100 bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <nav className="flex items-center overflow-x-auto no-scrollbar">
            <Link
              to="/categories"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-800 hover:text-primary-600 whitespace-nowrap border-r border-gray-100 transition-colors flex-shrink-0"
            >
              <MdMenu size={18} />
              All Categories
            </Link>
            {categories.map((cat) => {
              const catPath =
                cat === "Fashion"        ? "/fashion"        :
                cat === "Electronics"    ? "/electronics"    :
                cat === "Mobiles"        ? "/mobiles"        :
                cat === "Home & Kitchen" ? "/home-kitchen"   :
                cat === "Appliances"     ? "/appliances"     :
                cat === "Beauty"         ? "/beauty"         :
                cat === "Sports"         ? "/sports"         :
                cat === "Books"          ? "/books"          :
                cat === "Toys"           ? "/toys"           :
                cat === "Grocery"        ? "/grocery"        :
                cat === "Automotive"     ? "/automotive"     :
                cat === "More"           ? "/more"           :
                `/products?category=${encodeURIComponent(cat)}`;
              const isActive =
                (cat === "Fashion"        && location.pathname === "/fashion") ||
                (cat === "Electronics"    && location.pathname.startsWith("/electronics")) ||
                (cat === "Mobiles"        && location.pathname.startsWith("/mobiles")) ||
                (cat === "Home & Kitchen" && location.pathname.startsWith("/home-kitchen")) ||
                (cat === "Appliances"     && location.pathname.startsWith("/appliances")) ||
                (cat === "Beauty"         && location.pathname.startsWith("/beauty")) ||
                (cat === "Sports"         && location.pathname.startsWith("/sports")) ||
                (cat === "Books"          && location.pathname.startsWith("/books")) ||
                (cat === "Toys"           && location.pathname.startsWith("/toys")) ||
                (cat === "Grocery"        && location.pathname.startsWith("/grocery")) ||
                (cat === "Automotive"     && location.pathname.startsWith("/automotive")) ||
                (cat === "More"           && location.pathname.startsWith("/more"));
              return (
                <Link
                  key={cat}
                  to={catPath}
                  className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-800 hover:text-primary-600"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex px-4 py-3 border-b border-gray-100">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 h-10 px-3 border border-gray-300 rounded-l-lg text-sm outline-none"
            />
            <button type="submit"
              className="h-10 w-11 bg-primary-600 text-white flex items-center justify-center rounded-r-lg">
              <MdSearch size={18} />
            </button>
          </form>

          {/* Mobile category links */}
          <nav className="px-4 py-2">
            {categories.map((cat) => {
              const catPath =
                cat === "Fashion"        ? "/fashion"        :
                cat === "Electronics"    ? "/electronics"    :
                cat === "Mobiles"        ? "/mobiles"        :
                cat === "Home & Kitchen" ? "/home-kitchen"   :
                cat === "Appliances"     ? "/appliances"     :
                cat === "Beauty"         ? "/beauty"         :
                cat === "Sports"         ? "/sports"         :
                cat === "Books"          ? "/books"          :
                cat === "Toys"           ? "/toys"           :
                cat === "Grocery"        ? "/grocery"        :
                cat === "Automotive"     ? "/automotive"     :
                cat === "More"           ? "/more"           :
                `/products?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  to={catPath}
                  className="block px-2 py-2.5 text-sm font-semibold text-gray-800 hover:text-primary-600 border-b border-gray-50 last:border-0 transition-colors"
                >
                  {cat}
                </Link>
              );
            })}
          </nav>

          {/* Mobile account actions */}
          <div className="border-t border-gray-100 px-4 py-3">
            {customer ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-1 py-2 mb-2">
                  <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                    {customer.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                  </div>
                </div>
                {[
                  { to:"/account",      label:"My Account"      },
                  { to:"/my-orders",    label:"My Orders"       },
                  { to:"/my-addresses", label:"My Addresses"    },
                  { to:"/my-coupons",   label:"My Coupons"      },
                  { to:"/notifications",label:"Notifications"   },
                  { to:"/my-settings",  label:"Account Settings"},
                  { to:"/help-center",  label:"Help & Support"  },
                ].map((l) => (
                  <Link key={l.to} to={l.to}
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                    {l.label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                  <MdLogout size={16}/> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
