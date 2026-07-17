// ─── Shared Electronics product data ─────────────────────────────────────────
// Imported by Electronics.jsx for the category listing page.
// _id must be a string so it works with publicCartSlice / publicWishlistSlice.

export const electronicsProducts = [
  {
    _id: "e1", id: 1, name: "Samsung Galaxy S24 Ultra", brand: "Samsung",
    price: 89999, mrp: 124999, rating: 4.7, reviews: 8420, badge: "Best Seller",
    img: "📱", tag: "mobiles",
    sizes: ["One Size"],
    colors: [
      { name: "Titanium Black", hex: "#1a1a1a" }, { name: "Titanium Gray", hex: "#6b7280" },
      { name: "Titanium Violet", hex: "#7c3aed" }, { name: "Titanium Yellow", hex: "#d97706" },
    ],
    images: ["📱", "📱✨", "🔵📱", "📱💫", "⚡📱"],
    description: "The Samsung Galaxy S24 Ultra redefines smartphone excellence with its titanium frame, built-in S Pen, and 200MP camera system. Powered by Snapdragon 8 Gen 3, it delivers unmatched performance with AI-enhanced photography and a stunning 6.8\" Dynamic AMOLED 2X display.",
    highlights: ["200MP Quad Camera System", "Built-in S Pen", "Snapdragon 8 Gen 3 Processor", "6.8\" Dynamic AMOLED 2X Display", "5000mAh Battery with 45W Charging"],
    seller: "Samsung India Official", deliveryDays: 2,
    stock: 150,
    coupons: [
      { code: "SAMSUNG10", desc: "10% off on Samsung", discount: 10, type: "percent" },
      { code: "MOBILE500", desc: "₹500 off on Mobiles", discount: 500, type: "flat" },
    ],
    bankOffers: ["10% off on HDFC Credit Cards", "No Cost EMI on SBI Cards", "5% Cashback on Paytm"],
    specifications: { Display: "6.8\" Dynamic AMOLED 2X", Processor: "Snapdragon 8 Gen 3", RAM: "12GB", Storage: "256GB/512GB/1TB", Camera: "200MP + 12MP + 10MP + 10MP", Battery: "5000mAh" },
  },
  {
    _id: "e2", id: 2, name: "Apple MacBook Air M3", brand: "Apple",
    price: 114900, mrp: 134900, rating: 4.8, reviews: 5630, badge: "Top Rated",
    img: "💻", tag: "laptops",
    sizes: ["One Size"],
    colors: [
      { name: "Midnight", hex: "#1a1a2e" }, { name: "Starlight", hex: "#f5f0e8" },
      { name: "Space Gray", hex: "#6b7280" }, { name: "Sky Blue", hex: "#7dd3fc" },
    ],
    images: ["💻", "💻✨", "🍎💻", "💻🔋", "💻⚡", "💻🌟"],
    description: "The MacBook Air with M3 chip delivers incredible performance and up to 18 hours of battery life. Featuring a 13.6\" Liquid Retina display, fanless design and 8-core CPU, it's the world's best consumer laptop for productivity and creativity.",
    highlights: ["Apple M3 8-Core CPU", "Up to 18 Hours Battery", "13.6\" Liquid Retina Display", "Fanless Silent Design", "MagSafe 3 Charging"],
    seller: "Apple Authorized Reseller", deliveryDays: 3,
    stock: 80,
    coupons: [
      { code: "APPLE5", desc: "5% off on Apple Products", discount: 5, type: "percent" },
      { code: "LAPTOP1000", desc: "₹1000 off on Laptops", discount: 1000, type: "flat" },
    ],
    bankOffers: ["No Cost EMI on HDFC Cards", "10% off on Axis Bank Credit Cards", "5% Cashback on Amazon Pay"],
    specifications: { Chip: "Apple M3", CPU: "8-Core", GPU: "10-Core", RAM: "8GB/16GB/24GB", Storage: "256GB/512GB/1TB/2TB SSD", Display: "13.6\" Liquid Retina" },
  },
  {
    _id: "e3", id: 3, name: "Sony WH-1000XM5 Headphones", brand: "Sony",
    price: 24990, mrp: 34990, rating: 4.6, reviews: 3210, badge: "Trending",
    img: "🎧", tag: "audio",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" }, { name: "Silver", hex: "#e5e7eb" },
      { name: "Midnight Blue", hex: "#1e3a5f" },
    ],
    images: ["🎧", "🎧✨", "🔊🎧", "🎧💫", "🎵🎧"],
    description: "The Sony WH-1000XM5 features industry-leading noise cancellation with 8 microphones and two processors. With up to 30 hours of battery life, multipoint connection for two devices, and Crystal Sound for extraordinary audio quality, it's the ultimate wireless headphone.",
    highlights: ["Industry-Leading Noise Cancellation", "30 Hours Battery Life", "8 Microphones for Clear Calls", "Multipoint Bluetooth Connection", "Comfortable All-Day Wear"],
    seller: "Sony India Official", deliveryDays: 3,
    stock: 120,
    coupons: [
      { code: "SONY15", desc: "15% off on Sony Audio", discount: 15, type: "percent" },
      { code: "AUDIO200", desc: "₹200 off on Audio Products", discount: 200, type: "flat" },
    ],
    bankOffers: ["10% off on ICICI Credit Cards", "5% Cashback on PhonePe"],
    specifications: { Type: "Over-Ear Wireless", "Noise Cancellation": "Yes - Industry Leading", Battery: "30 Hours", Connectivity: "Bluetooth 5.2", Weight: "250g", "Foldable": "Yes" },
  },
  {
    _id: "e4", id: 4, name: "LG OLED 55\" 4K TV", brand: "LG",
    price: 89999, mrp: 149999, rating: 4.7, reviews: 2150, badge: "Best Seller",
    img: "📺", tag: "tv",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
    ],
    images: ["📺", "📺✨", "🎬📺", "📺💫", "🎮📺", "📺🌟"],
    description: "Experience cinema-quality visuals with the LG OLED55C3PSA. Self-lit OLED pixels deliver perfect black levels and infinite contrast ratio. Features Dolby Vision IQ, Dolby Atmos, NVIDIA G-Sync compatibility and WebOS smart platform for an unmatched 4K experience.",
    highlights: ["Self-Lit OLED Pixels", "Perfect Black & Infinite Contrast", "Dolby Vision IQ + Dolby Atmos", "NVIDIA G-Sync Compatible", "WebOS Smart TV Platform"],
    seller: "LG India Official", deliveryDays: 5,
    stock: 45,
    coupons: [
      { code: "LG10", desc: "10% off on LG TVs", discount: 10, type: "percent" },
      { code: "TV2000", desc: "₹2000 off on Smart TVs", discount: 2000, type: "flat" },
    ],
    bankOffers: ["No Cost EMI on SBI Cards up to 24 months", "10% off on HDFC Credit Cards", "₹5000 Cashback on Kotak Cards"],
    specifications: { Display: "55\" OLED 4K", Resolution: "3840 x 2160", "Refresh Rate": "120Hz", HDR: "Dolby Vision IQ / HDR10", Sound: "Dolby Atmos 2.2ch 60W", "Smart Platform": "WebOS" },
  },
  {
    _id: "e5", id: 5, name: "Canon EOS R50 Camera", brand: "Canon",
    price: 59999, mrp: 79999, rating: 4.5, reviews: 1480, badge: "New",
    img: "📷", tag: "cameras",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" }, { name: "White", hex: "#f5f5f5" },
    ],
    images: ["📷", "📷✨", "🌄📷", "📷💫", "📸📷"],
    description: "The Canon EOS R50 is a compact mirrorless camera ideal for content creators and photography enthusiasts. With a 24.2MP APS-C sensor, 4K video recording, in-body image stabilization, and intelligent tracking AF covering 651 focus zones, it captures every moment perfectly.",
    highlights: ["24.2MP APS-C CMOS Sensor", "4K Video @ 30fps", "651-Zone Intelligent AF", "In-body Image Stabilization", "Vari-angle LCD Touchscreen"],
    seller: "Canon India Official", deliveryDays: 4,
    stock: 60,
    coupons: [
      { code: "CANON10", desc: "10% off on Canon Cameras", discount: 10, type: "percent" },
      { code: "CAMERA500", desc: "₹500 off on Cameras", discount: 500, type: "flat" },
    ],
    bankOffers: ["No Cost EMI on HDFC Cards", "10% off on Axis Bank Cards"],
    specifications: { Sensor: "24.2MP APS-C CMOS", Autofocus: "651-Zone Dual Pixel II", Video: "4K 30fps / FHD 120fps", Stabilization: "In-body IS", Screen: "2.95\" Vari-Angle LCD", Weight: "375g" },
  },
  {
    _id: "e6", id: 6, name: "Apple iPad Pro 12.9\"", brand: "Apple",
    price: 109900, mrp: 129900, rating: 4.8, reviews: 3740, badge: "Top Rated",
    img: "📱", tag: "tablets",
    sizes: ["One Size"],
    colors: [
      { name: "Space Gray", hex: "#374151" }, { name: "Silver", hex: "#e5e7eb" },
    ],
    images: ["📱", "🍎📱", "📱✨", "📱💫", "✏️📱"],
    description: "The iPad Pro 12.9\" with M2 chip delivers desktop-class performance. Featuring a stunning Liquid Retina XDR ProMotion display, Apple Pencil hover and USB 3 connectivity. Perfect for creative professionals, designers and power users demanding the absolute best tablet experience.",
    highlights: ["Apple M2 Chip", "12.9\" Liquid Retina XDR Display", "ProMotion 120Hz Adaptive", "Apple Pencil Hover (2nd Gen)", "Wi-Fi 6E Connectivity"],
    seller: "Apple Authorized Reseller", deliveryDays: 3,
    stock: 55,
    coupons: [
      { code: "APPLE5", desc: "5% off on Apple Products", discount: 5, type: "percent" },
    ],
    bankOffers: ["No Cost EMI on HDFC Cards", "10% off on Citibank Credit Cards"],
    specifications: { Chip: "Apple M2", Display: "12.9\" Liquid Retina XDR", Resolution: "2732 x 2048", Storage: "128GB/256GB/512GB/1TB/2TB", Camera: "12MP Wide + 10MP Ultra Wide", Connectivity: "Wi-Fi 6E + Optional 5G" },
  },
  {
    _id: "e7", id: 7, name: "boAt Airdopes 141 TWS", brand: "boAt",
    price: 999, mrp: 1999, rating: 4.2, reviews: 52400, badge: "Trending",
    img: "🎵", tag: "audio",
    sizes: ["One Size"],
    colors: [
      { name: "Bold Black", hex: "#1a1a1a" }, { name: "Active Black", hex: "#374151" },
      { name: "White", hex: "#f5f5f5" }, { name: "Navy Blue", hex: "#1e3a5f" },
    ],
    images: ["🎵", "🎵✨", "🎧🎵", "🎵💫", "🎶🎵"],
    description: "The boAt Airdopes 141 offers an impressive 42-hour total playback with its charging case. Featuring BEAST Mode for 60ms ultra-low latency gaming, 8mm audio drivers for punchy bass, and IPX4 water resistance. The perfect budget TWS earbuds for music, calls and gaming.",
    highlights: ["42 Hours Total Playback", "BEAST Mode 60ms Low Latency", "8mm Immersive Audio Drivers", "IPX4 Water Resistance", "Touch Controls"],
    seller: "boAt Official Store", deliveryDays: 2,
    stock: 500,
    coupons: [
      { code: "BOAT20", desc: "20% off on boAt Products", discount: 20, type: "percent" },
      { code: "AUDIO100", desc: "₹100 off on Audio", discount: 100, type: "flat" },
    ],
    bankOffers: ["5% Cashback on Paytm", "Extra 10% off on RuPay Cards"],
    specifications: { Type: "True Wireless Earbuds", Drivers: "8mm", "Battery (Buds)": "6 Hours", "Battery (Case)": "42 Hours Total", "Latency": "60ms BEAST Mode", "Water Resistance": "IPX4" },
  },
  {
    _id: "e8", id: 8, name: "Dell XPS 15 Laptop", brand: "Dell",
    price: 159990, mrp: 189990, rating: 4.5, reviews: 2100, badge: "",
    img: "💻", tag: "laptops",
    sizes: ["One Size"],
    colors: [
      { name: "Platinum Silver", hex: "#e5e7eb" }, { name: "Frost", hex: "#f3f4f6" },
    ],
    images: ["💻", "💻✨", "⚡💻", "💻🔋", "💻🌟", "💎💻"],
    description: "The Dell XPS 15 combines stunning InfinityEdge OLED display with Intel Core i7 13th Gen performance. With NVIDIA GeForce RTX 4060 graphics, 32GB DDR5 RAM and a premium machined aluminum chassis, it's the ideal powerhouse laptop for creative professionals and developers.",
    highlights: ["15.6\" OLED InfinityEdge Display", "Intel Core i7-13700H Processor", "NVIDIA GeForce RTX 4060 8GB", "32GB DDR5 RAM", "1TB NVMe SSD"],
    seller: "Dell India Official", deliveryDays: 4,
    stock: 35,
    coupons: [
      { code: "DELL10", desc: "10% off on Dell Laptops", discount: 10, type: "percent" },
    ],
    bankOffers: ["No Cost EMI on SBI Cards up to 18 months", "10% off on HDFC Debit Cards"],
    specifications: { Display: "15.6\" OLED 3.5K 60Hz", Processor: "Intel Core i7-13700H", Graphics: "NVIDIA RTX 4060 8GB", RAM: "32GB DDR5", Storage: "1TB NVMe SSD", Battery: "86Whr" },
  },
  {
    _id: "e9", id: 9, name: "OnePlus 12 5G", brand: "OnePlus",
    price: 64999, mrp: 69999, rating: 4.5, reviews: 6320, badge: "New",
    img: "📱", tag: "mobiles",
    sizes: ["One Size"],
    colors: [
      { name: "Silky Black", hex: "#1a1a1a" }, { name: "Flowy Emerald", hex: "#059669" },
    ],
    images: ["📱", "📱⚡", "📱✨", "📱💫", "🔥📱"],
    description: "The OnePlus 12 5G is powered by Snapdragon 8 Gen 3 with up to 16GB RAM and 256GB storage. Featuring a 6.82\" LTPO AMOLED display, Hasselblad-tuned 50MP camera triple system, 100W SUPERVOOC charging, and 50W AIRVOOC wireless charging for a premium flagship experience.",
    highlights: ["Snapdragon 8 Gen 3 Processor", "50MP Hasselblad Camera System", "100W SUPERVOOC Wired Charging", "50W AIRVOOC Wireless Charging", "6.82\" LTPO AMOLED Display"],
    seller: "OnePlus India Official", deliveryDays: 2,
    stock: 200,
    coupons: [
      { code: "ONEPLUS10", desc: "10% off on OnePlus", discount: 10, type: "percent" },
      { code: "MOBILE500", desc: "₹500 off on Mobiles", discount: 500, type: "flat" },
    ],
    bankOffers: ["10% off on ICICI Cards", "No Cost EMI on HDFC Cards"],
    specifications: { Display: "6.82\" LTPO 3 AMOLED 120Hz", Processor: "Snapdragon 8 Gen 3", RAM: "12GB/16GB", Storage: "256GB/512GB", Camera: "50MP + 48MP + 64MP", Battery: "5400mAh + 100W" },
  },
  {
    _id: "e10", id: 10, name: "Sony Bravia 43\" LED TV", brand: "Sony",
    price: 45990, mrp: 64990, rating: 4.4, reviews: 3890, badge: "Sale",
    img: "📺", tag: "tv",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
    ],
    images: ["📺", "📺✨", "🎬📺", "📺🎮", "📺💫"],
    description: "The Sony Bravia 43\" 4K LED TV with X-Reality PRO upscaling and Triluminos Pro display technology brings vibrant colors to every scene. Powered by the X1 processor, Google TV smart platform, and Dolby Audio, it delivers a premium viewing experience for every family.",
    highlights: ["4K X-Reality PRO Processing", "Google TV Smart Platform", "Dolby Audio Sound", "Triluminos Pro Display", "Works with Alexa & Google Assistant"],
    seller: "Sony India Official", deliveryDays: 4,
    stock: 70,
    coupons: [
      { code: "SONY15", desc: "15% off on Sony", discount: 15, type: "percent" },
      { code: "TV1000", desc: "₹1000 off on TVs", discount: 1000, type: "flat" },
    ],
    bankOffers: ["No Cost EMI on Kotak Cards", "10% off on SBI Credit Cards"],
    specifications: { Display: "43\" LED 4K", Resolution: "3840 x 2160", Processor: "X1", HDR: "HDR10 / HLG", Sound: "Dolby Audio 20W", "Smart Platform": "Google TV" },
  },
  {
    _id: "e11", id: 11, name: "GoPro Hero 12 Black", brand: "GoPro",
    price: 34990, mrp: 44990, rating: 4.6, reviews: 1870, badge: "",
    img: "📷", tag: "cameras",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" },
    ],
    images: ["📷", "📷✨", "🏄📷", "📷💧", "📷🔥", "🏔️📷"],
    description: "GoPro Hero 12 Black shoots stunning 5.3K video and 27MP photos with advanced HyperSmooth 6.0 stabilization. Waterproof to 10m without a case, with front and rear displays, and compatibility with all GoPro accessories. Perfect for adventure sports and content creation.",
    highlights: ["5.3K60 + 4K120 Video", "27MP Photos", "HyperSmooth 6.0 Stabilization", "Waterproof to 10 Meters", "Front & Rear LCD Displays"],
    seller: "GoPro India Official", deliveryDays: 3,
    stock: 90,
    coupons: [
      { code: "GOPRO10", desc: "10% off on GoPro", discount: 10, type: "percent" },
    ],
    bankOffers: ["5% off on Axis Cards", "No Cost EMI on HDFC Cards"],
    specifications: { Video: "5.3K60 / 4K120 / 2.7K240", Photo: "27MP", Stabilization: "HyperSmooth 6.0", "Waterproof": "10m Without Case", Battery: "Enduro 1720mAh", Weight: "154g" },
  },
  {
    _id: "e12", id: 12, name: "JBL Flip 6 Bluetooth Speaker", brand: "JBL",
    price: 13999, mrp: 19999, rating: 4.5, reviews: 9840, badge: "Sale",
    img: "🔊", tag: "audio",
    sizes: ["One Size"],
    colors: [
      { name: "Black", hex: "#1a1a1a" }, { name: "Blue", hex: "#3b82f6" },
      { name: "Red", hex: "#ef4444" }, { name: "Teal", hex: "#0d9488" },
      { name: "Pink", hex: "#ec4899" },
    ],
    images: ["🔊", "🔊✨", "🎵🔊", "🔊💦", "🔊🔥", "🎶🔊"],
    description: "JBL Flip 6 delivers bold and loud JBL Original Pro Sound with 2-way speaker system. Featuring IP67 dust and waterproof rating, PartyBoost to link multiple JBL speakers, and 12 hours of playtime. The racetrack-shaped woofer and separate tweeter produce crisp highs and deep bass.",
    highlights: ["2-Way Speaker System", "IP67 Dustproof & Waterproof", "12 Hours Playtime", "PartyBoost Multi-Speaker Link", "USB-C Charging"],
    seller: "JBL India Official", deliveryDays: 2,
    stock: 180,
    coupons: [
      { code: "JBL15", desc: "15% off on JBL Products", discount: 15, type: "percent" },
      { code: "SPEAKER300", desc: "₹300 off on Speakers", discount: 300, type: "flat" },
    ],
    bankOffers: ["10% off on HDFC Cards", "5% Cashback on Paytm"],
    specifications: { Output: "30W RMS", Drivers: "Woofer + Tweeter", Battery: "12 Hours", Waterproofing: "IP67", Connectivity: "Bluetooth 5.1", Weight: "550g" },
  },
];

export const discount = (p, m) => Math.round(((m - p) / m) * 100);

export const badgeColor = (b) => {
  if (b === "Best Seller") return "bg-amber-500 text-white";
  if (b === "Trending")    return "bg-rose-500 text-white";
  if (b === "New")         return "bg-emerald-500 text-white";
  if (b === "Top Rated")   return "bg-blue-600 text-white";
  if (b === "Sale")        return "bg-orange-500 text-white";
  return "";
};
