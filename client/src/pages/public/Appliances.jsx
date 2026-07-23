import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#1e3a5f] via-[#1d4ed8] to-[#1e3a5f]",
  accentColor: "text-sky-300",
  accentBtnColor: "bg-sky-500 hover:bg-sky-600",
  icons: [
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=160&q=80",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=180&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&q=80",
  ],
  tagline: "Top home appliances — ACs, washing machines, refrigerators & more. Up to 45% off.",
  offerCode: "APPLIANCE10",
  offerText: "Extra 10% off",
};

const subcategories = [
  { icon: "❄️", label: "ACs",            tab: "ac"          },
  { icon: "🌀", label: "Washing Machine", tab: "washing"     },
  { icon: "🧊", label: "Refrigerators",  tab: "fridge"      },
  { icon: "🌬️", label: "Fans",          tab: "fan"         },
  { icon: "🫧", label: "Dishwashers",    tab: "dishwasher"  },
  { icon: "♨️", label: "Microwaves",     tab: "microwave"   },
  { icon: "🔌", label: "Water Purifiers",tab: "purifier"    },
  { icon: "💨", label: "Geysers",        tab: "geyser"      },
];

const tabs = [
  { key: "ac",       label: "ACs"             },
  { key: "washing",  label: "Washing Machines" },
  { key: "fridge",   label: "Refrigerators"   },
  { key: "fan",      label: "Fans"            },
  { key: "microwave",label: "Microwaves"      },
];

const tabTagMap = {
  ac:         "air conditioner",
  washing:    "washing machine",
  fridge:     "refrigerator",
  fan:        "fan",
  dishwasher: "dishwasher",
  microwave:  "microwave",
  purifier:   "water purifier",
  geyser:     "geyser",
};

const Appliances = () => (
  <CategoryPage
    categoryName="Appliances"
    categorySlug="appliances"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Appliances;
