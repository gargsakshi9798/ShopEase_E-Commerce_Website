import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#0f172a] via-[#1e293b] to-[#0f172a]",
  accentColor: "text-red-400",
  accentBtnColor: "bg-red-600 hover:bg-red-700",
  icons: ["🚗", "🏍️", "🔧"],
  tagline: "Automotive accessories, tools, care products & more. Up to 35% off on top brands.",
  offerCode: "AUTO15",
  offerText: "Extra 15% off",
};

const subcategories = [
  { icon: "🔧", label: "Tools",         tab: "tools"       },
  { icon: "🪑", label: "Car Accessories",tab: "accessories" },
  { icon: "🛢️", label: "Car Care",      tab: "care"        },
  { icon: "💡", label: "Lights",         tab: "lights"      },
  { icon: "🏍️", label: "Bike Parts",    tab: "bike"        },
  { icon: "📻", label: "Car Electronics",tab: "electronics" },
  { icon: "🛞", label: "Tyres",          tab: "tyres"       },
  { icon: "🧴", label: "Lubricants",     tab: "lubricants"  },
];

const tabs = [
  { key: "accessories", label: "Car Accessories"  },
  { key: "tools",       label: "Tools"            },
  { key: "care",        label: "Car Care"         },
  { key: "electronics", label: "Car Electronics"  },
  { key: "bike",        label: "Bike Parts"       },
];

const tabTagMap = {
  tools:       "auto tools",
  accessories: "car accessories",
  care:        "car care",
  lights:      "car lights",
  bike:        "bike parts",
  electronics: "car electronics",
  tyres:       "tyre",
  lubricants:  "lubricant",
};

const Automotive = () => (
  <CategoryPage
    categoryName="Automotive"
    categorySlug="automotive"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Automotive;
