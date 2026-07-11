import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#1a0533] via-[#2d0f5e] to-[#1a0533]",
  accentColor: "text-violet-400",
  accentBtnColor: "bg-violet-600 hover:bg-violet-700",
  icons: ["📱", "📲", "🔋"],
  tagline: "Latest smartphones from Apple, Samsung, OnePlus & more. Best prices, guaranteed.",
  offerCode: "MOBILE15",
  offerText: "Extra 15% off",
};

const subcategories = [
  { icon: "🍎", label: "Apple",     tab: "apple"    },
  { icon: "🌌", label: "Samsung",   tab: "samsung"  },
  { icon: "1️⃣",  label: "OnePlus",  tab: "oneplus"  },
  { icon: "📱", label: "Xiaomi",    tab: "xiaomi"   },
  { icon: "📲", label: "Vivo",      tab: "vivo"     },
  { icon: "📱", label: "OPPO",      tab: "oppo"     },
  { icon: "🔋", label: "Realme",    tab: "realme"   },
  { icon: "📦", label: "Accessories", tab: "accessories" },
];

const tabs = [
  { key: "apple",   label: "Apple"   },
  { key: "samsung", label: "Samsung" },
  { key: "oneplus", label: "OnePlus" },
  { key: "xiaomi",  label: "Xiaomi"  },
];

const tabTagMap = {
  apple:       "apple",
  samsung:     "samsung",
  oneplus:     "oneplus",
  xiaomi:      "xiaomi",
  vivo:        "vivo",
  oppo:        "oppo",
  realme:      "realme",
  accessories: "mobile accessories",
};

const Mobiles = () => (
  <CategoryPage
    categoryName="Mobiles"
    categorySlug="mobiles"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Mobiles;
