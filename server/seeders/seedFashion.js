/**
 * seedFashion.js — 100 Fashion Products
 * Run: node server/seeders/seedFashion.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  tshirt: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80"],
  jeans:  ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80","https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80","https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&q=80","https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80"],
  dress:  ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80","https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600&q=80","https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80","https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&q=80"],
  shoes:  ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80","https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80","https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80","https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80"],
  jacket: ["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80","https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&q=80","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80","https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80"],
  kurti:  ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80","https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80","https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=600&q=80"],
  saree:  ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80","https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=80"],
  suit:   ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80","https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80","https://images.unsplash.com/photo-1594938298603-c8148c4b4e25?w=600&q=80","https://images.unsplash.com/photo-1600091166971-7f9faad6c15b?w=600&q=80"],
  hoodie: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80","https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80","https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&q=80","https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=600&q=80"],
  bag:    ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80","https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name,
  slug: toSlug(name),
  short_description: specs.map(s => `${s.key}: ${s.value}`).slice(0, 2).join(", "),
  description: `${name} — premium quality fashion product. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp,
  discount_percent: Math.round(((mrp - price) / mrp) * 100),
  sku: toSlug(name).slice(0, 20).toUpperCase().replace(/-/g, "") + "-" + Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock * 0.1)),
  thumbnail: IMGS[type][0],
  images: IMGS[type],
  tags,
  specifications: specs,
  weight: 300,
  rating_avg: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
  rating_count: Math.floor(50 + Math.random() * 800),
  total_sold: Math.floor(100 + Math.random() * 2000),
  status: true,
  _brandName: brand,
  ...extra,
});

const PRODUCTS = [
// ── T-SHIRTS (1-10) ───────────────────────────────────────────────────────────
p("tshirt","Nike Dri-FIT Training T-Shirt Men","Nike",999,1999,200,[{key:"Material",value:"100% Polyester"},{key:"Fit",value:"Regular"},{key:"Sleeve",value:"Half Sleeve"},{key:"Care",value:"Machine Wash"}],["tshirt","nike","dri-fit","men"],{is_bestseller:true}),
p("tshirt","Adidas Essentials 3-Stripes T-Shirt","Adidas",849,1599,180,[{key:"Material",value:"Cotton Jersey"},{key:"Fit",value:"Regular"},{key:"Collar",value:"Round Neck"},{key:"Gender",value:"Men"}],["tshirt","adidas","men","cotton"]),
p("tshirt","Puma Active Sports Tee Men","Puma",799,1299,150,[{key:"Material",value:"Cotton Blend"},{key:"Fit",value:"Slim"},{key:"Sleeve",value:"Half Sleeve"},{key:"Feature",value:"Moisture Wicking"}],["tshirt","puma","men","active"]),
p("tshirt","H&M Slim Fit Crew-Neck T-Shirt","H&M",499,799,300,[{key:"Material",value:"100% Cotton"},{key:"Fit",value:"Slim Fit"},{key:"Neck",value:"Crew Neck"},{key:"Pack",value:"Single"}],["tshirt","hm","basics","men"]),
p("tshirt","Levi's Graphic Print Round Neck Tee","Levis",899,1499,220,[{key:"Material",value:"100% Cotton"},{key:"Print",value:"Graphic Front"},{key:"Fit",value:"Regular"},{key:"Sleeve",value:"Half"}],["tshirt","levis","graphic","men"]),
p("tshirt","UCB Solid Polo T-Shirt Men","UCB",1299,2499,120,[{key:"Material",value:"Pique Cotton"},{key:"Type",value:"Polo"},{key:"Collar",value:"Polo Collar"},{key:"Fit",value:"Regular"}],["polo","ucb","men","solid"]),
p("tshirt","Peter England Casual T-Shirt","Peter England",699,1299,160,[{key:"Material",value:"Cotton Blend"},{key:"Fit",value:"Regular"},{key:"Sleeve",value:"Half Sleeve"},{key:"Wash",value:"Machine Wash"}],["tshirt","peter-england","casual","men"]),
p("tshirt","Zara Oversized Graphic Tee Unisex","Zara",1499,2499,140,[{key:"Material",value:"100% Cotton"},{key:"Fit",value:"Oversized"},{key:"Print",value:"Graphic"},{key:"Gender",value:"Unisex"}],["tshirt","zara","oversized","unisex"]),
p("tshirt","Van Heusen Athleisure Polo Men","Van Heusen",1199,1999,130,[{key:"Material",value:"Cotton Poly Blend"},{key:"Type",value:"Polo"},{key:"Feature",value:"Quick Dry"},{key:"Fit",value:"Slim"}],["polo","van-heusen","athleisure","men"]),
p("tshirt","Tommy Hilfiger Classic Logo Tee","Tommy Hilfiger",2499,3499,90,[{key:"Material",value:"Premium Cotton"},{key:"Logo",value:"Chest Logo"},{key:"Fit",value:"Regular"},{key:"Origin",value:"Imported"}],["tshirt","tommy","premium","men"],{is_featured:true}),

// ── JEANS (11-20) ─────────────────────────────────────────────────────────────
p("jeans","Levi's 511 Slim Fit Jeans Men","Levis",2299,3499,180,[{key:"Fit",value:"Slim Fit"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"Stretch Denim"},{key:"Wash",value:"Dark Blue"}],["jeans","levis","slim","men"],{is_bestseller:true}),
p("jeans","Lee Regular Fit Straight Jeans Men","Lee",1799,2799,160,[{key:"Fit",value:"Regular"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"100% Cotton Denim"},{key:"Wash",value:"Medium Blue"}],["jeans","lee","regular","men"]),
p("jeans","Wrangler Texas Straight Jeans Men","Wrangler",1599,2499,140,[{key:"Fit",value:"Straight"},{key:"Rise",value:"Regular Rise"},{key:"Fabric",value:"Denim"},{key:"Closure",value:"Zip Fly"}],["jeans","wrangler","straight","men"]),
p("jeans","Pepe Jeans Skinny Fit Low Rise Men","Pepe Jeans",2099,3299,120,[{key:"Fit",value:"Skinny"},{key:"Rise",value:"Low Rise"},{key:"Fabric",value:"Stretch Denim"},{key:"Wash",value:"Dark Indigo"}],["jeans","pepe","skinny","men"]),
p("jeans","Spykar Slim Tapered Jeans Men","Spykar",1399,2199,150,[{key:"Fit",value:"Slim Tapered"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"Denim Blend"},{key:"Wash",value:"Light Blue"}],["jeans","spykar","tapered","men"]),
p("jeans","H&M Skinny High Waist Jeans Women","H&M",1299,2199,200,[{key:"Fit",value:"Skinny"},{key:"Rise",value:"High Waist"},{key:"Fabric",value:"Stretch Denim"},{key:"Gender",value:"Women"}],["jeans","hm","women","skinny"]),
p("jeans","Zara Wide Leg Denim Jeans Women","Zara",2999,4499,100,[{key:"Fit",value:"Wide Leg"},{key:"Rise",value:"High Waist"},{key:"Fabric",value:"Denim"},{key:"Gender",value:"Women"}],["jeans","zara","wide-leg","women"]),
p("jeans","Roadster Relaxed Fit Jeans Unisex","Roadster",999,1799,220,[{key:"Fit",value:"Relaxed"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"Denim"},{key:"Gender",value:"Unisex"}],["jeans","roadster","relaxed","unisex"]),
p("jeans","Flying Machine Jackson Slim Jeans Men","Flying Machine",1699,2599,130,[{key:"Fit",value:"Slim"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"Stretch Denim"},{key:"Wash",value:"Dark"}],["jeans","flying-machine","slim","men"]),
p("jeans","Urbano Fashion Distressed Slim Jeans Men","Urbano",1199,2199,110,[{key:"Fit",value:"Slim"},{key:"Style",value:"Distressed"},{key:"Rise",value:"Mid Rise"},{key:"Fabric",value:"Stretch Denim"}],["jeans","urbano","distressed","men"]),

// ── DRESSES & ETHNIC WEAR (21-35) ─────────────────────────────────────────────
p("dress","Anita Dongre Floral Wrap Dress Women","Anita Dongre",3499,4999,80,[{key:"Fabric",value:"Georgette"},{key:"Pattern",value:"Floral Print"},{key:"Length",value:"Midi"},{key:"Closure",value:"Wrap"}],["dress","women","floral","wrap"],{is_featured:true}),
p("dress","W for Woman A-Line Casual Dress","W",1499,2499,130,[{key:"Fabric",value:"Crepe"},{key:"Pattern",value:"Solid"},{key:"Length",value:"Knee Length"},{key:"Sleeve",value:"Short Sleeve"}],["dress","women","casual","a-line"]),
p("dress","Global Desi Printed Maxi Dress","Global Desi",1799,2999,110,[{key:"Fabric",value:"Viscose Rayon"},{key:"Pattern",value:"Digital Print"},{key:"Length",value:"Maxi"},{key:"Sleeve",value:"Sleeveless"}],["dress","women","maxi","printed"]),
p("dress","AND Summer Slip Dress Women","AND",1999,3299,90,[{key:"Fabric",value:"Chiffon"},{key:"Pattern",value:"Solid"},{key:"Length",value:"Midi"},{key:"Sleeve",value:"Strappy"}],["dress","women","slip","summer"]),
p("kurti","Biba Cotton Anarkali Kurti Women","Biba",1299,2199,200,[{key:"Fabric",value:"Cotton"},{key:"Style",value:"Anarkali"},{key:"Sleeve",value:"3/4 Sleeve"},{key:"Pattern",value:"Embroidered"}],["kurti","women","biba","anarkali"],{is_bestseller:true}),
p("kurti","Libas Rayon Straight Kurta Women","Libas",799,1499,250,[{key:"Fabric",value:"Rayon"},{key:"Style",value:"Straight"},{key:"Length",value:"Calf Length"},{key:"Print",value:"Printed"}],["kurti","women","libas","straight"]),
p("kurti","Sangria Ethnic Motifs Kurta Women","Sangria",999,1799,180,[{key:"Fabric",value:"Cotton Blend"},{key:"Style",value:"A-Line"},{key:"Sleeve",value:"Half Sleeve"},{key:"Pattern",value:"Ethnic Print"}],["kurti","women","sangria","ethnic"]),
p("kurti","Jaipur Kurti Block Print Cotton Women","Jaipur Kurti",1199,1999,160,[{key:"Fabric",value:"Pure Cotton"},{key:"Print",value:"Block Print"},{key:"Sleeve",value:"Elbow Sleeve"},{key:"Length",value:"Long"}],["kurti","women","block-print","cotton"]),
p("kurti","Aurelia Solid Flared Tunic Women","Aurelia",1099,1899,170,[{key:"Fabric",value:"Viscose"},{key:"Style",value:"Flared Tunic"},{key:"Sleeve",value:"3/4 Sleeve"},{key:"Closure",value:"Keyhole"}],["kurti","women","aurelia","tunic"]),
p("saree","Banarasi Silk Woven Saree Women","Ekaya",4999,7999,60,[{key:"Fabric",value:"Pure Banarasi Silk"},{key:"Work",value:"Zari Woven"},{key:"Length",value:"6.3 Meters"},{key:"Blouse",value:"Unstitched Included"}],["saree","women","banarasi","silk"],{is_featured:true}),
p("saree","Cotton Handloom Saree Women","Fabindia",2499,3999,80,[{key:"Fabric",value:"Pure Cotton"},{key:"Style",value:"Handloom"},{key:"Work",value:"Woven"},{key:"Blouse",value:"Unstitched"}],["saree","women","cotton","handloom"]),
p("saree","Georgette Printed Saree Women","Varkala Silk",1299,2199,120,[{key:"Fabric",value:"Georgette"},{key:"Print",value:"Digital Print"},{key:"Length",value:"5.5 Meters"},{key:"Blouse",value:"Printed Included"}],["saree","women","georgette","printed"]),
p("suit","Raymond Men's Business Suit","Raymond",7999,12999,50,[{key:"Fabric",value:"Wool Blend"},{key:"Fit",value:"Slim Fit"},{key:"Style",value:"2-Piece"},{key:"Occasion",value:"Formal"}],["suit","men","raymond","formal"],{is_featured:true}),
p("suit","Arrow Formal Blazer Men","Arrow",4999,7999,70,[{key:"Fabric",value:"Polyester Blend"},{key:"Fit",value:"Regular Fit"},{key:"Buttons",value:"2 Button"},{key:"Occasion",value:"Formal"}],["blazer","men","arrow","formal"]),
p("suit","Peter England Formal Shirt Trouser Set","Peter England",2999,4999,90,[{key:"Shirt Fabric",value:"Cotton"},{key:"Trouser Fabric",value:"Poly Viscose"},{key:"Fit",value:"Regular"},{key:"Set",value:"2 Piece"}],["set","men","peter-england","formal"]),

// ── SHOES & FOOTWEAR (36-55) ──────────────────────────────────────────────────
p("shoes","Nike Air Max 270 Running Shoes Men","Nike",8995,12995,150,[{key:"Type",value:"Running"},{key:"Upper",value:"Mesh"},{key:"Sole",value:"Rubber"},{key:"Feature",value:"Max Air Cushioning"}],["shoes","nike","airmax","running"],{is_bestseller:true,is_featured:true}),
p("shoes","Adidas Ultraboost 22 Running Shoes","Adidas",12999,17999,80,[{key:"Type",value:"Running"},{key:"Upper",value:"Primeknit"},{key:"Cushioning",value:"Boost Foam"},{key:"Weight",value:"310g"}],["shoes","adidas","ultraboost","running"],{is_featured:true}),
p("shoes","Puma Softride Enzo Running Shoes","Puma",3499,5999,200,[{key:"Type",value:"Running"},{key:"Upper",value:"Mesh"},{key:"Sole",value:"SoftFoam+"},{key:"Closure",value:"Lace-Up"}],["shoes","puma","softride","running"]),
p("shoes","Reebok Classic Leather Sneakers","Reebok",4999,7499,120,[{key:"Type",value:"Casual Sneaker"},{key:"Upper",value:"Leather"},{key:"Sole",value:"Rubber"},{key:"Style",value:"Low Top"}],["shoes","reebok","classic","sneakers"]),
p("shoes","Nike Court Vision Low Sneakers","Nike",5495,6995,110,[{key:"Type",value:"Lifestyle"},{key:"Upper",value:"Leather"},{key:"Sole",value:"Rubber Cupsole"},{key:"Style",value:"Court Style"}],["shoes","nike","court","sneakers"]),
p("shoes","Adidas Stan Smith Sneakers","Adidas",8999,11999,90,[{key:"Type",value:"Casual"},{key:"Upper",value:"Leather"},{key:"Feature",value:"Perforated 3-Stripes"},{key:"Sole",value:"Rubber"}],["shoes","adidas","stan-smith","iconic"],{is_bestseller:true}),
p("shoes","Bata Comfit Casual Oxford Men","Bata",1999,3499,180,[{key:"Type",value:"Oxford"},{key:"Upper",value:"Synthetic Leather"},{key:"Occasion",value:"Casual"},{key:"Sole",value:"TPR"}],["shoes","bata","oxford","men"]),
p("shoes","Red Tape Formal Lace Up Shoes Men","Red Tape",2499,3999,160,[{key:"Type",value:"Formal"},{key:"Upper",value:"Genuine Leather"},{key:"Sole",value:"TPR"},{key:"Occasion",value:"Office"}],["shoes","red-tape","formal","men"]),
p("shoes","Liberty Gliders Loafers Men","Liberty",1799,2999,140,[{key:"Type",value:"Loafer"},{key:"Upper",value:"Synthetic"},{key:"Closure",value:"Slip-On"},{key:"Sole",value:"EVA"}],["shoes","liberty","loafer","men"]),
p("shoes","Crocs Classic Clog Unisex","Crocs",3299,4299,200,[{key:"Material",value:"Croslite Foam"},{key:"Closure",value:"Slip-On"},{key:"Feature",value:"Ventilation Ports"},{key:"Gender",value:"Unisex"}],["crocs","clog","unisex","comfort"],{is_bestseller:true}),
p("shoes","Woodland Outdoor Lace-Up Shoes Men","Woodland",4499,6499,120,[{key:"Type",value:"Outdoor/Trekking"},{key:"Upper",value:"Genuine Leather"},{key:"Sole",value:"Rubber"},{key:"Feature",value:"Waterproof"}],["shoes","woodland","outdoor","men"]),
p("shoes","Inc.5 Block Heel Pumps Women","Inc.5",1499,2499,100,[{key:"Type",value:"Pumps"},{key:"Heel",value:"Block Heel 2 inch"},{key:"Upper",value:"Synthetic"},{key:"Occasion",value:"Casual/Party"}],["heels","women","inc5","pumps"]),
p("shoes","Catwalk Stiletto Heels Women","Catwalk",2299,3799,80,[{key:"Type",value:"Stiletto"},{key:"Heel",value:"3 inch"},{key:"Upper",value:"Patent Finish"},{key:"Occasion",value:"Party"}],["heels","women","catwalk","stiletto"]),
p("shoes","Khadim's Mary Jane Flats Women","Khadims",799,1299,200,[{key:"Type",value:"Mary Jane Flats"},{key:"Upper",value:"Synthetic"},{key:"Closure",value:"Strap"},{key:"Sole",value:"TPR"}],["flats","women","khadims","maryjane"]),
p("shoes","Metro Slip On Mules Women","Metro",1299,2199,150,[{key:"Type",value:"Mules"},{key:"Upper",value:"Suede Finish"},{key:"Closure",value:"Slip-On"},{key:"Heel",value:"Flat"}],["mules","women","metro","slip-on"]),
p("shoes","Puma Flex Essential Sports Shoes Women","Puma",2499,3999,180,[{key:"Type",value:"Training"},{key:"Upper",value:"Mesh"},{key:"Sole",value:"FlexFoam"},{key:"Closure",value:"Lace-Up"}],["shoes","puma","women","training"]),
p("shoes","Sparx Running Shoes Men","Sparx",1299,1999,250,[{key:"Type",value:"Running"},{key:"Upper",value:"Mesh"},{key:"Sole",value:"EVA"},{key:"Weight",value:"250g"}],["shoes","sparx","running","budget"]),
p("shoes","Campus Hurricane Running Shoes Men","Campus",999,1799,300,[{key:"Type",value:"Running"},{key:"Upper",value:"Knitted Mesh"},{key:"Sole",value:"EVA+Rubber"},{key:"Weight",value:"280g"}],["shoes","campus","running","men"]),
p("shoes","Skechers GOwalk Slip-On Shoes Women","Skechers",3499,4999,120,[{key:"Type",value:"Walking"},{key:"Upper",value:"Knit"},{key:"Sole",value:"Goga Mat"},{key:"Closure",value:"Slip-On"}],["shoes","skechers","women","walking"]),
p("shoes","Asian Wonder Max Sports Shoes Men","Asian",699,1299,350,[{key:"Type",value:"Sports"},{key:"Upper",value:"Mesh"},{key:"Sole",value:"Rubber"},{key:"Closure",value:"Lace-Up"}],["shoes","asian","sports","budget"]),

// ── JACKETS & HOODIES (56-70) ─────────────────────────────────────────────────
p("jacket","Nike Windrunner Jacket Men","Nike",5995,8995,80,[{key:"Material",value:"Nylon"},{key:"Type",value:"Windbreaker"},{key:"Feature",value:"Packable"},{key:"Closure",value:"Full Zip"}],["jacket","nike","windrunner","men"],{is_featured:true}),
p("jacket","Adidas Tiro Track Jacket Men","Adidas",3999,5999,100,[{key:"Material",value:"Recycled Polyester"},{key:"Type",value:"Track Jacket"},{key:"Closure",value:"Full Zip"},{key:"Feature",value:"3-Stripe"}],["jacket","adidas","tiro","men"]),
p("jacket","Puma Padded Puffer Jacket Men","Puma",4499,6999,70,[{key:"Material",value:"Polyester"},{key:"Type",value:"Puffer"},{key:"Filling",value:"Synthetic Down"},{key:"Closure",value:"Zip"}],["jacket","puma","puffer","men"]),
p("jacket","Roadster Bomber Jacket Men","Roadster",1999,3499,120,[{key:"Material",value:"Polyester"},{key:"Type",value:"Bomber"},{key:"Lining",value:"Fleece"},{key:"Closure",value:"Zip"}],["jacket","roadster","bomber","men"]),
p("jacket","Highlander Denim Jacket Men","Highlander",1799,2999,130,[{key:"Material",value:"Denim"},{key:"Type",value:"Denim Jacket"},{key:"Fit",value:"Regular"},{key:"Closure",value:"Button"}],["jacket","highlander","denim","men"]),
p("jacket","United Colors of Benetton Jacket Women","UCB",3499,5499,90,[{key:"Material",value:"Polyester"},{key:"Type",value:"Puffer"},{key:"Fit",value:"Regular"},{key:"Gender",value:"Women"}],["jacket","ucb","women","puffer"]),
p("jacket","Only Quilted Jacket Women","Only",2499,3999,100,[{key:"Material",value:"Polyester"},{key:"Type",value:"Quilted"},{key:"Fit",value:"Regular"},{key:"Closure",value:"Zip"}],["jacket","only","women","quilted"]),
p("jacket","Vero Moda Faux Leather Jacket Women","Vero Moda",3999,6499,60,[{key:"Material",value:"Faux Leather"},{key:"Type",value:"Biker Jacket"},{key:"Closure",value:"Zip"},{key:"Lining",value:"Viscose"}],["jacket","vero-moda","women","faux-leather"]),
p("hoodie","Nike Club Fleece Pullover Hoodie","Nike",4495,5995,150,[{key:"Material",value:"Fleece"},{key:"Type",value:"Pullover"},{key:"Feature",value:"Kangaroo Pocket"},{key:"Fit",value:"Regular"}],["hoodie","nike","fleece","men"],{is_bestseller:true}),
p("hoodie","Adidas Essentials Hoodie Unisex","Adidas",3499,4999,160,[{key:"Material",value:"French Terry"},{key:"Type",value:"Pullover"},{key:"Feature",value:"Front Pocket"},{key:"Gender",value:"Unisex"}],["hoodie","adidas","unisex","fleece"]),
p("hoodie","Puma Evostripe Full Zip Hoodie Men","Puma",2999,4499,120,[{key:"Material",value:"Dry Cell Fabric"},{key:"Type",value:"Full Zip"},{key:"Feature",value:"Moisture Wicking"},{key:"Fit",value:"Regular"}],["hoodie","puma","zip","men"]),
p("hoodie","Bewakoof Graphic Hoodie Unisex","Bewakoof",999,1999,250,[{key:"Material",value:"Fleece"},{key:"Print",value:"Graphic Front"},{key:"Type",value:"Pullover"},{key:"Gender",value:"Unisex"}],["hoodie","bewakoof","graphic","budget"]),
p("hoodie","Urbanic Cropped Hoodie Women","Urbanic",1499,2499,110,[{key:"Material",value:"Cotton Fleece"},{key:"Style",value:"Cropped"},{key:"Type",value:"Pullover"},{key:"Gender",value:"Women"}],["hoodie","women","cropped","casual"]),
p("hoodie","The Souled Store Printed Hoodie","The Souled Store",1799,2999,140,[{key:"Material",value:"GSM 340 Fleece"},{key:"Print",value:"Pop Culture"},{key:"Fit",value:"Oversized"},{key:"Gender",value:"Unisex"}],["hoodie","printed","unisex","pop-culture"]),
p("jacket","HRX by Hrithik Roshan Training Jacket","HRX",1999,3499,100,[{key:"Material",value:"Polyester"},{key:"Type",value:"Training"},{key:"Feature",value:"4-Way Stretch"},{key:"Closure",value:"Full Zip"}],["jacket","hrx","training","men"]),

// ── BAGS & ACCESSORIES (71-85) ────────────────────────────────────────────────
p("bag","Lavie Satchel Handbag Women","Lavie",1799,2999,100,[{key:"Material",value:"Faux Leather"},{key:"Type",value:"Satchel"},{key:"Compartments",value:"2 Main + Pockets"},{key:"Closure",value:"Zip"}],["bag","women","lavie","handbag"]),
p("bag","Hidesign Genuine Leather Tote Women","Hidesign",4999,7999,50,[{key:"Material",value:"Genuine Leather"},{key:"Type",value:"Tote"},{key:"Feature",value:"Laptop Sleeve"},{key:"Gender",value:"Women"}],["bag","hidesign","leather","tote"],{is_featured:true}),
p("bag","Baggit Flap Shoulder Bag Women","Baggit",1299,2199,130,[{key:"Material",value:"PU Leather"},{key:"Type",value:"Shoulder Bag"},{key:"Compartments",value:"3"},{key:"Closure",value:"Flap"}],["bag","baggit","shoulder","women"]),
p("bag","Caprese Crossbody Bag Women","Caprese",2499,3999,80,[{key:"Material",value:"Vegan Leather"},{key:"Type",value:"Crossbody"},{key:"Strap",value:"Adjustable"},{key:"Closure",value:"Zip"}],["bag","caprese","crossbody","women"]),
p("bag","Tommy Hilfiger Backpack Unisex","Tommy Hilfiger",5999,8999,60,[{key:"Material",value:"Polyester"},{key:"Type",value:"Backpack"},{key:"Capacity",value:"25 Litres"},{key:"Feature",value:"Laptop Sleeve 15 inch"}],["bag","tommy","backpack","unisex"],{is_featured:true}),
p("bag","Wildcraft Backpack Unisex 30L","Wildcraft",1999,2999,200,[{key:"Material",value:"Polyester"},{key:"Type",value:"Backpack"},{key:"Capacity",value:"30 Litres"},{key:"Feature",value:"Rain Cover"}],["bag","wildcraft","backpack","outdoor"],{is_bestseller:true}),
p("bag","American Tourister Casual Backpack","American Tourister",1799,2999,170,[{key:"Material",value:"Polyester"},{key:"Capacity",value:"25 Litres"},{key:"Feature",value:"Laptop Compartment"},{key:"Warranty",value:"3 Years"}],["bag","american-tourister","backpack","travel"]),
p("bag","Skybags Campus Plus Backpack Men","Skybags",1499,2499,150,[{key:"Material",value:"Polyester"},{key:"Capacity",value:"31 Litres"},{key:"Compartments",value:"3"},{key:"Feature",value:"USB Charging Port"}],["bag","skybags","backpack","men"]),
p("bag","Fossil Women's Crossbody Bucket Bag","Fossil",6999,9999,40,[{key:"Material",value:"Genuine Leather"},{key:"Type",value:"Bucket Bag"},{key:"Closure",value:"Drawstring"},{key:"Hardware",value:"Gold Tone"}],["bag","fossil","leather","women"],{is_featured:true}),
p("bag","Fastrack Sling Bag Unisex","Fastrack",699,1199,200,[{key:"Material",value:"Polyester"},{key:"Type",value:"Sling Bag"},{key:"Capacity",value:"5 Litres"},{key:"Gender",value:"Unisex"}],["bag","fastrack","sling","budget"]),
p("bag","Gear Hobo Hand Bag Women","Gear",1099,1999,120,[{key:"Material",value:"PU Leather"},{key:"Type",value:"Hobo"},{key:"Closure",value:"Zip"},{key:"Compartments",value:"2"}],["bag","gear","hobo","women"]),
p("bag","Puma Phase Backpack Unisex","Puma",1999,2999,130,[{key:"Material",value:"100% Polyester"},{key:"Capacity",value:"24 Litres"},{key:"Feature",value:"Padded Straps"},{key:"Gender",value:"Unisex"}],["bag","puma","backpack","sports"]),
p("bag","Adidas Linear Backpack Unisex","Adidas",2499,3499,110,[{key:"Material",value:"Ripstop Polyester"},{key:"Capacity",value:"22 Litres"},{key:"Laptop",value:"Fits 14 inch"},{key:"Gender",value:"Unisex"}],["bag","adidas","backpack","sports"]),
p("bag","Lino Perros Patent Clutch Women","Lino Perros",899,1599,90,[{key:"Material",value:"PU Patent"},{key:"Type",value:"Clutch"},{key:"Closure",value:"Magnetic Snap"},{key:"Occasion",value:"Party"}],["clutch","lino-perros","party","women"]),
p("bag","Esbeda Printed Tote Bag Women","Esbeda",2999,4999,70,[{key:"Material",value:"PU"},{key:"Type",value:"Tote"},{key:"Print",value:"Printed"},{key:"Feature",value:"Inner Zipper Pocket"}],["bag","esbeda","tote","printed"]),

// ── WATCHES & ACCESSORIES (86-100) ───────────────────────────────────────────
p("suit","Titan Analog Watch Men","Titan",3495,4995,120,[{key:"Case",value:"42mm Stainless Steel"},{key:"Strap",value:"Leather"},{key:"Movement",value:"Quartz"},{key:"Water Resistance",value:"30m"}],["watch","titan","men","analog"],{is_bestseller:true}),
p("suit","Fastrack Analog Watch Men","Fastrack",1295,1995,200,[{key:"Case",value:"40mm"},{key:"Strap",value:"Silicone"},{key:"Movement",value:"Quartz"},{key:"Style",value:"Sporty"}],["watch","fastrack","men","sports"]),
p("suit","Casio G-Shock Digital Watch Men","Casio",6999,8999,80,[{key:"Type",value:"Digital"},{key:"Feature",value:"Shock Resistant"},{key:"Water Resistance",value:"200m"},{key:"Power",value:"Solar"}],["watch","casio","gshock","digital"],{is_featured:true}),
p("suit","Sonata Petal Analog Watch Women","Sonata",1199,1899,150,[{key:"Case",value:"36mm"},{key:"Strap",value:"Metal Bracelet"},{key:"Movement",value:"Quartz"},{key:"Display",value:"Analog"}],["watch","sonata","women","analog"]),
p("suit","DKNY Stanhope Watch Women","DKNY",9999,13999,40,[{key:"Case",value:"38mm Gold-Tone"},{key:"Strap",value:"Mesh Bracelet"},{key:"Movement",value:"Quartz"},{key:"Water Resistance",value:"30m"}],["watch","dkny","women","fashion"],{is_featured:true}),
p("tshirt","Levis Belt Men Genuine Leather","Levis",1299,1999,100,[{key:"Material",value:"Genuine Leather"},{key:"Width",value:"35mm"},{key:"Buckle",value:"Brass Tone"},{key:"Gender",value:"Men"}],["belt","levis","leather","men"]),
p("tshirt","Tommy Hilfiger Canvas Belt Men","Tommy Hilfiger",2499,3499,80,[{key:"Material",value:"Canvas + Leather"},{key:"Width",value:"30mm"},{key:"Buckle",value:"Silver Tone"},{key:"Style",value:"Casual"}],["belt","tommy","men","canvas"]),
p("bag","Ray-Ban Aviator Sunglasses Unisex","Ray-Ban",9990,12990,60,[{key:"Frame",value:"Metal"},{key:"Lens",value:"Polarized G-15"},{key:"Shape",value:"Aviator"},{key:"UV Protection",value:"100% UV400"}],["sunglasses","ray-ban","aviator","unisex"],{is_featured:true}),
p("bag","Fastrack UV-Protected Wayfarer Sunglasses","Fastrack",999,1499,150,[{key:"Frame",value:"Plastic"},{key:"Lens",value:"UV400 Polycarbonate"},{key:"Shape",value:"Wayfarer"},{key:"Gender",value:"Unisex"}],["sunglasses","fastrack","wayfarer","budget"]),
p("bag","Lenskart Vincent Chase Rectangle Frames","Lenskart",1500,2500,120,[{key:"Frame",value:"TR90"},{key:"Shape",value:"Rectangle"},{key:"Style",value:"Full Rim"},{key:"Feature",value:"Anti-Glare Coating"}],["eyewear","lenskart","rectangle","unisex"]),
p("tshirt","Peter England Formal Tie Men","Peter England",799,1299,200,[{key:"Material",value:"Micro Fibre"},{key:"Width",value:"7.5cm"},{key:"Length",value:"150cm"},{key:"Pattern",value:"Striped"}],["tie","men","formal","peter-england"]),
p("kurti","Scarf & Stole Printed Dupatta Women","Scarf n Stole",499,899,300,[{key:"Material",value:"Chiffon"},{key:"Print",value:"Floral"},{key:"Length",value:"2.2 Metres"},{key:"Gender",value:"Women"}],["dupatta","women","chiffon","printed"]),
p("kurti","Vero Moda Knit Beret Hat Unisex","Vero Moda",699,1199,180,[{key:"Material",value:"Acrylic Knit"},{key:"Style",value:"Beret"},{key:"Feature",value:"One Size Fits All"},{key:"Season",value:"Winter"}],["hat","cap","women","winter"]),
p("hoodie","Wrogn Graphic Sweatshirt Men","Wrogn",1499,2499,160,[{key:"Material",value:"GSM 280 Fleece"},{key:"Print",value:"Graphic"},{key:"Fit",value:"Regular"},{key:"Sleeve",value:"Full Sleeve"}],["sweatshirt","wrogn","men","graphic"]),
p("tshirt","Jack & Jones Slim Fit Chinos Men","Jack Jones",1999,3499,130,[{key:"Fabric",value:"Cotton Blend"},{key:"Fit",value:"Slim Fit"},{key:"Closure",value:"Button & Zip"},{key:"Rise",value:"Mid Rise"}],["chinos","men","jack-jones","slim"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });

  if (!categories.length) { console.error("❌ No categories found. Run seedCategory first."); process.exit(1); }

  const catId   = categories.find(c => c.slug === "fashion")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;

  // Delete existing fashion products
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing fashion products`);

  let inserted = 0;
  for (const raw of PRODUCTS) {
    const { _brandName, ...data } = raw;
    data.category_id = catId;
    const bKey = (_brandName || "").toLowerCase();
    data.brand_id = brandMap[bKey] || defaultBrand;

    // Ensure unique slug
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) data.slug = data.slug + "-" + Date.now().toString().slice(-4);

    await Product.create(data);
    inserted++;
    process.stdout.write(`\r✍️  Inserted ${inserted}/100`);
  }

  console.log(`\n✅ Done! ${inserted} Fashion products seeded.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
