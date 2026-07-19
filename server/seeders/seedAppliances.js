/**
 * seedAppliances.js — 100 Appliances Products
 * Run: node server/seeders/seedAppliances.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  washing: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80"],
  fridge:  ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80","https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=80"],
  ac:      ["https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=80"],
  micro:   ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80"],
  mixer:   ["https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80","https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80","https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80","https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80"],
  fan:     ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80"],
  geyser:  ["https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80"],
  iron:    ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80","https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=80","https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(3, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 8000, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(50+Math.random()*1000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── WASHING MACHINES (1-14) ───────────────────────────────────────────────────
p("washing","LG 7kg 5 Star Inverter Fully-Automatic Front Load","LG",37990,49990,25,[{key:"Capacity",value:"7 kg"},{key:"Type",value:"Fully-Automatic Front Load"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"6 Motion DD Technology"}],["washing-machine","lg","front-load","inverter"],{is_featured:true,is_bestseller:true}),
p("washing","Samsung 7kg Inverter Fully-Automatic Front Load","Samsung",34990,45990,30,[{key:"Capacity",value:"7 kg"},{key:"Type",value:"Front Load"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"EcoBubble Technology"}],["washing-machine","samsung","front-load","ecobubble"]),
p("washing","Whirlpool 7kg 5 Star Fully-Automatic Top Load","Whirlpool",22990,30990,40,[{key:"Capacity",value:"7 kg"},{key:"Type",value:"Fully-Automatic Top Load"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"ZPF Technology"}],["washing-machine","whirlpool","top-load","5-star"],{is_bestseller:true}),
p("washing","IFB 6kg Fully-Automatic Front Load","IFB",29990,39990,30,[{key:"Capacity",value:"6 kg"},{key:"Type",value:"Front Load"},{key:"Feature",value:"Aqua Energie Water Softener"},{key:"Spin Speed",value:"1000 RPM"}],["washing-machine","ifb","front-load","aqua"]),
p("washing","Haier 6.5kg Semi-Automatic Top Load","Haier",12990,17990,50,[{key:"Capacity",value:"6.5 kg"},{key:"Type",value:"Semi-Automatic Top Load"},{key:"Feature",value:"Turbodry"},{key:"Power",value:"300W"}],["washing-machine","haier","semi-automatic","6.5kg"]),
p("washing","Bosch 7kg 5 Star Inverter Front Load","Bosch",42990,55990,20,[{key:"Capacity",value:"7 kg"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"EcoSilence Drive"},{key:"Spin Speed",value:"1000 RPM"}],["washing-machine","bosch","front-load","5-star"],{is_featured:true}),
p("washing","Godrej 6.5kg Fully-Automatic Top Load","Godrej",18990,25990,40,[{key:"Capacity",value:"6.5 kg"},{key:"Type",value:"Top Load"},{key:"Feature",value:"Toughened Glass Lid"},{key:"Program",value:"10 Wash Programs"}],["washing-machine","godrej","top-load","6.5kg"]),
p("washing","Panasonic 7kg Fully-Automatic Top Load","Panasonic",21990,28990,35,[{key:"Capacity",value:"7 kg"},{key:"Type",value:"Top Load"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"Active Foam System"}],["washing-machine","panasonic","top-load","7kg"]),
p("washing","LG 8kg 5 Star AI Direct Drive Front Load","LG",52990,65990,15,[{key:"Capacity",value:"8 kg"},{key:"Feature",value:"AI DD + TurboWash"},{key:"Star Rating",value:"5 Star"},{key:"Steam",value:"Steam Function"}],["washing-machine","lg","8kg","ai-dd"]),
p("washing","Samsung 8kg Fully-Automatic Front Load","Samsung",42990,54990,20,[{key:"Capacity",value:"8 kg"},{key:"Feature",value:"AI Control"},{key:"Spin Speed",value:"1400 RPM"},{key:"Motor",value:"Digital Inverter"}],["washing-machine","samsung","8kg","ai-control"]),
p("washing","Whirlpool 6.5kg Fully-Automatic Top Load","Whirlpool",18990,24990,45,[{key:"Capacity",value:"6.5 kg"},{key:"Type",value:"Top Load"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"In-Built Heater"}],["washing-machine","whirlpool","6.5kg","heater"]),
p("washing","Voltas Beko 7kg Fully-Automatic Front Load","Voltas",29990,39990,25,[{key:"Capacity",value:"7 kg"},{key:"Feature",value:"ProSmart Inverter"},{key:"Hygiene",value:"Aquafresh+"},{key:"Spin Speed",value:"1000 RPM"}],["washing-machine","voltas","front-load","prosmart"]),
p("washing","IFB 7kg Senator WXS Fully-Automatic Front Load","IFB",34990,44990,20,[{key:"Capacity",value:"7 kg"},{key:"Feature",value:"3D Wash System"},{key:"Water Level",value:"5 Levels"},{key:"Spin Speed",value:"1200 RPM"}],["washing-machine","ifb","senator","7kg"]),
p("washing","Onida 7kg Fully-Automatic Top Load","Onida",17990,23990,40,[{key:"Capacity",value:"7 kg"},{key:"Type",value:"Top Load"},{key:"Feature",value:"Magic Filter"},{key:"Program",value:"8 Wash Programs"}],["washing-machine","onida","top-load","7kg"]),

// ── REFRIGERATORS (15-27) ─────────────────────────────────────────────────────
p("fridge","LG 260L 3 Star Frost Free Double Door","LG",27990,35990,30,[{key:"Capacity",value:"260 Litres"},{key:"Type",value:"Double Door Frost Free"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Smart Inverter Compressor"}],["refrigerator","lg","double-door","260l"],{is_bestseller:true}),
p("fridge","Samsung 253L 3 Star Frost Free Double Door","Samsung",24990,32990,35,[{key:"Capacity",value:"253 Litres"},{key:"Type",value:"Double Door"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Digital Inverter Technology"}],["refrigerator","samsung","double-door","253l"]),
p("fridge","Whirlpool 215L 4 Star Direct Cool Single Door","Whirlpool",14990,19990,50,[{key:"Capacity",value:"215 Litres"},{key:"Type",value:"Single Door Direct Cool"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"Vitamagic Pro"}],["refrigerator","whirlpool","single-door","215l"],{is_bestseller:true}),
p("fridge","Godrej 265L 3 Star Frost Free Double Door","Godrej",25990,33990,30,[{key:"Capacity",value:"265 Litres"},{key:"Type",value:"Double Door"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Fresh Air Duct"}],["refrigerator","godrej","double-door","265l"]),
p("fridge","Haier 258L 3 Star Frost Free Double Door","Haier",22990,30990,35,[{key:"Capacity",value:"258 Litres"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Twin Inverter Technology"},{key:"Type",value:"Double Door"}],["refrigerator","haier","double-door","twin-inverter"]),
p("fridge","LG 437L Frost Free Side-by-Side","LG",62990,79990,15,[{key:"Capacity",value:"437 Litres"},{key:"Type",value:"Side-by-Side"},{key:"Feature",value:"InstaView Door-in-Door"},{key:"Star Rating",value:"3 Star"}],["refrigerator","lg","side-by-side","instview"],{is_featured:true}),
p("fridge","Samsung 324L 3 Star Frost Free Double Door","Samsung",29990,38990,25,[{key:"Capacity",value:"324 Litres"},{key:"Type",value:"Double Door"},{key:"Feature",value:"All-Around Cooling"},{key:"Star Rating",value:"3 Star"}],["refrigerator","samsung","324l","all-around"]),
p("fridge","Bosch 559L Side-by-Side Refrigerator","Bosch",84990,104990,10,[{key:"Capacity",value:"559 Litres"},{key:"Type",value:"Side-by-Side"},{key:"Feature",value:"No Frost + VitaFresh"},{key:"Star Rating",value:"3 Star"}],["refrigerator","bosch","side-by-side","premium"],{is_featured:true}),
p("fridge","Panasonic 338L 4 Star Frost Free Double Door","Panasonic",31990,41990,20,[{key:"Capacity",value:"338 Litres"},{key:"Type",value:"Double Door"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"Ag Clean Technology"}],["refrigerator","panasonic","338l","4-star"]),
p("fridge","Voltas 195L 4 Star Direct Cool Single Door","Voltas",12990,17990,60,[{key:"Capacity",value:"195 Litres"},{key:"Type",value:"Single Door"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"Frost-Free Base Plate"}],["refrigerator","voltas","single-door","195l"]),
p("fridge","Whirlpool 340L 3 Star Frost Free Triple Door","Whirlpool",34990,43990,20,[{key:"Capacity",value:"340 Litres"},{key:"Type",value:"Triple Door"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Microblock Technology"}],["refrigerator","whirlpool","triple-door","340l"]),
p("fridge","LG 190L 5 Star Direct Cool Single Door","LG",15990,20990,45,[{key:"Capacity",value:"190 Litres"},{key:"Type",value:"Single Door"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Smart Inverter"}],["refrigerator","lg","single-door","5-star"]),
p("fridge","Carrier 185L 4 Star Direct Cool Single Door","Carrier",11990,16990,55,[{key:"Capacity",value:"185 Litres"},{key:"Type",value:"Single Door"},{key:"Star Rating",value:"4 Star"},{key:"Feature",value:"Turbo Ice Making"}],["refrigerator","carrier","single-door","4-star"]),
// ── AIR CONDITIONERS (28-40) ──────────────────────────────────────────────────
p("ac","LG 1.5 Ton 5 Star Inverter Split AC","LG",42990,54990,25,[{key:"Capacity",value:"1.5 Ton"},{key:"Type",value:"Split AC"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"AI Dual Inverter"}],["ac","lg","1.5-ton","inverter"],{is_featured:true,is_bestseller:true}),
p("ac","Samsung 1.5 Ton 5 Star Inverter Split AC","Samsung",39990,51990,30,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Wind-Free Cooling"},{key:"Type",value:"Split"}],["ac","samsung","1.5-ton","wind-free"]),
p("ac","Daikin 1.5 Ton 5 Star Inverter Split AC","Daikin",44990,57990,20,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Power Chill Operation"},{key:"Type",value:"Split"}],["ac","daikin","1.5-ton","5-star"],{is_featured:true}),
p("ac","Voltas 1.5 Ton 3 Star Inverter Split AC","Voltas",32990,42990,40,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"4-in-1 Adjustable Mode"},{key:"Type",value:"Split"}],["ac","voltas","1.5-ton","4-in-1"],{is_bestseller:true}),
p("ac","Hitachi 1.5 Ton 5 Star Inverter Split AC","Hitachi",45990,58990,20,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Tropical Inverter"},{key:"Filter",value:"PM 2.5 Filter"}],["ac","hitachi","1.5-ton","tropical"]),
p("ac","Blue Star 1.5 Ton 3 Star Inverter Split AC","Blue Star",33990,43990,35,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"Self-Cleaning"},{key:"Type",value:"Split"}],["ac","blue-star","1.5-ton","self-clean"]),
p("ac","Carrier 1.5 Ton 5 Star Inverter Split AC","Carrier",41990,53990,25,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Flexicool Hybridjet"},{key:"Warranty",value:"5 Years Compressor"}],["ac","carrier","1.5-ton","flexicool"]),
p("ac","LG 1 Ton 5 Star Inverter Split AC","LG",35990,45990,30,[{key:"Capacity",value:"1 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"AI Dual Inverter"},{key:"Area",value:"Up to 150 sq ft"}],["ac","lg","1-ton","inverter"]),
p("ac","Panasonic 1.5 Ton 5 Star Inverter Split AC","Panasonic",41990,53990,20,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"nanoe-G Air Purifier"},{key:"Gas",value:"R32"}],["ac","panasonic","1.5-ton","nanoe"]),
p("ac","Godrej 1.5 Ton 3 Star Inverter Split AC","Godrej",29990,39990,40,[{key:"Capacity",value:"1.5 Ton"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"6-in-1 Convertible"},{key:"Type",value:"Split"}],["ac","godrej","1.5-ton","6-in-1"]),
p("ac","Voltas 2 Ton 3 Star Inverter Split AC","Voltas",42990,54990,15,[{key:"Capacity",value:"2 Ton"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"3-in-1 Adjustable"},{key:"Area",value:"Up to 250 sq ft"}],["ac","voltas","2-ton","3-star"]),
p("ac","Daikin 1 Ton 5 Star Inverter Split AC","Daikin",37990,48990,25,[{key:"Capacity",value:"1 Ton"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Stabilizer Free Operation"},{key:"Gas",value:"R-32"}],["ac","daikin","1-ton","5-star"]),
p("ac","Samsung 1 Ton 3 Star Inverter Split AC","Samsung",29990,38990,35,[{key:"Capacity",value:"1 Ton"},{key:"Star Rating",value:"3 Star"},{key:"Feature",value:"WindFree ELITE"},{key:"Type",value:"Split"}],["ac","samsung","1-ton","windfree"]),

// ── MICROWAVES & KITCHEN APPLIANCES (41-60) ───────────────────────────────────
p("micro","LG 28L Convection Microwave Oven","LG",12990,17990,40,[{key:"Capacity",value:"28 Litres"},{key:"Type",value:"Convection"},{key:"Feature",value:"Diet Fry + Auto Cook"},{key:"Power",value:"900W"}],["microwave","lg","convection","28l"],{is_bestseller:true}),
p("micro","Samsung 28L Convection Microwave","Samsung",11990,16990,45,[{key:"Capacity",value:"28 Litres"},{key:"Type",value:"Convection"},{key:"Feature",value:"Slim Fry + Health Cook"},{key:"Power",value:"900W"}],["microwave","samsung","convection","28l"]),
p("micro","IFB 25L Convection Microwave","IFB",10990,14990,50,[{key:"Capacity",value:"25 Litres"},{key:"Type",value:"Convection"},{key:"Feature",value:"55 Auto-Cook Menus"},{key:"Power",value:"900W"}],["microwave","ifb","convection","25l"]),
p("micro","Panasonic 23L Solo Microwave NN-ST26JMFDG","Panasonic",7990,10990,60,[{key:"Capacity",value:"23 Litres"},{key:"Type",value:"Solo"},{key:"Power",value:"800W"},{key:"Feature",value:"Auto Cook Menu x12"}],["microwave","panasonic","solo","23l"]),
p("micro","Godrej 30L Convection Microwave GME 530 CF1 PM","Godrej",13990,18990,35,[{key:"Capacity",value:"30 Litres"},{key:"Type",value:"Convection"},{key:"Feature",value:"Motorised Rotisserie"},{key:"Power",value:"900W"}],["microwave","godrej","convection","30l"]),
p("mixer","Philips HL7756 750W Mixer Grinder 3 Jars","Philips",3499,4999,80,[{key:"Power",value:"750W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"3 Speed + Pulse"},{key:"Feature",value:"ProBlend 6 3D Technology"}],["mixer","philips","750w","3-jars"],{is_bestseller:true}),
p("mixer","Bajaj Rex 500W Mixer Grinder 3 Jars","Bajaj",2299,3299,100,[{key:"Power",value:"500W"},{key:"Jars",value:"3 Stainless Steel"},{key:"Speed",value:"3 + Pulse"},{key:"Warranty",value:"2 Years"}],["mixer","bajaj","500w","rex"]),
p("mixer","Preethi Zodiac 750W Mixer 5 Jars","Preethi",5999,7999,60,[{key:"Power",value:"750W"},{key:"Jars",value:"5 Jars"},{key:"Feature",value:"Insta-Fresh Citrus Juicer"},{key:"Warranty",value:"5 Years Motor"}],["mixer","preethi","750w","5-jars"],{is_featured:true}),
p("mixer","Havells Supermix 600W Mixer 3 Jars","Havells",2999,4299,70,[{key:"Power",value:"600W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"3 Speed + Pulse"},{key:"Feature",value:"Double Locking System"}],["mixer","havells","600w","3-jars"]),
p("mixer","Kenstar Little Pro 350W Mixer 3 Jars","Kenstar",1799,2999,90,[{key:"Power",value:"350W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"2 Speed + Pulse"},{key:"Weight",value:"2.6 kg"}],["mixer","kenstar","350w","compact"]),
p("mixer","Bosch TrueMixx Pro 1000W Mixer","Bosch",6499,8999,50,[{key:"Power",value:"1000W"},{key:"Jars",value:"4 SS Jars"},{key:"Feature",value:"Advance Gear Technology"},{key:"Speed",value:"3 + Pulse"}],["mixer","bosch","1000w","pro"],{is_featured:true}),
p("mixer","Sujata Dynamix 900W Mixer 3 Jars","Sujata",3999,5499,65,[{key:"Power",value:"900W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"3 Speed"},{key:"Feature",value:"100% Copper Motor"}],["mixer","sujata","900w","copper-motor"]),
p("mixer","Usha 3253 500W Mixer Grinder 3 Jars","Usha",1999,2999,80,[{key:"Power",value:"500W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"3 Speed + Pulse"},{key:"Warranty",value:"2 Years"}],["mixer","usha","500w","3-jars"]),
p("mixer","Wonderchef Nutri-blend 400W Personal Blender","Wonderchef",2499,3499,100,[{key:"Power",value:"400W"},{key:"Type",value:"Personal Blender"},{key:"Jars",value:"2 Serving Jars"},{key:"Feature",value:"On-the-Go Lid"}],["blender","wonderchef","personal","400w"]),
p("micro","Whirlpool 20L Solo Microwave Magicook Elite S","Whirlpool",6990,9990,70,[{key:"Capacity",value:"20 Litres"},{key:"Type",value:"Solo"},{key:"Power",value:"700W"},{key:"Feature",value:"6th Sense Technology"}],["microwave","whirlpool","solo","20l"]),
p("micro","Bajaj 17L Solo Microwave 1701 MT EX","Bajaj",4990,7490,80,[{key:"Capacity",value:"17 Litres"},{key:"Type",value:"Solo"},{key:"Power",value:"700W"},{key:"Feature",value:"2-Stage Cooking"}],["microwave","bajaj","solo","17l"]),
p("micro","Morphy Richards 20L Grill Microwave",  "Morphy Richards",7990,10990,55,[{key:"Capacity",value:"20 Litres"},{key:"Type",value:"Grill"},{key:"Power",value:"800W"},{key:"Feature",value:"Stainless Steel Interior"}],["microwave","morphy-richards","grill","20l"]),
p("micro","Toshiba 25L Convection Microwave ER-TC25","Toshiba",9990,13990,40,[{key:"Capacity",value:"25 Litres"},{key:"Type",value:"Convection"},{key:"Feature",value:"28 Auto Cook Programs"},{key:"Power",value:"900W"}],["microwave","toshiba","convection","25l"]),
p("mixer","Lifelong LLMG01 400W Mixer 3 Jars","Lifelong",1299,2199,120,[{key:"Power",value:"400W"},{key:"Jars",value:"3 SS Jars"},{key:"Speed",value:"3 Speed + Pulse"},{key:"Warranty",value:"1 Year"}],["mixer","lifelong","400w","budget"]),
p("mixer","Crompton Ameo 750W Mixer 3 Jars","Crompton",2799,4199,75,[{key:"Power",value:"750W"},{key:"Jars",value:"3 SS Jars"},{key:"Feature",value:"ExcelFlow Technology"},{key:"Speed",value:"3 + Pulse"}],["mixer","crompton","750w","3-jars"]),
// ── FANS, GEYSERS & IRONS (61-100) ────────────────────────────────────────────
p("fan","Orient Aeroslim 1200mm Ceiling Fan BLDC","Orient",3499,4999,80,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"BLDC 28W"},{key:"Feature",value:"IoT Enabled"},{key:"Star Rating",value:"5 Star"}],["ceiling-fan","orient","bldc","5-star"],{is_bestseller:true}),
p("fan","Havells Stealth Air 1200mm BLDC Fan","Havells",5999,7999,50,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"BLDC 35W"},{key:"Feature",value:"LED Indicator + Remote"},{key:"Warranty",value:"3 Years"}],["ceiling-fan","havells","bldc","remote"],{is_featured:true}),
p("fan","Atomberg Renesa 1200mm BLDC Fan","Atomberg",3199,4499,70,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"BLDC 28W"},{key:"Feature",value:"Remote + LED"},{key:"Energy",value:"65% Less Power"}],["ceiling-fan","atomberg","bldc","renesa"],{is_bestseller:true}),
p("fan","Crompton HS Plus Anti-Dust 1200mm Fan","Crompton",1599,2299,120,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"Copper Motor"},{key:"Feature",value:"Anti-Dust Coating"},{key:"Speed",value:"3 Speed Regulator"}],["ceiling-fan","crompton","anti-dust","copper"]),
p("fan","Usha Bloom Daffodil 1200mm Designer Fan","Usha",2499,3499,90,[{key:"Sweep",value:"1200 mm"},{key:"Design",value:"Decorative Daffodil"},{key:"Finish",value:"Ivory + Gold"},{key:"Speed",value:"3 Speed"}],["ceiling-fan","usha","designer","daffodil"]),
p("fan","Bajaj Midea BW21 3-Speed Table Fan 300mm","Bajaj",1799,2499,100,[{key:"Sweep",value:"300 mm"},{key:"Type",value:"Table Fan"},{key:"Speed",value:"3 Speed"},{key:"Power",value:"55W"}],["table-fan","bajaj","300mm","3-speed"]),
p("fan","Orient Stand 33 Pedestal Fan 400mm","Orient",2499,3499,80,[{key:"Sweep",value:"400 mm"},{key:"Type",value:"Pedestal Fan"},{key:"Height",value:"Adjustable 120-145 cm"},{key:"Speed",value:"3 Speed"}],["pedestal-fan","orient","400mm","adjustable"]),
p("fan","Crompton Greaves Air Buddy 400mm Wall Fan","Crompton",1499,2199,100,[{key:"Sweep",value:"400 mm"},{key:"Type",value:"Wall Fan"},{key:"Power",value:"55W"},{key:"Feature",value:"Rust-Proof Body"}],["wall-fan","crompton","400mm","rust-proof"]),
p("fan","Philips AeroPure AC Exhaust Fan 200mm","Philips",1299,1899,90,[{key:"Size",value:"200 mm"},{key:"Type",value:"Exhaust Fan"},{key:"Air Flow",value:"340 CMH"},{key:"Feature",value:"Thermal Overload Protector"}],["exhaust-fan","philips","200mm","bathroom"]),
p("fan","Havells Instacool Tower Fan 1000mm","Havells",6999,9999,40,[{key:"Height",value:"1000 mm"},{key:"Type",value:"Tower Fan"},{key:"Feature",value:"Remote + Timer"},{key:"Speed",value:"3 Speed"}],["tower-fan","havells","remote","timer"]),
p("geyser","Bajaj New Shakti GL 15L Storage Geyser","Bajaj",5499,7499,60,[{key:"Capacity",value:"15 Litres"},{key:"Type",value:"Storage"},{key:"Power",value:"2000W"},{key:"Feature",value:"4-in-1 Protection"}],["geyser","bajaj","15l","storage"],{is_bestseller:true}),
p("geyser","Racold Eterno Pro 25L Vertical Geyser","Racold",8999,11999,40,[{key:"Capacity",value:"25 Litres"},{key:"Type",value:"Vertical Storage"},{key:"Power",value:"2000W"},{key:"Feature",value:"Glasslined Tank"}],["geyser","racold","25l","glasslined"]),
p("geyser","Crompton Solarium Neo 6L Instant Geyser","Crompton",3999,5999,70,[{key:"Capacity",value:"6 Litres"},{key:"Type",value:"Instant"},{key:"Power",value:"3000W"},{key:"Feature",value:"5-Level Safety"}],["geyser","crompton","instant","6l"]),
p("geyser","AO Smith HSE-SES 15L 5 Star Geyser","AO Smith",7499,9999,45,[{key:"Capacity",value:"15 Litres"},{key:"Star Rating",value:"5 Star"},{key:"Power",value:"1500W"},{key:"Feature",value:"Blue Diamond Tank"}],["geyser","ao-smith","15l","5-star"],{is_featured:true}),
p("geyser","Havells Adonia I 25L Vertical Geyser","Havells",8499,10999,35,[{key:"Capacity",value:"25 Litres"},{key:"Type",value:"Vertical"},{key:"Power",value:"2000W"},{key:"Feature",value:"Titanium Glasslined Tank"}],["geyser","havells","25l","titanium"]),
p("geyser","Venus Lyra 10L Storage Geyser","Venus",4499,6499,55,[{key:"Capacity",value:"10 Litres"},{key:"Type",value:"Horizontal"},{key:"Power",value:"2000W"},{key:"Feature",value:"Corrosion Resistant Magnesium Rod"}],["geyser","venus","10l","horizontal"]),
p("iron","Philips Dry Iron GC102 1000W","Philips",799,1299,200,[{key:"Type",value:"Dry Iron"},{key:"Power",value:"1000W"},{key:"Soleplate",value:"Non-Stick"},{key:"Feature",value:"Temperature Selector"}],["iron","philips","dry","1000w"],{is_bestseller:true}),
p("iron","Bajaj Majesty DX7 1000W Dry Iron","Bajaj",599,999,250,[{key:"Type",value:"Dry Iron"},{key:"Power",value:"1000W"},{key:"Soleplate",value:"Non-Stick"},{key:"Feature",value:"Super Glide Technology"}],["iron","bajaj","dry","budget"]),
p("iron","Philips Steam Iron GC2999 2400W","Philips",2999,3999,120,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2400W"},{key:"Steam",value:"40g/min"},{key:"Feature",value:"OptimalTemp Technology"}],["iron","philips","steam","2400w"],{is_featured:true}),
p("iron","Morphy Richards Turbosteam 2400W Iron","Morphy Richards",3499,4999,80,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2400W"},{key:"Steam",value:"45g/min"},{key:"Soleplate",value:"Stainless Steel"}],["iron","morphy-richards","steam","turbosteam"]),
p("iron","Usha Techne 2000W Steam Iron EI 3802","Usha",1999,2999,100,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2000W"},{key:"Steam",value:"25g/min"},{key:"Feature",value:"Variable Steam Control"}],["iron","usha","steam","2000w"]),
p("geyser","Bajaj Caldia 3L Instant Geyser","Bajaj",2999,4499,80,[{key:"Capacity",value:"3 Litres"},{key:"Type",value:"Instant"},{key:"Power",value:"3000W"},{key:"Feature",value:"Pilot Indicator"}],["geyser","bajaj","instant","3l"]),
p("iron","Singer Pressmaster Stream Iron 2400W","Singer",1799,2799,90,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2400W"},{key:"Tank",value:"300 ml"},{key:"Feature",value:"Anti-Drip System"}],["iron","singer","steam","2400w"]),
p("fan","Luminous Dhoom 1200mm High Speed Fan","Luminous",1499,2099,130,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"Aluminium"},{key:"Speed",value:"375 RPM"},{key:"Power",value:"70W"}],["ceiling-fan","luminous","high-speed","1200mm"]),
p("geyser","Crompton Amica 25L 5 Star Geyser","Crompton",7999,10499,35,[{key:"Capacity",value:"25 Litres"},{key:"Star Rating",value:"5 Star"},{key:"Power",value:"2000W"},{key:"Feature",value:"Feather Touch Controls"}],["geyser","crompton","25l","5-star"]),
p("iron","Inalsa Max Steam 2400W Iron","Inalsa",1499,2299,110,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2400W"},{key:"Soleplate",value:"Ceramic"},{key:"Feature",value:"Self-Clean Function"}],["iron","inalsa","ceramic","2400w"]),
p("fan","Superfan Super A1 78W 1200mm Fan","Superfan",9999,12999,30,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"BLDC 30W"},{key:"Feature",value:"IoT + Voice Control"},{key:"Star Rating",value:"5 Star"}],["ceiling-fan","superfan","bldc","iot"],{is_featured:true}),
p("geyser","Jaquar Elena 15L 5 Star Geyser","Jaquar",8499,11499,30,[{key:"Capacity",value:"15 Litres"},{key:"Star Rating",value:"5 Star"},{key:"Feature",value:"Hard Water Protection"},{key:"Warranty",value:"8 Years Tank"}],["geyser","jaquar","15l","hard-water"]),
p("iron","Havells Fabio 2000W Steam Press Iron","Havells",2499,3499,90,[{key:"Type",value:"Steam Iron"},{key:"Power",value:"2000W"},{key:"Soleplate",value:"Stainless Steel"},{key:"Feature",value:"Continuous Steam 30g/min"}],["iron","havells","steam","2000w"]),
p("fan","Polycab Aereo Slim 1200mm BLDC Fan","Polycab",3999,5499,55,[{key:"Sweep",value:"1200 mm"},{key:"Motor",value:"BLDC 28W"},{key:"Feature",value:"Remote Control"},{key:"Star Rating",value:"5 Star"}],["ceiling-fan","polycab","bldc","slim"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "appliances")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing appliances products`);
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
  console.log(`\n✅ Done! ${inserted} Appliances products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
