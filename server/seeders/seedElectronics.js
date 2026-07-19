/**
 * seedElectronics.js — 100 Electronics Products
 * Run: node server/seeders/seedElectronics.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  laptop:    ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80","https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80","https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80"],
  headphone: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80","https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80","https://images.unsplash.com/photo-1520170350707-b2da59970118?w=600&q=80"],
  tv:        ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80","https://images.unsplash.com/photo-1571415060716-baff5ea4c1d7?w=600&q=80","https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&q=80","https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&q=80"],
  camera:    ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80","https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80","https://images.unsplash.com/photo-1471733820775-51f7cf96efab?w=600&q=80","https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=600&q=80"],
  tablet:    ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80","https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&q=80","https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80","https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=600&q=80"],
  speaker:   ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80","https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
  printer:   ["https://images.unsplash.com/photo-1612815292020-919b7b76f64e?w=600&q=80","https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80"],
  monitor:   ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80","https://images.unsplash.com/photo-1593640408182-31c228b71ed8?w=600&q=80","https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80","https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80"],
  keyboard:  ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80","https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80","https://images.unsplash.com/photo-1595044426077-d36d9236d44a?w=600&q=80","https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600&q=80"],
  earbuds:   ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80","https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80","https://images.unsplash.com/photo-1574920162043-b872873f19bc?w=600&q=80","https://images.unsplash.com/photo-1631176093617-eb67dca8a6d7?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 500, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── LAPTOPS (1-20) ────────────────────────────────────────────────────────────
p("laptop","Apple MacBook Air M2 13-inch 256GB","Apple",99900,114900,40,[{key:"Chip",value:"Apple M2 8-core"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"256 GB SSD"},{key:"Display",value:"13.6 inch Liquid Retina"}],["laptop","apple","macbook","m2"],{is_featured:true,is_bestseller:true}),
p("laptop","Apple MacBook Pro M3 14-inch 512GB","Apple",168900,199900,20,[{key:"Chip",value:"Apple M3 Pro 11-core"},{key:"RAM",value:"18 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"14.2 inch Liquid Retina XDR"}],["laptop","apple","macbook","m3","pro"],{is_featured:true}),
p("laptop","Dell XPS 15 Core i7 OLED 512GB","Dell",149990,179990,25,[{key:"Processor",value:"Intel Core i7-13700H"},{key:"RAM",value:"16 GB DDR5"},{key:"Storage",value:"512 GB NVMe"},{key:"Display",value:"15.6 inch 3.5K OLED"}],["laptop","dell","xps","oled"],{is_featured:true}),
p("laptop","Dell Inspiron 15 Core i5 512GB","Dell",57990,69990,60,[{key:"Processor",value:"Intel Core i5-1235U"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"15.6 inch FHD"}],["laptop","dell","inspiron","intel"]),
p("laptop","HP Pavilion 15 Ryzen 5 512GB","HP",54990,64990,70,[{key:"Processor",value:"AMD Ryzen 5 7520U"},{key:"RAM",value:"8 GB DDR5"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"15.6 inch FHD IPS"}],["laptop","hp","pavilion","ryzen"],{is_bestseller:true}),
p("laptop","HP Envy x360 Core i7 2-in-1","HP",89990,109990,30,[{key:"Processor",value:"Intel Core i7-1355U"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Type",value:"2-in-1 Convertible"}],["laptop","hp","envy","convertible"]),
p("laptop","Lenovo IdeaPad Slim 5 Core i5 512GB","Lenovo",62990,74990,55,[{key:"Processor",value:"Intel Core i5-1335U"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"14 inch WUXGA IPS"}],["laptop","lenovo","ideapad","intel"]),
p("laptop","Lenovo ThinkPad E14 Core i7","Lenovo",79990,94990,35,[{key:"Processor",value:"Intel Core i7-1355U"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Feature",value:"Spill-resistant keyboard"}],["laptop","lenovo","thinkpad","business"]),
p("laptop","Asus ROG Strix G15 RTX 3070 Ti","Asus",139990,159990,20,[{key:"Processor",value:"AMD Ryzen 9 6900HX"},{key:"GPU",value:"NVIDIA RTX 3070 Ti"},{key:"RAM",value:"16 GB DDR5"},{key:"Display",value:"15.6 inch 300Hz"}],["gaming","laptop","asus","rog"],{is_featured:true}),
p("laptop","Asus VivoBook 15 Core i3 512GB","Asus",39990,49990,100,[{key:"Processor",value:"Intel Core i3-1215U"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"15.6 inch FHD"}],["laptop","asus","vivobook","budget"]),
p("laptop","Acer Aspire 5 Ryzen 5 512GB","Acer",48990,58990,80,[{key:"Processor",value:"AMD Ryzen 5 5500U"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"15.6 inch FHD IPS"}],["laptop","acer","aspire","ryzen"]),
p("laptop","Acer Predator Helios Neo RTX 4060","Acer",109990,129990,25,[{key:"Processor",value:"Intel Core i7-13700HX"},{key:"GPU",value:"NVIDIA RTX 4060"},{key:"RAM",value:"16 GB"},{key:"Display",value:"16 inch WUXGA 165Hz"}],["gaming","laptop","acer","predator"],{is_featured:true}),
p("laptop","MSI Thin GF63 RTX 4050","MSI",69990,84990,30,[{key:"Processor",value:"Intel Core i5-12450H"},{key:"GPU",value:"NVIDIA RTX 4050"},{key:"RAM",value:"8 GB"},{key:"Display",value:"15.6 inch FHD 144Hz"}],["gaming","laptop","msi","rtx"]),
p("laptop","Samsung Galaxy Book3 Core i5","Samsung",74990,89990,40,[{key:"Processor",value:"Intel Core i5-1335U"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"512 GB NVMe"},{key:"Display",value:"15.6 inch FHD AMOLED"}],["laptop","samsung","galaxy-book","intel"]),
p("laptop","Microsoft Surface Laptop 5 Core i7","Microsoft",119999,139999,20,[{key:"Processor",value:"Intel Core i7-1265U"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB"},{key:"Display",value:"13.5 inch PixelSense"}],["laptop","microsoft","surface","premium"],{is_featured:true}),
p("laptop","LG Gram 14 Core i7 Ultralight","LG",104990,124990,25,[{key:"Processor",value:"Intel Core i7-1360P"},{key:"RAM",value:"16 GB"},{key:"Storage",value:"512 GB"},{key:"Weight",value:"999g"}],["laptop","lg","gram","ultralight"]),
p("laptop","HP Victus 15 RTX 3050 Gaming","HP",67990,79990,45,[{key:"Processor",value:"AMD Ryzen 5 7535HS"},{key:"GPU",value:"NVIDIA RTX 3050"},{key:"RAM",value:"8 GB"},{key:"Display",value:"15.6 inch FHD 144Hz"}],["gaming","laptop","hp","victus"]),
p("laptop","Lenovo Legion 5 RTX 4060 Gaming","Lenovo",94990,114990,30,[{key:"Processor",value:"AMD Ryzen 7 7745HX"},{key:"GPU",value:"NVIDIA RTX 4060"},{key:"RAM",value:"16 GB"},{key:"Display",value:"15.6 inch FHD 144Hz"}],["gaming","laptop","lenovo","legion"],{is_bestseller:true}),
p("laptop","Infinix INBook X2 Slim Core i3","Infinix",25990,34990,120,[{key:"Processor",value:"Intel Core i3-1115G4"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"256 GB SSD"},{key:"Display",value:"14 inch FHD IPS"}],["laptop","infinix","budget","thin"]),
p("laptop","Realme Book Prime Core i5","Realme",43990,52990,90,[{key:"Processor",value:"Intel Core i5-1155G7"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"512 GB SSD"},{key:"Display",value:"14 inch 2K IPS"}],["laptop","realme","book","intel"]),

// ── TELEVISIONS (21-35) ───────────────────────────────────────────────────────
p("tv","Samsung 55-inch 4K QLED Smart TV","Samsung",64990,84990,30,[{key:"Screen",value:"55 inch"},{key:"Resolution",value:"4K UHD QLED"},{key:"OS",value:"Tizen"},{key:"Feature",value:"HDR10+"}],["tv","samsung","qled","4k"],{is_featured:true}),
p("tv","Samsung 43-inch Crystal 4K Smart TV","Samsung",34990,44990,50,[{key:"Screen",value:"43 inch"},{key:"Resolution",value:"4K UHD"},{key:"OS",value:"Tizen"},{key:"Feature",value:"Motion Xcelerator"}],["tv","samsung","crystal","4k"]),
p("tv","LG 55-inch OLED C3 4K TV","LG",129990,159990,15,[{key:"Screen",value:"55 inch"},{key:"Panel",value:"OLED evo"},{key:"Resolution",value:"4K 120Hz"},{key:"Feature",value:"Dolby Vision IQ"}],["tv","lg","oled","premium"],{is_featured:true}),
p("tv","LG 43-inch Full HD Smart TV","LG",28990,35990,55,[{key:"Screen",value:"43 inch"},{key:"Resolution",value:"Full HD"},{key:"OS",value:"webOS"},{key:"Audio",value:"20W Dolby Audio"}],["tv","lg","fullhd","smart"]),
p("tv","Sony Bravia 55-inch X75L 4K TV","Sony",62990,79990,25,[{key:"Screen",value:"55 inch"},{key:"Resolution",value:"4K HDR"},{key:"OS",value:"Google TV"},{key:"Processor",value:"X1 4K HDR Processor"}],["tv","sony","bravia","google-tv"],{is_bestseller:true}),
p("tv","Sony Bravia 32-inch HD Smart TV","Sony",22990,28990,70,[{key:"Screen",value:"32 inch"},{key:"Resolution",value:"HD Ready"},{key:"OS",value:"Google TV"},{key:"Audio",value:"10W"}],["tv","sony","bravia","hd"]),
p("tv","Mi 4K Ultra HD Android TV 43-inch","Xiaomi",28999,36999,65,[{key:"Screen",value:"43 inch"},{key:"Resolution",value:"4K UHD"},{key:"OS",value:"Android TV 11"},{key:"Audio",value:"30W"}],["tv","xiaomi","mi","android"]),
p("tv","OnePlus U1S 55-inch 4K Smart TV","OnePlus",42999,54999,40,[{key:"Screen",value:"55 inch"},{key:"Resolution",value:"4K QLED"},{key:"OS",value:"OxygenPlay"},{key:"Feature",value:"Gamma Engine"}],["tv","oneplus","qled","4k"]),
p("tv","Vu Premium 65-inch 4K Android TV","Vu",54999,69999,20,[{key:"Screen",value:"65 inch"},{key:"Resolution",value:"4K"},{key:"OS",value:"Android 10"},{key:"Audio",value:"60W JBL"}],["tv","vu","premium","65inch"]),
p("tv","TCL 50-inch 4K Smart TV P635","TCL",32999,42999,45,[{key:"Screen",value:"50 inch"},{key:"Resolution",value:"4K HDR"},{key:"OS",value:"Google TV"},{key:"Feature",value:"Dolby Audio"}],["tv","tcl","4k","google-tv"]),
p("tv","Hisense 55-inch ULED 4K Smart TV","Hisense",44999,59999,30,[{key:"Screen",value:"55 inch"},{key:"Panel",value:"ULED"},{key:"Resolution",value:"4K 120Hz"},{key:"Feature",value:"Quantum Dot"}],["tv","hisense","uled","4k"]),
p("tv","Toshiba 32-inch HD Smart Fire TV","Toshiba",13999,19999,90,[{key:"Screen",value:"32 inch"},{key:"Resolution",value:"HD Ready"},{key:"OS",value:"Fire TV"},{key:"Voice",value:"Alexa Built-in"}],["tv","toshiba","firetv","hd"]),
p("tv","Panasonic 43-inch 4K LED Smart TV","Panasonic",33999,42999,50,[{key:"Screen",value:"43 inch"},{key:"Resolution",value:"4K UHD"},{key:"OS",value:"My Home Screen"},{key:"Audio",value:"20W"}],["tv","panasonic","4k","led"]),
p("tv","Kodak 50-inch 4K Android TV","Kodak",27999,36999,55,[{key:"Screen",value:"50 inch"},{key:"Resolution",value:"4K"},{key:"OS",value:"Android 11"},{key:"Port",value:"3x HDMI + 2x USB"}],["tv","kodak","4k","android"]),
p("tv","iFFALCON 75-inch 4K QLED TV","iFFALCON",69999,89999,15,[{key:"Screen",value:"75 inch"},{key:"Panel",value:"QLED"},{key:"Resolution",value:"4K"},{key:"OS",value:"Google TV"}],["tv","iffalcon","qled","75inch"],{is_featured:true}),

// ── HEADPHONES & EARBUDS (36-55) ─────────────────────────────────────────────
p("headphone","Sony WH-1000XM5 Wireless Noise Cancelling","Sony",24990,29990,80,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"30 Hours"},{key:"Feature",value:"Industry-best ANC"},{key:"Connectivity",value:"Bluetooth 5.2"}],["headphone","sony","noise-cancelling","wireless"],{is_featured:true,is_bestseller:true}),
p("headphone","Bose QuietComfort 45 Wireless","Bose",24990,32990,60,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"24 Hours"},{key:"Feature",value:"World-class ANC"},{key:"Weight",value:"238g"}],["headphone","bose","anc","premium"],{is_featured:true}),
p("headphone","Apple AirPods Max","Apple",54900,59900,30,[{key:"Type",value:"Over-Ear"},{key:"Feature",value:"Apple H1 Chip"},{key:"ANC",value:"Active Noise Cancellation"},{key:"Audio",value:"Hi-Fi Adaptive EQ"}],["headphone","apple","airpods-max","premium"],{is_featured:true}),
p("headphone","JBL Tune 760NC Wireless","JBL",5999,8999,120,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"35 Hours"},{key:"Feature",value:"Active Noise Cancelling"},{key:"Driver",value:"40mm"}],["headphone","jbl","anc","wireless"],{is_bestseller:true}),
p("headphone","boAt Rockerz 550 Wireless","boAt",1299,3990,300,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"20 Hours"},{key:"Driver",value:"40mm"},{key:"Connectivity",value:"Bluetooth 5.0"}],["headphone","boat","wireless","budget"],{is_bestseller:true}),
p("headphone","Sennheiser HD 450BT Wireless","Sennheiser",7499,12999,70,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"30 Hours"},{key:"Feature",value:"Active Noise Cancelling"},{key:"Codec",value:"AAC, aptX"}],["headphone","sennheiser","anc","wireless"]),
p("headphone","Skullcandy Crusher Evo Wireless","Skullcandy",9999,14999,60,[{key:"Type",value:"Over-Ear"},{key:"Battery",value:"40 Hours"},{key:"Feature",value:"Sensory Bass"},{key:"Connectivity",value:"Bluetooth 5.1"}],["headphone","skullcandy","bass","wireless"]),
p("headphone","Jabra Evolve2 55 Business Headset","Jabra",19999,27999,40,[{key:"Type",value:"Over-Ear"},{key:"ANC",value:"Advanced Hybrid ANC"},{key:"Battery",value:"36 Hours"},{key:"Mic",value:"8-mic Call Technology"}],["headphone","jabra","business","anc"]),
p("earbuds","Apple AirPods Pro 2nd Gen","Apple",24900,26900,80,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Active Noise Cancellation"},{key:"Battery",value:"30 Hours with case"},{key:"Feature",value:"Adaptive Audio"}],["earbuds","apple","airpods-pro","anc"],{is_featured:true,is_bestseller:true}),
p("earbuds","Samsung Galaxy Buds2 Pro","Samsung",11999,17999,100,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Intelligent ANC"},{key:"Battery",value:"8+29 Hours"},{key:"Driver",value:"10mm Woofer + 5.5mm Tweeter"}],["earbuds","samsung","galaxy-buds","anc"]),
p("earbuds","Sony WF-1000XM5 TWS","Sony",19990,24990,70,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Industry-best ANC"},{key:"Battery",value:"8+24 Hours"},{key:"Driver",value:"8.4mm"}],["earbuds","sony","twitch","noise-cancelling"]),
p("earbuds","OnePlus Buds Pro 2 TWS","OnePlus",9999,12999,120,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Max 48dB Adaptive ANC"},{key:"Battery",value:"9+36 Hours"},{key:"Feature",value:"LHDC 5.0 HiFi"}],["earbuds","oneplus","twitch","anc"]),
p("earbuds","boAt Airdopes 141 TWS","boAt",999,2499,500,[{key:"Type",value:"In-Ear TWS"},{key:"Battery",value:"6+42 Hours"},{key:"Driver",value:"8mm"},{key:"Feature",value:"ENx Tech Mic"}],["earbuds","boat","tws","budget"],{is_bestseller:true}),
p("earbuds","Nothing Ear 2 TWS","Nothing",8999,10999,90,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Up to 40dB"},{key:"Battery",value:"6.3+22.5 Hours"},{key:"Driver",value:"11.6mm Custom Dynamic"}],["earbuds","nothing","ear2","transparent"]),
p("earbuds","Jabra Elite 4 Active TWS","Jabra",7999,10999,80,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Adjustable ANC"},{key:"Battery",value:"7+28 Hours"},{key:"Rating",value:"IP57 Water Resistant"}],["earbuds","jabra","active","sport"]),
p("earbuds","JBL Tune 230NC TWS","JBL",3999,6999,180,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"Active Noise Cancelling"},{key:"Battery",value:"10+40 Hours"},{key:"Driver",value:"10mm"}],["earbuds","jbl","anc","tws"]),
p("earbuds","Realme Buds Air 5 Pro TWS","Realme",3499,5999,200,[{key:"Type",value:"In-Ear TWS"},{key:"ANC",value:"50dB Hybrid ANC"},{key:"Battery",value:"6+30 Hours"},{key:"Driver",value:"12.4mm"}],["earbuds","realme","anc","budget"]),
p("earbuds","Noise Buds VS104 TWS","Noise",1299,2999,300,[{key:"Type",value:"In-Ear TWS"},{key:"Battery",value:"6+24 Hours"},{key:"Driver",value:"10mm"},{key:"Connectivity",value:"Bluetooth 5.2"}],["earbuds","noise","tws","budget"]),
p("speaker","JBL Charge 5 Bluetooth Speaker","JBL",14999,18999,80,[{key:"Type",value:"Portable BT Speaker"},{key:"Battery",value:"20 Hours"},{key:"Rating",value:"IP67"},{key:"Feature",value:"PowerBank Function"}],["speaker","jbl","bluetooth","portable"],{is_bestseller:true}),
p("speaker","Sony SRS-XB43 Bluetooth Speaker","Sony",12990,16990,70,[{key:"Type",value:"Portable BT Speaker"},{key:"Battery",value:"24 Hours"},{key:"Feature",value:"Extra Bass"},{key:"Rating",value:"IP67"}],["speaker","sony","bluetooth","bass"]),

// ── CAMERAS & ACCESSORIES (56-65) ────────────────────────────────────────────
p("camera","Sony ZV-E10 Mirrorless Camera + 16-50mm","Sony",59990,69990,40,[{key:"Sensor",value:"24.2 MP APS-C"},{key:"Video",value:"4K 30fps"},{key:"Mount",value:"Sony E-mount"},{key:"Feature",value:"Vlog Optimised"}],["camera","sony","mirrorless","vlog"],{is_featured:true}),
p("camera","Canon EOS 1500D DSLR 18-55mm Kit","Canon",29990,36990,55,[{key:"Sensor",value:"24.1 MP APS-C"},{key:"Video",value:"Full HD 1080p"},{key:"Feature",value:"Wi-Fi + NFC"},{key:"Processor",value:"DIGIC 4+"}],["camera","canon","dslr","beginner"],{is_bestseller:true}),
p("camera","Nikon D3500 DSLR 18-55mm VR Kit","Nikon",30990,37990,45,[{key:"Sensor",value:"24.2 MP APS-C"},{key:"Battery",value:"1500 shots"},{key:"Video",value:"Full HD"},{key:"Feature",value:"Guide Mode"}],["camera","nikon","dslr","beginner"]),
p("camera","Fujifilm X-T30 II Mirrorless Body","Fujifilm",79990,94990,25,[{key:"Sensor",value:"26.1 MP APS-C X-Trans"},{key:"Video",value:"4K 30fps"},{key:"Feature",value:"Film Simulations"},{key:"EVF",value:"2.36M-dot"}],["camera","fujifilm","mirrorless","retro"]),
p("camera","GoPro HERO12 Black Action Camera","GoPro",39990,47990,60,[{key:"Video",value:"5.3K60fps"},{key:"Photo",value:"27 MP"},{key:"Rating",value:"Waterproof 10m"},{key:"Feature",value:"HyperSmooth 6.0"}],["camera","gopro","action","waterproof"],{is_bestseller:true}),
p("camera","DJI Pocket 3 Gimbal Camera","DJI",64990,74990,30,[{key:"Sensor",value:"1-inch CMOS"},{key:"Video",value:"4K 120fps"},{key:"Feature",value:"3-axis Motorised Gimbal"},{key:"Storage",value:"Built-in"}],["camera","dji","pocket","gimbal"],{is_featured:true}),
p("camera","Sony Alpha 6400 Mirrorless Body","Sony",79990,94990,20,[{key:"Sensor",value:"24.2 MP APS-C Exmor"},{key:"Autofocus",value:"Real-time Eye AF"},{key:"Video",value:"4K"},{key:"FPS",value:"11 fps"}],["camera","sony","alpha","mirrorless"]),
p("camera","Canon PowerShot G7X Mark III","Canon",49990,59990,35,[{key:"Sensor",value:"20.1 MP 1-inch CMOS"},{key:"Video",value:"4K 30fps"},{key:"Feature",value:"Live Streaming"},{key:"Zoom",value:"4.2x Optical"}],["camera","canon","compact","vlog"]),
p("camera","Insta360 X3 360-degree Camera","Insta360",42999,49999,40,[{key:"Video",value:"5.7K 360° / 4K Single"},{key:"Feature",value:"FlowState Stabilization"},{key:"Rating",value:"IPX8 Waterproof"},{key:"Display",value:"2.29 inch Touchscreen"}],["camera","insta360","360","action"]),
p("camera","Polaroid Now+ Instant Camera","Polaroid",14999,18999,50,[{key:"Type",value:"Instant Film Camera"},{key:"Film",value:"i-Type / 600"},{key:"Feature",value:"Bluetooth + 5 Lens Filters"},{key:"Flash",value:"Autofocus"}],["camera","polaroid","instant","film"]),

// ── MONITORS, KEYBOARDS, PRINTERS & TABLETS (66-100) ─────────────────────────
p("monitor","LG 27-inch 4K IPS Monitor","LG",28990,36990,50,[{key:"Size",value:"27 inch"},{key:"Resolution",value:"4K UHD 3840x2160"},{key:"Panel",value:"IPS"},{key:"Feature",value:"USB-C 60W"}],["monitor","lg","4k","professional"],{is_featured:true}),
p("monitor","Samsung 32-inch 4K UHD Monitor","Samsung",34990,42990,40,[{key:"Size",value:"32 inch"},{key:"Resolution",value:"4K UHD"},{key:"Panel",value:"VA"},{key:"Feature",value:"HDR10+ 1000"}],["monitor","samsung","4k","va"]),
p("monitor","Dell S2722QC 27-inch 4K USB-C","Dell",31990,38990,45,[{key:"Size",value:"27 inch"},{key:"Resolution",value:"4K UHD"},{key:"Port",value:"USB-C 65W"},{key:"Panel",value:"IPS"}],["monitor","dell","4k","usb-c"]),
p("monitor","BenQ PD2705Q 27-inch QHD","BenQ",29990,36990,35,[{key:"Size",value:"27 inch"},{key:"Resolution",value:"2560x1440 QHD"},{key:"Panel",value:"IPS"},{key:"Feature",value:"99% sRGB"}],["monitor","benq","qhd","designer"]),
p("monitor","Asus ProArt 27-inch 4K OLED","Asus",84990,99990,15,[{key:"Size",value:"27 inch"},{key:"Panel",value:"OLED"},{key:"Resolution",value:"4K 3840x2160"},{key:"Feature",value:"99% DCI-P3"}],["monitor","asus","proart","oled"],{is_featured:true}),
p("monitor","AOC 24-inch Full HD Gaming 144Hz","AOC",9990,13990,100,[{key:"Size",value:"24 inch"},{key:"Resolution",value:"Full HD 144Hz"},{key:"Panel",value:"IPS"},{key:"Feature",value:"AMD FreeSync"}],["monitor","aoc","gaming","144hz"]),
p("keyboard","Logitech MX Keys Wireless Keyboard","Logitech",9495,12995,80,[{key:"Type",value:"Wireless"},{key:"Backlit",value:"Smart Backlit"},{key:"Battery",value:"10 Days"},{key:"Connectivity",value:"Bluetooth + USB"}],["keyboard","logitech","wireless","productivity"],{is_bestseller:true}),
p("keyboard","Keychron K2 Mechanical Wireless","Keychron",7999,9999,70,[{key:"Type",value:"Mechanical Wireless"},{key:"Switch",value:"Gateron Brown"},{key:"Layout",value:"75% TKL"},{key:"Backlit",value:"RGB"}],["keyboard","keychron","mechanical","wireless"]),
p("keyboard","HP K10G Wired Gaming Keyboard","HP",999,1999,200,[{key:"Type",value:"Wired"},{key:"Switch",value:"Membrane"},{key:"Feature",value:"19 Anti-Ghosting Keys"},{key:"Backlit",value:"RGB"}],["keyboard","hp","gaming","budget"]),
p("keyboard","Dell KB216 Wired Multimedia","Dell",649,999,300,[{key:"Type",value:"Wired USB"},{key:"Keys",value:"104 Keys"},{key:"Feature",value:"Multimedia Shortcut Keys"},{key:"Compatibility",value:"Windows"}],["keyboard","dell","wired","office"]),
p("keyboard","Logitech G213 Gaming Keyboard","Logitech",3995,5495,120,[{key:"Type",value:"Wired Gaming"},{key:"Backlit",value:"Spectrum RGB"},{key:"Switch",value:"Mech-Dome"},{key:"Feature",value:"Spill Resistant"}],["keyboard","logitech","gaming","rgb"]),
p("keyboard","Apple Magic Keyboard with Touch ID","Apple",10900,12900,60,[{key:"Type",value:"Wireless"},{key:"Feature",value:"Touch ID"},{key:"Connectivity",value:"Bluetooth"},{key:"Battery",value:"1 Month"}],["keyboard","apple","magic","wireless"]),
p("printer","HP LaserJet MFP M141w Wireless","HP",13990,17990,60,[{key:"Type",value:"Laser MFP"},{key:"Function",value:"Print Scan Copy"},{key:"Speed",value:"21 ppm"},{key:"Connectivity",value:"Wi-Fi + USB"}],["printer","hp","laser","wireless"],{is_bestseller:true}),
p("printer","Epson EcoTank L3210 Ink Tank","Epson",9499,13999,80,[{key:"Type",value:"Inkjet MFP"},{key:"Function",value:"Print Scan Copy"},{key:"Ink",value:"EcoTank Refillable"},{key:"Speed",value:"10 ppm Black"}],["printer","epson","ecotank","budget"]),
p("printer","Canon PIXMA G3020 WiFi Ink Tank","Canon",10999,14999,70,[{key:"Type",value:"Inkjet MFP"},{key:"Function",value:"Print Scan Copy"},{key:"Connectivity",value:"Wi-Fi"},{key:"Ink",value:"Megatank"}],["printer","canon","inkjet","wifi"]),
p("tablet","Apple iPad 10th Gen 64GB Wi-Fi","Apple",44900,49900,60,[{key:"Chip",value:"A14 Bionic"},{key:"Display",value:"10.9 inch Liquid Retina"},{key:"Storage",value:"64 GB"},{key:"Camera",value:"12 MP"}],["tablet","apple","ipad","ios"],{is_featured:true}),
p("tablet","Samsung Galaxy Tab S9 FE 128GB","Samsung",44999,52999,50,[{key:"Processor",value:"Exynos 1380"},{key:"Display",value:"10.9 inch WUXGA+"},{key:"Storage",value:"128 GB"},{key:"Stylus",value:"S Pen Included"}],["tablet","samsung","galaxy-tab","android"]),
p("tablet","Lenovo Tab P12 Pro 256GB","Lenovo",64999,79999,30,[{key:"Display",value:"12.6 inch AMOLED 120Hz"},{key:"Processor",value:"Snapdragon 870"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"256 GB"}],["tablet","lenovo","tab","amoled"]),
p("tablet","Xiaomi Pad 6 256GB","Xiaomi",29999,37999,70,[{key:"Processor",value:"Snapdragon 870"},{key:"Display",value:"11 inch 144Hz IPS"},{key:"RAM",value:"8 GB"},{key:"Storage",value:"256 GB"}],["tablet","xiaomi","pad","gaming"]),
p("tablet","realme Pad 2 WiFi 64GB","Realme",15999,22999,90,[{key:"Processor",value:"Helio G99"},{key:"Display",value:"11.5 inch 90Hz LCD"},{key:"RAM",value:"6 GB"},{key:"Storage",value:"64 GB"}],["tablet","realme","pad","budget"]),
p("speaker","Bose SoundLink Flex BT Speaker","Bose",11900,13900,70,[{key:"Battery",value:"12 Hours"},{key:"Rating",value:"IP67"},{key:"Feature",value:"PositionIQ"},{key:"Color",value:"Multiple"}],["speaker","bose","portable","waterproof"]),
p("speaker","Marshall Stanmore III BT Speaker","Marshall",29999,34999,30,[{key:"Power",value:"80W RMS"},{key:"Connectivity",value:"Bluetooth 5.2"},{key:"Feature",value:"Multi-directional"},{key:"Style",value:"Classic Marshall"}],["speaker","marshall","home","premium"],{is_featured:true}),
p("speaker","Boat Stone 1010 10W BT Speaker","boAt",1799,3999,200,[{key:"Power",value:"10W"},{key:"Battery",value:"12 Hours"},{key:"Rating",value:"IPX5"},{key:"Connectivity",value:"Bluetooth 5.0"}],["speaker","boat","portable","budget"],{is_bestseller:true}),
p("speaker","Sonos One Gen 2 Smart Speaker","Sonos",21999,26999,40,[{key:"Feature",value:"Amazon Alexa Built-in"},{key:"Audio",value:"Trueplay Auto-tuning"},{key:"Connectivity",value:"Wi-Fi"},{key:"Room",value:"Multi-room Audio"}],["speaker","sonos","smart","alexa"]),
p("speaker","Harman Kardon Onyx Studio 8","Harman Kardon",22999,28999,35,[{key:"Power",value:"50W"},{key:"Battery",value:"8 Hours"},{key:"Connectivity",value:"Bluetooth 5.3"},{key:"Feature",value:"Wireless Stereo Mode"}],["speaker","harman","portable","premium"]),
p("monitor","ViewSonic 27-inch 165Hz Gaming","ViewSonic",18990,24990,60,[{key:"Size",value:"27 inch"},{key:"Resolution",value:"Full HD 1080p"},{key:"Refresh",value:"165Hz"},{key:"Panel",value:"IPS"}],["monitor","viewsonic","gaming","165hz"]),
p("keyboard","Corsair K70 RGB MK.2 Mechanical","Corsair",12999,16999,50,[{key:"Type",value:"Wired Mechanical"},{key:"Switch",value:"Cherry MX Red"},{key:"Backlit",value:"Per-key RGB"},{key:"Feature",value:"Aluminium Frame"}],["keyboard","corsair","mechanical","gaming"]),
p("printer","Brother HL-L2321D Laser Printer","Brother",9999,13999,70,[{key:"Type",value:"Monochrome Laser"},{key:"Speed",value:"30 ppm"},{key:"Feature",value:"Automatic Duplex"},{key:"Connectivity",value:"USB"}],["printer","brother","laser","duplex"]),
p("tablet","OnePlus Pad 128GB","OnePlus",37999,44999,45,[{key:"Processor",value:"Dimensity 9000"},{key:"Display",value:"11.61 inch 144Hz LCD"},{key:"RAM",value:"8 GB"},{key:"Battery",value:"9510 mAh 67W"}],["tablet","oneplus","pad","android"]),
p("speaker","Tribit StormBox Pro 360 Speaker","Tribit",7999,11999,80,[{key:"Power",value:"40W"},{key:"Battery",value:"24 Hours"},{key:"Rating",value:"IPX7"},{key:"Feature",value:"360° Sound"}],["speaker","tribit","360","portable"]),
p("speaker","Amazon Echo Studio Smart Speaker","Amazon",21999,24999,55,[{key:"Audio",value:"330W 5-speaker"},{key:"Feature",value:"Dolby Atmos + 3D Audio"},{key:"Smart",value:"Alexa Built-in"},{key:"Connectivity",value:"Wi-Fi + Bluetooth"}],["speaker","amazon","echo","alexa"],{is_bestseller:true}),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });

  if (!categories.length) { console.error("❌ No categories found. Run seedCategory first."); process.exit(1); }

  const catId = categories.find(c => c.slug === "electronics")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;

  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing electronics products`);

  let inserted = 0;
  for (const raw of PRODUCTS) {
    const { _brandName, ...data } = raw;
    data.category_id = catId;
    const bKey = (_brandName || "").toLowerCase();
    data.brand_id = brandMap[bKey] || defaultBrand;
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) data.slug = data.slug + "-" + Date.now().toString().slice(-4);
    await Product.create(data);
    inserted++;
    process.stdout.write(`\r✍️  Inserted ${inserted}/100`);
  }

  console.log(`\n✅ Done! ${inserted} Electronics products seeded.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });