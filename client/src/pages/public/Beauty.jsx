import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#500724] via-[#881337] to-[#500724]",
  accentColor: "text-rose-300",
  accentBtnColor: "bg-rose-500 hover:bg-rose-600",
  icons: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=180&q=80",
    "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=160&q=80",
  ],
  tagline: "Premium beauty & personal care — skincare, makeup, haircare & more. Up to 50% off.",
  offerCode: "BEAUTY25",
  offerText: "Extra 25% off",
};

const subcategories = [
  { icon: "💄", label: "Makeup",       tab: "makeup"    },
  { icon: "🧴", label: "Skincare",     tab: "skincare"  },
  { icon: "💇", label: "Haircare",     tab: "haircare"  },
  { icon: "🧼", label: "Bath & Body",  tab: "bath"      },
  { icon: "🌸", label: "Fragrance",    tab: "fragrance" },
  { icon: "✂️", label: "Grooming",    tab: "grooming"  },
  { icon: "💅", label: "Nail Care",    tab: "nail"      },
  { icon: "🌿", label: "Organic",      tab: "organic"   },
];

const tabs = [
  { key: "makeup",   label: "Makeup"   },
  { key: "skincare", label: "Skincare" },
  { key: "haircare", label: "Haircare" },
  { key: "bath",     label: "Bath & Body" },
  { key: "fragrance",label: "Fragrance" },
];

const tabTagMap = {
  makeup:    "makeup",
  skincare:  "skincare",
  haircare:  "haircare",
  bath:      "bath body",
  fragrance: "perfume",
  grooming:  "grooming",
  nail:      "nail care",
  organic:   "organic beauty",
};

const Beauty = () => (
  <CategoryPage
    categoryName="Beauty"
    categorySlug="beauty"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Beauty;
