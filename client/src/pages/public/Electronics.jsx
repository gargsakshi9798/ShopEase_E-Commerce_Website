import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#0a0f1e] via-[#0d1b3e] to-[#0a1628]",
  accentColor: "text-cyan-400",
  accentBtnColor: "bg-cyan-500 hover:bg-cyan-600",
  icons: [
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=160&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=180&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&q=80",
  ],
  tagline: "Top-rated mobiles, laptops, audio & more. Up to 60% off on premium electronics.",
  offerCode: "TECH20",
  offerText: "Extra 20% off",
};

const subcategories = [
  { icon: "📱", label: "Mobiles",     tab: "mobiles"  },
  { icon: "💻", label: "Laptops",     tab: "laptops"  },
  { icon: "🎧", label: "Audio",       tab: "audio"    },
  { icon: "📺", label: "Smart TVs",   tab: "tv"       },
  { icon: "📷", label: "Cameras",     tab: "cameras"  },
  { icon: "📟", label: "Tablets",     tab: "tablets"  },
  { icon: "🎮", label: "Gaming",      tab: "gaming"   },
  { icon: "🔌", label: "Accessories", tab: "accessories" },
];

const tabs = [
  { key: "mobiles",  label: "Mobiles"  },
  { key: "laptops",  label: "Laptops"  },
  { key: "audio",    label: "Audio"    },
  { key: "tv",       label: "Smart TVs"},
  { key: "cameras",  label: "Cameras"  },
];

const tabTagMap = {
  mobiles:     "mobile",
  laptops:     "laptop",
  audio:       "audio",
  tv:          "television",
  cameras:     "camera",
  tablets:     "tablet",
  gaming:      "gaming",
  accessories: "accessories",
};

const Electronics = () => (
  <CategoryPage
    categoryName="Electronics"
    categorySlug="electronics"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Electronics;
