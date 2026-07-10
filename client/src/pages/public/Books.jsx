import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  MdFilterList, MdClose, MdStar, MdFavoriteBorder, MdFavorite,
  MdShoppingCart, MdArrowForward, MdGridView, MdViewList,
  MdExpandMore, MdLocalOffer,
} from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { addToCart } from "../../features/public/publicCartSlice";
import { toggleWishlist } from "../../features/public/publicWishlistSlice";
import { booksProducts, discount, badgeColor } from "../../data/booksData";

const subcategories = [
  { icon: "📗", label: "Self Help",   tab: "self_help",  count: 840  },
  { icon: "💰", label: "Finance",     tab: "finance",    count: 520  },
  { icon: "📕", label: "Fiction",     tab: "fiction",    count: 1240 },
  { icon: "💼", label: "Business",    tab: "business",   count: 680  },
  { icon: "📖", label: "Academic",    tab: "academic",   count: 920  },
  { icon: "📘", label: "Non-Fiction", tab: "non_fiction",count: 430  },
  { icon: "📔", label: "Biography",   tab: "biography",  count: 310  },
  { icon: "🧒", label: "Children",    tab: "fiction",    count: 560  },
];

const brands = ["Penguin","HarperCollins","NCERT","Arihant","Fingerprint","Bloomsbury","Crown Business","Universities Press","Plata Publishing"];
const sortOptions = [
  { value: "popular",   label: "Popularity" },
  { value: "newest",    label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_dsc", label: "Price: High to Low" },
  { value: "rating",    label: "Customer Rating" },
  { value: "discount",  label: "Discount" },
];

const ProductCard = ({ product, view }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.publicWishlist.items);
  const isWished = wishlist.some((w) => w._id === product._id);
  const disc = discount(product.price, product.mrp);
  const handleAddToCart = (e) => { e.preventDefault(); dispatch(addToCart({ product, qty: 1 })); toast.success("Added to cart!"); };
  const handleWishlist  = (e) => { e.preventDefault(); dispatch(toggleWishlist(product)); toast.success(isWished ? "Removed from wishlist" : "Added to wishlist!"); };

  if (view === "list") {
    return (
      <Link to={`/books/product/${product._id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex gap-4 p-4 hover:shadow-md transition-shadow group">
        <div className="w-32 h-32 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl flex items-center justify-center text-6xl flex-shrink-0 relative">
          {product.img}
          {product.badge && <span className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${badgeColor(product.badge)}`}>{product.badge}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-medium">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">{product.rating} <MdStar size={11} /></div>
            <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-gray-900">&#8377;{product.price.toLocaleString()}</span>
            <span className="text-sm text-gray-400 line-through">&#8377;{product.mrp.toLocaleString()}</span>
            <span className="text-xs text-green-600 font-bold">{disc}% off</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center flex-shrink-0">
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
    <Link to={`/books/product/${product._id}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 h-44 flex items-center justify-center text-7xl">
        {product.img}
        {product.badge && <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-lg ${badgeColor(product.badge)}`}>{product.badge}</span>}
        <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-lg">{disc}% off</span>
        <button onClick={handleWishlist} className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isWished ? <MdFavorite size={16} className="text-rose-500" /> : <MdFavoriteBorder size={16} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 font-medium">{product.brand}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 flex-1">{product.name}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center gap-0.5 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{product.rating} <MdStar size={10} /></div>
          <span className="text-[11px] text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">&#8377;{product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">&#8377;{product.mrp.toLocaleString()}</span>
        </div>
        <button onClick={handleAddToCart} className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
          <MdShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

const FilterSidebar = ({ filters, setFilters, onClose }) => {
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [open, setOpen] = useState({ price: true, brands: true });
  const toggle = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  const toggleBrand = (b) => setFilters((f) => ({ ...f, brands: f.brands.includes(b) ? f.brands.filter((x) => x !== b) : [...f.brands, b] }));
  const Section = ({ title, id, children }) => (
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
          <button onClick={() => setFilters({ brands: [] })} className="text-xs text-primary-600 font-semibold hover:underline">Clear All</button>
          {onClose && <button onClick={onClose}><MdClose size={18} className="text-gray-400" /></button>}
        </div>
      </div>
      <Section title="Price Range" id="price">
        <div className="px-1">
          <input type="range" min={0} max={3000} step={100} value={priceRange[1]} onChange={(e) => setPriceRange([0, +e.target.value])} className="w-full accent-primary-600" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">&#8377;0</span>
            <span className="text-xs text-primary-600 font-bold">&#8377;{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </Section>
      <Section title="Brand" id="brands">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => toggleBrand(b)} className="w-3.5 h-3.5 accent-primary-600 rounded cursor-pointer" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{b}</span>
            </label>
          ))}
        </div>
      </Section>
      <div>
        <h4 className="text-sm font-bold text-gray-800 mb-3">Customer Rating</h4>
        {[4, 3, 2].map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer mb-2">
            <input type="checkbox" className="w-3.5 h-3.5 accent-primary-600 cursor-pointer" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <MdStar key={i} size={13} className={i < r ? "text-amber-400" : "text-gray-200"} />)}
              <span className="text-xs text-gray-500 ml-1">&amp; above</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const Books = () => {
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("popular");
  const [activeTab, setActiveTab] = useState("all");
  const [mobileFilter, setMobileFilter] = useState(false);
  const [filters, setFilters] = useState({ brands: [] });

  const tabs = [
    { key: "all",       label: "All Books" },
    { key: "self_help", label: "Self Help" },
    { key: "finance",   label: "Finance" },
    { key: "fiction",   label: "Fiction" },
    { key: "business",  label: "Business" },
    { key: "academic",  label: "Academic" },
  ];

  const filtered = activeTab === "all" ? booksProducts : booksProducts.filter((p) => p.tag === activeTab);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_dsc") return b.price - a.price;
    if (sort === "rating")    return b.rating - a.rating;
    if (sort === "discount")  return discount(b.price, b.mrp) - discount(a.price, a.mrp);
    return 0;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#1c0a00] via-[#7c2d12] to-[#c2410c] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaBook className="text-orange-300" size={18} />
              <span className="text-orange-300 font-bold text-sm tracking-wide uppercase">Books Mega Sale</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              Discover Your Next <span className="text-orange-300">Great Read</span>
            </h1>
            <p className="text-white/70 max-w-md text-sm leading-relaxed mb-5">
              Explore bestsellers, textbooks, business books and inspiring biographies from top publishers. Up to 50% off on thousands of titles.
            </p>
            <div className="flex flex-wrap gap-3 mb-5">
              {["Free Delivery", "Easy Returns", "Genuine Products", "EMI Available"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">&#10003; {f}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg">
                Shop Now <MdArrowForward size={16} />
              </Link>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-3 rounded-xl border border-white/20">
                <MdLocalOffer size={16} className="text-yellow-300" />
                <span className="text-sm font-bold">Use <span className="text-yellow-300">BOOK15</span> &#8594; Extra 15% off</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-end gap-3 text-8xl select-none">
            <span className="opacity-80">📗</span><span className="text-9xl">📚</span><span className="opacity-80">📕</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {subcategories.map((s) => (
            <button key={s.label} onClick={() => setActiveTab(s.tab)}
              className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all group">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-[11px] font-semibold text-gray-700 group-hover:text-orange-700 text-center leading-tight">{s.label}</span>
              <span className="text-[10px] text-gray-400">{s.count.toLocaleString()}+</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-4">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2"><span className="text-2xl">📚</span><div><p className="text-sm font-bold text-gray-900">Today's Book Deals</p><p className="text-xs text-gray-500">Limited time offers on top titles</p></div></div>
          {[{ label: "Self Help from", price: "&#8377;199" }, { label: "Fiction from", price: "&#8377;249" }, { label: "Textbooks from", price: "&#8377;89" }, { label: "Box Sets from", price: "&#8377;999" }].map((d) => (
            <div key={d.label} className="bg-white rounded-xl px-3 py-2 border border-orange-100 text-center shadow-sm">
              <p className="text-[10px] text-gray-500">{d.label}</p>
              <p className="text-sm font-bold text-orange-700" dangerouslySetInnerHTML={{ __html: d.price }} />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-10 flex gap-6">
        <aside className="hidden lg:block w-60 flex-shrink-0"><FilterSidebar filters={filters} setFilters={setFilters} /></aside>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 mb-4 shadow-sm">
            <div className="flex-1 flex items-center gap-1 overflow-x-auto min-w-0">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === t.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setMobileFilter(true)} className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600"><MdFilterList size={15} /> Filter</button>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-gray-700 outline-none bg-white cursor-pointer">
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <MdExpandMore size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}><MdGridView size={16} /></button>
                <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}><MdViewList size={16} /></button>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Showing <span className="font-semibold text-gray-800">{sorted.length}</span> products</p>
          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center"><span className="text-6xl">📚</span><p className="text-gray-500 mt-4 font-medium">No products found</p><button onClick={() => { setActiveTab("all"); setFilters({ brands: [] }); }} className="mt-3 text-sm text-primary-600 font-semibold hover:underline">Clear filters</button></div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
              {sorted.map((p) => <ProductCard key={p.id} product={p} view={view} />)}
            </div>
          )}
        </div>
      </div>
      {mobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-xl"><FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setMobileFilter(false)} /></div>
        </div>
      )}
    </div>
  );
};
export default Books;
