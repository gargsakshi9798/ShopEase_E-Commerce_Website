import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#14532d] via-[#15803d] to-[#14532d]",
  accentColor: "text-lime-300",
  accentBtnColor: "bg-lime-600 hover:bg-lime-700",
  icons: [
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=160&q=80",
    "https://images.unsplash.com/photo-1543168256-418811576931?w=180&q=80",
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=160&q=80",
  ],
  tagline: "Fresh groceries, staples, snacks & beverages delivered to your door. Best prices daily.",
  offerCode: "FRESH10",
  offerText: "10% off on first order",
};

const subcategories = [
  { icon: "🥦", label: "Vegetables",   tab: "vegetables" },
  { icon: "🍎", label: "Fruits",       tab: "fruits"     },
  { icon: "🥛", label: "Dairy",        tab: "dairy"      },
  { icon: "🌾", label: "Staples",      tab: "staples"    },
  { icon: "🍫", label: "Snacks",       tab: "snacks"     },
  { icon: "☕", label: "Beverages",    tab: "beverages"  },
  { icon: "🧂", label: "Condiments",   tab: "condiments" },
  { icon: "🧁", label: "Bakery",       tab: "bakery"     },
];

const tabs = [
  { key: "vegetables", label: "Vegetables" },
  { key: "fruits",     label: "Fruits"     },
  { key: "dairy",      label: "Dairy"      },
  { key: "staples",    label: "Staples"    },
  { key: "snacks",     label: "Snacks"     },
];

const tabTagMap = {
  vegetables: "vegetable",
  fruits:     "fruit",
  dairy:      "dairy",
  staples:    "staples",
  snacks:     "snack",
  beverages:  "beverage",
  condiments: "condiment",
  bakery:     "bakery",
};

const Grocery = () => (
  <CategoryPage
    categoryName="Grocery"
    categorySlug="grocery"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Grocery;
