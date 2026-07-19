/**
 * seedHomeKitchen.js — 100 Home & Kitchen Products
 * Run: node server/seeders/seedHomeKitchen.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  cookware:  ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80","https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80","https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80","https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80"],
  furniture: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80","https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80","https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80"],
  bedding:   ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80","https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80"],
  decor:     ["https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80","https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80","https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80"],
  storage:   ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80","https://images.unsplash.com/photo-1603912699214-92627f304eb6?w=600&q=80","https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&q=80"],
  dining:    ["https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80","https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80","https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"],
  cleaning:  ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80","https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80","https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
  lighting:  ["https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80","https://images.unsplash.com/photo-1513506003901-1e6a35f60532?w=600&q=80","https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 1000, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── COOKWARE (1-18) ───────────────────────────────────────────────────────────
p("cookware","Prestige Aluminium Non-Stick Tawa 280mm","Prestige",699,999,200,[{key:"Material",value:"Aluminium"},{key:"Coating",value:"Non-Stick"},{key:"Size",value:"280mm"},{key:"Compatible",value:"Gas Stove"}],["tawa","prestige","non-stick","cookware"],{is_bestseller:true}),
p("cookware","Hawkins Futura Non-Stick Deep Pan 1.5L","Hawkins",1299,1799,150,[{key:"Material",value:"Aluminium"},{key:"Coating",value:"Hard Anodised Non-Stick"},{key:"Capacity",value:"1.5 Litres"},{key:"Lid",value:"Included"}],["pan","hawkins","non-stick","hard-anodised"]),
p("cookware","Meyer Stainless Steel Kadai 2.5L","Meyer",2499,3499,100,[{key:"Material",value:"Stainless Steel 304"},{key:"Capacity",value:"2.5 Litres"},{key:"Handle",value:"Stay-Cool"},{key:"Compatible",value:"All Cooktops"}],["kadai","meyer","stainless-steel","indian"]),
p("cookware","Prestige Pressure Cooker 5L Induction","Prestige",1999,2799,120,[{key:"Material",value:"Aluminium"},{key:"Capacity",value:"5 Litres"},{key:"Compatible",value:"Gas + Induction"},{key:"Safety",value:"Auto Lock Lid"}],["pressure-cooker","prestige","5l","induction"],{is_bestseller:true}),
p("cookware","Hawkins Hevibase Pressure Cooker 3L","Hawkins",1599,2199,130,[{key:"Material",value:"Hard Anodised"},{key:"Capacity",value:"3 Litres"},{key:"Compatible",value:"Gas"},{key:"Feature",value:"Heavy Base"}],["pressure-cooker","hawkins","3l","gas"]),
p("cookware","Wonderchef Maestro Fry Pan 24cm","Wonderchef",1899,2799,90,[{key:"Material",value:"Forged Aluminium"},{key:"Coating",value:"5-layer Non-Stick"},{key:"Size",value:"24cm"},{key:"Handle",value:"SS Riveted"}],["frypan","wonderchef","non-stick","24cm"]),
p("cookware","Milton Pro Cook Stainless Casserole 2L","Milton",1299,1999,110,[{key:"Material",value:"Stainless Steel"},{key:"Capacity",value:"2 Litres"},{key:"Lid",value:"Stainless Steel Lid"},{key:"Feature",value:"Induction Compatible"}],["casserole","milton","stainless","2l"]),
p("cookware","Vinod Stainless Steel Induction Kadai 1.5L","Vinod",1499,2199,100,[{key:"Material",value:"Triply Stainless Steel"},{key:"Capacity",value:"1.5 Litres"},{key:"Compatible",value:"All Cooktops"},{key:"Warranty",value:"Lifetime"}],["kadai","vinod","triply","induction"]),
p("cookware","Bergner Grill Pan 28cm Granite","Bergner",1799,2799,80,[{key:"Material",value:"Aluminium"},{key:"Coating",value:"Granite Non-Stick"},{key:"Size",value:"28cm"},{key:"Feature",value:"Raised Ridges"}],["grill-pan","bergner","granite","28cm"]),
p("cookware","Pigeon Non-Stick Cookware Set 5pcs","Pigeon",1999,3499,70,[{key:"Material",value:"Aluminium"},{key:"Coating",value:"Non-Stick"},{key:"Set",value:"5 Pieces"},{key:"Includes",value:"Kadai+Pan+Tawa+2 Lids"}],["cookware-set","pigeon","non-stick","5piece"],{is_featured:true}),
p("cookware","Butterfly Smart Induction Cooker 1600W","Butterfly",1999,2999,80,[{key:"Power",value:"1600W"},{key:"Controls",value:"Touch Panel"},{key:"Feature",value:"Auto Shut-off"},{key:"Compatible",value:"Induction Cookware"}],["induction","butterfly","cooker","1600w"]),
p("cookware","Philips Viva Collection HD Juicer 500W","Philips",2999,3999,90,[{key:"Power",value:"500W"},{key:"Capacity",value:"2 Litres"},{key:"Speed",value:"2 Speed + Pulse"},{key:"Feature",value:"Anti-Drip Spout"}],["juicer","philips","500w","fruits"]),
p("cookware","Bajaj Rex Mixer Grinder 500W 3 Jars","Bajaj",2299,3299,100,[{key:"Power",value:"500W"},{key:"Jars",value:"3 Stainless Steel"},{key:"Speed",value:"3 Speed + Pulse"},{key:"Warranty",value:"2 Years"}],["mixer","bajaj","500w","3-jars"],{is_bestseller:true}),
p("cookware","Preethi Blue Leaf Mixer 550W 3 Jars","Preethi",3499,4499,85,[{key:"Power",value:"550W"},{key:"Jars",value:"3 Stainless Steel"},{key:"Feature",value:"Insta-Fresh Jar"},{key:"Warranty",value:"2 Years Motor"}],["mixer","preethi","550w","blue-leaf"]),
p("cookware","Cuisinart Stainless Mixing Bowl Set 3pcs","Cuisinart",1499,2299,120,[{key:"Material",value:"Stainless Steel"},{key:"Set",value:"3 Bowls"},{key:"Sizes",value:"1.5L + 2.5L + 5L"},{key:"Feature",value:"Nesting Design"}],["mixing-bowl","cuisinart","stainless","set"]),
p("cookware","Borosil Vision Glass Bowl Set 3pcs","Borosil",999,1799,150,[{key:"Material",value:"Borosilicate Glass"},{key:"Set",value:"3 Bowls"},{key:"Feature",value:"Microwave Safe"},{key:"Lid",value:"Lid Included"}],["bowl","borosil","glass","set"]),
p("cookware","Prestige Omega Aluminium Frying Pan 28cm","Prestige",1599,2299,110,[{key:"Material",value:"Cast Aluminium"},{key:"Coating",value:"Omega Select Non-Stick"},{key:"Size",value:"28cm"},{key:"Handle",value:"Bakelite"}],["frypan","prestige","28cm","cast-aluminium"]),
p("cookware","Tramontina Enamelled Cast Iron Pan 26cm","Tramontina",4999,7999,40,[{key:"Material",value:"Enamelled Cast Iron"},{key:"Size",value:"26cm"},{key:"Compatible",value:"All Cooktops + Oven"},{key:"Color",value:"Red"}],["cast-iron","tramontina","enamel","premium"],{is_featured:true}),
// ── FURNITURE (19-32) ─────────────────────────────────────────────────────────
p("furniture","Wakefit Orthopaedic Memory Foam Mattress Queen","Wakefit",14999,22999,30,[{key:"Size",value:"Queen 60x78 inch"},{key:"Type",value:"Memory Foam"},{key:"Thickness",value:"6 inch"},{key:"Feature",value:"Orthopaedic Support"}],["mattress","wakefit","queen","memory-foam"],{is_featured:true,is_bestseller:true}),
p("furniture","Sleepycat Plus Latex + Memory Foam Mattress King","Sleepycat",27999,39999,20,[{key:"Size",value:"King 72x78 inch"},{key:"Layers",value:"Latex + Memory Foam"},{key:"Thickness",value:"8 inch"},{key:"Trial",value:"100 Night Free Trial"}],["mattress","sleepycat","king","latex"]),
p("furniture","Duroflex Back Magic Foam Mattress Queen","Duroflex",11999,18999,25,[{key:"Size",value:"Queen 60x78 inch"},{key:"Type",value:"High Density Foam"},{key:"Thickness",value:"5 inch"},{key:"Feature",value:"Spine Support"}],["mattress","duroflex","queen","hd-foam"]),
p("furniture","Urban Ladder Wenge Study Table","Urban Ladder",8999,13999,40,[{key:"Material",value:"Engineered Wood"},{key:"Dimensions",value:"120x60x75 cm"},{key:"Color",value:"Wenge"},{key:"Feature",value:"Cable Management"}],["table","study","urban-ladder","wenge"]),
p("furniture","Nilkamal Plastic Chair Set of 4","Nilkamal",1999,2999,100,[{key:"Material",value:"Polypropylene Plastic"},{key:"Set",value:"4 Chairs"},{key:"Capacity",value:"110 kg each"},{key:"Color",value:"Marble Brown"}],["chair","nilkamal","plastic","set-4"],{is_bestseller:true}),
p("furniture","Godrej Interio Office Chair Ergonomic","Godrej",8999,13999,35,[{key:"Type",value:"Ergonomic Office Chair"},{key:"Seat",value:"Foam Cushion"},{key:"Feature",value:"Lumbar Support + Armrest"},{key:"Base",value:"5-Star Nylon"}],["chair","godrej","office","ergonomic"]),
p("furniture","IKEA KALLAX Shelf Unit 4 Cubes","IKEA",4999,6999,50,[{key:"Material",value:"Particleboard"},{key:"Cubes",value:"4 Compartments"},{key:"Dimensions",value:"77x77 cm"},{key:"Color",value:"White"}],["shelf","ikea","kallax","storage"]),
p("furniture","Wooden Street Queen Bed Frame Walnut","Wooden Street",24999,35999,15,[{key:"Material",value:"Sheesham Wood"},{key:"Size",value:"Queen 60x78 inch"},{key:"Finish",value:"Walnut"},{key:"Feature",value:"Storage Headboard"}],["bed","wooden-street","queen","sheesham"],{is_featured:true}),
p("furniture","Pepperfry 3-Seater Sofa Fabric Grey","Pepperfry",18999,27999,20,[{key:"Material",value:"Engineered Wood + Fabric"},{key:"Seating",value:"3 Seater"},{key:"Color",value:"Grey"},{key:"Dimensions",value:"188x83x85 cm"}],["sofa","pepperfry","3-seater","grey"]),
p("furniture","Hometown Bookshelf 5-Tier Walnut","Hometown",4999,7999,40,[{key:"Material",value:"Engineered Wood"},{key:"Shelves",value:"5 Tiers"},{key:"Color",value:"Walnut"},{key:"Dimensions",value:"60x30x180 cm"}],["bookshelf","hometown","5-tier","walnut"]),
p("furniture","FabIndia Cotton Dhurrie Rug 4x6 ft","FabIndia",3499,4999,60,[{key:"Material",value:"Pure Cotton"},{key:"Size",value:"4x6 feet"},{key:"Style",value:"Handwoven Dhurrie"},{key:"Washable",value:"Machine Washable"}],["rug","fabindia","cotton","dhurrie"]),
p("furniture","Asian Paints ezyCR8 PVC Wardrobe 3-Door","Asian Paints",12999,17999,25,[{key:"Material",value:"PVC"},{key:"Doors",value:"3 Sliding Doors"},{key:"Feature",value:"Scratch-Resistant"},{key:"Waterproof",value:"Yes"}],["wardrobe","pvc","3-door","asian-paints"]),
p("furniture","Nilkamal Freedom Small Plastic Cabinet","Nilkamal",2499,3499,80,[{key:"Material",value:"Virgin Plastic"},{key:"Shelves",value:"3 Adjustable"},{key:"Lockable",value:"Yes"},{key:"Color",value:"Wenge/Beige"}],["cabinet","nilkamal","plastic","storage"]),
p("furniture","Wooden Street Coffee Table with Drawer","Wooden Street",8999,13999,30,[{key:"Material",value:"Sheesham Wood"},{key:"Finish",value:"Honey Oak"},{key:"Feature",value:"1 Drawer + 1 Shelf"},{key:"Dimensions",value:"120x60x40 cm"}],["coffee-table","wooden-street","sheesham","drawer"]),

// ── BEDDING & BATH (33-45) ────────────────────────────────────────────────────
p("bedding","Story@Home Cotton Bedsheet Queen 144TC","Story@Home",799,1499,200,[{key:"Material",value:"100% Cotton"},{key:"Size",value:"Queen 228x254 cm"},{key:"TC",value:"144 Thread Count"},{key:"Set",value:"1 Sheet + 2 Pillow Covers"}],["bedsheet","queen","cotton","story@home"],{is_bestseller:true}),
p("bedding","Bombay Dyeing Breeze Cotton Bedsheet King","Bombay Dyeing",1299,1999,150,[{key:"Material",value:"Cotton"},{key:"Size",value:"King 274x274 cm"},{key:"TC",value:"200 Thread Count"},{key:"Set",value:"1 Sheet + 2 Pillow Covers"}],["bedsheet","king","bombay-dyeing","cotton"]),
p("bedding","Raymond Home Microfibre Comforter Double","Raymond",1999,3299,100,[{key:"Material",value:"Microfibre Shell"},{key:"Filling",value:"Hollow Fibre"},{key:"Size",value:"Double 220x240 cm"},{key:"Weight",value:"1.5 kg"}],["comforter","raymond","double","microfibre"]),
p("bedding","SPACES Hygro Cotton Bath Towel Large","SPACES",699,1199,300,[{key:"Material",value:"Hygro Cotton"},{key:"Size",value:"75x150 cm"},{key:"GSM",value:"500 GSM"},{key:"Feature",value:"Quick Dry"}],["towel","spaces","bath","hygro-cotton"],{is_bestseller:true}),
p("bedding","Trident Premium Cotton Pillow 600g","Trident",499,799,250,[{key:"Filling",value:"Microfibre"},{key:"Size",value:"17x27 inch"},{key:"Cover",value:"100% Cotton"},{key:"Feature",value:"Anti-Allergenic"}],["pillow","trident","cotton","anti-allergy"]),
p("bedding","D'Decor Jacquard Cushion Cover 5pcs 16x16","D'Decor",999,1799,120,[{key:"Material",value:"Jacquard Polyester"},{key:"Set",value:"5 Pieces"},{key:"Size",value:"16x16 inch"},{key:"Closure",value:"Zip"}],["cushion-cover","ddecor","jacquard","set-5"]),
p("bedding","Mark Home Velvet Throw Blanket 130x150cm","Mark Home",1299,1999,90,[{key:"Material",value:"Polyester Velvet"},{key:"Size",value:"130x150 cm"},{key:"Feature",value:"Super Soft"},{key:"Season",value:"All-Season"}],["blanket","throw","velvet","soft"]),
p("bedding","Spaces Simply Soft 400TC Bedsheet Queen","SPACES",1499,2299,130,[{key:"Material",value:"Combed Cotton"},{key:"TC",value:"400 Thread Count"},{key:"Size",value:"Queen"},{key:"Set",value:"Fitted Sheet + Pillow Covers"}],["bedsheet","spaces","400tc","premium"]),
p("bedding","Story@Home Waterproof Mattress Protector Queen","Story@Home",599,999,180,[{key:"Material",value:"Terry Cotton Top"},{key:"Backing",value:"Waterproof TPU"},{key:"Size",value:"Queen 60x78 inch"},{key:"Feature",value:"Machine Washable"}],["mattress-protector","waterproof","queen","story@home"]),
p("bedding","Portico New York 100% Cotton Bath Robe","Portico",1999,2999,70,[{key:"Material",value:"100% Cotton"},{key:"Size",value:"Free Size"},{key:"Type",value:"Shawl Collar"},{key:"GSM",value:"400 GSM"}],["bathrobe","portico","cotton","premium"]),
p("bedding","Home Candy Microfibre Comforter Single","Home Candy",999,1799,150,[{key:"Material",value:"Microfibre"},{key:"Size",value:"Single 150x220 cm"},{key:"Filling",value:"Hollow Siliconized Fibre"},{key:"Weight",value:"1 kg"}],["comforter","single","microfibre","home-candy"]),
p("bedding","Bombay Dyeing Luxury Cotton Bath Towel Set 2pcs","Bombay Dyeing",1299,1999,120,[{key:"Material",value:"100% Cotton"},{key:"GSM",value:"600 GSM"},{key:"Set",value:"2 Bath Towels"},{key:"Size",value:"70x140 cm each"}],["towel","set","bombay-dyeing","600gsm"]),
p("decor","Pure Home + Living Jute Planter Basket Set 3","Pure Home",999,1799,100,[{key:"Material",value:"Jute"},{key:"Set",value:"3 Sizes"},{key:"Feature",value:"Waterproof Inner"},{key:"Style",value:"Handwoven"}],["planter","jute","basket","decor"]),
// ── HOME DÉCOR & LIGHTING (46-60) ─────────────────────────────────────────────
p("decor","Philips 9W LED Bulb Cool White Pack of 6","Philips",599,999,500,[{key:"Power",value:"9W"},{key:"Color",value:"Cool White 6500K"},{key:"Base",value:"B22"},{key:"Lifespan",value:"15000 Hours"}],["led","philips","bulb","6-pack"],{is_bestseller:true}),
p("lighting","Havells Adore LED Ceiling Light 18W","Havells",1299,1799,150,[{key:"Power",value:"18W"},{key:"Type",value:"Ceiling Light"},{key:"Color",value:"Neutral White 4000K"},{key:"Diameter",value:"280mm"}],["ceiling-light","havells","led","18w"]),
p("lighting","Syska LED Panel Light Round 18W","Syska",799,1299,200,[{key:"Power",value:"18W"},{key:"Type",value:"Round Panel"},{key:"Diameter",value:"225mm"},{key:"Color",value:"Cool White"}],["panel-light","syska","led","round"]),
p("decor","Craftvatika Wooden Handpainted Warli Wall Frame","Craftvatika",1299,2199,80,[{key:"Material",value:"Sheesham Wood"},{key:"Art",value:"Warli Painting"},{key:"Size",value:"30x30 cm"},{key:"Style",value:"Traditional Indian"}],["wall-art","warli","wooden","decor"],{is_featured:true}),
p("decor","Ellementry Copper Glass Vase Set 3","Ellementry",1999,3299,60,[{key:"Material",value:"Glass with Copper Finish"},{key:"Set",value:"3 Vases"},{key:"Style",value:"Modern"},{key:"Use",value:"Dry + Artificial Flowers"}],["vase","copper","glass","decor"]),
p("decor","The Decor Mart Cotton Macramé Wall Hanging","The Decor Mart",999,1799,90,[{key:"Material",value:"Cotton Rope"},{key:"Style",value:"Boho Macramé"},{key:"Size",value:"30x60 cm"},{key:"Hanging",value:"Wooden Dowel"}],["macrame","wall-hanging","boho","cotton"]),
p("decor","IKEA FEJKA Artificial Plant in Pot","IKEA",399,599,300,[{key:"Type",value:"Artificial Plant"},{key:"Pot",value:"Plastic Pot Included"},{key:"Height",value:"9 cm"},{key:"Care",value:"No Watering Needed"}],["plant","artificial","ikea","decor"]),
p("lighting","Orient Electric Aura LED Floor Lamp","Orient",3499,4999,50,[{key:"Power",value:"24W LED"},{key:"Height",value:"155 cm"},{key:"Color",value:"Warm White"},{key:"Feature",value:"Touch Dimmer"}],["floor-lamp","orient","led","dimmable"]),
p("decor","Aesthetic Living Ceramic Diffuser Set","Aesthetic Living",1499,2499,70,[{key:"Material",value:"Ceramic"},{key:"Set",value:"Diffuser + 3 Oil Vials"},{key:"Type",value:"Reed Diffuser"},{key:"Scent",value:"Lavender + Rose + Jasmine"}],["diffuser","ceramic","aroma","set"]),
p("decor","Nestasia Glass Dome Terrarium","Nestasia",1299,1999,60,[{key:"Material",value:"Borosilicate Glass + Iron"},{key:"Shape",value:"Geometric Dome"},{key:"Size",value:"15x15x20 cm"},{key:"Use",value:"Succulent + Candle Holder"}],["terrarium","glass","dome","decor"]),
p("lighting","Wipro Garnet 12W LED Downlight Warm","Wipro",499,799,300,[{key:"Power",value:"12W"},{key:"Color",value:"Warm White 3000K"},{key:"Type",value:"Recessed Downlight"},{key:"Size",value:"90mm Cut-out"}],["downlight","wipro","led","warm-white"]),
p("decor","Home Centre Monza Photo Frame Set 5pcs","Home Centre",1299,1999,100,[{key:"Material",value:"MDF + Glass"},{key:"Set",value:"5 Frames"},{key:"Sizes",value:"4x6 + 5x7 + 8x10"},{key:"Feature",value:"Wall + Table"}],["photo-frame","home-centre","set","decor"]),
p("decor","Chumbak Gond Art Wall Clock 30cm","Chumbak",1999,2999,60,[{key:"Material",value:"MDF"},{key:"Size",value:"30cm Diameter"},{key:"Movement",value:"Silent Quartz"},{key:"Style",value:"Gond Art"}],["wall-clock","chumbak","gond-art","30cm"]),
p("lighting","Crompton BLISS LED Bulb 12W Warm Pack 4","Crompton",549,899,400,[{key:"Power",value:"12W"},{key:"Color",value:"Warm White 3000K"},{key:"Pack",value:"4 Bulbs"},{key:"Lifespan",value:"25000 Hours"}],["led","crompton","12w","warm-white"]),
p("decor","Asian Paints TruGrip Adhesive Wall Hooks 10pcs","Asian Paints",299,499,500,[{key:"Type",value:"Adhesive Hooks"},{key:"Capacity",value:"3 kg each"},{key:"Pack",value:"10 Hooks"},{key:"Feature",value:"Damage-Free Removal"}],["hooks","adhesive","wall","asian-paints"]),

// ── STORAGE & ORGANISATION (61-75) ────────────────────────────────────────────
p("storage","Cello Opalware Dinner Set 26pcs","Cello",2999,4499,80,[{key:"Material",value:"Opalware"},{key:"Set",value:"26 Pieces"},{key:"Include",value:"Plates+Bowls+Cups"},{key:"Feature",value:"Microwave Safe"}],["dinner-set","cello","opalware","26pcs"],{is_bestseller:true}),
p("storage","Signoraware Glass Lunch Box 3pcs","Signoraware",899,1499,150,[{key:"Material",value:"Borosilicate Glass"},{key:"Set",value:"3 Containers"},{key:"Feature",value:"Airtight Lid + Microwave Safe"},{key:"Capacity",value:"300+500+900 ml"}],["lunch-box","signoraware","glass","airtight"]),
p("storage","Tupperware Smart Saver Set 4pcs","Tupperware",1299,1999,100,[{key:"Material",value:"BPA-Free Plastic"},{key:"Set",value:"4 Containers"},{key:"Feature",value:"Airtight Seal"},{key:"Sizes",value:"400ml to 1.1L"}],["container","tupperware","airtight","set"]),
p("storage","Princeware Jumbo Storage Jar 4pc Set","Princeware",799,1299,120,[{key:"Material",value:"PET Plastic"},{key:"Set",value:"4 Jars"},{key:"Capacity",value:"4.5L each"},{key:"Feature",value:"Air-Tight Lid"}],["storage-jar","princeware","airtight","4-set"]),
p("storage","IKEA SAMLA Box with Lid 11L","IKEA",499,699,200,[{key:"Material",value:"Polypropylene"},{key:"Capacity",value:"11 Litres"},{key:"Feature",value:"Stackable"},{key:"Color",value:"Transparent"}],["storage-box","ikea","samla","transparent"]),
p("storage","Rubbermaid Brilliance Pantry Box Large 3pc","Rubbermaid",1999,2999,80,[{key:"Material",value:"BPA-Free Plastic"},{key:"Set",value:"3 Containers"},{key:"Feature",value:"Stain-Proof + Airtight"},{key:"Sizes",value:"3.3 + 8.5 + 12.8 Cup"}],["pantry","rubbermaid","airtight","set"]),
p("storage","Godrej Magic Spray Mop with Refill 1.2L","Godrej",1299,1999,90,[{key:"Type",value:"Spray Mop"},{key:"Tank",value:"1.2 Litres"},{key:"Feature",value:"360° Rotating Head"},{key:"Includes",value:"2 Microfibre Pads"}],["mop","godrej","spray","floor-cleaning"]),
p("cleaning","Prestige Electric Vegetable Chopper 200W","Prestige",1299,1999,120,[{key:"Power",value:"200W"},{key:"Capacity",value:"500 ml"},{key:"Blades",value:"Stainless Steel x4"},{key:"Feature",value:"One-Touch Operation"}],["chopper","prestige","electric","vegetable"]),
p("storage","Vaya Tyffyn Lunchbox 600ml Copper","Vaya",2999,3999,60,[{key:"Material",value:"Stainless Steel"},{key:"Capacity",value:"600 ml"},{key:"Feature",value:"Vacuum Insulated 6 Hours"},{key:"Tiffin",value:"3 Containers"}],["tiffin","vaya","insulated","copper"],{is_featured:true}),
p("storage","Milton Thermosteel Flip Lid Bottle 1L","Milton",899,1299,200,[{key:"Material",value:"Stainless Steel"},{key:"Capacity",value:"1 Litre"},{key:"Feature",value:"Hot 24hr + Cold 24hr"},{key:"Lid",value:"Flip Lid"}],["bottle","milton","thermosteel","insulated"],{is_bestseller:true}),
p("storage","Cello World Plastic Kitchen Trolley 3-Tier","Cello",1799,2799,70,[{key:"Material",value:"Polypropylene"},{key:"Tiers",value:"3 Shelves"},{key:"Feature",value:"Wheels + Handles"},{key:"Load",value:"25 kg per shelf"}],["trolley","cello","kitchen","3-tier"]),
p("dining","Borosil Vision Glass Set of 6 350ml","Borosil",999,1799,150,[{key:"Material",value:"Borosilicate Glass"},{key:"Set",value:"6 Glasses"},{key:"Capacity",value:"350 ml each"},{key:"Feature",value:"Dishwasher Safe"}],["glass","borosil","drinking","set-6"],{is_bestseller:true}),
p("dining","Larah Opalware Dinner Set 18pcs","Larah",1799,2799,90,[{key:"Material",value:"Opalware"},{key:"Set",value:"18 Pieces"},{key:"Include",value:"6 Plates+6 Bowls+6 Cups"},{key:"Feature",value:"Microwave Safe"}],["dinner-set","larah","opalware","18pcs"]),
p("dining","Treo by Milton Casserole with Steel Lid 1.5L","Treo",1199,1999,100,[{key:"Material",value:"Borosilicate Glass"},{key:"Capacity",value:"1.5 Litres"},{key:"Feature",value:"Oven + Microwave Safe"},{key:"Lid",value:"SS Lid"}],["casserole","treo","glass","oven-safe"]),
p("dining","Meena Bazaar Copper Steel Dining Set 6pcs","Meena Bazaar",3999,5999,40,[{key:"Material",value:"Copper-Coated Steel"},{key:"Set",value:"6 Pieces"},{key:"Include",value:"Thali+Katori+Spoon"},{key:"Style",value:"Traditional Indian"}],["dining-set","copper","traditional","6pcs"]),
// ── CLEANING & TOOLS (76-100) ─────────────────────────────────────────────────
p("cleaning","Scotch-Brite Heavy Duty Scrub Pad Pack 3","Scotch-Brite",149,299,800,[{key:"Type",value:"Scrub Pad"},{key:"Pack",value:"3 Pieces"},{key:"Feature",value:"Heavy Duty Green"},{key:"Use",value:"Pots + Pans + Tiles"}],["scrub","scotch-brite","cleaning","3-pack"],{is_bestseller:true}),
p("cleaning","Harpic Power Plus 500ml 2pcs","Harpic",199,299,600,[{key:"Type",value:"Toilet Cleaner"},{key:"Pack",value:"2 x 500 ml"},{key:"Feature",value:"10x More Powerful"},{key:"Scent",value:"Original Blue"}],["toilet-cleaner","harpic","power-plus","2-pack"]),
p("cleaning","Lizol Disinfectant Surface Cleaner 975ml Pine","Lizol",249,349,500,[{key:"Type",value:"Surface Cleaner"},{key:"Volume",value:"975 ml"},{key:"Fragrance",value:"Pine"},{key:"Feature",value:"Kills 99.9% Germs"}],["cleaner","lizol","disinfectant","pine"]),
p("cleaning","Exo Dish Wash Bar 700g 2pcs","Exo",99,179,1000,[{key:"Type",value:"Dish Wash Bar"},{key:"Weight",value:"700g x 2"},{key:"Feature",value:"Tri-Action Formula"},{key:"Removes",value:"Grease + Stains"}],["dishwash","exo","bar","2-pack"],{is_bestseller:true}),
p("cleaning","Vim Dishwash Gel Lemon 750ml","Vim",149,199,800,[{key:"Type",value:"Dish Wash Gel"},{key:"Volume",value:"750 ml"},{key:"Scent",value:"Lemon"},{key:"Feature",value:"100 Vessels per Bottle"}],["dishwash","vim","gel","lemon"]),
p("cleaning","Prestige PHSL 01 Steam Mop 1200W","Prestige",3999,5999,50,[{key:"Power",value:"1200W"},{key:"Type",value:"Steam Mop"},{key:"Tank",value:"300 ml"},{key:"Feature",value:"Kills 99.9% Bacteria"}],["steam-mop","prestige","1200w","floors"]),
p("cleaning","Arlo Spin Mop 360° with Bucket","Arlo",1299,1999,80,[{key:"Type",value:"Spin Mop"},{key:"Feature",value:"360° Rotating Head"},{key:"Bucket",value:"Included with Wringer"},{key:"Pad",value:"Microfibre Washable"}],["spin-mop","arlo","360","bucket"]),
p("cleaning","Kent Magic Auto Dish Washer 480W","Kent",3499,4999,40,[{key:"Power",value:"480W"},{key:"Capacity",value:"4 Place Settings"},{key:"Programs",value:"3 Wash Modes"},{key:"Feature",value:"Portable Countertop"}],["dishwasher","kent","portable","countertop"]),
p("cleaning","Bajaj Tornado Floor Cleaner Machine 1200W","Bajaj",4999,6999,30,[{key:"Power",value:"1200W"},{key:"Type",value:"Wet + Dry Vacuum"},{key:"Tank",value:"12 Litres"},{key:"Feature",value:"Blower Function"}],["vacuum","bajaj","wet-dry","1200w"]),
p("cleaning","Dyson V8 Slim Cordless Vacuum","Dyson",34999,42999,15,[{key:"Suction",value:"115 AW"},{key:"Battery",value:"40 Min Run Time"},{key:"Filter",value:"HEPA Whole Machine"},{key:"Weight",value:"2.13 kg"}],["vacuum","dyson","cordless","v8"],{is_featured:true}),
p("storage","Kuber Industries Foldable Storage Ottoman","Kuber",999,1699,100,[{key:"Material",value:"Non-Woven Fabric"},{key:"Capacity",value:"30 Litres"},{key:"Use",value:"Sit + Store"},{key:"Feature",value:"Foldable"}],["ottoman","kuber","storage","foldable"]),
p("storage","Amazon Basics Microfibre Cloth 24pcs","Amazon Basics",799,1299,200,[{key:"Material",value:"80% Polyester + 20% Nylon"},{key:"Pack",value:"24 Cloths"},{key:"Size",value:"32x32 cm each"},{key:"Use",value:"Multi-Surface Cleaning"}],["microfibre","cleaning-cloth","amazon","24-pack"]),
p("storage","Usha EasyMop 0.5L Electric Spray Mop","Usha",2499,3499,60,[{key:"Type",value:"Electric Spray Mop"},{key:"Tank",value:"500 ml"},{key:"Power",value:"Battery Operated"},{key:"Pad",value:"Washable Microfibre"}],["spray-mop","usha","electric","microfibre"]),
p("cleaning","Odopic Dishwash Bar 250g Pack 6","Odopic",199,349,600,[{key:"Type",value:"Dish Wash Bar"},{key:"Weight",value:"250g x 6"},{key:"Feature",value:"Lime Fresh"},{key:"Removes",value:"Oil + Stains"}],["dishwash","odopic","bar","6-pack"]),
p("storage","Plastic Wala Heavy Duty Clothes Organiser Set 6","Plastic Wala",499,899,300,[{key:"Material",value:"Non-Woven"},{key:"Set",value:"6 Organiser Bags"},{key:"Feature",value:"Zip Closure"},{key:"Use",value:"Wardrobe + Shelf"}],["organiser","clothes","wardrobe","set-6"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "home-kitchen")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing home-kitchen products`);
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
  console.log(`\n✅ Done! ${inserted} Home & Kitchen products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
