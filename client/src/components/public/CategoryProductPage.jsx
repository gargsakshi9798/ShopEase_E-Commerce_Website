/**
 * CategoryProductPage — shared dynamic category listing page.
 *
 * Usage:
 *   <CategoryProductPage
 *     categorySlug="mobiles"          // used for API filtering
 *     pageTitle="Mobiles"             // header h1
 *     heroBg="bg-[#0a0f1e]"          // hero section background class
 *     heroAccent="text-cyan-400"      // accent colour class for tagline
 *     heroTagline="Smartphone Deals"  // small label above h1
 *     heroHighlight="text-cyan-400"   // colour for highlighted word in h1
 *     heroHeadline={<>Shop the Best <span className="text-cyan-400">Phones</span></>}
 *     heroDesc="Latest flagships at unbeatable prices."
 *     heroEmojis={["📱","📱","📱"]}   // decorative right-side emojis
 *     accentBtnColor="bg-cyan-500 hover:bg-cyan-600"
 *     dealStripColor="from-cyan-50 to-blue-50 border-cyan-100"
 *     dealStripPriceColor="text-cyan-600"
 *     dealItems={[{ label:"Phones from", price:"₹9,999" }]}
 *   />
 */

import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdFilterList, MdClose, MdStar, MdFavoriteBorder, MdFavorite,
  MdShoppingCart, MdArrowForward, MdGridView, MdViewList,
  MdExpandMore, MdLocalOffer, MdSearch, MdRefresh,
} from "react-icons/md";
import { fetchPublicProducts } from "../../features/public/publicProductSlice";
import { addToCart }      from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { getImgUrl }      from "../../utils/Methods";

// ─── helpers ─────────────────────────────────────────────────────────────────
const disc = (price, mrp) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

const SORT_OPTIONS = [
  { value: "createdAt|desc", label: "Newest First" },
  { value: "rating_avg|desc", label: "Customer Rating" },
  { value: "price|asc",  label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "discount_percent|desc", label: "Discount" },
  { value: "total_sold|desc", label: "Popularity" },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, view, categorySlug }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === product._id);
  const pct      = disc(product.price, product.mrp);

  const handleCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, qty: 1 }));
    toast.success("Added to cart!");
  };
  const handleWish = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!");
  };

  const detailPath = `/products/${product.slug}`;

  if (view === "list") {
    return (
      <Link to={detailPath}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow group">
        <div className="w-28 h-28 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 relative">
          {product.thumbnail
            ? <img src={getImgUrl(product.thumbnail)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <span className="text-5xl">🛍️</span>}
          {product.is_bestseller && (
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-orange-100 text-orange-700">Best Seller</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {product.brand_id?.name && <p className="text-xs text-gray-400 font-medium">{product.brand_id.name}</p>}
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2">{product.name}</h3>
          {product.rating_avg > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                {product.rating_avg.toFixed(1)} <MdStar size={11} />
              </div>
              {product.rating_count > 0 && <span className="text-xs text-gray-400">({product.rating_count.toLocaleString()})</span>}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && <span className="text-sm text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>}
            {pct > 0 && <span className="text-xs text-green-600 font-bold">{pct}% off</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={handleWish} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-rose-400 transition-colors">
            {isWished ? <MdFavorite size={18} className="text-rose-500" /> : <MdFavoriteBorder size={18} className="text-gray-400" />}
          </button>
          <button onClick={handleCart} className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            <MdShoppingCart size={14} /> Add
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={detailPath}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative bg-gray-50 h-44 flex items-center justify-center overflow-hidden">
        {product.thumbnail
          ? <img src={getImgUrl(product.thumbnail)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-7xl">🛍️</span>}
        {product.is_bestseller && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700">Best Seller</span>
        )}
        {product.is_new_arrival && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700">New</span>
        )}
        {pct > 0 && (
          <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{pct}% off</span>
        )}
        <button onClick={handleWish}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isWished ? <MdFavorite size={16} className="text-rose-500" /> : <MdFavoriteBorder size={16} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand_id?.name && <p className="text-[11px] text-gray-400 font-medium">{product.brand_id.name}</p>}
        <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1">{product.name}</p>
        {product.rating_avg > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
              {product.rating_avg.toFixed(1)} <MdStar size={10} />
            </div>
            {product.rating_count > 0 && <span className="text-[11px] text-gray-400">({product.rating_count.toLocaleString()})</span>}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>}
        </div>
        <button onClick={handleCart} className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
          <MdShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
const FilterSidebar = ({ filters, setFilters, maxPrice, onClose }) => {
  const [open, setOpen] = useState({ price: true, rating: true, flags: true });
  const toggle = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  const Section = ({ id, title, children }) => (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <MdExpandMore size={18} className={`text-gray-400 transition-transform ${open[id] ? "rotate-180" : ""}`} />
      </button>
      {open[id] && children}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><MdFilterList size={18} />Filters</h3>
        <div className="flex gap-2">
          <button onClick={() => setFilters({ min_price: 0, max_price: maxPrice, rating: 0, flags: [] })}
            className="text-xs text-primary-600 font-semibold hover:underline">Clear All</button>
          {onClose && <button onClick={onClose}><MdClose size={18} className="text-gray-400" /></button>}
        </div>
      </div>

      <Section id="price" title="Price Range">
        <div className="px-1">
          <input type="range" min={0} max={maxPrice} step={500} value={filters.max_price}
            onChange={(e) => setFilters((f) => ({ ...f, max_price: Number(e.target.value) }))}
            className="w-full accent-primary-600" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">₹0</span>
            <span className="text-xs text-primary-600 font-bold">₹{filters.max_price.toLocaleString()}</span>
          </div>
        </div>
      </Section>

      <Section id="rating" title="Customer Rating">
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer mb-2 group">
            <input type="radio" name="rating" checked={filters.rating === r}
              onChange={() => setFilters((f) => ({ ...f, rating: f.rating === r ? 0 : r }))}
              className="w-3.5 h-3.5 accent-primary-600 cursor-pointer" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <MdStar key={i} size={13} className={i < r ? "text-amber-400" : "text-gray-200"} />
              ))}
              <span className="text-xs text-gray-500 ml-1">& above</span>
            </div>
          </label>
        ))}
      </Section>

      <Section id="flags" title="Availability">
        {[
          { key: "is_featured",    label: "Featured" },
          { key: "is_bestseller",  label: "Best Seller" },
          { key: "is_new_arrival", label: "New Arrival" },
          { key: "is_on_sale",     label: "On Sale" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox"
              checked={filters.flags.includes(key)}
              onChange={() => setFilters((f) => ({
                ...f,
                flags: f.flags.includes(key) ? f.flags.filter((x) => x !== key) : [...f.flags, key],
              }))}
              className="w-3.5 h-3.5 accent-primary-600 rounded cursor-pointer" />
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </Section>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CategoryProductPage = ({
  categorySlug,
  pageTitle,
  heroBg        = "bg-gradient-to-r from-gray-900 to-gray-800",
  heroAccent    = "text-primary-400",
  heroTagline   = "Top Deals",
  heroHeadline,
  heroDesc      = "Shop the best products at unbeatable prices.",
  heroEmojis    = ["🛍️"],
  accentBtnColor = "bg-primary-600 hover:bg-primary-700",
  dealStripColor = "from-primary-50 to-indigo-50 border-primary-100",
  dealStripPriceColor = "text-primary-600",
  dealItems     = [],
}) => {
  const dispatch   = useDispatch();
  const [searchParams] = useSearchParams();

  const { products, total, totalPages, currentPage, status } = useSelector((s) => s.publicProduct);
  const loading = status === "loading";

  const DEFAULT_MAX = 500000;
  const [view,         setView]         = useState("grid");
  const [sort,         setSort]         = useState("createdAt|desc");
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState(searchParams.get("q") || "");
  const [mobileFilter, setMobileFilter] = useState(false);
  const [filters, setFilters] = useState({
    min_price: 0,
    max_price: DEFAULT_MAX,
    rating: 0,
    flags: [],
  });

  const load = useCallback(() => {
    const [sortField, sortOrder] = sort.split("|");
    const params = {
      category_slug: categorySlug,
      sort: sortField,
      order: sortOrder,
      page,
      per_page: 24,
    };
    if (search)            params.search    = search;
    if (filters.max_price < DEFAULT_MAX) params.max_price = filters.max_price;
    if (filters.min_price > 0)           params.min_price = filters.min_price;
    if (filters.rating > 0)              params.rating    = filters.rating;
    filters.flags.forEach((f) => { params[f] = "true"; });
    dispatch(fetchPublicProducts(params));
  }, [dispatch, categorySlug, sort, page, search, filters]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters/sort/search change
  useEffect(() => { setPage(1); }, [sort, filters, search, categorySlug]);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className={`${heroBg} text-white`}>
        <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className={`${heroAccent} font-bold text-sm tracking-wide uppercase`}>{heroTagline}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-2 mb-3">
              {heroHeadline || <>{pageTitle}</>}
            </h1>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-5">{heroDesc}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={`/products?q=${encodeURIComponent(pageTitle)}`}
                className={`inline-flex items-center gap-2 ${accentBtnColor} text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg`}>
                Shop Now <MdArrowForward size={16} />
              </Link>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-3 rounded-xl border border-white/20">
                <MdLocalOffer size={16} className="text-yellow-400" />
                <span className="text-sm font-bold text-white">Up to <span className="text-yellow-400">60% OFF</span> today</span>
              </div>
            </div>
          </div>
          {heroEmojis.length > 0 && (
            <div className="hidden md:flex items-end gap-4 select-none">
              {heroEmojis.map((e, i) => (
                <span key={i} className={i === 1 ? "text-9xl" : "text-8xl opacity-90"}>{e}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Deal Strip ── */}
      {dealItems.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className={`bg-gradient-to-r ${dealStripColor} border rounded-2xl p-4 flex flex-wrap items-center gap-4`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Today's Best Deals</p>
                <p className="text-xs text-gray-500">Limited time offers</p>
              </div>
            </div>
            {dealItems.map((d) => (
              <div key={d.label} className="bg-white rounded-xl px-3 py-2 border border-white shadow-sm text-center">
                <p className="text-[10px] text-gray-500">{d.label}</p>
                <p className={`text-sm font-bold ${dealStripPriceColor}`}>{d.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className="max-w-[1280px] mx-auto px-4 pb-10 flex gap-6">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <FilterSidebar filters={filters} setFilters={setFilters} maxPrice={DEFAULT_MAX} />
        </aside>

        {/* Products column */}
        <div className="flex-1 min-w-0 pt-4">

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 mb-4 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${pageTitle}...`}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 bg-white" />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile filter */}
              <button onClick={() => setMobileFilter(true)}
                className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                <MdFilterList size={15} /> Filter
              </button>
              {/* Sort */}
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 outline-none bg-white cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <MdExpandMore size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                  <MdGridView size={16} />
                </button>
                <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}>
                  <MdViewList size={16} />
                </button>
              </div>
              {/* Refresh */}
              <button onClick={load} className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">
                <MdRefresh size={16} />
              </button>
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-gray-500 mb-3">
            Showing <span className="font-semibold text-gray-800">{products.length}</span> of <span className="font-semibold text-gray-800">{total}</span> products
          </p>

          {/* Products */}
          {loading ? (
            <div className={view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <span className="text-6xl">🔍</span>
              <p className="text-gray-600 mt-4 font-semibold text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try changing your filters or search term</p>
              <button onClick={() => { setSearch(""); setFilters({ min_price:0, max_price:DEFAULT_MAX, rating:0, flags:[] }); }}
                className="mt-4 text-sm text-primary-600 font-semibold hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className={view === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"}>
              {products.map((p) => <ProductCard key={p._id} product={p} view={view} categorySlug={categorySlug} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? "bg-primary-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-xl">
            <FilterSidebar filters={filters} setFilters={setFilters} maxPrice={DEFAULT_MAX} onClose={() => setMobileFilter(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProductPage;
