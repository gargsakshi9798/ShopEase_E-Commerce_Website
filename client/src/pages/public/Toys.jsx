import CategoryPage from "./CategoryPage";

const heroConfig = {
  bg: "from-[#4c1d95] via-[#6d28d9] to-[#4c1d95]",
  accentColor: "text-yellow-300",
  accentBtnColor: "bg-yellow-500 hover:bg-yellow-600",
  icons: ["🧸", "🎮", "🪀"],
  tagline: "Fun toys & games for all ages — educational, outdoor, indoor & collectibles. Up to 50% off.",
  offerCode: "TOYS20",
  offerText: "Extra 20% off",
};

const subcategories = [
  { icon: "🧸", label: "Soft Toys",     tab: "soft"       },
  { icon: "🎮", label: "Video Games",   tab: "video"      },
  { icon: "🧩", label: "Puzzles",       tab: "puzzles"    },
  { icon: "🚗", label: "Remote Control",tab: "rc"         },
  { icon: "🎨", label: "Art & Craft",   tab: "art"        },
  { icon: "🏃", label: "Outdoor Toys",  tab: "outdoor"    },
  { icon: "🎲", label: "Board Games",   tab: "board"      },
  { icon: "🤖", label: "Action Figures",tab: "action"     },
];

const tabs = [
  { key: "soft",    label: "Soft Toys"     },
  { key: "puzzles", label: "Puzzles"       },
  { key: "rc",      label: "Remote Control"},
  { key: "board",   label: "Board Games"   },
  { key: "outdoor", label: "Outdoor"       },
];

const tabTagMap = {
  soft:    "soft toy",
  video:   "video game",
  puzzles: "puzzle",
  rc:      "remote control",
  art:     "art craft",
  outdoor: "outdoor toy",
  board:   "board game",
  action:  "action figure",
};

const Toys = () => (
  <CategoryPage
    categoryName="Toys & Games"
    categorySlug="toys"
    heroConfig={heroConfig}
    subcategories={subcategories}
    tabs={tabs}
    tabTagMap={tabTagMap}
  />
);

export default Toys;
