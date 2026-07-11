import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdFilterList, MdClose, MdStar, MdFavoriteBorder,
  MdFavorite, MdShoppingCart, MdArrowForward,
  MdGridView, MdViewList, MdExpandMore, MdLocalOffer,
  MdSearch, MdTune,
} from "react-icons/md";
import { fetchPublicProducts, fetchPublicCategories } from "../../features/public/publicProductSlice";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { getImgUrl } from "../../utils/Methods";

// ─── Smart Image ──────────────────────────────────────────────────────────────
const ProductImg = ({ src, alt, className = "w-full h-full object-contain" }) => {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <span className="text-5xl select-none">🛒</span>;
  return (
    <img
      src={getImgUrl(src)}
      alt={alt || "product"}
      className={className}
      onError={() => setBroken(true)}
    />
  );
};

// ─── Badge color helper ───────────────────────────────────────────────────────
const badgeStyle = (p) => {
  if (p.is_bestseller) return "bg-amber-500 text-white";
  if (p.is_new_arrival) return "bg-emerald-500 text-white";
  if ((p.discount_percent ?? 0) >= 40) return "bg-rose-500 text-white";
  return "";
};
const badgeLabel = (p) => {
  if (p.is_bestseller) return "Best Seller";
  if (p.is_new_arrival) return "New";
  if ((p.discount_percent ?? 0) >= 40) return `${p.discount_percent}% OFF`;
  return "";
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, view }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === product._id);

  const price = product.price ?? 0;
  const mrp   = product.mrp ?? price;
  const disc  = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : (product.discount_percent ?? 0);
  const badge = badgeLabel(product);
  const bStyle = badgeStyle(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({
      product: {
        _id: product._id,
        name: product.name,
        price,
        mrp,
        img: product.thumbnail || "",
        brand: product.brand_id?.name ?? "",
      },
      qty: 1,
    }));
    toast.success("Added to cart!");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({
      _id: product._id,
      name: product.name,
      price,
      mrp,
      img: product.thumbnail || "",
      brand: product.brand_id?.name ?? "",
    }));
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!");
  };

  if (view === "list") {
    return (
      <Link
        to={`/product/${product.slug || product._id}`}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow group"
      >
        <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <ProductImg src={product.thumbnail} alt={product.name} />
          {badge && bStyle && (
            <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${bStyle}`}>{badge}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">{product.brand_id?.name}</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2">{product.name}</h3>
          {product.rating_avg > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                {product.rating_avg?.toFixed(1)} <MdStar size={11} />
              </div>
              <span className="text-xs text-gray-400">({product.rating_count?.toLocaleString()})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString()}</span>
            {mrp > price && <span className="text-sm text-gray-400 line-through">₹{mrp.toLocaleString()}</span>}
            {disc > 0 && <span className="text-xs text-green-600 font-bold">{disc}% off</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={handleWishlist} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors">
            {isWished ? <MdFavorite size={18} className="text-rose-500" /> : <MdFavoriteBorder size={18} className="text-gray-400" />}
          </button>
          <button onClick={handleAddToCart} className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            <MdShoppingCart size={14} /> Add
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="relative bg-gray-50 h-44 flex items-center justify-center overflow-hidden">
        <ProductImg src={product.thumbnail} alt={product.name} />
        {badge && bStyle && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg ${bStyle}`}>{badge}</span>
        )}
        {disc > 0 && (
          <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{disc}% off</span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isWished ? <MdFavorite size={16} className="text-rose-500" /> : <MdFavoriteBorder size={16} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 font-medium">{product.brand_id?.name}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1">{product.name}</p>
        {product.rating_avg > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
              {product.rating_avg?.toFixed(1)} <MdStar size={10} />
            </div>
            <span className="text-[11px] text-gray-400">({product.rating_count?.toLocaleString()})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">₹{price.toLocaleString()}</span>
          {mrp > price && <span className="text-xs text-gray-400 line-through">₹{mrp.toLocaleString()}</span>}
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
        >
          <MdShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  </div>
);

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
const FilterSidebar = ({ filters, setFilters, brands, maxPrice, onClose }) => {
  const [openSections, setOpenSections] = useState({ price: true, brands: true, rating: true });
  const toggle = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const Section = ({ title, id, children }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <MdExpandMore size={18} className={`text-gray-400 transition-transform ${openSections[id] ? "rotate-180" : ""}`} />
      </button>
      {openSections[id] && children}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><MdFilterList size={18} /> Filters</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters({ brands: [], min_price: "", max_price: "", rating: "" })}
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            Clear All
          </button>
          {onClose && <button onClick={onClose}><MdClose size={18} className="text-gray-400" /></button>}
        </div>
      </div>

      {/* Price Range */}
      <Section title="Price Range" id="price">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.min_price}
              onChange={(e) => setFilters((f) => ({ ...f, min_price: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.max_price}
              onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-500"
            />
          </div>
          <input
            type="range" min={0} max={maxPrice || 200000} step={500}
            value={filters.max_price || maxPrice || 200000}
            onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
            className="w-full accent-primary-600"
          />
          <p className="text-xs text-right text-primary-600 font-bold">
            Up to ₹{(filters.max_price || maxPrice || 200000).toLocaleString()}
          </p>
        </div>
      </Section>

      {/* Brands */}
      {brands.length > 0 && (
        <Section title="Brand" id="brands">
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {brands.map((b) => (
              <label key={b._id || b} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(b._id || b)}
                  onChange={() => {
                    const id = b._id || b;
                    setFilters((f) => ({
                      ...f,
                      brands: f.brands.includes(id) ? f.brands.filter((x) => x !== id) : [...f.brands, id],
                    }));
                  }}
                  className="w-3.5 h-3.5 accent-primary-600 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">{b.name || b}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Rating */}
      <Section title="Customer Rating" id="rating">
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer mb-2 group">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === String(r)}
              onChange={() => setFilters((f) => ({ ...f, rating: f.rating === String(r) ? "" : String(r) }))}
              className="w-3.5 h-3.5 accent-primary-600 cursor-pointer"
            />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <MdStar key={i} size={13} className={i < r ? "text-amber-400" : "text-gray-200"} />
              ))}
              <span className="text-xs text-gray-500 ml-1">& above</span>
            </div>
          </label>
        ))}
      </Section>
    </div>
  );
};

// ─── Main CategoryPage Component ──────────────────────────────────────────────
/**
 * Props:
 *  - categoryName: string  — e.g. "Fashion", "Electronics"
 *  - categorySlug: string  — e.g. "fashion" (matches DB category slug)
 *  - heroConfig: object    — { bg, accentColor, icons, tagline, offerCode, offerText }
 *  - subcategories: array  — [{ icon, label, tag }]
 *  - tabs: array           — [{ key, label }]
 *  - tabTagMap: object     — { tabKey: "db_tag_or_search_term" }
 */
const CategoryPage = ({
  categoryName = "Products",
  categorySlug = "",
  heroConfig = {},
  subcategories = [],
  tabs = [],
  tabTagMap = {},
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, total, totalPages, status, categories } = useSelector((s) => s.publicProduct);

  const [view,         setView]         = useState("grid");
  const [sort,         setSort]         = useState("createdAt");
  const [sortOrder,    setSortOrder]    = useState("desc");
  const [activeTab,    setActiveTab]    = useState("all");
  const [mobileFilter, setMobileFilter] = useState(false);
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [page,         setPage]         = useState(1);
  const [categoryId,   setCategoryId]   = useState(null);
  const [brandsList,   setBrandsList]   = useState([]);
  const [filters, setFilters] = useState({ brands: [], min_price: "", max_price: "", rating: "" });

  const PER_PAGE = 20;

  // Find category _id from categories list
  useEffect(() => {
    if (!categories.length) dispatch(fetchPublicCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories.length && categorySlug) {
      const cat = categories.find(
        (c) => c.slug === categorySlug || c.name?.toLowerCase() === categorySlug.toLowerCase()
      );
      if (cat) {
        setCategoryId(cat._id);
        // Collect brands from subcategory/products if available
        if (cat.brands) setBrandsList(cat.brands);
      }
    }
  }, [categories, categorySlug]);

  // Build params and fetch products
  const fetchProducts = useCallback(() => {
    const params = { page, per_page: PER_PAGE };
    if (categoryId) params.category_id = categoryId;
    if (search)     params.search = search;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.rating)    params.rating    = filters.rating;
    if (filters.brands.length === 1) params.brand_id = filters.brands[0];

    // Map tab to sort or search
    if (activeTab !== "all" && tabTagMap[activeTab]) {
      params.search = tabTagMap[activeTab];
    }

    // Sort
    const sortMap = {
      createdAt:  { sort: "createdAt",    order: "desc" },
      price_asc:  { sort: "price",        order: "asc"  },
      price_dsc:  { sort: "price",        order: "desc" },
      rating:     { sort: "rating_avg",   order: "desc" },
      discount:   { sort: "discount_percent", order: "desc" },
      popular:    { sort: "rating_count", order: "desc" },
    };
    const s = sortMap[sort] || sortMap.createdAt;
    params.sort  = s.sort;
    params.order = s.order;

    dispatch(fetchPublicProducts(params));
  }, [dispatch, categoryId, search, filters, activeTab, sort, page, tabTagMap]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const {
    bg = "from-gray-900 to-gray-700",
    accentColor = "text-primary-400",
    accentBtnColor = "bg-primary-600 hover:bg-primary-700",
    icons = ["🛒"],
    tagline = `Discover amazing ${categoryName} products`,
    offerCode = "",
    offerText = "",
  } = heroConfig;

  const allTabs = [{ key: "all", label: `All ${categoryName}` }, ...tabs];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Banner ── */}
      <div className={`bg-gradient-to-r ${bg} text-white`}>
        <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              {categoryName} <span className={accentColor}>Store</span>
            </h1>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-5">{tagline}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/products?category=${categorySlug}`}
                className={`inline-flex items-center gap-2 ${accentBtnColor} text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg`}
              >
                Shop Now <MdArrowForward size={16} />
              </Link>
              {offerCode && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-3 rounded-xl border border-white/20">
                  <MdLocalOffer size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold">
                    Use <span className="text-yellow-400">{offerCode}</span>
                    {offerText && ` → ${offerText}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-end gap-4 text-8xl select-none">
            {icons.map((ic, i) => (
              <span key={i} className={i === 1 ? "text-9xl" : "opacity-90"}>{ic}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="max-w-[1280px] mx-auto px-4 pt-5 pb-2">
        <div className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={`Search in ${categoryName}…`}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Subcategory Tiles ── */}
      {subcategories.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Shop by Category</h2>
          <div className="flex gap-2 flex-wrap">
            {subcategories.map((s) => (
              <button
                key={s.label}
                onClick={() => handleTabChange(s.tab || "all")}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  activeTab === (s.tab || "all")
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary-300"
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-10 flex gap-6">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            setFilters={handleFilterChange}
            brands={brandsList}
            maxPrice={200000}
          />
        </aside>

        {/* Products Column */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 mb-4 shadow-sm">
            {/* Tabs */}
            <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
              {allTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === t.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile filter */}
              <button
                onClick={() => setMobileFilter(true)}
                className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <MdTune size={15} /> Filter
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 outline-none bg-white cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="createdAt">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_dsc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Discount</option>
                </select>
                <MdExpandMore size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")}
                  className={`p-1.5 ${view === "grid" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                  <MdGridView size={16} />
                </button>
                <button onClick={() => setView("list")}
                  className={`p-1.5 ${view === "list" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                  <MdViewList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-500 mb-3">
            {status === "loading" ? (
              "Loading products…"
            ) : (
              <>Showing <span className="font-semibold text-gray-800">{products.length}</span> of <span className="font-semibold">{total}</span> products</>
            )}
            {search && <> for "<span className="font-semibold text-primary-600">{search}</span>"</>}
          </p>

          {/* Loading skeletons */}
          {status === "loading" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {status !== "loading" && products.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <span className="text-6xl">{icons[0]}</span>
              <p className="text-gray-500 mt-4 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting filters or search terms</p>
              <button
                onClick={() => {
                  setSearch(""); setSearchInput(""); setActiveTab("all");
                  handleFilterChange({ brands: [], min_price: "", max_price: "", rating: "" });
                }}
                className="mt-3 text-sm text-primary-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Product grid/list */}
          {status !== "loading" && products.length > 0 && (
            <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
              {products.map((p) => <ProductCard key={p._id} product={p} view={view} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && status !== "loading" && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
            <FilterSidebar
              filters={filters}
              setFilters={handleFilterChange}
              brands={brandsList}
              maxPrice={200000}
              onClose={() => setMobileFilter(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
