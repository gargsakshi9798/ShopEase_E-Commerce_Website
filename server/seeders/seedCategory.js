const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("../models/Category");

// ─── Parent Categories (Level 1) ──────────────────────────────────────────────
const parentCategories = [
  {
    name: "Electronics", slug: "electronics",
    description: "Gadgets, devices and electronic products",
    icon: "FiMonitor", sort_order: 1, is_featured: true,
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80",
  },
  {
    name: "Mobiles", slug: "mobiles",
    description: "Smartphones, feature phones and accessories",
    icon: "FiSmartphone", sort_order: 2, is_featured: true,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  },
  {
    name: "Fashion", slug: "fashion",
    description: "Clothing, footwear and accessories for all",
    icon: "FiShoppingBag", sort_order: 3, is_featured: true,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  },
  {
    name: "Home & Kitchen", slug: "home-kitchen",
    description: "Furniture, decor and kitchen essentials",
    icon: "FiHome", sort_order: 4, is_featured: true,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  },
  {
    name: "Appliances", slug: "appliances",
    description: "Home and kitchen appliances",
    icon: "FiZap", sort_order: 5, is_featured: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    name: "Books", slug: "books",
    description: "Books, e-books, and study material",
    icon: "FiBook", sort_order: 6, is_featured: false,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  },
  {
    name: "Sports & Fitness", slug: "sports-fitness",
    description: "Sports gear, fitness equipment and outdoor",
    icon: "FiActivity", sort_order: 7, is_featured: true,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  },
  {
    name: "Beauty & Personal", slug: "beauty-personal",
    description: "Skincare, haircare and personal grooming",
    icon: "FiFeather", sort_order: 8, is_featured: false,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  },
  {
    name: "Grocery", slug: "grocery",
    description: "Fresh produce, packaged food and beverages",
    icon: "FiShoppingCart", sort_order: 9, is_featured: false,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  },
  {
    name: "Toys & Baby", slug: "toys-baby",
    description: "Toys, games and baby care products",
    icon: "FiStar", sort_order: 10, is_featured: false,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
  },
  {
    name: "Automotive", slug: "automotive",
    description: "Car, bike accessories and spare parts",
    icon: "FiTruck", sort_order: 11, is_featured: false,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
  },
  {
    name: "Furniture", slug: "furniture",
    description: "Home and office furniture",
    icon: "FiBox", sort_order: 12, is_featured: false,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
];

// ─── Sub Categories (Level 2) ─────────────────────────────────────────────────
const subCategoryDefs = [
  // Electronics
  {
    name: "Laptops", slug: "laptops",
    description: "Notebooks and laptops for work and gaming",
    parent: "electronics", sort_order: 1,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  },
  {
    name: "Cameras", slug: "cameras",
    description: "DSLR, mirrorless and point-and-shoot cameras",
    parent: "electronics", sort_order: 2,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
  },
  {
    name: "Headphones", slug: "headphones",
    description: "Wired and wireless headphones and earbuds",
    parent: "electronics", sort_order: 3,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  {
    name: "Televisions", slug: "televisions",
    description: "Smart TVs, LED and OLED televisions",
    parent: "electronics", sort_order: 4,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80",
  },
  {
    name: "Tablets", slug: "tablets",
    description: "Android and iOS tablets",
    parent: "electronics", sort_order: 5,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
  },

  // Mobiles
  {
    name: "Smartphones", slug: "smartphones",
    description: "Latest Android and iOS smartphones",
    parent: "mobiles", sort_order: 1,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
  },
  {
    name: "Feature Phones", slug: "feature-phones",
    description: "Basic feature phones and keypad phones",
    parent: "mobiles", sort_order: 2,
    image: "https://images.unsplash.com/photo-1598327106026-848a11c3e8b3?w=600&q=80",
  },
  {
    name: "Mobile Accessories", slug: "mobile-accessories",
    description: "Cases, chargers, cables and screen guards",
    parent: "mobiles", sort_order: 3,
    image: "https://images.unsplash.com/photo-1583394293214-30b3ea9d3c95?w=600&q=80",
  },
  {
    name: "Smartwatches", slug: "smartwatches",
    description: "Fitness bands and smartwatches",
    parent: "mobiles", sort_order: 4,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },

  // Fashion
  {
    name: "Men's Clothing", slug: "mens-clothing",
    description: "T-shirts, shirts, trousers and more for men",
    parent: "fashion", sort_order: 1,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
  },
  {
    name: "Women's Clothing", slug: "womens-clothing",
    description: "Kurtis, sarees, dresses and more for women",
    parent: "fashion", sort_order: 2,
    image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&q=80",
  },
  {
    name: "Kids Clothing", slug: "kids-clothing",
    description: "Clothing for boys and girls",
    parent: "fashion", sort_order: 3,
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
  },
  {
    name: "Footwear", slug: "footwear",
    description: "Shoes, sandals and sneakers",
    parent: "fashion", sort_order: 4,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  },
  {
    name: "Bags & Luggage", slug: "bags-luggage",
    description: "Handbags, backpacks and travel luggage",
    parent: "fashion", sort_order: 5,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  },

  // Home & Kitchen
  {
    name: "Cookware", slug: "cookware",
    description: "Pans, pots, pressure cookers",
    parent: "home-kitchen", sort_order: 1,
    image: "https://images.unsplash.com/photo-1584990347449-a2d4c2c044a2?w=600&q=80",
  },
  {
    name: "Bedding", slug: "bedding",
    description: "Bedsheets, pillows and mattresses",
    parent: "home-kitchen", sort_order: 2,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  },
  {
    name: "Home Decor", slug: "home-decor",
    description: "Wall art, photo frames and decorative items",
    parent: "home-kitchen", sort_order: 3,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  },
  {
    name: "Storage", slug: "storage",
    description: "Shelves, organizers and storage boxes",
    parent: "home-kitchen", sort_order: 4,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
  },

  // Appliances
  {
    name: "Washing Machines", slug: "washing-machines",
    description: "Front load, top load washing machines",
    parent: "appliances", sort_order: 1,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80",
  },
  {
    name: "Refrigerators", slug: "refrigerators",
    description: "Single door, double door fridges",
    parent: "appliances", sort_order: 2,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80",
  },
  {
    name: "Air Conditioners", slug: "air-conditioners",
    description: "Split and window air conditioners",
    parent: "appliances", sort_order: 3,
    image: "https://images.unsplash.com/photo-1563351672-62b74891a28a?w=600&q=80",
  },
  {
    name: "Microwaves", slug: "microwaves",
    description: "Solo, grill and convection microwaves",
    parent: "appliances", sort_order: 4,
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80",
  },
  {
    name: "Vacuum Cleaners", slug: "vacuum-cleaners",
    description: "Dry and wet vacuum cleaners",
    parent: "appliances", sort_order: 5,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80",
  },

  // Books
  {
    name: "Fiction", slug: "fiction",
    description: "Novels, thrillers and fiction books",
    parent: "books", sort_order: 1,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  },
  {
    name: "Non-Fiction", slug: "non-fiction",
    description: "Self-help, biographies and business books",
    parent: "books", sort_order: 2,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  },
  {
    name: "Academic", slug: "academic",
    description: "Textbooks and academic study material",
    parent: "books", sort_order: 3,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
  },
  {
    name: "Children Books", slug: "children-books",
    description: "Story and activity books for kids",
    parent: "books", sort_order: 4,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  },

  // Sports & Fitness
  {
    name: "Gym Equipment", slug: "gym-equipment",
    description: "Dumbbells, barbells and gym accessories",
    parent: "sports-fitness", sort_order: 1,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  },
  {
    name: "Cricket", slug: "cricket",
    description: "Bats, balls, gloves and cricket gear",
    parent: "sports-fitness", sort_order: 2,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80",
  },
  {
    name: "Yoga & Meditation", slug: "yoga-meditation",
    description: "Yoga mats, blocks and meditation accessories",
    parent: "sports-fitness", sort_order: 3,
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80",
  },
  {
    name: "Cycling", slug: "cycling",
    description: "Cycles, helmets and cycling accessories",
    parent: "sports-fitness", sort_order: 4,
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80",
  },

  // Beauty & Personal
  {
    name: "Skincare", slug: "skincare",
    description: "Face wash, moisturizers, serums",
    parent: "beauty-personal", sort_order: 1,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
  },
  {
    name: "Haircare", slug: "haircare",
    description: "Shampoo, conditioner, hair oils",
    parent: "beauty-personal", sort_order: 2,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  },
  {
    name: "Makeup", slug: "makeup",
    description: "Foundation, lipstick, eyeshadow",
    parent: "beauty-personal", sort_order: 3,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80",
  },
  {
    name: "Fragrances", slug: "fragrances",
    description: "Perfumes, deodorants and body sprays",
    parent: "beauty-personal", sort_order: 4,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
  },

  // Grocery
  {
    name: "Fruits & Vegetables", slug: "fruits-vegetables",
    description: "Fresh fruits and vegetables",
    parent: "grocery", sort_order: 1,
    image: "https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80",
  },
  {
    name: "Dairy & Eggs", slug: "dairy-eggs",
    description: "Milk, curd, cheese and eggs",
    parent: "grocery", sort_order: 2,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  },
  {
    name: "Snacks", slug: "snacks",
    description: "Chips, biscuits and packaged snacks",
    parent: "grocery", sort_order: 3,
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80",
  },
  {
    name: "Beverages", slug: "beverages",
    description: "Tea, coffee, juices and soft drinks",
    parent: "grocery", sort_order: 4,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
  },

  // Toys & Baby
  {
    name: "Action Figures", slug: "action-figures",
    description: "Superhero and action figures",
    parent: "toys-baby", sort_order: 1,
    image: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&q=80",
  },
  {
    name: "Board Games", slug: "board-games",
    description: "Chess, Ludo, Scrabble and more",
    parent: "toys-baby", sort_order: 2,
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
  },
  {
    name: "Baby Care", slug: "baby-care",
    description: "Diapers, baby food and care products",
    parent: "toys-baby", sort_order: 3,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
  },
  {
    name: "Educational Toys", slug: "educational-toys",
    description: "STEM and learning toys for kids",
    parent: "toys-baby", sort_order: 4,
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80",
  },

  // Automotive
  {
    name: "Car Accessories", slug: "car-accessories",
    description: "Car mats, seat covers and more",
    parent: "automotive", sort_order: 1,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
  },
  {
    name: "Bike Accessories", slug: "bike-accessories",
    description: "Helmets, gloves and bike accessories",
    parent: "automotive", sort_order: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    name: "Car Electronics", slug: "car-electronics",
    description: "Dashcams, GPS and car audio",
    parent: "automotive", sort_order: 3,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80",
  },

  // Furniture
  {
    name: "Sofas & Seating", slug: "sofas-seating",
    description: "Sofas, recliners and chairs",
    parent: "furniture", sort_order: 1,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    name: "Beds & Mattresses", slug: "beds-mattresses",
    description: "Beds, cots and mattresses",
    parent: "furniture", sort_order: 2,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  },
  {
    name: "Office Furniture", slug: "office-furniture",
    description: "Desks, chairs and cabinets for office",
    parent: "furniture", sort_order: 3,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
  },
  {
    name: "Wardrobes", slug: "wardrobes",
    description: "Almirah, wardrobes and storage cabinets",
    parent: "furniture", sort_order: 4,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&q=80",
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ─── Parent Categories ──────────────────────────────────────────────────────
    console.log("\nSeeding parent categories...");
    const parentMap = {}; // slug → _id

    for (const cat of parentCategories) {
      const doc = await Category.findOneAndUpdate(
        { slug: cat.slug },
        { ...cat, level: 1, parent_id: null },
        { upsert: true, new: true }
      );
      parentMap[cat.slug] = doc._id;
    }
    console.log(`✅ ${parentCategories.length} parent categories seeded`);

    // ─── Sub Categories ─────────────────────────────────────────────────────────
    console.log("\nSeeding sub-categories...");
    let subCount = 0;

    for (const sub of subCategoryDefs) {
      const parentId = parentMap[sub.parent];
      if (!parentId) {
        console.warn(`⚠️  Parent not found for slug: ${sub.parent}`);
        continue;
      }
      const { parent, ...rest } = sub;
      await Category.findOneAndUpdate(
        { slug: rest.slug },
        { ...rest, level: 2, parent_id: parentId },
        { upsert: true, new: true }
      );
      subCount++;
    }
    console.log(`✅ ${subCount} sub-categories seeded`);

    const total = await Category.countDocuments();
    console.log(`\n🎉 Total categories in DB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
    process.exit(1);
  }
}

seedCategories();
