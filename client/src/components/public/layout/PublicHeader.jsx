import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MdSearch, MdShoppingCart, MdFavoriteBorder, MdFavorite,
  MdPerson, MdKeyboardArrowDown, MdMenu, MdClose,
  MdLogout, MdShoppingBag, MdAccountCircle,
} from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { customerLogout } from "../../../features/public/customerAuthSlice";

const categories = [
  "Fashion", "Electronics", "Mobiles", "Home & Kitchen",
  "Appliances", "Beauty", "Sports", "Books",
  "Toys", "Grocery", "Automotive", "More",
];

const PublicHeader = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [accountDropdown,  setAccountDropdown]  = useState(false);

  const accountRef = useRef(null);

  const cartCount     = useSelector((s) => s.publicCart?.count     ?? 0);
  const wishlistCount = useSelector((s) => s.publicWishlist?.count ?? 0);
  const customer      = useSelector((s) => s.customerAuth?.user    ?? null);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target))
        setAccountDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(customerLogout());
    setAccountDropdown(false);
    navigate("/login");
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
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <FaShoppingBag size={17} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-600">Shop</span>
              <span className="text-gray-900">Ease</span>
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

          {/* Right — Wishlist, Cart, Account */}
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
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setAccountDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdAccountCircle size={16} className="text-gray-400" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setAccountDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdShoppingBag size={16} className="text-gray-400" /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setAccountDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <MdFavoriteBorder size={16} className="text-gray-400" /> My Wishlist
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <MdLogout size={16} /> Logout
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
          <nav className="flex items-center overflow-x-auto">
            <Link
              to="/products"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 whitespace-nowrap border-r border-gray-100 transition-colors flex-shrink-0"
            >
              <MdMenu size={18} />
              All Categories
            </Link>
            {categories.map((cat) => {
              const catPath =
                cat === "Fashion"     ? "/fashion"     :
                cat === "Electronics" ? "/electronics" :
                `/products?category=${encodeURIComponent(cat)}`;
              const isActive =
                (cat === "Fashion"     && location.pathname === "/fashion") ||
                (cat === "Electronics" && location.pathname.startsWith("/electronics"));
              return (
                <Link
                  key={cat}
                  to={catPath}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive ? "text-primary-600 font-semibold" : "text-gray-600 hover:text-primary-600"
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
                cat === "Fashion"     ? "/fashion"     :
                cat === "Electronics" ? "/electronics" :
                `/products?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  to={catPath}
                  className="block px-2 py-2.5 text-sm text-gray-700 hover:text-primary-600 border-b border-gray-50 last:border-0 transition-colors"
                >
                  {cat}
                </Link>
              );
            })}
          </nav>

          {/* Mobile account actions */}
          <div className="border-t border-gray-100 px-4 py-3 flex gap-3">
            {customer ? (
              <button onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                <MdLogout size={16} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
