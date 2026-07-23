import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#7c2d12] via-[#9a3412] to-[#7c2d12]",
  accentColor: "text-orange-300",
  accentBtnColor: "bg-orange-500 hover:bg-orange-600",
  icons: [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=160&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=180&q=80",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=160&q=80",
  ],
  tagline: "Everything for your home — cookware, decor, furniture & more. Up to 55% off.",
  offerCode: "HOME20",
  offerText: "Extra 20% off",
};

const subcategories = [
  { icon: "🍳", label: "Cookware",    tab: "cookware"   },
  { icon: "🛋️", label: "Furniture",  tab: "furniture"  },
  { icon: "💡", label: "Lighting",    tab: "lighting"   },
  { icon: "🛁", label: "Bath",        tab: "bath"       },
  { icon: "🌿", label: "Garden",      tab: "garden"     },
  { icon: "🧹", label: "Cleaning",    tab: "cleaning"   },
  { icon: "🍽️", label: "Dining",     tab: "dining"     },
  { icon: "🛏️", label: "Bedding",    tab: "bedding"    },
];

const tabs = [
  { key: "cookware",  label: "Cookware"  },
  { key: "furniture", label: "Furniture" },
  { key: "lighting",  label: "Lighting"  },
  { key: "bath",      label: "Bath"      },
  { key: "bedding",   label: "Bedding"   },
];

const tabTagMap = {
  cookware:  "cookware",
  furniture: "furniture",
  lighting:  "lighting",
  bath:      "bathroom",
  garden:    "garden",
  cleaning:  "cleaning",
  dining:    "dining",
  bedding:   "bedding",
};

const HomeKitchen = () => (
  <CategoryPage
    categoryName="Home & Kitchen"
    categorySlug="home-kitchen"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default HomeKitchen;
