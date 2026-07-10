import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MdSearch, MdFilterList, MdClose, MdStar,
  MdShoppingCart, MdFavoriteBorder, MdFavorite,
  MdChevronLeft, MdChevronRight, MdGridView, MdViewList,
} from "react-icons/md";
import toast from "react-hot-toast";
import { fetchPublicProducts, fetchPublicCategories } from "../../features/public/publicProductSlice";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, view = "grid" }) => {
  const dispatch  = useDispatch();
  const wishlist  = useSelector((s) => s.publicWishlist.items);
  const isWished  = wishlist.some((w) => w._id === product._id);

  const disc = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : product.discount_percent ?? 0;

  const handleCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product: { _id: product._id, name: product.name, price: product.price, mrp: product.mrp, img: product.thumbnail ?? "🛒", brand: product.brand_id?.name ?? "" }, qty: 1 }));
    toast.success("Added to cart!");
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({ _id: product._id, name: product.name, price: product.price, mrp: product.mrp, img: product.thumbnail ?? "🛒", brand: product.brand_id?.name ?? "" }));
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!");
  };

  if (view === "list") {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4 p-4 group"
      >
        <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {product.thumbnail
            ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
            : <span className="text-5xl">🛒</span>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-xs text-gray-400">{product.brand_id?.name}</p>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-primary-600 transition-colors">{product.name}</p>
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                {product.rating_avg?.toFixed(1)} <MdStar size={10} />
              </span>
              <span className="text-xs text-gray-400">({product.rating_count})</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
            )}
            {disc > 0 && <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{disc}% off</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={handleWishlist}
            className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:border-rose-300 hover:bg-rose-50 transition-colors">
            {isWished ? <MdFavorite size={17} className="text-rose-500" /> : <MdFavoriteBorder size={17} className="text-gray-400" />}
          </button>
          <button onClick={handleCart}
            className="w-9 h-9 bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center transition-colors">
            <MdShoppingCart size={17} className="text-white" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
    >
      <div className="relative h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.thumbnail
          ? <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-2" />
          : <span className="text-6xl">🛒</span>}
        {disc > 0 && (
          <span className="absolute top-2 left-2 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{disc}% off</span>
        )}
        <button onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isWished ? <MdFavorite size={16} className="text-rose-500" /> : <MdFavoriteBorder size={16} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400">{product.brand_id?.name}</p>
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1 mt-0.5 group-hover:text-primary-600 transition-colors">{product.name}</p>
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {product.rating_avg?.toFixed(1)} <MdStar size={9} />
            </span>
            <span className="text-[10px] text-gray-400">({product.rating_count})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>
        <button onClick={handleCart}
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
          <MdShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

// ─── Main Products Page ───────────────────────────────────────────────────────
const Products = () => {
  const dispatch    = useDispatch();
  const [params, setParams] = useSearchParams();

  const { products, total, totalPages, currentPage, categories, status } =
    useSelector((s) => s.publicProduct);

  const [view,         setView]         = useState("grid");
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [search,       setSearch]       = useState(params.get("q") ?? "");
  const [sortBy,       setSortBy]       = useState(params.get("sort") ?? "");
  const [selectedCat,  setSelectedCat]  = useState(params.get("category") ?? "");
  const [minPrice,     setMinPrice]     = useState(params.get("min_price") ?? "");
  const [maxPrice,     setMaxPrice]     = useState(params.get("max_price") ?? "");
  const [page,         setPage]         = useState(Number(params.get("page")) || 1);

  const buildQuery = useCallback(() => ({
    ...(search     ? { q: search }              : {}),
    ...(selectedCat? { category: selectedCat }  : {}),
    ...(sortBy     ? { sort: sortBy }            : {}),
    ...(minPrice   ? { min_price: minPrice }     : {}),
    ...(maxPrice   ? { max_price: maxPrice }     : {}),
    page,
    per_page: 20,
  }), [search, selectedCat, sortBy, minPrice, maxPrice, page]);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  useEffect(() => {
    const q = buildQuery();
    dispatch(fetchPublicProducts(q));
    // sync URL params
    const sp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => sp.set(k, v));
    setParams(sp, { replace: true });
  }, [dispatch, buildQuery, setParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(""); setSelectedCat(""); setSortBy(""); setMinPrice(""); setMaxPrice(""); setPage(1);
  };

  const sortOptions = [
    { value: "",            label: "Relevance" },
    { value: "price_asc",  label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating",     label: "Top Rated" },
    { value: "newest",     label: "Newest First" },
    { value: "bestseller", label: "Best Seller" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 py-6">

        {/* ── Top bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Products</h1>
            {status === "succeeded" && (
              <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} results found</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-9 pl-3 pr-1 border border-gray-200 rounded-l-xl text-sm outline-none focus:border-primary-500 w-48"
              />
              <button type="submit" className="h-9 w-9 bg-primary-600 text-white rounded-r-xl flex items-center justify-center hover:bg-primary-700 transition-colors">
                <MdSearch size={17} />
              </button>
            </form>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="h-9 px-3 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-primary-500"
            >
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")} className={`px-3 py-2 transition-colors ${view === "grid" ? "bg-primary-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                <MdGridView size={16} />
              </button>
              <button onClick={() => setView("list")} className={`px-3 py-2 transition-colors ${view === "list" ? "bg-primary-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                <MdViewList size={16} />
              </button>
            </div>

            {/* Filter toggle (mobile) */}
            <button onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <MdFilterList size={17} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">

          {/* ── Sidebar Filters (desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-primary-600 hover:underline">Clear All</button>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="cat" value="" checked={selectedCat === ""} onChange={() => { setSelectedCat(""); setPage(1); }} className="accent-primary-600" />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
                    {categories.slice(0, 8).map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="cat" value={cat._id} checked={selectedCat === cat._id} onChange={() => { setSelectedCat(cat._id); setPage(1); }} className="accent-primary-600" />
                        <span className="text-sm text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price range */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Min" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={() => setPage(1)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary-500"
                  />
                  <input
                    type="number" placeholder="Max" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={() => setPage(1)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Mobile Filter Drawer ── */}
          {filterOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/40" onClick={() => setFilterOpen(false)} />
              <div className="w-72 bg-white h-full overflow-y-auto p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filters</h3>
                  <button onClick={() => setFilterOpen(false)}><MdClose size={22} className="text-gray-500" /></button>
                </div>
                <button onClick={() => { resetFilters(); setFilterOpen(false); }} className="text-xs text-primary-600 hover:underline mb-4 block">Clear All</button>

                {categories.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Category</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="mcat" value="" checked={selectedCat === ""} onChange={() => setSelectedCat("")} className="accent-primary-600" />
                        <span className="text-sm">All</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="mcat" value={cat._id} checked={selectedCat === cat._id} onChange={() => setSelectedCat(cat._id)} className="accent-primary-600" />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Price Range</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" />
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" />
                  </div>
                </div>

                <button onClick={() => { setPage(1); setFilterOpen(false); }}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* ── Products Grid / List ── */}
          <div className="flex-1 min-w-0">
            {status === "loading" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            )}

            {status === "succeeded" && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-6xl">🔍</span>
                <h3 className="text-lg font-bold text-gray-700">No products found</h3>
                <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
                <button onClick={resetFilters} className="text-sm text-primary-600 font-semibold hover:underline">Clear Filters</button>
              </div>
            )}

            {status === "succeeded" && products.length > 0 && (
              <>
                <div className={
                  view === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-3"
                }>
                  {products.map((p) => <ProductCard key={p._id} product={p} view={view} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <MdChevronLeft size={20} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                            p === page ? "bg-primary-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}>
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      <MdChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
