/**
 * seedMobiles.js — 100 Mobiles & Accessories Products
 * Run: node server/seeders/seedMobiles.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  phone:   ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80","https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80","https://images.unsplash.com/photo-1598327106026-848a11c3e8b3?w=600&q=80","https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80"],
  iphone:  ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80","https://images.unsplash.com/photo-1574755393849-623942496936?w=600&q=80","https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80","https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80"],
  samsung: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80","https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80","https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80","https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&q=80"],
  watch:   ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80","https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80","https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80","https://images.unsplash.com/photo-1617625785292-eb4e0b27d285?w=600&q=80"],
  tablet:  ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80","https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80","https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80","https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=600&q=80"],
  charger: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80","https://images.unsplash.com/photo-1592890288564-76628a30a657?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1631949454967-6c89abdb5637?w=600&q=80"],
  cover:   ["https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&q=80","https://images.unsplash.com/photo-1601593346740-925612772716?w=600&q=80","https://images.unsplash.com/photo-1586495777744-4e6232bf4987?w=600&q=80","https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 200, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── APPLE iPhones (1-8) ───────────────────────────────────────────────────────
p("iphone","Apple iPhone 15 128GB","Apple",74900,79900,100,[{key:"Chip",value:"A16 Bionic"},{key:"Camera",value:"48 MP Main"},{key:"Display",value:"6.1 inch Super Retina XDR"},{key:"Storage",value:"128 GB"}],["iphone","apple","smartphone"],{is_featured:true,is_bestseller:true}),
p("iphone","Apple iPhone 15 Plus 256GB","Apple",84900,89900,80,[{key:"Chip",value:"A16 Bionic"},{key:"Camera",value:"48 MP Main"},{key:"Display",value:"6.7 inch Super Retina XDR"},{key:"Storage",value:"256 GB"}],["iphone","apple","plus"],{is_featured:true}),
p("iphone","Apple iPhone 15 Pro 256GB","Apple",134900,144900,60,[{key:"Chip",value:"A17 Pro"},{key:"Camera",value:"48 MP ProRAW"},{key:"Frame",value:"Titanium"},{key:"Feature",value:"Action Button"}],["iphone","apple","pro","titanium"],{is_featured:true}),
p("iphone","Apple iPhone 15 Pro Max 256GB","Apple",159900,169900,40,[{key:"Chip",value:"A17 Pro"},{key:"Camera",value:"48+12+12 MP Tetraprism"},{key:"Display",value:"6.7 inch ProMotion"},{key:"Frame",value:"Titanium"}],["iphone","apple","pro-max"],{is_featured:true}),
p("iphone","Apple iPhone 14 128GB","Apple",64900,79900,120,[{key:"Chip",value:"A15 Bionic"},{key:"Camera",value:"12 MP Dual"},{key:"Display",value:"6.1 inch Super Retina XDR"},{key:"Battery",value:"3279 mAh"}],["iphone","apple","14"],{is_bestseller:true}),
p("iphone","Apple iPhone 14 Plus 256GB","Apple",74900,89900,80,[{key:"Chip",value:"A15 Bionic"},{key:"Camera",value:"12 MP Dual"},{key:"Display",value:"6.7 inch"},{key:"Battery",value:"4323 mAh"}],["iphone","apple","14-plus"]),
p("iphone","Apple iPhone 13 128GB","Apple",54900,69900,150,[{key:"Chip",value:"A15 Bionic"},{key:"Camera",value:"12 MP Dual OIS"},{key:"Display",value:"6.1 inch OLED"},{key:"Storage",value:"128 GB"}],["iphone","apple","13"],{is_bestseller:true}),
p("iphone","Apple iPhone SE 3rd Gen 64GB","Apple",43900,49900,120,[{key:"Chip",value:"A15 Bionic"},{key:"Camera",value:"12 MP"},{key:"Display",value:"4.7 inch Retina HD"},{key:"Feature",value:"Touch ID"}],["iphone","apple","se","compact"]),
// ── SAMSUNG (9-18) ────────────────────────────────────────────────────────────
p("samsung","Samsung Galaxy S24 Ultra 256GB","Samsung",134999,144999,50,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"200 MP Quad"},{key:"Display",value:"6.8 inch Dynamic AMOLED"},{key:"Feature",value:"S Pen Built-in"}],["samsung","galaxy","s24","ultra"],{is_featured:true}),
p("samsung","Samsung Galaxy S24+ 256GB","Samsung",99999,109999,60,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+10+12 MP"},{key:"Display",value:"6.7 inch AMOLED 120Hz"},{key:"Battery",value:"4900 mAh"}],["samsung","galaxy","s24-plus"],{is_featured:true}),
p("samsung","Samsung Galaxy S24 256GB","Samsung",74999,79999,80,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+10+12 MP"},{key:"Display",value:"6.2 inch AMOLED 120Hz"},{key:"Battery",value:"4000 mAh"}],["samsung","galaxy","s24"]),
p("samsung","Samsung Galaxy S23 FE 128GB","Samsung",44999,54999,100,[{key:"Processor",value:"Exynos 2200"},{key:"Camera",value:"50+10+12 MP"},{key:"Display",value:"6.4 inch AMOLED 120Hz"},{key:"Battery",value:"4500 mAh"}],["samsung","galaxy","s23","fan-edition"],{is_bestseller:true}),
p("samsung","Samsung Galaxy A55 5G 256GB","Samsung",37999,44999,120,[{key:"Processor",value:"Exynos 1480"},{key:"Camera",value:"50+12+5 MP"},{key:"Display",value:"6.6 inch AMOLED 120Hz"},{key:"Battery",value:"5000 mAh"}],["samsung","galaxy","a55","5g"]),
p("samsung","Samsung Galaxy A35 5G 128GB","Samsung",25999,31999,150,[{key:"Processor",value:"Exynos 1380"},{key:"Camera",value:"50+8+5 MP"},{key:"Display",value:"6.6 inch AMOLED 120Hz"},{key:"Battery",value:"5000 mAh"}],["samsung","galaxy","a35","5g"]),
p("samsung","Samsung Galaxy M55 5G 256GB","Samsung",29999,36999,130,[{key:"Processor",value:"Snapdragon 7 Gen 1"},{key:"Camera",value:"50+8+2 MP"},{key:"Display",value:"6.7 inch AMOLED 120Hz"},{key:"Battery",value:"5000 mAh"}],["samsung","galaxy","m55"]),
p("samsung","Samsung Galaxy F55 5G 256GB","Samsung",26999,33999,140,[{key:"Processor",value:"Snapdragon 7 Gen 1"},{key:"Camera",value:"50+8+2 MP"},{key:"Display",value:"6.7 inch AMOLED"},{key:"Battery",value:"5000 mAh"}],["samsung","galaxy","f55"]),
p("samsung","Samsung Galaxy A15 5G 128GB","Samsung",15999,19999,200,[{key:"Processor",value:"Dimensity 6100+"},{key:"Camera",value:"50+5+2 MP"},{key:"Display",value:"6.5 inch AMOLED 90Hz"},{key:"Battery",value:"5000 mAh"}],["samsung","galaxy","a15","budget"]),
p("samsung","Samsung Galaxy M35 5G 128GB","Samsung",19999,24999,180,[{key:"Processor",value:"Exynos 1380"},{key:"Camera",value:"50+8+2 MP"},{key:"Display",value:"6.6 inch AMOLED 120Hz"},{key:"Battery",value:"6000 mAh"}],["samsung","galaxy","m35"]),
p("samsung","Samsung Galaxy Z Fold 5 512GB","Samsung",164999,174999,20,[{key:"Processor",value:"Snapdragon 8 Gen 2"},{key:"Display",value:"7.6 inch QXGA+ Foldable"},{key:"Camera",value:"50+10+12 MP"},{key:"RAM",value:"12 GB"}],["samsung","galaxy","fold","foldable"],{is_featured:true}),
// ── OnePlus (19-25) ───────────────────────────────────────────────────────────
p("phone","OnePlus 12 256GB","OnePlus",64999,69999,80,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+48+64 MP Hasselblad"},{key:"Charging",value:"100W SUPERVOOC"},{key:"Battery",value:"5400 mAh"}],["oneplus","flagship"],{is_featured:true}),
p("phone","OnePlus 12R 128GB","OnePlus",39999,44999,100,[{key:"Processor",value:"Snapdragon 8 Gen 1"},{key:"Camera",value:"50+8+2 MP"},{key:"Charging",value:"80W SUPERVOOC"},{key:"Battery",value:"5500 mAh"}],["oneplus","12r"],{is_bestseller:true}),
p("phone","OnePlus Nord CE4 Lite 5G 128GB","OnePlus",19999,24999,150,[{key:"Processor",value:"Snapdragon 695"},{key:"Camera",value:"50+2 MP"},{key:"Charging",value:"80W SUPERVOOC"},{key:"Battery",value:"5110 mAh"}],["oneplus","nord","budget"]),
p("phone","OnePlus Nord 4 256GB","OnePlus",29999,34999,120,[{key:"Processor",value:"Snapdragon 7+ Gen 3"},{key:"Camera",value:"50+8 MP"},{key:"Charging",value:"100W"},{key:"Battery",value:"5500 mAh"}],["oneplus","nord","5g"]),
p("phone","OnePlus Open 512GB Foldable","OnePlus",139999,149999,15,[{key:"Processor",value:"Snapdragon 8 Gen 2"},{key:"Display",value:"7.82 inch Foldable LTPO"},{key:"Camera",value:"48+64+48 MP Hasselblad"},{key:"RAM",value:"16 GB"}],["oneplus","open","foldable"],{is_featured:true}),
p("phone","OnePlus Nord CE 3 Lite 5G 128GB","OnePlus",17999,22999,180,[{key:"Processor",value:"Snapdragon 695"},{key:"Camera",value:"108+2+2 MP"},{key:"Charging",value:"67W SUPERVOOC"},{key:"Battery",value:"5000 mAh"}],["oneplus","nord","budget"]),
p("phone","OnePlus Ace 2V 256GB","OnePlus",27999,34999,100,[{key:"Processor",value:"Dimensity 9000"},{key:"Camera",value:"64+8+2 MP"},{key:"Charging",value:"80W"},{key:"Battery",value:"5000 mAh"}],["oneplus","ace","5g"]),
// ── Xiaomi & Redmi (26-34) ────────────────────────────────────────────────────
p("phone","Xiaomi 14 Pro 512GB","Xiaomi",84999,94999,50,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+50+50 MP Leica"},{key:"Charging",value:"120W HyperCharge"},{key:"Display",value:"6.73 inch LTPO OLED"}],["xiaomi","14-pro","leica"],{is_featured:true}),
p("phone","Xiaomi 14 256GB","Xiaomi",64999,69999,70,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+50+50 MP Leica"},{key:"Charging",value:"90W"},{key:"Display",value:"6.36 inch OLED"}],["xiaomi","14","leica"]),
p("phone","Redmi Note 13 Pro 5G 256GB","Xiaomi",26999,31999,150,[{key:"Processor",value:"Snapdragon 7s Gen 2"},{key:"Camera",value:"200+8+2 MP"},{key:"Charging",value:"67W"},{key:"Display",value:"6.67 inch AMOLED 120Hz"}],["xiaomi","redmi","note13-pro"],{is_bestseller:true}),
p("phone","Redmi Note 13 Pro+ 5G 256GB","Xiaomi",31999,38999,120,[{key:"Processor",value:"Dimensity 7200 Ultra"},{key:"Camera",value:"200+8+2 MP"},{key:"Charging",value:"120W HyperCharge"},{key:"Display",value:"6.67 inch AMOLED"}],["xiaomi","redmi","note13-pro-plus"]),
p("phone","Redmi 13C 5G 128GB","Xiaomi",11999,15999,250,[{key:"Processor",value:"Dimensity 6100+"},{key:"Camera",value:"50+2 MP"},{key:"Battery",value:"5000 mAh"},{key:"Display",value:"6.74 inch HD+"}],["xiaomi","redmi","budget","5g"]),
p("phone","Poco X6 Pro 5G 256GB","Xiaomi",26999,32999,130,[{key:"Processor",value:"Dimensity 8300 Ultra"},{key:"Camera",value:"64+8+2 MP"},{key:"Display",value:"6.67 inch AMOLED 144Hz"},{key:"Charging",value:"67W"}],["poco","x6-pro","gaming"]),
p("phone","Poco M6 Pro 5G 128GB","Xiaomi",13999,17999,200,[{key:"Processor",value:"Dimensity 6080"},{key:"Camera",value:"64+8+2 MP"},{key:"Battery",value:"5000 mAh"},{key:"Charging",value:"44W"}],["poco","m6-pro","budget"]),
p("phone","Redmi A3 64GB","Xiaomi",6999,9999,350,[{key:"Processor",value:"Helio G36"},{key:"Camera",value:"8+0.08 MP"},{key:"Battery",value:"5000 mAh"},{key:"Display",value:"6.71 inch HD+"}],["xiaomi","redmi","a3","ultra-budget"]),
p("phone","Xiaomi 13T Pro 512GB","Xiaomi",59999,69999,60,[{key:"Processor",value:"Dimensity 9200+"},{key:"Camera",value:"50+50+50 MP Leica"},{key:"Charging",value:"144W"},{key:"Display",value:"6.67 inch AMOLED 144Hz"}],["xiaomi","13t-pro","leica"]),
// ── Realme & Vivo & Oppo (35-47) ─────────────────────────────────────────────
p("phone","Realme GT 6T 5G 256GB","Realme",29999,35999,100,[{key:"Processor",value:"Snapdragon 7+ Gen 3"},{key:"Camera",value:"50+8+2 MP"},{key:"Display",value:"6.78 inch AMOLED 120Hz"},{key:"Charging",value:"80W"}],["realme","gt","5g"]),
p("phone","Realme Narzo 70 Pro 5G 128GB","Realme",19999,24999,150,[{key:"Processor",value:"Dimensity 7050"},{key:"Camera",value:"50 MP Sony IMX890"},{key:"Display",value:"6.7 inch AMOLED"},{key:"Charging",value:"67W"}],["realme","narzo","5g"],{is_bestseller:true}),
p("phone","Realme 12 Pro+ 5G 256GB","Realme",24999,29999,130,[{key:"Processor",value:"Snapdragon 7s Gen 2"},{key:"Camera",value:"50+64+8 MP Periscope"},{key:"Display",value:"6.7 inch AMOLED 120Hz"},{key:"Charging",value:"67W"}],["realme","12-pro","periscope"]),
p("phone","Vivo V30 Pro 5G 256GB","Vivo",44999,51999,80,[{key:"Processor",value:"Snapdragon 7 Gen 3"},{key:"Camera",value:"50+50+8 MP Aura Light"},{key:"Display",value:"6.78 inch AMOLED 120Hz"},{key:"Charging",value:"80W"}],["vivo","v30","pro"]),
p("phone","Vivo T3x 5G 128GB","Vivo",12999,15999,200,[{key:"Processor",value:"Snapdragon 6 Gen 1"},{key:"Camera",value:"50+2 MP"},{key:"Battery",value:"6000 mAh"},{key:"Display",value:"6.72 inch LCD 120Hz"}],["vivo","t3x","battery"]),
p("phone","Vivo Y200 5G 256GB","Vivo",21999,26999,130,[{key:"Processor",value:"Snapdragon 4 Gen 1"},{key:"Camera",value:"64+2 MP"},{key:"Battery",value:"5000 mAh 44W"},{key:"Display",value:"6.67 inch AMOLED 120Hz"}],["vivo","y200","5g"]),
p("phone","Oppo Reno 12 Pro 5G 256GB","Oppo",36999,43999,80,[{key:"Processor",value:"Dimensity 7300 Energy"},{key:"Camera",value:"50+50+8 MP"},{key:"Display",value:"6.7 inch AMOLED 120Hz"},{key:"Charging",value:"80W"}],["oppo","reno","pro"]),
p("phone","Oppo A3 Pro 5G 128GB","Oppo",18999,23999,150,[{key:"Processor",value:"Dimensity 7050"},{key:"Camera",value:"50+2 MP"},{key:"Battery",value:"5000 mAh"},{key:"Feature",value:"IP65 Dust/Water Resistant"}],["oppo","a3","5g"]),
p("phone","Oppo Find X7 Ultra 512GB","Oppo",99999,114999,25,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+50+50+50 MP Hasselblad"},{key:"Display",value:"6.82 inch OLED 120Hz"},{key:"Charging",value:"100W + 50W Wireless"}],["oppo","find-x7","ultra","hasselblad"],{is_featured:true}),
p("phone","iQOO 12 5G 256GB","iQOO",52999,59999,70,[{key:"Processor",value:"Snapdragon 8 Gen 3"},{key:"Camera",value:"50+64+50 MP Zeiss"},{key:"Display",value:"6.78 inch LTPO AMOLED 144Hz"},{key:"Charging",value:"120W FlashCharge"}],["iqoo","12","zeiss"],{is_featured:true}),
p("phone","iQOO Neo 9 Pro 5G 256GB","iQOO",34999,39999,90,[{key:"Processor",value:"Snapdragon 8 Gen 2"},{key:"Camera",value:"50+8+2 MP"},{key:"Display",value:"6.78 inch AMOLED 144Hz"},{key:"Charging",value:"120W"}],["iqoo","neo9-pro"]),
p("phone","Nothing Phone 2a 256GB","Nothing",23999,27999,100,[{key:"Processor",value:"Dimensity 7200 Pro"},{key:"Camera",value:"50+50 MP"},{key:"Display",value:"6.7 inch AMOLED 120Hz"},{key:"Feature",value:"Glyph Interface"}],["nothing","phone","2a"]),
p("phone","Nothing Phone 2 256GB","Nothing",39999,44999,70,[{key:"Processor",value:"Snapdragon 8+ Gen 1"},{key:"Camera",value:"50+50 MP"},{key:"Display",value:"6.7 inch LTPO OLED 120Hz"},{key:"Feature",value:"Glyph Interface"}],["nothing","phone","2"]),

// ── Google & Motorola (48-57) ─────────────────────────────────────────────────
p("phone","Google Pixel 8 Pro 256GB","Google",89999,99999,50,[{key:"Processor",value:"Google Tensor G3"},{key:"Camera",value:"50+48+48 MP"},{key:"Updates",value:"7 Years OS"},{key:"Feature",value:"AI Features"}],["google","pixel","8-pro"],{is_featured:true}),
p("phone","Google Pixel 8a 128GB","Google",52999,59999,70,[{key:"Processor",value:"Google Tensor G3"},{key:"Camera",value:"64+13 MP"},{key:"Feature",value:"AI Photo Editing"},{key:"Battery",value:"4492 mAh"}],["google","pixel","8a"]),
p("phone","Google Pixel 7a 128GB","Google",43999,52999,90,[{key:"Processor",value:"Google Tensor G2"},{key:"Camera",value:"64+13 MP"},{key:"Feature",value:"Magic Eraser"},{key:"Display",value:"6.1 inch OLED 90Hz"}],["google","pixel","7a"]),
p("phone","Motorola Edge 50 Pro 256GB","Motorola",29999,35999,100,[{key:"Processor",value:"Snapdragon 7s Gen 2"},{key:"Camera",value:"50+13+10 MP"},{key:"Charging",value:"125W TurboPower"},{key:"Display",value:"6.7 inch pOLED 144Hz"}],["motorola","edge","pro"]),
p("phone","Motorola Razr 50 Ultra 5G","Motorola",99999,114999,25,[{key:"Processor",value:"Snapdragon 8s Gen 3"},{key:"Display",value:"6.9 inch LTPO OLED Foldable"},{key:"Camera",value:"50+13 MP"},{key:"Feature",value:"Flex View Cover Display"}],["motorola","razr","foldable"],{is_featured:true}),
p("phone","Motorola G85 5G 128GB","Motorola",17999,21999,150,[{key:"Processor",value:"Snapdragon 6s Gen 3"},{key:"Camera",value:"50+8 MP"},{key:"Display",value:"6.67 inch AMOLED 120Hz"},{key:"Battery",value:"5000 mAh"}],["motorola","g85","5g"]),
p("phone","Motorola G54 5G 128GB","Motorola",13999,17999,200,[{key:"Processor",value:"Dimensity 7020"},{key:"Camera",value:"50+2 MP"},{key:"Display",value:"6.5 inch 120Hz"},{key:"Battery",value:"6000 mAh"}],["motorola","g54","budget"]),
p("phone","Motorola Edge 40 Neo 256GB","Motorola",19999,24999,130,[{key:"Processor",value:"Dimensity 7030"},{key:"Camera",value:"50+13 MP"},{key:"Display",value:"6.55 inch pOLED 144Hz"},{key:"Rating",value:"IP68"}],["motorola","edge","neo"]),
p("phone","Tecno Pova 6 Pro 5G 256GB","Tecno",20999,25999,150,[{key:"Processor",value:"Dimensity 6080"},{key:"Camera",value:"108+2 MP"},{key:"Battery",value:"6000 mAh 45W"},{key:"Display",value:"6.78 inch AMOLED 144Hz"}],["tecno","pova","5g"]),
p("phone","Infinix Note 40 Pro 5G 256GB","Infinix",21999,26999,140,[{key:"Processor",value:"Dimensity 7020"},{key:"Camera",value:"108+2 MP"},{key:"Charging",value:"100W + MagCharge"},{key:"Battery",value:"4600 mAh"}],["infinix","note","5g"]),
// ── Smart Watches (58-70) ─────────────────────────────────────────────────────
p("watch","Apple Watch Series 9 GPS 45mm","Apple",44900,48900,60,[{key:"Chip",value:"Apple S9"},{key:"Display",value:"45mm Always-On Retina"},{key:"Feature",value:"Double Tap"},{key:"Health",value:"Blood Oxygen + ECG"}],["apple","watch","smartwatch"],{is_featured:true,is_bestseller:true}),
p("watch","Apple Watch Ultra 2 49mm","Apple",89900,94900,25,[{key:"Chip",value:"Apple S9"},{key:"Build",value:"Titanium Case"},{key:"Battery",value:"60 Hours"},{key:"Display",value:"49mm Sapphire Crystal"}],["apple","watch","ultra","titanium"],{is_featured:true}),
p("watch","Apple Watch SE 2nd Gen 40mm","Apple",29900,32900,80,[{key:"Chip",value:"Apple S8"},{key:"Display",value:"40mm Retina"},{key:"Health",value:"Heart Rate + Crash Detection"},{key:"Feature",value:"Family Setup"}],["apple","watch","se"]),
p("watch","Samsung Galaxy Watch 6 Classic 47mm","Samsung",34999,39999,70,[{key:"Processor",value:"Exynos W930"},{key:"Display",value:"47mm Sapphire Crystal"},{key:"Feature",value:"Rotating Bezel"},{key:"Health",value:"BioActive Sensor"}],["samsung","galaxy-watch","classic"],{is_bestseller:true}),
p("watch","Samsung Galaxy Watch 6 40mm","Samsung",24999,29999,90,[{key:"Processor",value:"Exynos W930"},{key:"Health",value:"BioActive Sensor"},{key:"OS",value:"Wear OS 4"},{key:"Battery",value:"300 mAh"}],["samsung","galaxy-watch","6"]),
p("watch","OnePlus Watch 2 Nordic Blue","OnePlus",19999,24999,80,[{key:"Processor",value:"Snapdragon W5"},{key:"Battery",value:"100 Hours"},{key:"OS",value:"Wear OS 4"},{key:"Health",value:"BHR + SpO2 + GPS"}],["oneplus","watch","wear-os"]),
p("watch","Noise ColorFit Ultra 3 Smartwatch","Noise",2499,4999,300,[{key:"Display",value:"2.01 inch AMOLED"},{key:"Battery",value:"7 Days"},{key:"Feature",value:"BT Calling"},{key:"Health",value:"SpO2 + Heart Rate"}],["noise","smartwatch","budget"],{is_bestseller:true}),
p("watch","Boat Wave Curl 3 Smartwatch","boAt",1499,3499,400,[{key:"Display",value:"1.96 inch TFT"},{key:"Battery",value:"7 Days"},{key:"Feature",value:"BT Calling"},{key:"Health",value:"SpO2 + HR Monitor"}],["boat","smartwatch","budget"]),
p("watch","Fastrack Reflex Vox Pro Smartwatch","Fastrack",2999,4999,200,[{key:"Display",value:"1.78 inch AMOLED"},{key:"Battery",value:"5 Days"},{key:"Feature",value:"BT Calling"},{key:"Health",value:"24/7 HR Monitoring"}],["fastrack","smartwatch","amoled"]),
p("watch","Garmin Forerunner 265 Running Watch","Garmin",44999,52999,30,[{key:"Display",value:"1.3 inch AMOLED"},{key:"Battery",value:"15 Days Smartwatch"},{key:"Feature",value:"Advanced Running Metrics"},{key:"GPS",value:"Multi-band GPS"}],["garmin","running","gps","sport"],{is_featured:true}),
p("watch","Fitbit Versa 4 Fitness Smartwatch","Fitbit",13999,17999,80,[{key:"Display",value:"1.58 inch AMOLED"},{key:"Battery",value:"6 Days"},{key:"Health",value:"Daily Readiness Score"},{key:"Feature",value:"Google Wallet + Maps"}],["fitbit","versa","fitness"]),
p("watch","Amazfit GTR 4 Smartwatch","Amazfit",13999,18999,100,[{key:"Display",value:"1.43 inch AMOLED"},{key:"Battery",value:"14 Days"},{key:"GPS",value:"4-system GPS"},{key:"Health",value:"BioTracker 4.0"}],["amazfit","gtr","smartwatch"]),
p("watch","CMF Watch Pro 2 by Nothing","CMF",3999,5999,150,[{key:"Display",value:"1.32 inch AMOLED"},{key:"Battery",value:"11 Days"},{key:"Feature",value:"BT Calling"},{key:"GPS",value:"Built-in GPS"}],["cmf","nothing","watch"]),
// ── Tablets (71-78) ───────────────────────────────────────────────────────────
p("tablet","Apple iPad Pro M4 11-inch 256GB","Apple",99900,109900,30,[{key:"Chip",value:"Apple M4"},{key:"Display",value:"11 inch Ultra Retina XDR OLED"},{key:"Storage",value:"256 GB"},{key:"Thickness",value:"5.3mm"}],["ipad","apple","pro","m4"],{is_featured:true}),
p("tablet","Apple iPad Air M2 11-inch 128GB","Apple",59900,64900,50,[{key:"Chip",value:"Apple M2"},{key:"Display",value:"11 inch Liquid Retina"},{key:"Camera",value:"12 MP Landscape"},{key:"Feature",value:"Landscape FaceTime"}],["ipad","apple","air","m2"]),
p("tablet","Apple iPad 10th Gen WiFi 64GB","Apple",44900,49900,70,[{key:"Chip",value:"A14 Bionic"},{key:"Display",value:"10.9 inch Liquid Retina"},{key:"Camera",value:"12 MP Landscape"},{key:"Connectivity",value:"Wi-Fi 6"}],["ipad","apple","10th-gen"],{is_bestseller:true}),
p("tablet","Samsung Galaxy Tab S9 Ultra 256GB","Samsung",104999,119999,15,[{key:"Processor",value:"Snapdragon 8 Gen 2"},{key:"Display",value:"14.6 inch Dynamic AMOLED 120Hz"},{key:"RAM",value:"12 GB"},{key:"Stylus",value:"S Pen Included"}],["samsung","galaxy-tab","s9-ultra"],{is_featured:true}),
p("tablet","Samsung Galaxy Tab S9 FE 256GB","Samsung",49999,57999,50,[{key:"Processor",value:"Exynos 1380"},{key:"Display",value:"10.9 inch WUXGA+"},{key:"Storage",value:"256 GB"},{key:"Stylus",value:"S Pen Included"}],["samsung","galaxy-tab","s9-fe"]),
p("tablet","OnePlus Pad Go 128GB","OnePlus",19999,24999,80,[{key:"Processor",value:"Helio G99"},{key:"Display",value:"11.35 inch 90Hz"},{key:"Battery",value:"8000 mAh 33W"},{key:"RAM",value:"8 GB"}],["oneplus","pad","budget"]),
p("tablet","Realme Pad X 128GB WiFi","Realme",24999,31999,70,[{key:"Processor",value:"Snapdragon 695"},{key:"Display",value:"11 inch 120Hz IPS"},{key:"Battery",value:"8340 mAh 33W"},{key:"RAM",value:"6 GB"}],["realme","pad-x","5g"]),
p("tablet","Lenovo Tab M11 128GB WiFi","Lenovo",15999,21999,90,[{key:"Processor",value:"Helio G88"},{key:"Display",value:"11 inch 90Hz IPS"},{key:"Battery",value:"7700 mAh"},{key:"Stylus",value:"Compatible with Pen"}],["lenovo","tab","budget"]),
// ── Chargers, Cables & Accessories (79-100) ───────────────────────────────────
p("charger","Apple 20W USB-C Fast Charger","Apple",1900,2200,300,[{key:"Power",value:"20W"},{key:"Port",value:"USB-C"},{key:"Compatible",value:"iPhone 12 and above"},{key:"Certification",value:"MFi Certified"}],["charger","apple","20w","fast-charging"]),
p("charger","Samsung 45W Super Fast Charger","Samsung",2499,2999,250,[{key:"Power",value:"45W"},{key:"Port",value:"USB-C"},{key:"Feature",value:"Super Fast Charging 2.0"},{key:"Compatible",value:"Galaxy S Series"}],["charger","samsung","45w","super-fast"]),
p("charger","Anker 65W GaN Compact Charger","Anker",2999,4499,200,[{key:"Power",value:"65W"},{key:"Ports",value:"2x USB-C + 1x USB-A"},{key:"Technology",value:"GaN II"},{key:"Feature",value:"PowerIQ 3.0"}],["charger","anker","gan","65w"],{is_bestseller:true}),
p("charger","Belkin BoostCharge 30W USB-C PD","Belkin",1999,2999,200,[{key:"Power",value:"30W"},{key:"Port",value:"USB-C PD"},{key:"Feature",value:"Power Delivery 3.0"},{key:"Size",value:"Compact"}],["charger","belkin","30w","pd"]),
p("charger","OnePlus 80W SUPERVOOC Charger","OnePlus",999,1499,300,[{key:"Power",value:"80W"},{key:"Port",value:"USB-C"},{key:"Technology",value:"SUPERVOOC"},{key:"Safety",value:"Multi-level Protection"}],["charger","oneplus","80w","supervooc"]),
p("charger","Portronics Adapto 66W GaN Charger","Portronics",1499,2499,250,[{key:"Power",value:"66W"},{key:"Ports",value:"2x USB-C + 1x USB-A"},{key:"Technology",value:"GaN"},{key:"Feature",value:"PPS Technology"}],["charger","portronics","66w","gan"]),
p("charger","Mivi 10000mAh Power Bank 22.5W","Mivi",999,1999,350,[{key:"Capacity",value:"10000 mAh"},{key:"Input",value:"22.5W Fast Charge"},{key:"Ports",value:"2x USB-A + 1x USB-C"},{key:"Weight",value:"220g"}],["powerbank","mivi","10000mah","budget"],{is_bestseller:true}),
p("charger","Ambrane 20000mAh Power Bank 20W","Ambrane",1499,2999,300,[{key:"Capacity",value:"20000 mAh"},{key:"Input/Output",value:"20W PD"},{key:"Ports",value:"3 Output Ports"},{key:"Feature",value:"LED Battery Indicator"}],["powerbank","ambrane","20000mah"]),
p("charger","boAt Power Bank 20000mAh 18W","boAt",1299,2499,280,[{key:"Capacity",value:"20000 mAh"},{key:"Charging",value:"18W Fast Charge"},{key:"Ports",value:"2x USB-A + 1x Micro"},{key:"Feature",value:"Dual Input"}],["powerbank","boat","20000mah"]),
p("charger","Xiaomi 33W Fast Charger Combo","Xiaomi",799,1299,400,[{key:"Power",value:"33W"},{key:"Port",value:"USB-A"},{key:"Cable",value:"USB-A to Type-C Included"},{key:"Compatible",value:"Xiaomi/Redmi Devices"}],["charger","xiaomi","33w","combo"]),
p("cover","Spigen Tough Armor Case iPhone 15","Spigen",1999,2999,200,[{key:"Material",value:"Polycarbonate + TPU"},{key:"Compatible",value:"iPhone 15"},{key:"Feature",value:"Air Cushion Technology"},{key:"MagSafe",value:"Compatible"}],["case","spigen","iphone","protection"]),
p("cover","Caseology Parallax Samsung S24","Caseology",1499,2499,180,[{key:"Material",value:"TPU + PC"},{key:"Compatible",value:"Samsung Galaxy S24"},{key:"Feature",value:"Geometric Design"},{key:"Drop Protection",value:"Military Grade"}],["case","caseology","samsung","protection"]),
p("cover","Ringke Fusion Clear Case OnePlus 12","Ringke",999,1999,220,[{key:"Material",value:"Clear PC + TPU Bumper"},{key:"Compatible",value:"OnePlus 12"},{key:"Feature",value:"Yellowing Resistant"},{key:"Finish",value:"Crystal Clear"}],["case","ringke","oneplus","clear"]),
p("charger","boAt Type-C to Type-C Cable 1.5m","boAt",349,699,500,[{key:"Length",value:"1.5 Metres"},{key:"Type",value:"USB-C to USB-C"},{key:"Rating",value:"100W PD"},{key:"Durability",value:"Nylon Braided"}],["cable","boat","usbc","braided"]),
p("charger","Anker USB-C to Lightning Cable 1m","Anker",1499,1999,300,[{key:"Length",value:"1 Metre"},{key:"Type",value:"USB-C to Lightning"},{key:"Certification",value:"MFi Certified"},{key:"Speed",value:"Fast Charge Compatible"}],["cable","anker","lightning","mfi"]),
p("charger","Portronics Konnect L PD 1.2m","Portronics",299,599,600,[{key:"Length",value:"1.2 Metres"},{key:"Type",value:"USB-C to Lightning"},{key:"Speed",value:"20W Fast Charge"},{key:"Material",value:"Nylon Braided"}],["cable","portronics","lightning","fast"]),
p("cover","PopSockets Phone Grip Stand Unisex","PopSockets",799,1199,400,[{key:"Type",value:"Phone Grip + Stand"},{key:"Feature",value:"Collapsible 3-step"},{key:"Compatibility",value:"Universal"},{key:"Adhesive",value:"Repositionable"}],["popsocket","grip","universal","stand"]),
p("charger","Ambrane 15W Wireless Charger Pad","Ambrane",799,1499,250,[{key:"Power",value:"15W Max"},{key:"Compatible",value:"Qi-enabled devices"},{key:"Feature",value:"Overcharge Protection"},{key:"LED",value:"Status Indicator"}],["wireless-charger","ambrane","qi","15w"]),
p("cover","Otterbox Commuter Case Samsung S24","Otterbox",3499,4999,100,[{key:"Material",value:"Polycarbonate + Synthetic Rubber"},{key:"Compatible",value:"Samsung Galaxy S24"},{key:"Protection",value:"Drop + Dust Protection"},{key:"Certification",value:"MIL-STD-810H"}],["case","otterbox","samsung","rugged"]),
p("charger","Baseus 65W GaN3 Pro Desktop Charger","Baseus",2799,3999,180,[{key:"Power",value:"65W"},{key:"Ports",value:"2x USB-C + 2x USB-A"},{key:"Technology",value:"GaN3"},{key:"Feature",value:"Intelligent Power Distribution"}],["charger","baseus","65w","4-port"]),
p("charger","URBN 45W GaN Type-C Charger","URBN",1499,2499,220,[{key:"Power",value:"45W"},{key:"Port",value:"USB-C PD"},{key:"Technology",value:"GaN"},{key:"Size",value:"Ultra Compact"}],["charger","urbn","45w","gan"]),
p("cover","Supcase UB Pro Redmi Note 13 Pro","Supcase",1299,1999,160,[{key:"Material",value:"TPU + Polycarbonate"},{key:"Compatible",value:"Redmi Note 13 Pro"},{key:"Feature",value:"Built-in Screen Protector"},{key:"Protection",value:"Rugged Holster"}],["case","supcase","redmi","rugged"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "mobiles")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing mobiles products`);
  let inserted = 0;
  for (const raw of PRODUCTS) {
    const { _brandName, ...data } = raw;
    data.category_id = catId;
    data.brand_id = brandMap[(_brandName||"").toLowerCase()] || defaultBrand;
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) data.slug = data.slug + "-" + Date.now().toString().slice(-4);
    await Product.create(data);
    inserted++;
    process.stdout.write(`\r✍️  Inserted ${inserted}/100`);
  }
  console.log(`\n✅ Done! ${inserted} Mobiles products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
