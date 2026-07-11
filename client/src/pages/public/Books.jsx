import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#1c1917] via-[#44403c] to-[#1c1917]",
  accentColor: "text-amber-300",
  accentBtnColor: "bg-amber-600 hover:bg-amber-700",
  icons: ["📚", "📖", "✏️"],
  tagline: "Millions of books — fiction, non-fiction, academic, children's & more. Best deals.",
  offerCode: "BOOKS15",
  offerText: "Extra 15% off",
};

const subcategories = [
  { icon: "📖", label: "Fiction",       tab: "fiction"    },
  { icon: "📊", label: "Non-Fiction",   tab: "nonfiction" },
  { icon: "🎓", label: "Academic",      tab: "academic"   },
  { icon: "👶", label: "Children's",    tab: "children"   },
  { icon: "💼", label: "Business",      tab: "business"   },
  { icon: "🌍", label: "Self-Help",     tab: "selfhelp"   },
  { icon: "🔬", label: "Science",       tab: "science"    },
  { icon: "🎨", label: "Art & Design",  tab: "art"        },
];

const tabs = [
  { key: "fiction",    label: "Fiction"     },
  { key: "nonfiction", label: "Non-Fiction" },
  { key: "academic",   label: "Academic"    },
  { key: "children",   label: "Children's"  },
  { key: "business",   label: "Business"    },
];

const tabTagMap = {
  fiction:    "fiction",
  nonfiction: "non fiction",
  academic:   "academic",
  children:   "children books",
  business:   "business books",
  selfhelp:   "self help",
  science:    "science",
  art:        "art design",
};

const Books = () => (
  <CategoryPage
    categoryName="Books"
    categorySlug="books"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Books;
