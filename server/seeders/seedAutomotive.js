/**
 * seedAutomotive.js — 100 Automotive Products
 * Run: node server/seeders/seedAutomotive.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  auto:   ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80","https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80"],
  tool:   ["https://images.unsplash.com/photo-1504222490345-c075b56cf49e?w=600&q=80","https://images.unsplash.com/photo-1547482792-a5b5b7b24b2a?w=600&q=80","https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80","https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80"],
  clean:  ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80","https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80"],
  tyre:   ["https://images.unsplash.com/photo-1566936737687-8f392a237246?w=600&q=80","https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"],
  elect:  ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80","https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80","https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"],
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
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(50+Math.random()*1000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── CAR ACCESSORIES (1-20) ────────────────────────────────────────────────────
p("auto","Vega Crux Helmet ISI Full Face","Vega",1299,1899,100,[{key:"Type",value:"Full Face"},{key:"Certification",value:"ISI Mark"},{key:"Shell",value:"Thermoplastic Alloy"},{key:"Size",value:"M/L/XL"}],["helmet","vega","full-face","bike"],{is_bestseller:true}),
p("auto","Steelbird Air SBA-2 Full Face Helmet","Steelbird",1499,1999,80,[{key:"Type",value:"Full Face"},{key:"Certification",value:"ISI + ECE"},{key:"Visor",value:"Anti-Scratch UV Cut"},{key:"Weight",value:"1.4 kg"}],["helmet","steelbird","full-face","ece"]),
p("auto","Studds Marshall D1 Half Face Helmet","Studds",799,1199,120,[{key:"Type",value:"Half Face"},{key:"Certification",value:"ISI"},{key:"Shell",value:"Thermoplastic"},{key:"Size",value:"S/M/L/XL"}],["helmet","studds","half-face","isi"]),
p("auto","Royal Enfield Open Face Helmet Camo","Royal Enfield",2499,3499,60,[{key:"Type",value:"Open Face"},{key:"Design",value:"Camo Print"},{key:"Visor",value:"Anti-Scratch Clear Visor"},{key:"Fit",value:"Size M/L"}],["helmet","royal-enfield","open-face","camo"]),
p("auto","iBELL Wind Motorcycle Helmet Full Face","iBell",1099,1599,90,[{key:"Type",value:"Full Face"},{key:"Ventilation",value:"Top + Chin Vents"},{key:"Certification",value:"ISI"},{key:"Feature",value:"Quick Release Strap"}],["helmet","ibell","full-face","isi"]),
p("auto","Autofy Universal Bike Seat Cover","Autofy",599,899,200,[{key:"Type",value:"Seat Cover"},{key:"Material",value:"Leatherette"},{key:"Feature",value:"Water Resistant"},{key:"Compatibility",value:"Universal Fit"}],["seat-cover","autofy","bike","universal"],{is_bestseller:true}),
p("auto","Moto-Quip Bike Cover Medium with Lock","Moto-Quip",899,1299,150,[{key:"Size",value:"Medium 100-150cc Bikes"},{key:"Material",value:"Polyester"},{key:"Feature",value:"Water + Dust Proof"},{key:"Lock",value:"Safety Lock Hole"}],["bike-cover","moto-quip","medium","waterproof"]),
p("auto","Speedwav Silicone Bike Handle Grip Set","Speedwav",349,599,250,[{key:"Material",value:"Silicone"},{key:"Length",value:"22 cm each"},{key:"Feature",value:"Anti-Slip Texture"},{key:"Compatibility",value:"22mm Handlebar"}],["handle-grip","speedwav","silicone","anti-slip"]),
p("auto","Roots Rain Guard Car Cover SWIFT","Roots",2499,3499,60,[{key:"Car",value:"Maruti Suzuki Swift"},{key:"Material",value:"Parachute Nylon"},{key:"Feature",value:"Waterproof + UV Protection"},{key:"Layers",value:"5-Layer"}],["car-cover","roots","swift","5-layer"]),
p("auto","Carmate Silicone Car Key Cover NEXON","Carmate",399,649,200,[{key:"Car",value:"Tata Nexon"},{key:"Material",value:"Silicone"},{key:"Feature",value:"Scratch Resistant"},{key:"Color",value:"Black"}],["key-cover","carmate","nexon","silicone"]),
p("auto","Auto Addict Car Tissue Box Holder","Auto Addict",399,699,300,[{key:"Type",value:"Sun Visor Tissue Box"},{key:"Material",value:"PU Leather"},{key:"Feature",value:"Easy Installation"},{key:"Compatibility",value:"Universal"}],["tissue-box","car-interior","universal","pu"]),
p("auto","Techno Earth Car Backseat Organiser","Techno Earth",799,1199,150,[{key:"Type",value:"Back Seat Organiser"},{key:"Pockets",value:"Multiple Pockets"},{key:"Material",value:"Oxford Fabric"},{key:"Feature",value:"Cup Holder + Tablet Pocket"}],["car-organiser","backseat","techno-earth","pocket"]),
p("auto","GOCART Steering Wheel Cover Leather","GOCART",499,799,200,[{key:"Size",value:"38cm Steering Wheel"},{key:"Material",value:"Genuine Leather Texture"},{key:"Feature",value:"Anti-Slip"},{key:"Compatible",value:"Universal Fit"}],["steering-cover","gocart","leather","38cm"]),
p("auto","AutoFurnish Gear Shift Boot Cover","AutoFurnish",349,599,180,[{key:"Type",value:"Gear Knob Cover"},{key:"Material",value:"Genuine Leather"},{key:"Feature",value:"Fits Most Cars"},{key:"Stitching",value:"Red Stitch"}],["gear-cover","autofurnish","leather","universal"]),
p("auto","Amkette Evo Car 5S Wireless Fast Charger Mount","Amkette",1499,1999,100,[{key:"Type",value:"Wireless Car Charger Mount"},{key:"Power",value:"15W Fast Wireless"},{key:"Mount",value:"Air Vent + Dashboard"},{key:"Feature",value:"Auto-Clamp"}],["car-charger","amkette","wireless","15w"],{is_featured:true}),
p("elect","Digitech Auto D-904 Car Bluetooth Receiver","Digitech",799,1299,150,[{key:"Type",value:"Bluetooth FM Transmitter"},{key:"Power",value:"Dual USB QC3.0"},{key:"Feature",value:"Handsfree + Music"},{key:"Compatibility",value:"All Cars"}],["bluetooth","car","fm-transmitter","usb"]),
p("elect","Pioneer MVH-S120UI Single DIN Car Stereo","Pioneer",3999,5499,50,[{key:"Type",value:"Single DIN Head Unit"},{key:"Feature",value:"USB + AUX + FM Radio"},{key:"Power",value:"50W x4"},{key:"Display",value:"2-Line LCD"}],["car-stereo","pioneer","single-din","usb"],{is_featured:true}),
p("elect","Garmin DriveSmart 55 GPS Navigator","Garmin",8999,12999,30,[{key:"Display",value:"5.5 inch"},{key:"Feature",value:"Live Traffic + Map Updates"},{key:"Maps",value:"India Full Maps"},{key:"Voice",value:"Voice-Guided Navigation"}],["gps","garmin","navigator","india"],{is_featured:true}),
p("elect","70mai Dash Cam Lite 2 1080P","70mai",3999,5999,60,[{key:"Resolution",value:"1080P Full HD"},{key:"Angle",value:"130° Wide Angle"},{key:"Feature",value:"Night Vision"},{key:"Storage",value:"Up to 128GB microSD"}],["dashcam","70mai","1080p","night-vision"],{is_bestseller:true}),
p("elect","Viofo A119 Mini 2 4K Dash Cam","Viofo",7999,10999,30,[{key:"Resolution",value:"4K 30fps"},{key:"Angle",value:"140° FOV"},{key:"Feature",value:"GPS + Wi-Fi"},{key:"Night",value:"Sony STARVIS Sensor"}],["dashcam","viofo","4k","wifi"]),

// ── CAR CARE & CLEANING (21-40) ───────────────────────────────────────────────
p("clean","3M Auto Care Car Shampoo 250ml","3M",299,399,200,[{key:"Volume",value:"250 ml"},{key:"Type",value:"Car Shampoo"},{key:"Feature",value:"pH Neutral + Foam Formula"},{key:"Dilution",value:"1:50 ratio"}],["car-shampoo","3m","foam","250ml"],{is_bestseller:true}),
p("clean","Meguiar's Ultimate Quik Wax 473ml","Meguiars",1299,1799,80,[{key:"Volume",value:"473 ml"},{key:"Type",value:"Spray Wax"},{key:"Feature",value:"Hydrophobic Polymer"},{key:"Application",value:"Spray + Wipe"}],["car-wax","meguiars","spray","473ml"],{is_featured:true}),
p("clean","Turtle Wax Ice Spray Wax 500ml","Turtle Wax",999,1399,90,[{key:"Volume",value:"500 ml"},{key:"Type",value:"Ice Wax Spray"},{key:"Feature",value:"Diamond Fusion Technology"},{key:"Shine",value:"Crystal Clear Shine"}],["car-wax","turtle-wax","ice","spray"]),
p("clean","Wavex Foam Wash Car Shampoo 500ml","Wavex",349,499,150,[{key:"Volume",value:"500 ml"},{key:"Type",value:"Foam Car Shampoo"},{key:"Feature",value:"High Foam + pH Neutral"},{key:"Safe",value:"Wax Safe Formula"}],["car-shampoo","wavex","foam","500ml"]),
p("clean","SOFT99 Kizaikos Scratch Repair Liquid 100ml","Soft99",999,1399,60,[{key:"Volume",value:"100 ml"},{key:"Type",value:"Scratch Remover"},{key:"Use",value:"Light Scratches + Swirl Marks"},{key:"Origin",value:"Japan"}],["scratch-remover","soft99","japan","100ml"]),
p("clean","Chemical Guys Tire & Auto Dressing 473ml","Chemical Guys",899,1299,70,[{key:"Volume",value:"473 ml"},{key:"Type",value:"Tyre Dressing"},{key:"Finish",value:"Satin Shine"},{key:"Feature",value:"Protects from UV + Cracking"}],["tyre-dressing","chemical-guys","satin","473ml"]),
p("clean","3M Car Glass Cleaner 500ml","3M",249,349,200,[{key:"Volume",value:"500 ml"},{key:"Type",value:"Glass Cleaner Spray"},{key:"Feature",value:"Anti-Streak Formula"},{key:"Use",value:"Windshield + Windows"}],["glass-cleaner","3m","anti-streak","500ml"],{is_bestseller:true}),
p("clean","Armor All Original Protectant 500ml","Armor All",699,899,100,[{key:"Volume",value:"500 ml"},{key:"Type",value:"Interior Protectant"},{key:"Use",value:"Dashboard + Plastic + Vinyl"},{key:"Feature",value:"UV Protection"}],["protectant","armor-all","interior","uv"]),
p("clean","WD-40 Multi-Use Maintenance Spray 420ml","WD-40",499,699,200,[{key:"Volume",value:"420 ml"},{key:"Type",value:"Multi-Use Spray"},{key:"Use",value:"Rust Prevention + Lubrication"},{key:"Feature",value:"Smart Straw 2-Ways"}],["wd-40","lubricant","rust","420ml"],{is_bestseller:true}),
p("clean","Bosch Microfibre Cloth 40x40cm Pack 3","Bosch",499,699,150,[{key:"Size",value:"40x40 cm each"},{key:"Pack",value:"3 Cloths"},{key:"Material",value:"80% Polyester + 20% Polyamide"},{key:"GSM",value:"350 GSM"}],["microfibre","bosch","car","3-pack"]),
p("clean","Wavex Ultimate Car Wash Foam Kit","Wavex",1499,2199,80,[{key:"Type",value:"Foam Wash Kit"},{key:"Include",value:"Shampoo + Foam Lance + Brush"},{key:"Feature",value:"Snow Foam Formula"},{key:"Compatibility",value:"Pressure Washer"}],["foam-kit","wavex","wash","snow-foam"]),
p("clean","Meguiar's All Purpose Cleaner 473ml","Meguiars",799,1099,90,[{key:"Volume",value:"473 ml"},{key:"Type",value:"Multi-Purpose Cleaner"},{key:"Dilution",value:"4:1 to 10:1"},{key:"Use",value:"Interior + Exterior"}],["all-purpose","meguiars","473ml","interior"]),
p("tool","Stanley 16oz Claw Hammer Fibreglass Handle","Stanley",899,1299,100,[{key:"Weight",value:"16 oz"},{key:"Handle",value:"Fibreglass Anti-Vibration"},{key:"Feature",value:"Magnetic Nail Starter"},{key:"Type",value:"Claw Hammer"}],["hammer","stanley","claw","fibreglass"]),
p("tool","Bosch GSR 120-LI Cordless Drill Driver","Bosch",4499,5999,50,[{key:"Voltage",value:"12V"},{key:"Chuck",value:"10mm"},{key:"Feature",value:"Brushless Motor"},{key:"Battery",value:"2x 2.0Ah Li-ion"}],["drill","bosch","cordless","12v"],{is_featured:true}),
p("tool","Taparia Combination Plier 8-inch","Taparia",349,499,200,[{key:"Size",value:"8 inch"},{key:"Material",value:"Alloy Steel"},{key:"Jaw",value:"Serrated + Side Cutter"},{key:"Handle",value:"PVC Grip"}],["plier","taparia","combination","8-inch"]),
p("tool","Eastman Hacksaw Frame + Blades 12-inch","Eastman",399,599,150,[{key:"Frame",value:"Adjustable 10-12 inch"},{key:"Blades",value:"5 Blades Included"},{key:"Material",value:"Steel Frame"},{key:"TPI",value:"18 TPI Blades"}],["hacksaw","eastman","adjustable","12-inch"]),
p("tool","Stanley 6-Piece Combination Spanner Set","Stanley",1299,1799,80,[{key:"Set",value:"6 Pieces"},{key:"Sizes",value:"8/10/12/13/14/17mm"},{key:"Material",value:"Chrome Vanadium Steel"},{key:"Finish",value:"Mirror Polished"}],["spanner-set","stanley","6-piece","chrome-vanadium"]),
p("tool","Kenwood Car Jump Starter 12000mAh","Kenwood",3999,5499,40,[{key:"Capacity",value:"12000 mAh"},{key:"Peak Current",value:"400A"},{key:"Feature",value:"USB Power Bank + LED Torch"},{key:"Compatible",value:"Up to 3L Petrol / 2L Diesel"}],["jump-starter","kenwood","12000mah","emergency"],{is_featured:true}),
p("tool","Vega 360° Car Tyre Inflator 150PSI","Vega",1499,2299,80,[{key:"Type",value:"Digital Tyre Inflator"},{key:"Power",value:"12V DC Car Power"},{key:"Pressure",value:"Up to 150 PSI"},{key:"Display",value:"LED Digital"}],["tyre-inflator","vega","150psi","digital"]),
p("tool","Ingco Socket Set 40-Piece Ratchet","Ingco",2999,4499,50,[{key:"Pieces",value:"40 Pieces"},{key:"Drive",value:"1/4 + 1/2 inch"},{key:"Material",value:"Chrome Vanadium Steel"},{key:"Feature",value:"Blow Moulded Case"}],["socket-set","ingco","40-piece","ratchet"]),

// ── TYRES, OILS & FLUIDS (41-60) ─────────────────────────────────────────────
p("tyre","MRF ZVTS 165/65 R14 Tubeless Tyre","MRF",3499,4299,40,[{key:"Size",value:"165/65 R14"},{key:"Type",value:"Tubeless"},{key:"Load Index",value:"79T"},{key:"Feature",value:"Fuel Efficient"}],["tyre","mrf","165-65-r14","tubeless"],{is_bestseller:true}),
p("tyre","Apollo Amazer 4G Life 165/65 R14","Apollo",3299,4099,40,[{key:"Size",value:"165/65 R14"},{key:"Type",value:"Tubeless"},{key:"Load Index",value:"79T"},{key:"Feature",value:"Long Mileage"}],["tyre","apollo","amazer","165-65-r14"]),
p("tyre","CEAT SecuraDrive 185/65 R15 Tubeless","CEAT",4299,5299,30,[{key:"Size",value:"185/65 R15"},{key:"Type",value:"Tubeless"},{key:"Feature",value:"Secure Grip on Wet Roads"},{key:"Pattern",value:"Asymmetric"}],["tyre","ceat","185-65-r15","wet-grip"]),
p("tyre","Michelin Energy XM2+ 185/65 R15","Michelin",5499,6999,25,[{key:"Size",value:"185/65 R15"},{key:"Feature",value:"20% Longer Life vs. XM2"},{key:"Fuel",value:"Fuel Efficient"},{key:"Type",value:"Tubeless"}],["tyre","michelin","185-65-r15","premium"],{is_featured:true}),
p("tyre","Bridgestone Ecopia EP150 175/65 R14","Bridgestone",3799,4799,30,[{key:"Size",value:"175/65 R14"},{key:"Feature",value:"Eco-Friendly Fuel Saving"},{key:"Type",value:"Tubeless"},{key:"Load",value:"82T"}],["tyre","bridgestone","ecopia","fuel-saving"]),
p("tyre","Yokohama A539 185/55 R16 Tubeless","Yokohama",5999,7499,20,[{key:"Size",value:"185/55 R16"},{key:"Feature",value:"Sporty Performance"},{key:"Compound",value:"BluEarth"},{key:"Type",value:"Tubeless"}],["tyre","yokohama","185-55-r16","performance"]),
p("tyre","MRF Meteor M ZT 100/90-17 Bike Tyre","MRF",1499,1899,60,[{key:"Size",value:"100/90-17"},{key:"Type",value:"Tube Type"},{key:"Use",value:"Commuter Bikes"},{key:"Feature",value:"Centre Groove Design"}],["tyre","mrf","100-90-17","bike"]),
p("tyre","Pirelli Diablo Rosso III 120/70 ZR17","Pirelli",9999,12999,15,[{key:"Size",value:"120/70 ZR17"},{key:"Type",value:"Radial Sport"},{key:"Feature",value:"Race-Derived Technology"},{key:"Use",value:"Sportbike"}],["tyre","pirelli","diablo","sportbike"],{is_featured:true}),
p("auto","Castrol EDGE 5W-40 Engine Oil 3L","Castrol",1899,2299,100,[{key:"Volume",value:"3 Litres"},{key:"Grade",value:"5W-40 Full Synthetic"},{key:"Feature",value:"Titanium FST Technology"},{key:"Use",value:"Petrol + Diesel Cars"}],["engine-oil","castrol","edge","5w40"],{is_bestseller:true}),
p("auto","Mobil 1 ESP 5W-30 Engine Oil 4L","Mobil",2499,3199,80,[{key:"Volume",value:"4 Litres"},{key:"Grade",value:"5W-30 Full Synthetic"},{key:"Feature",value:"Extended Service Protection"},{key:"Use",value:"Diesel + Petrol"}],["engine-oil","mobil-1","5w30","full-synthetic"]),
p("auto","Shell Helix Ultra 5W-40 Engine Oil 3.5L","Shell",2199,2799,80,[{key:"Volume",value:"3.5 Litres"},{key:"Grade",value:"5W-40"},{key:"Feature",value:"Active Cleansing Technology"},{key:"Viscosity",value:"Full Synthetic"}],["engine-oil","shell","helix","5w40"]),
p("auto","Gulf Pride 4T Plus 20W-40 Bike Oil 1L","Gulf",299,389,200,[{key:"Volume",value:"1 Litre"},{key:"Grade",value:"20W-40"},{key:"Use",value:"4-Stroke Motorcycles"},{key:"Feature",value:"Wear Protection"}],["bike-oil","gulf","4t","20w40"],{is_bestseller:true}),
p("auto","Motul 7100 4T 10W-40 Full Synthetic 1L","Motul",799,999,100,[{key:"Volume",value:"1 Litre"},{key:"Grade",value:"10W-40"},{key:"Type",value:"Full Synthetic 4T"},{key:"Feature",value:"Ester Technology"}],["bike-oil","motul","7100","full-synthetic"],{is_featured:true}),
p("auto","Bosch 0.5L Universal Brake Fluid DOT 4","Bosch",299,399,150,[{key:"Volume",value:"500 ml"},{key:"Type",value:"DOT 4 Brake Fluid"},{key:"Feature",value:"High Boiling Point"},{key:"Compatible",value:"All Vehicles"}],["brake-fluid","bosch","dot4","500ml"]),
p("auto","Prestone Radiator Coolant Ready-to-Use 1L","Prestone",449,599,120,[{key:"Volume",value:"1 Litre"},{key:"Type",value:"Ethylene Glycol Coolant"},{key:"Feature",value:"Anti-Freeze + Anti-Boil"},{key:"Mix",value:"Ready to Use"}],["coolant","prestone","radiator","1l"]),
p("auto","STP Engine Flush 450ml","STP",499,699,100,[{key:"Volume",value:"450 ml"},{key:"Use",value:"Before Oil Change"},{key:"Feature",value:"Removes Sludge + Deposits"},{key:"Compatible",value:"Petrol + Diesel"}],["engine-flush","stp","450ml","cleaner"]),
p("auto","3M Fuel System Cleaner 300ml","3M",699,899,80,[{key:"Volume",value:"300 ml"},{key:"Use",value:"Fuel Tank Additive"},{key:"Feature",value:"Injector + Carb Cleaner"},{key:"Mileage",value:"Improves Mileage"}],["fuel-cleaner","3m","300ml","mileage"]),
p("auto","Penrite Trans ATF Universal 1L","Penrite",999,1399,60,[{key:"Volume",value:"1 Litre"},{key:"Type",value:"Automatic Transmission Fluid"},{key:"Compatible",value:"Most Japanese + European ATF"},{key:"Feature",value:"Anti-Shudder"}],["atf","penrite","transmission","universal"]),
p("auto","Fuchs Titan ATF 4400 1L","Fuchs",1299,1799,50,[{key:"Volume",value:"1 Litre"},{key:"Type",value:"ATF for ZF Gearboxes"},{key:"Feature",value:"Low Viscosity"},{key:"Origin",value:"Germany"}],["atf","fuchs","titan","zf"]),
p("tyre","CEAT Milaze X3 90/90-10 Scooter Tyre","CEAT",799,1099,100,[{key:"Size",value:"90/90-10"},{key:"Type",value:"Tubeless"},{key:"Use",value:"Scooters"},{key:"Feature",value:"Mileage + Grip Balance"}],["tyre","ceat","scooter","90-90-10"]),

// ── SAFETY, ELECTRONICS & MORE (61-100) ──────────────────────────────────────
p("elect","Amaze Fire Extinguisher 500ml Car","Amaze",499,799,200,[{key:"Volume",value:"500 ml"},{key:"Type",value:"Dry Powder ABC"},{key:"Feature",value:"Car + Home Use"},{key:"Weight",value:"500g"}],["fire-extinguisher","amaze","car","safety"],{is_bestseller:true}),
p("elect","Lifelong Car Emergency Safety Kit","Lifelong",999,1599,150,[{key:"Include",value:"Jump Cables+Tow Rope+Torch+Gloves"},{key:"Feature",value:"Emergency Roadside Kit"},{key:"Bag",value:"Carry Bag Included"},{key:"Use",value:"Car Emergency"}],["emergency-kit","lifelong","car","roadside"]),
p("elect","Phillips Car Safety Hammer 2-in-1","Philips",599,999,200,[{key:"Type",value:"Safety Hammer"},{key:"Function",value:"Glass Breaker + Seatbelt Cutter"},{key:"Material",value:"Stainless Steel"},{key:"Feature",value:"LED Torch"}],["safety-hammer","philips","glass-breaker","car"]),
p("elect","Ring Rechargeable LED Jump Starter 12V","Ring",5999,8499,30,[{key:"Type",value:"Lithium Jump Starter"},{key:"Peak",value:"300A"},{key:"Battery",value:"8000 mAh"},{key:"Feature",value:"USB Powerbank + LED"}],["jump-starter","ring","lithium","300a"]),
p("auto","Michelin Tyre Repair Inflator Tyre Inflate","Michelin",1999,2999,70,[{key:"Type",value:"Tyre Sealant + Inflator"},{key:"Volume",value:"500 ml"},{key:"Compatible",value:"Up to 225 Tyres"},{key:"Feature",value:"Ready in 5 Minutes"}],["tyre-sealant","michelin","inflator","emergency"]),
p("auto","Tata AIG Car Insurance Accessory Kit","Tata",299,499,200,[{key:"Include",value:"Warning Triangle+Reflective Jacket"},{key:"Standard",value:"IS:14808"},{key:"Feature",value:"High Visibility"},{key:"Use",value:"Road Safety Mandatory"}],["warning-triangle","reflective-jacket","car","safety"]),
p("elect","Garmin BC 40 Wireless Backup Camera","Garmin",9999,12999,20,[{key:"Type",value:"Wireless Rearview Camera"},{key:"Resolution",value:"480p"},{key:"Feature",value:"Night Vision + IP67"},{key:"Range",value:"15 metres Wireless"}],["backup-camera","garmin","wireless","night-vision"]),
p("elect","Blaupunkt BPA 100 Parking Sensor 4pcs","Blaupunkt",1299,1899,60,[{key:"Sensors",value:"4 Ultrasonic Sensors"},{key:"Alert",value:"Buzzer + LED Display"},{key:"Range",value:"0.3-2.5 metres"},{key:"Install",value:"DIY Kit"}],["parking-sensor","blaupunkt","4-sensor","ultrasonic"]),
p("elect","GIVI E41 Rear Box Motorcycle 41L","GIVI",8999,11999,20,[{key:"Capacity",value:"41 Litres"},{key:"Material",value:"ABS Plastic"},{key:"Feature",value:"Monolock + Backrest"},{key:"Lock",value:"Quick Release"}],["top-box","givi","41l","motorcycle"],{is_featured:true}),
p("auto","Indoart Car Seat Gap Filler Organiser","Indoart",399,699,200,[{key:"Type",value:"Seat Gap Organizer"},{key:"Material",value:"PU Leather"},{key:"Feature",value:"Coin + Phone + Card Holder"},{key:"Compatibility",value:"Universal"}],["gap-filler","car-organiser","seat","pu"]),
p("auto","Curvv Reverse Camera for Swift Dzire","Curvv",1799,2799,50,[{key:"Type",value:"Wired Reverse Camera"},{key:"Resolution",value:"720P"},{key:"Night Vision",value:"IR LEDs"},{key:"Car",value:"Maruti Swift Dzire"}],["reverse-camera","curvv","swift-dzire","720p"]),
p("elect","Mivi Car Charger Dual USB QC3.0 36W","Mivi",599,999,200,[{key:"Power",value:"36W"},{key:"Ports",value:"2x USB-A QC3.0"},{key:"Feature",value:"Intelligent Fast Charge"},{key:"Compatibility",value:"All USB Devices"}],["car-charger","mivi","qc3","36w"],{is_bestseller:true}),
p("elect","Portronics Car Power 3 Triple USB 30W","Portronics",499,799,200,[{key:"Power",value:"30W Total"},{key:"Ports",value:"3x USB"},{key:"Feature",value:"Voltmeter Display"},{key:"Compatibility",value:"Universal"}],["car-charger","portronics","triple-usb","30w"]),
p("elect","Belkin Car Vent Mount F7U017","Belkin",1499,1999,100,[{key:"Type",value:"Vent Mount"},{key:"Compatibility",value:"Universal Smartphone"},{key:"Feature",value:"One-Hand Operation"},{key:"Rotation",value:"360°"}],["phone-mount","belkin","vent","360"]),
p("auto","Saygus Car Phone Mount Dashboard","Saygus",499,799,200,[{key:"Type",value:"Dashboard + Windshield Mount"},{key:"Compatibility",value:"4-7 inch Phones"},{key:"Feature",value:"Strong Suction Cup"},{key:"Rotation",value:"360°"}],["phone-mount","dashboard","suction","360"]),
p("tool","Hella 12V Horn Dual Tone Trumpet","Hella",799,1199,100,[{key:"Type",value:"Dual Trumpet Horn"},{key:"Voltage",value:"12V"},{key:"Sound",value:"400Hz + 500Hz Dual Tone"},{key:"Material",value:"ABS + Metal"}],["car-horn","hella","dual-tone","12v"],{is_bestseller:true}),
p("tool","Roots Car Wiper Blade Set 24+16 inch","Roots",599,899,120,[{key:"Front",value:"24 inch Driver Side"},{key:"Rear",value:"16 inch Passenger Side"},{key:"Type",value:"Frameless Flat Blade"},{key:"Feature",value:"All Weather"}],["wiper-blade","roots","frameless","set"]),
p("tool","Bosch Aerotwin Wiper Blade 600mm","Bosch",899,1299,80,[{key:"Size",value:"600mm (24 inch)"},{key:"Type",value:"Flat Aerotwin"},{key:"Feature",value:"No Lifting at High Speed"},{key:"Compatibility",value:"Universal"}],["wiper-blade","bosch","aerotwin","600mm"]),
p("tool","Vega Bike Tyre Pressure Gauge Digital","Vega",499,799,150,[{key:"Type",value:"Digital Pressure Gauge"},{key:"Range",value:"0-100 PSI"},{key:"Display",value:"LCD"},{key:"Feature",value:"Auto Power Off"}],["pressure-gauge","vega","digital","100psi"]),
p("auto","Stanley Jumper Cable 200A 3m","Stanley",999,1499,60,[{key:"Current",value:"200A"},{key:"Length",value:"3 Metres"},{key:"Cable",value:"4 AWG"},{key:"Feature",value:"Colour-Coded Clamps"}],["jumper-cable","stanley","200a","3m"]),
p("auto","Michelin Digital Tyre Inflator 150PSI","Michelin",2499,3499,50,[{key:"Type",value:"Digital Inflator"},{key:"Max Pressure",value:"150 PSI"},{key:"Power",value:"12V Car Socket"},{key:"Display",value:"Digital Backlit"}],["tyre-inflator","michelin","digital","150psi"]),
p("auto","Granvel Fibre Windshield Sun Shade","Granvel",699,999,150,[{key:"Type",value:"Foldable Sun Shade"},{key:"Material",value:"Fibre Silver"},{key:"Feature",value:"UV + Heat Protection"},{key:"Size",value:"150x80 cm Universal"}],["sunshade","windshield","granvel","uv-protection"]),
p("auto","DreamCar Leather Dashboard Mat","DreamCar",999,1499,100,[{key:"Type",value:"Dashboard Mat"},{key:"Material",value:"Anti-Slip PVC Leather"},{key:"Size",value:"Universal"},{key:"Feature",value:"Sun Reflective"}],["dashboard-mat","dreamcar","leather","anti-slip"]),
p("tool","Hella LED Fog Lamp Set White 6000K","Hella",1999,2999,60,[{key:"Type",value:"LED Fog Lamp"},{key:"Color",value:"6000K White"},{key:"Watts",value:"20W each"},{key:"Set",value:"Pair with Wiring Harness"}],["fog-lamp","hella","led","white"],{is_featured:true}),
p("elect","Philips X-tremeVision LED H4 6000K","Philips",2999,3999,70,[{key:"Type",value:"LED Headlight Bulb"},{key:"Base",value:"H4"},{key:"Color",value:"6000K Cool White"},{key:"Brightness",value:"200% More Light"}],["headlight-bulb","philips","led-h4","6000k"],{is_featured:true}),
p("auto","Amkette Roadbot 5-in-1 Car Kit","Amkette",1299,1899,80,[{key:"Include",value:"Charger+Mount+FM+AUX+Cable"},{key:"Power",value:"Dual USB 24W"},{key:"Feature",value:"Bluetooth FM Transmitter"},{key:"Use",value:"All-in-One Car Solution"}],["car-kit","amkette","5in1","fm"]),
p("auto","Coilovers Adjustable Lowering Springs Swift","Speedcraft",4999,7999,20,[{key:"Car",value:"Maruti Suzuki Swift 2018+"},{key:"Type",value:"Adjustable Lowering Springs"},{key:"Drop",value:"30-50mm"},{key:"Material",value:"High Carbon Steel"}],["lowering-springs","swift","suspension","adjustable"]),
p("auto","NLG Magnetic Phone Mount Dashboard 360","NLG",499,899,200,[{key:"Type",value:"Magnetic Mount"},{key:"Rotation",value:"360°"},{key:"Feature",value:"N52 Magnets"},{key:"Mount",value:"Dashboard + Air Vent"}],["magnetic-mount","nlg","phone","360"]),
p("auto","GIVI E22N Side Case Luggage 22L Each","GIVI",6999,9499,15,[{key:"Capacity",value:"22L each side"},{key:"Set",value:"Pair of Panniers"},{key:"Material",value:"ABS Plastic"},{key:"Feature",value:"Monokey Locking System"}],["panniers","givi","side-case","motorcycle"]),
p("auto","Turtle Wax Scratch Repair Pen 12ml","Turtle Wax",699,999,120,[{key:"Volume",value:"12 ml"},{key:"Type",value:"Touch-Up Paint Pen"},{key:"Use",value:"Light Scratches + Chips"},{key:"Feature",value:"Universal White/Silver/Black"}],["scratch-pen","turtle-wax","touch-up","repair"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "automotive")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing automotive products`);
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
  console.log(`\n✅ Done! ${inserted} Automotive products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
