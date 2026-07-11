import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
  accentColor: "text-pink-400",
  accentBtnColor: "bg-pink-500 hover:bg-pink-600",
  icons: ["👗", "👔", "👟"],
  tagline: "Discover the latest trends — casuals, ethnic, footwear & more. Up to 70% off on top brands.",
  offerCode: "FASHION30",
  offerText: "Extra 30% off",
};

const subcategories = [
  { icon: "👔", label: "Men's",        tab: "mens"        },
  { icon: "👗", label: "Women's",      tab: "womens"      },
  { icon: "👧", label: "Kids'",        tab: "kids"        },
  { icon: "👟", label: "Footwear",     tab: "footwear"    },
  { icon: "👜", label: "Bags",         tab: "bags"        },
  { icon: "🕶️", label: "Sunglasses",  tab: "sunglasses"  },
  { icon: "⌚", label: "Watches",      tab: "watches"     },
  { icon: "💍", label: "Jewellery",    tab: "jewellery"   },
];

const tabs = [
  { key: "mens",       label: "Men's"     },
  { key: "womens",     label: "Women's"   },
  { key: "kids",       label: "Kids'"     },
  { key: "footwear",   label: "Footwear"  },
  { key: "accessories",label: "Accessories" },
];

const tabTagMap = {
  mens:        "men",
  womens:      "women",
  kids:        "kids",
  footwear:    "shoes",
  accessories: "accessories",
  bags:        "bag",
  sunglasses:  "sunglasses",
  watches:     "watch",
  jewellery:   "jewellery",
};

const Fashion = () => (
  <CategoryPage
    categoryName="Fashion"
    categorySlug="fashion"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Fashion;
