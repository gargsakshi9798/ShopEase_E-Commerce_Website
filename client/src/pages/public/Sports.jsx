import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#052e16] via-[#166534] to-[#052e16]",
  accentColor: "text-green-300",
  accentBtnColor: "bg-green-600 hover:bg-green-700",
  icons: ["🏋️", "🏃", "🎽"],
  tagline: "Stay fit with top sports gear — equipment, apparel, shoes & supplements. Up to 40% off.",
  offerCode: "FIT20",
  offerText: "Extra 20% off",
};

const subcategories = [
  { icon: "🏋️", label: "Fitness",    tab: "fitness"   },
  { icon: "🎽",  label: "Sportswear", tab: "sportswear"},
  { icon: "👟",  label: "Sport Shoes",tab: "shoes"     },
  { icon: "🏊",  label: "Swimming",   tab: "swimming"  },
  { icon: "🎾",  label: "Racket Sports",tab: "racket"  },
  { icon: "⚽",  label: "Team Sports",tab: "team"      },
  { icon: "🧘",  label: "Yoga",       tab: "yoga"      },
  { icon: "🚴",  label: "Cycling",    tab: "cycling"   },
];

const tabs = [
  { key: "fitness",    label: "Fitness"     },
  { key: "sportswear", label: "Sportswear"  },
  { key: "shoes",      label: "Sport Shoes" },
  { key: "yoga",       label: "Yoga"        },
  { key: "cycling",    label: "Cycling"     },
];

const tabTagMap = {
  fitness:    "fitness",
  sportswear: "sportswear",
  shoes:      "sport shoes",
  swimming:   "swimming",
  racket:     "racket",
  team:       "team sport",
  yoga:       "yoga",
  cycling:    "cycling",
};

const Sports = () => (
  <CategoryPage
    categoryName="Sports & Fitness"
    categorySlug="sports"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Sports;
