const mongoose = require("mongoose");
require("dotenv").config();

const Brand = require("../models/Brand");

const brands = [
  // Electronics & Laptops
  {
    name: "Apple", slug: "apple",
    description: "Premium consumer electronics and software",
    website: "https://www.apple.com",
    logo: "https://logo.clearbit.com/apple.com",
    is_featured: true, sort_order: 1,
  },
  {
    name: "Samsung", slug: "samsung",
    description: "Global leader in electronics and home appliances",
    website: "https://www.samsung.com",
    logo: "https://logo.clearbit.com/samsung.com",
    is_featured: true, sort_order: 2,
  },
  {
    name: "Sony", slug: "sony",
    description: "Electronics, gaming and entertainment",
    website: "https://www.sony.com",
    logo: "https://logo.clearbit.com/sony.com",
    is_featured: true, sort_order: 3,
  },
  {
    name: "LG", slug: "lg",
    description: "Home appliances and electronics",
    website: "https://www.lg.com",
    logo: "https://logo.clearbit.com/lg.com",
    is_featured: true, sort_order: 4,
  },
  {
    name: "Dell", slug: "dell",
    description: "Computers, laptops and IT solutions",
    website: "https://www.dell.com",
    logo: "https://logo.clearbit.com/dell.com",
    is_featured: true, sort_order: 5,
  },
  {
    name: "HP", slug: "hp",
    description: "Laptops, printers and IT hardware",
    website: "https://www.hp.com",
    logo: "https://logo.clearbit.com/hp.com",
    is_featured: true, sort_order: 6,
  },
  {
    name: "Lenovo", slug: "lenovo",
    description: "Laptops, tablets and smart devices",
    website: "https://www.lenovo.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg",
    is_featured: true, sort_order: 7,
  },
  {
    name: "Asus", slug: "asus",
    description: "Laptops, motherboards and gaming gear",
    website: "https://www.asus.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg",
    is_featured: false, sort_order: 8,
  },
  {
    name: "Acer", slug: "acer",
    description: "Affordable laptops and monitors",
    website: "https://www.acer.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg",
    is_featured: false, sort_order: 9,
  },
  {
    name: "MSI", slug: "msi",
    description: "Gaming laptops and PC components",
    website: "https://www.msi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Micro-Star_International_logo.svg",
    is_featured: false, sort_order: 10,
  },

  // Mobiles
  {
    name: "OnePlus", slug: "oneplus",
    description: "Premium Android smartphones",
    website: "https://www.oneplus.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/OnePlus_logo.svg",
    is_featured: true, sort_order: 11,
  },
  {
    name: "Xiaomi", slug: "xiaomi",
    description: "Budget to flagship smartphones and smart devices",
    website: "https://www.mi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
    is_featured: true, sort_order: 12,
  },
  {
    name: "Realme", slug: "realme",
    description: "Affordable smartphones with great specs",
    website: "https://www.realme.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Realme_logo.svg",
    is_featured: false, sort_order: 13,
  },
  {
    name: "Vivo", slug: "vivo",
    description: "Camera-focused smartphones",
    website: "https://www.vivo.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Vivo_logo_2019.svg",
    is_featured: false, sort_order: 14,
  },
  {
    name: "Oppo", slug: "oppo",
    description: "Stylish smartphones with fast charging",
    website: "https://www.oppo.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/OPPO_LOGO_2019.svg",
    is_featured: false, sort_order: 15,
  },
  {
    name: "Google", slug: "google",
    description: "Pixel smartphones and smart home devices",
    website: "https://store.google.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    is_featured: false, sort_order: 16,
  },
  {
    name: "Nokia", slug: "nokia",
    description: "Reliable and durable smartphones",
    website: "https://www.nokia.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/02/Nokia_wordmark.svg",
    is_featured: false, sort_order: 17,
  },
  {
    name: "Motorola", slug: "motorola",
    description: "Pure Android experience smartphones",
    website: "https://www.motorola.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Motorola_wordmark_logo.svg",
    is_featured: false, sort_order: 18,
  },

  // Fashion & Footwear
  {
    name: "Nike", slug: "nike",
    description: "Sportswear, footwear and accessories",
    website: "https://www.nike.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    is_featured: true, sort_order: 19,
  },
  {
    name: "Adidas", slug: "adidas",
    description: "Sports and lifestyle clothing and footwear",
    website: "https://www.adidas.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    is_featured: true, sort_order: 20,
  },
  {
    name: "Puma", slug: "puma",
    description: "Athletic and casual footwear and clothing",
    website: "https://www.puma.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_logo.svg",
    is_featured: false, sort_order: 21,
  },
  {
    name: "Levi's", slug: "levis",
    description: "Iconic denim jeans and casual wear",
    website: "https://www.levis.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Levi%27s_logo.svg",
    is_featured: true, sort_order: 22,
  },
  {
    name: "H&M", slug: "hm",
    description: "Affordable fast fashion for all ages",
    website: "https://www.hm.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    is_featured: false, sort_order: 23,
  },
  {
    name: "Zara", slug: "zara",
    description: "Trendy fashion and accessories",
    website: "https://www.zara.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    is_featured: false, sort_order: 24,
  },
  {
    name: "Allen Solly", slug: "allen-solly",
    description: "Formal and casual wear for men and women",
    website: "https://www.allensolly.com",
    logo: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 25,
  },
  {
    name: "Van Heusen", slug: "van-heusen",
    description: "Premium formal clothing and accessories",
    website: "https://www.vanheusen.co.in",
    logo: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 26,
  },
  {
    name: "Bata", slug: "bata",
    description: "Quality footwear for the whole family",
    website: "https://www.bata.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Bata_logo.svg",
    is_featured: false, sort_order: 27,
  },
  {
    name: "Woodland", slug: "woodland",
    description: "Outdoor and adventure footwear",
    website: "https://www.woodland.in",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 28,
  },

  // Home & Kitchen / Appliances
  {
    name: "Philips", slug: "philips",
    description: "Home appliances, healthcare and lighting",
    website: "https://www.philips.co.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg",
    is_featured: true, sort_order: 29,
  },
  {
    name: "Whirlpool", slug: "whirlpool",
    description: "Washing machines, refrigerators and ACs",
    website: "https://www.whirlpoolindia.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Whirlpool_logo_2015.svg",
    is_featured: false, sort_order: 30,
  },
  {
    name: "Bosch", slug: "bosch",
    description: "Power tools and home appliances",
    website: "https://www.bosch-home.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Bosch_logo_simple.svg",
    is_featured: false, sort_order: 31,
  },
  {
    name: "Havells", slug: "havells",
    description: "Electrical equipment and home appliances",
    website: "https://www.havells.com",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 32,
  },
  {
    name: "Bajaj", slug: "bajaj",
    description: "Fans, mixer grinders and small appliances",
    website: "https://www.bajajelectricals.com",
    logo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 33,
  },
  {
    name: "Prestige", slug: "prestige",
    description: "Kitchen appliances and cookware",
    website: "https://www.prestigeappliances.com",
    logo: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 34,
  },
  {
    name: "Pigeon", slug: "pigeon",
    description: "Affordable kitchen appliances",
    website: "https://www.pigeonindia.com",
    logo: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 35,
  },
  {
    name: "Milton", slug: "milton",
    description: "Kitchenware, bottles and lunch boxes",
    website: "https://www.miltonindia.com",
    logo: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 36,
  },
  {
    name: "IKEA", slug: "ikea",
    description: "Flat-pack furniture and home accessories",
    website: "https://www.ikea.com/in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg",
    is_featured: true, sort_order: 37,
  },

  // Beauty & Personal Care
  {
    name: "Lakme", slug: "lakme",
    description: "Indian beauty and cosmetics brand",
    website: "https://www.lakmeindia.com",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&q=80",
    is_featured: true, sort_order: 38,
  },
  {
    name: "L'Oreal", slug: "loreal",
    description: "Global beauty and cosmetics leader",
    website: "https://www.loreal.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/L%27Or%C3%A9al_logo.svg",
    is_featured: true, sort_order: 39,
  },
  {
    name: "Dove", slug: "dove",
    description: "Skincare and haircare products",
    website: "https://www.dove.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Dove_logo.svg",
    is_featured: false, sort_order: 40,
  },
  {
    name: "Himalaya", slug: "himalaya",
    description: "Herbal health and personal care",
    website: "https://www.himalayawellness.in",
    logo: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 41,
  },
  {
    name: "Nivea", slug: "nivea",
    description: "Skincare and body care products",
    website: "https://www.nivea.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Nivea_logo.svg",
    is_featured: false, sort_order: 42,
  },
  {
    name: "Biotique", slug: "biotique",
    description: "Natural and organic beauty products",
    website: "https://www.biotique.com",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 43,
  },
  {
    name: "Mamaearth", slug: "mamaearth",
    description: "Natural and toxin-free personal care",
    website: "https://www.mamaearth.in",
    logo: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 44,
  },

  // Sports & Fitness
  {
    name: "Decathlon", slug: "decathlon",
    description: "Affordable sports equipment and clothing",
    website: "https://www.decathlon.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Decathlon_Logo.svg",
    is_featured: true, sort_order: 45,
  },
  {
    name: "Cosco", slug: "cosco",
    description: "Sports goods and fitness equipment",
    website: "https://www.cosco.in",
    logo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 46,
  },
  {
    name: "Nivia", slug: "nivia",
    description: "Sports gear and accessories",
    website: "https://www.nivia.com",
    logo: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 47,
  },
  {
    name: "Yonex", slug: "yonex",
    description: "Badminton and tennis equipment",
    website: "https://www.yonex.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Yonex_logo.svg",
    is_featured: false, sort_order: 48,
  },

  // Books & Stationery
  {
    name: "Penguin", slug: "penguin",
    description: "World-renowned book publisher",
    website: "https://www.penguin.co.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/Penguin_Random_House_logo.png",
    is_featured: false, sort_order: 49,
  },
  {
    name: "Harper Collins", slug: "harper-collins",
    description: "Leading global book publisher",
    website: "https://www.harpercollins.co.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/HarperCollins.svg",
    is_featured: false, sort_order: 50,
  },

  // Toys
  {
    name: "LEGO", slug: "lego",
    description: "Creative building blocks and toys",
    website: "https://www.lego.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/LEGO_logo.svg",
    is_featured: true, sort_order: 51,
  },
  {
    name: "Hasbro", slug: "hasbro",
    description: "Iconic toys and board games",
    website: "https://www.hasbro.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Hasbro_logo.svg",
    is_featured: false, sort_order: 52,
  },
  {
    name: "Fisher-Price", slug: "fisher-price",
    description: "Baby and toddler toys",
    website: "https://www.fisher-price.com",
    logo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 53,
  },

  // Automotive
  {
    name: "Bosch Auto", slug: "bosch-auto",
    description: "Automotive parts and accessories",
    website: "https://www.bosch-automotive.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Bosch_logo_simple.svg",
    is_featured: false, sort_order: 54,
  },
  {
    name: "Meguiar's", slug: "meguiars",
    description: "Car care and detailing products",
    website: "https://www.meguiars.com",
    logo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop&q=80",
    is_featured: false, sort_order: 55,
  },
  {
    name: "3M", slug: "3m",
    description: "Automotive tapes, films and accessories",
    website: "https://www.3mindia.in",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/3M_wordmark.svg",
    is_featured: false, sort_order: 56,
  },
];

async function seedBrands() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    console.log("\nSeeding brands...");
    let seeded = 0;

    for (const brand of brands) {
      await Brand.findOneAndUpdate(
        { slug: brand.slug },
        brand,
        { upsert: true, new: true }
      );
      seeded++;
    }

    const total = await Brand.countDocuments();
    console.log(`✅ ${seeded} brands seeded`);
    console.log(`\n🎉 Total brands in DB: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding brands:", err);
    process.exit(1);
  }
}

seedBrands();
