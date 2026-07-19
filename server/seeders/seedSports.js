/**
 * seedSports.js — 100 Sports Products
 * Run: node server/seeders/seedSports.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  cricket: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80","https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80","https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80","https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80"],
  football:["https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=80","https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80","https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80","https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80"],
  gym:     ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80","https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80","https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"],
  yoga:    ["https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80","https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80","https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80","https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80"],
  cycling: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80","https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80","https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&q=80","https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80"],
  swim:    ["https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80","https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&q=80","https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80","https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80"],
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
// ── CRICKET (1-18) ────────────────────────────────────────────────────────────
p("cricket","SG RSD Spark Cricket Bat English Willow","SG",2999,3999,80,[{key:"Grade",value:"English Willow Grade 3"},{key:"Weight",value:"1.1-1.3 kg"},{key:"Handle",value:"Oval Cane"},{key:"Size",value:"Short Handle"}],["cricket","bat","sg","english-willow"],{is_bestseller:true}),
p("cricket","SS Ton Supreme Cricket Bat Kashmir Willow","SS",1499,1999,100,[{key:"Grade",value:"Kashmir Willow Grade 1"},{key:"Weight",value:"1.0-1.2 kg"},{key:"Handle",value:"Cane"},{key:"Size",value:"Short Handle"}],["cricket","bat","ss","kashmir-willow"]),
p("cricket","MRF Virat Kohli VK18 Cricket Bat","MRF",3499,4499,60,[{key:"Type",value:"Tennis Tape Ball Bat"},{key:"Weight",value:"1.1-1.2 kg"},{key:"Handle",value:"Rubber Grip"},{key:"Endorsed",value:"Virat Kohli"}],["cricket","bat","mrf","virat-kohli"],{is_featured:true}),
p("cricket","Kookaburra Pace 5.0 Cricket Bat","Kookaburra",3999,5499,50,[{key:"Grade",value:"English Willow Grade 3"},{key:"Weight",value:"1.1-1.3 kg"},{key:"Edge",value:"40mm"},{key:"Size",value:"Short Handle"}],["cricket","bat","kookaburra","pace"]),
p("cricket","GM Diamond 808 Cricket Bat","GM",4999,6499,40,[{key:"Grade",value:"English Willow Grade 2"},{key:"Edge",value:"42mm"},{key:"Scoop",value:"Deep Oval"},{key:"Face",value:"Rounded"}],["cricket","bat","gm","diamond"],{is_featured:true}),
p("cricket","Cosco Dynamic Leather Cricket Ball Pack 6","Cosco",1199,1799,150,[{key:"Material",value:"Full Grain Leather"},{key:"Type",value:"Match Ball"},{key:"Pack",value:"6 Balls"},{key:"Seam",value:"4-Seam"}],["cricket","ball","cosco","leather"],{is_bestseller:true}),
p("cricket","SG Test Cricket Ball Red Leather","SG",599,799,200,[{key:"Material",value:"Grade A Leather"},{key:"Type",value:"Test Match Ball"},{key:"Color",value:"Red"},{key:"Seam",value:"Quality Cork"}],["cricket","ball","sg","test-match"]),
p("cricket","Kookaburra Turf Cricket Ball White","Kookaburra",699,899,150,[{key:"Material",value:"Full Grain Leather"},{key:"Color",value:"White"},{key:"Type",value:"One-Day Match Ball"},{key:"Seam",value:"4-piece"}],["cricket","ball","kookaburra","white"]),
p("cricket","SG League Wicket Keeping Gloves","SG",799,1099,80,[{key:"Type",value:"Wicket Keeping"},{key:"Material",value:"Pittards Leather"},{key:"Padding",value:"HD Foam"},{key:"Size",value:"Small/Medium/Large"}],["cricket","gloves","sg","wicket-keeping"]),
p("cricket","Adidas XT 2.0 Batting Gloves","Adidas",1299,1799,60,[{key:"Type",value:"Batting Gloves"},{key:"Material",value:"Pittards Leather"},{key:"Padding",value:"High-impact Protection"},{key:"Hand",value:"Right Hand"}],["cricket","gloves","adidas","batting"]),
p("cricket","MRF Batting Gloves Genius Grand","MRF",1499,1999,50,[{key:"Type",value:"Batting Gloves"},{key:"Material",value:"Pittards Leather"},{key:"Finger Rolls",value:"High-Density Sponge"},{key:"Hand",value:"Right Hand"}],["cricket","gloves","mrf","batting"]),
p("cricket","SG Club Full Cricket Helmet","SG",1499,1999,60,[{key:"Type",value:"Full Helmet"},{key:"Grille",value:"Steel Grille"},{key:"Fitting",value:"Size Adjustable"},{key:"Feature",value:"Air Holes Ventilation"}],["cricket","helmet","sg","protection"],{is_bestseller:true}),
p("cricket","Adidas XT Cricket Helmet","Adidas",2499,3299,40,[{key:"Type",value:"Full Face Helmet"},{key:"Grille",value:"Titanium Grille"},{key:"Feature",value:"Detachable Neck Guard"},{key:"Fitting",value:"Quick-Fit"}],["cricket","helmet","adidas","titanium"]),
p("cricket","SG Club Cricket Elbow Guard","SG",499,699,100,[{key:"Type",value:"Elbow Guard"},{key:"Material",value:"EVA Foam + Polyester"},{key:"Closure",value:"Hook & Loop"},{key:"Fit",value:"Adjustable"}],["cricket","elbow-guard","sg","protection"]),
p("cricket","Nivia Pro Cricket Kit Bag","Nivia",2499,3499,60,[{key:"Type",value:"Kit Bag"},{key:"Compartments",value:"2 Large + Multiple Pockets"},{key:"Feature",value:"Wheel + Trolley"},{key:"Material",value:"Polyester"}],["cricket","kit-bag","nivia","trolley"]),
p("cricket","SG Cricket Padded Shorts","SG",699,999,80,[{key:"Type",value:"Padded Shorts"},{key:"Padding",value:"High-Density Foam"},{key:"Size",value:"S/M/L/XL"},{key:"Feature",value:"Stretch Fit"}],["cricket","shorts","sg","padded"]),
p("cricket","KD Tour Thigh Guard Men","KD",599,899,90,[{key:"Type",value:"Thigh Guard"},{key:"Material",value:"EVA + HD Foam"},{key:"Closure",value:"Adjustable Strap"},{key:"Protection",value:"High Impact"}],["cricket","thigh-guard","kd","protection"]),
p("cricket","SG Test Wicket Keeping Pads","SG",1799,2499,40,[{key:"Type",value:"Wicket Keeping Pads"},{key:"Material",value:"Leather + Foam"},{key:"Feature",value:"Extended Wing"},{key:"Size",value:"Full Size"}],["cricket","pads","sg","wicket-keeping"]),
// ── FOOTBALL & BADMINTON (19-32) ─────────────────────────────────────────────
p("football","Nike Phantom GX Pro FG Football Shoes","Nike",7999,10999,50,[{key:"Type",value:"Football Cleats"},{key:"Surface",value:"Firm Ground"},{key:"Upper",value:"Gripknit"},{key:"Feature",value:"Precision Fit"}],["football","shoes","nike","fg"],{is_featured:true}),
p("football","Adidas Predator Edge Football Shoes","Adidas",6999,9499,55,[{key:"Type",value:"Football Cleats"},{key:"Surface",value:"Firm Ground"},{key:"Upper",value:"Controlskin"},{key:"Feature",value:"Demonskin Zones"}],["football","shoes","adidas","predator"]),
p("football","Cosco Brazil Football Size 5","Cosco",599,899,200,[{key:"Size",value:"5"},{key:"Material",value:"PVC"},{key:"Panels",value:"32 Panel"},{key:"Feature",value:"Machine Stitched"}],["football","cosco","size-5","pvc"],{is_bestseller:true}),
p("football","Nivia Storm Football Size 5","Nivia",799,1199,150,[{key:"Size",value:"5"},{key:"Material",value:"PU"},{key:"Bladder",value:"Butyl Bladder"},{key:"Feature",value:"Hand Stitched"}],["football","nivia","size-5","pu"]),
p("football","Adidas UEFA Champions League Football Size 5","Adidas",2499,3499,60,[{key:"Size",value:"5"},{key:"Material",value:"TPU"},{key:"Feature",value:"Official UCL Replica"},{key:"Construction",value:"Machine Stitched"}],["football","adidas","ucl","official"],{is_featured:true}),
p("football","Yonex Mavis 350 Badminton Shuttlecocks Pack 6","Yonex",899,1199,300,[{key:"Type",value:"Feather Shuttlecock"},{key:"Pack",value:"6 Pieces"},{key:"Grade",value:"Tournament Grade"},{key:"Speed",value:"Medium"}],["badminton","shuttlecock","yonex","feather"],{is_bestseller:true}),
p("football","Li-Ning G-Force Lite Badminton Racket","Li-Ning",3499,4999,80,[{key:"Weight",value:"85g"},{key:"Shaft",value:"Medium Flex"},{key:"String",value:"Pre-Strung 24 lbs"},{key:"Balance",value:"Head Heavy"}],["badminton","racket","li-ning","offensive"]),
p("football","Victor Thruster K Falcon Badminton Racket","Victor",4999,6999,50,[{key:"Weight",value:"88g"},{key:"Shaft",value:"Slim Shaft Stiff"},{key:"Feature",value:"V-SHARP Frame"},{key:"Balance",value:"Head Heavy"}],["badminton","racket","victor","advanced"]),
p("football","Yonex Astrox 99 Pro Badminton Racket","Yonex",13999,17999,20,[{key:"Weight",value:"83g"},{key:"Shaft",value:"Stiff"},{key:"Feature",value:"Namd Carbon + Tungsten Weights"},{key:"Balance",value:"Head Heavy"}],["badminton","racket","yonex","professional"],{is_featured:true}),
p("football","Cosco CB-150 Badminton Set 4 Players","Cosco",699,999,150,[{key:"Set",value:"4 Rackets + 2 Shuttles + Net"},{key:"Racket Weight",value:"90g"},{key:"Feature",value:"Full Set"},{key:"Use",value:"Recreational"}],["badminton","set","cosco","4-players"]),
p("football","Wilson Pro Staff Reaction Tennis Racket","Wilson",4999,7499,40,[{key:"Weight",value:"280g"},{key:"Head Size",value:"100 sq inches"},{key:"Balance",value:"Head Light"},{key:"Grip Size",value:"4 1/4"}],["tennis","racket","wilson","recreational"]),
p("football","Artengo TR100 Tennis Ball Can 4pcs","Artengo",499,699,200,[{key:"Type",value:"Tennis Ball"},{key:"Pack",value:"4 Balls"},{key:"Pressure",value:"Pressurised"},{key:"Use",value:"All Courts"}],["tennis","ball","artengo","4-pack"]),
p("football","Nivia Basketball Match BB-496","Nivia",999,1499,100,[{key:"Size",value:"7"},{key:"Material",value:"Rubber"},{key:"Feature",value:"Deep Channel"},{key:"Use",value:"Outdoor"}],["basketball","nivia","size-7","rubber"]),
p("football","Spalding NBA Street Basketball Size 7","Spalding",2499,3299,60,[{key:"Size",value:"7"},{key:"Material",value:"Rubber"},{key:"Feature",value:"Deep Channel for Better Grip"},{key:"Use",value:"Indoor + Outdoor"}],["basketball","spalding","nba","size-7"]),

// ── GYM & FITNESS (33-60) ─────────────────────────────────────────────────────
p("gym","Boldfit Adjustable Dumbbell Set 5-27.5 kg","Boldfit",12999,17999,30,[{key:"Weight",value:"5 to 27.5 kg Adjustable"},{key:"Material",value:"Chrome Steel"},{key:"Feature",value:"15 Weight Settings"},{key:"Pair",value:"Single Dumbbell"}],["dumbbell","boldfit","adjustable","gym"],{is_featured:true}),
p("gym","Lifelong Fixed Dumbbell 10kg Pair","Lifelong",1999,2999,80,[{key:"Weight",value:"10 kg per dumbbell"},{key:"Material",value:"Chrome Plated"},{key:"Handle",value:"Knurled Grip"},{key:"Set",value:"Pair 20 kg"}],["dumbbell","lifelong","fixed","10kg"],{is_bestseller:true}),
p("gym","Kobo Gym Gloves with Wrist Support","Kobo",699,999,150,[{key:"Material",value:"Leather + Neoprene"},{key:"Feature",value:"Wrist Support Wrap"},{key:"Size",value:"S/M/L/XL"},{key:"Gender",value:"Unisex"}],["gym-gloves","kobo","wrist-support","leather"]),
p("gym","Strauss Gym Bag 30L Sports Duffel","Strauss",1299,1999,100,[{key:"Capacity",value:"30 Litres"},{key:"Material",value:"Polyester"},{key:"Feature",value:"Shoes Compartment"},{key:"Color",value:"Black"}],["gym-bag","strauss","duffel","30l"]),
p("gym","Cosco Skipping Rope Ball Bearing Speed","Cosco",499,799,200,[{key:"Type",value:"Speed Rope"},{key:"Bearing",value:"Ball Bearing"},{key:"Handle",value:"Foam Grip"},{key:"Length",value:"Adjustable 2.6m"}],["skipping-rope","cosco","speed","ball-bearing"],{is_bestseller:true}),
p("gym","Decathlon Corength Resistance Band Set 5pcs","Decathlon",1299,1899,100,[{key:"Set",value:"5 Bands"},{key:"Resistance",value:"5 to 40 kg Range"},{key:"Material",value:"Latex"},{key:"Feature",value:"Color Coded Levels"}],["resistance-band","decathlon","set-5","latex"]),
p("gym","Nivia Pro Whey Protein 2kg Chocolate","Nivia",2499,3499,80,[{key:"Type",value:"Whey Protein"},{key:"Weight",value:"2 kg"},{key:"Flavour",value:"Chocolate"},{key:"Protein",value:"24g per serving"}],["whey-protein","nivia","chocolate","2kg"]),
p("gym","MuscleBlaze Whey Protein Isolate 1kg","MuscleBlaze",2999,3999,70,[{key:"Type",value:"Whey Isolate"},{key:"Weight",value:"1 kg"},{key:"Protein",value:"27g per serving"},{key:"Flavour",value:"Rich Milk Chocolate"}],["whey-isolate","muscleblaze","1kg","protein"],{is_bestseller:true}),
p("gym","Optimum Nutrition Gold Standard 100% Whey 2lbs","Optimum Nutrition",2999,4099,60,[{key:"Type",value:"Whey Protein"},{key:"Weight",value:"2 lbs"},{key:"Protein",value:"24g per serving"},{key:"Flavour",value:"Double Rich Chocolate"}],["whey-protein","on","gold-standard","2lbs"],{is_featured:true}),
p("gym","Strauss Yoga Mat 4mm Non-Slip","Strauss",799,1299,150,[{key:"Thickness",value:"4 mm"},{key:"Material",value:"PVC"},{key:"Size",value:"183x61 cm"},{key:"Feature",value:"Non-Slip Surface"}],["yoga-mat","strauss","4mm","non-slip"]),
p("gym","Boldfit Pull Up Bar Doorway No Screws","Boldfit",1499,2199,80,[{key:"Type",value:"Doorway Pull-Up Bar"},{key:"Load",value:"150 kg"},{key:"Feature",value:"No Screws"},{key:"Width",value:"60-100 cm Adjustable"}],["pull-up-bar","boldfit","doorway","no-screws"]),
p("gym","Decathlon Push Up Handles Rubber","Decathlon",699,999,150,[{key:"Type",value:"Push Up Handles"},{key:"Material",value:"Steel + Rubber"},{key:"Feature",value:"Non-Slip"},{key:"Set",value:"Pair"}],["push-up-handles","decathlon","rubber","pair"]),
p("gym","Lifelong Gym Ab Roller Wheel","Lifelong",599,999,150,[{key:"Type",value:"Ab Roller"},{key:"Material",value:"Stainless Steel + Foam Handle"},{key:"Feature",value:"Non-Slip Rubber Wheel"},{key:"Load",value:"150 kg"}],["ab-roller","lifelong","core","gym"]),
p("gym","Kobo Multi-Purpose Weight Plate 5kg Each","Kobo",899,1299,100,[{key:"Weight",value:"5 kg each"},{key:"Material",value:"Cast Iron"},{key:"Diameter",value:"25mm Hole"},{key:"Finish",value:"Black Powder Coat"}],["weight-plate","kobo","5kg","cast-iron"]),
p("gym","Strauss Treadmill T-5600 2HP Manual","Strauss",14999,21999,15,[{key:"Motor",value:"2 HP Peak"},{key:"Speed",value:"1-12 km/h"},{key:"Display",value:"LED Display"},{key:"Feature",value:"Foldable"}],["treadmill","strauss","2hp","foldable"]),
p("gym","Durafit Recumbent Bike RB2","Durafit",17999,24999,10,[{key:"Type",value:"Recumbent Bike"},{key:"Resistance",value:"8 Levels"},{key:"Display",value:"LED Monitor"},{key:"Feature",value:"Mobile Holder"}],["exercise-bike","durafit","recumbent","cardio"]),
p("gym","Boldfit Gym Shaker Bottle 700ml","Boldfit",299,499,400,[{key:"Capacity",value:"700 ml"},{key:"Material",value:"BPA-Free Plastic"},{key:"Feature",value:"Steel Mixing Ball"},{key:"Compartment",value:"Protein + Supplement"}],["shaker","boldfit","700ml","gym"],{is_bestseller:true}),
p("gym","Decathlon Domyos 8kg Kettlebell","Decathlon",1999,2999,60,[{key:"Weight",value:"8 kg"},{key:"Material",value:"Cast Iron"},{key:"Handle",value:"Textured Grip"},{key:"Coating",value:"Powder Coat"}],["kettlebell","decathlon","8kg","cast-iron"]),
p("gym","Healthvit Fitness Barbell Set 20kg","Healthvit",2999,4499,40,[{key:"Weight",value:"20 kg Total"},{key:"Bar Length",value:"150 cm"},{key:"Plates",value:"4x2.5kg + 4x5kg"},{key:"Material",value:"Cast Iron"}],["barbell","healthvit","20kg","set"]),
p("gym","Nivia Death Ball 5kg Slam Ball","Nivia",1299,1899,70,[{key:"Weight",value:"5 kg"},{key:"Material",value:"Rubber"},{key:"Feature",value:"No Bounce Slam Ball"},{key:"Use",value:"Cross Training"}],["slam-ball","nivia","5kg","crossfit"]),
p("gym","RitFit Fitness Foam Roller 33cm","RitFit",799,1299,100,[{key:"Type",value:"Foam Roller"},{key:"Length",value:"33 cm"},{key:"Density",value:"Medium"},{key:"Feature",value:"Grid Surface"}],["foam-roller","ritfit","recovery","33cm"]),
p("gym","Boldfit Resistance Tubes Set 5pcs","Boldfit",699,1199,120,[{key:"Set",value:"5 Tubes"},{key:"Resistance",value:"5-75 lbs"},{key:"Material",value:"Latex"},{key:"Accessory",value:"Handles + Door Anchor"}],["resistance-tubes","boldfit","set-5","home-gym"]),
p("gym","Decathlon Olympic Speed Skipping Rope","Decathlon",999,1499,80,[{key:"Type",value:"Speed Rope"},{key:"Cable",value:"Steel Wire"},{key:"Bearing",value:"Sealed Ball Bearing"},{key:"Handle",value:"Aluminium"}],["skipping-rope","decathlon","speed","steel"]),
p("gym","Healthkart HK Vitals Creatine Monohydrate 250g","Healthkart",999,1299,100,[{key:"Type",value:"Creatine Monohydrate"},{key:"Weight",value:"250 g"},{key:"Servings",value:"50 Servings"},{key:"Feature",value:"Micronized Form"}],["creatine","healthkart","monohydrate","250g"]),
p("gym","Nakpro Gold Multivitamin 60 Tablets","Nakpro",699,999,120,[{key:"Type",value:"Multivitamin"},{key:"Count",value:"60 Tablets"},{key:"Vitamins",value:"24 Vitamins + Minerals"},{key:"Serving",value:"1 per day"}],["multivitamin","nakpro","supplement","60-tabs"]),
p("gym","MuscleBlaze BCAA Gold 250g","MuscleBlaze",1199,1599,90,[{key:"Type",value:"BCAA"},{key:"Weight",value:"250 g"},{key:"Ratio",value:"2:1:1 Leucine"},{key:"Flavour",value:"Watermelon"}],["bcaa","muscleblaze","250g","recovery"]),
p("gym","Boldfit Pair of Ankle Weights 2x1kg","Boldfit",599,999,130,[{key:"Weight",value:"1 kg each"},{key:"Material",value:"Neoprene"},{key:"Feature",value:"Adjustable Strap"},{key:"Use",value:"Yoga + Walking + Gym"}],["ankle-weights","boldfit","1kg","pair"]),
p("gym","Strauss Gym Chalk Block 2 pcs","Strauss",149,299,300,[{key:"Type",value:"Gym Chalk"},{key:"Weight",value:"56g each"},{key:"Feature",value:"Magnesium Carbonate"},{key:"Pack",value:"2 Blocks"}],["gym-chalk","strauss","magnesium","2-pack"]),
// ── YOGA & CYCLING (61-75) ────────────────────────────────────────────────────
p("yoga","Boldfit Yoga Block Set 2pcs","Boldfit",599,999,150,[{key:"Material",value:"EVA Foam"},{key:"Set",value:"2 Blocks"},{key:"Size",value:"23x15x7.5 cm"},{key:"Density",value:"High Density"}],["yoga","block","boldfit","set-2"]),
p("yoga","Strauss Yoga Strap 244cm","Strauss",249,499,200,[{key:"Material",value:"Cotton"},{key:"Length",value:"244 cm"},{key:"Feature",value:"Metal D-Ring Buckle"},{key:"Width",value:"3.8 cm"}],["yoga","strap","strauss","cotton"]),
p("yoga","Letsfit Premium Yoga Mat 6mm","Letsfit",999,1799,100,[{key:"Thickness",value:"6 mm"},{key:"Material",value:"TPE"},{key:"Feature",value:"Alignment Lines"},{key:"Size",value:"183x61 cm"}],["yoga-mat","letsfit","6mm","tpe"]),
p("yoga","Manduka PRO Yoga Mat 6mm Black","Manduka",9999,12999,20,[{key:"Thickness",value:"6 mm"},{key:"Material",value:"PVC"},{key:"Feature",value:"Closed-Cell Surface"},{key:"Warranty",value:"Lifetime Guarantee"}],["yoga-mat","manduka","pro","premium"],{is_featured:true}),
p("yoga","Boldfit Meditation Cushion Zafu","Boldfit",799,1299,100,[{key:"Type",value:"Zafu Cushion"},{key:"Filling",value:"Buckwheat Hull"},{key:"Cover",value:"Cotton"},{key:"Height",value:"15 cm"}],["meditation","cushion","boldfit","zafu"]),
p("yoga","Strauss Gym Ball 65cm Anti-Burst","Strauss",999,1599,80,[{key:"Size",value:"65 cm"},{key:"Material",value:"PVC Anti-Burst"},{key:"Load",value:"300 kg"},{key:"Includes",value:"Pump + Pin"}],["gym-ball","strauss","65cm","anti-burst"]),
p("yoga","Reebok Training Mat 7mm","Reebok",2499,3499,70,[{key:"Thickness",value:"7 mm"},{key:"Material",value:"NBR Foam"},{key:"Size",value:"183x61 cm"},{key:"Feature",value:"Non-Slip"}],["yoga-mat","reebok","7mm","nbr"]),
p("cycling","Firefox Bikes Cyclone 27.5 MTB","Firefox",12999,17999,15,[{key:"Type",value:"Mountain Bike"},{key:"Wheel",value:"27.5 inch"},{key:"Gears",value:"21 Speed Shimano"},{key:"Frame",value:"Alloy"}],["cycle","firefox","mtb","21-speed"],{is_bestseller:true}),
p("cycling","Hero Lectro C8 Electric Cycle","Hero",34999,44999,10,[{key:"Type",value:"Electric Cycle"},{key:"Motor",value:"250W Hub Motor"},{key:"Battery",value:"36V 7.5Ah Li-ion"},{key:"Range",value:"30 km"}],["electric-cycle","hero","lectro","e-bike"]),
p("cycling","Cosmic Tora 700C Road Bike","Cosmic",8999,12999,20,[{key:"Type",value:"Road Bike"},{key:"Wheel",value:"700C"},{key:"Gears",value:"21 Speed"},{key:"Frame",value:"Alloy"}],["road-bike","cosmic","700c","21-speed"]),
p("cycling","Rexon RX-29 MTB 29 inch 21 Speed","Rexon",8499,11999,15,[{key:"Type",value:"Mountain Bike"},{key:"Wheel",value:"29 inch"},{key:"Gears",value:"21 Speed"},{key:"Suspension",value:"Front Fork"}],["cycle","rexon","29inch","21-speed"]),
p("cycling","Nivia Cycling Helmet Multi-Sport","Nivia",999,1599,80,[{key:"Type",value:"Cycling Helmet"},{key:"Adjustment",value:"Dial-Fit Retention"},{key:"Ventilation",value:"18 Air Vents"},{key:"Standard",value:"CE EN 1078"}],["helmet","nivia","cycling","ce-certified"]),
p("cycling","Decathlon Trek 500 Cycling Gloves","Decathlon",799,1199,100,[{key:"Material",value:"Synthetic"},{key:"Padding",value:"Gel Palm"},{key:"Closure",value:"Velcro"},{key:"Feature",value:"Touchscreen Compatible"}],["cycling-gloves","decathlon","gel","touchscreen"]),
p("cycling","Btwin 100 Cycle Bottle 650ml","Btwin",299,499,300,[{key:"Capacity",value:"650 ml"},{key:"Material",value:"BPA-Free Plastic"},{key:"Feature",value:"Squeeze Easy Flow"},{key:"Compatibility",value:"Standard Bottle Cage"}],["cycle-bottle","btwin","650ml","bpa-free"]),
p("swim","Speedo Fastskin Swimsuit Women","Speedo",2999,4499,40,[{key:"Type",value:"Competition Swimsuit"},{key:"Material",value:"LZR Racer Fabric"},{key:"Feature",value:"Chlorine Resistant"},{key:"Gender",value:"Women"}],["swimsuit","speedo","women","competition"]),
// ── SWIMMING & OTHER (76-100) ─────────────────────────────────────────────────
p("swim","Arena Spider Back Swimsuit Men","Arena",1999,2999,60,[{key:"Type",value:"Jammers"},{key:"Material",value:"Polyester + Elastane"},{key:"Feature",value:"Chlorine Resistant"},{key:"Gender",value:"Men"}],["swimwear","arena","men","jammers"]),
p("swim","Nivia 822 Swimming Cap Silicone","Nivia",299,499,200,[{key:"Material",value:"Silicone"},{key:"Feature",value:"Watertight Seal"},{key:"Gender",value:"Unisex"},{key:"Color",value:"Multiple"}],["swim-cap","nivia","silicone","unisex"],{is_bestseller:true}),
p("swim","Speedo Adult Goggles Vanquisher 2.0","Speedo",899,1299,120,[{key:"Type",value:"Swimming Goggles"},{key:"Lens",value:"Anti-Fog Polycarbonate"},{key:"Feature",value:"UV Protection"},{key:"Fit",value:"Adjustable Strap"}],["goggles","speedo","anti-fog","adult"]),
p("swim","Arena Unisex Swimming Goggles Cruiser Soft","Arena",699,999,150,[{key:"Type",value:"Swimming Goggles"},{key:"Lens",value:"Polycarbonate"},{key:"Feature",value:"Soft Face Gasket"},{key:"UV",value:"100% UV Protection"}],["goggles","arena","soft","unisex"]),
p("swim","Cosco Pro Snorkel Set Mask + Fin","Cosco",1999,3299,50,[{key:"Set",value:"Mask + Snorkel + Fins"},{key:"Material",value:"Silicone + Rubber"},{key:"Size",value:"Adult"},{key:"Feature",value:"Dry Top Snorkel"}],["snorkel","cosco","set","adult"]),
p("football","Nivia Encounter Football Shoes Turf","Nivia",1499,2199,100,[{key:"Type",value:"Turf Shoes"},{key:"Upper",value:"Synthetic"},{key:"Sole",value:"Rubber Turf Studs"},{key:"Surface",value:"Artificial Turf"}],["football","shoes","nivia","turf"]),
p("football","Adidas Tiro 23 Football Jersey Men","Adidas",1499,2199,120,[{key:"Material",value:"Recycled Polyester"},{key:"Feature",value:"AEROREADY Moisture Absorb"},{key:"Fit",value:"Regular"},{key:"Gender",value:"Men"}],["jersey","adidas","football","training"]),
p("cricket","SG HP 33 Cricket Batting Pads","SG",1799,2499,50,[{key:"Type",value:"Batting Pads"},{key:"Material",value:"PVC + HD Foam"},{key:"Feature",value:"Velcro Closure x3"},{key:"Size",value:"Full Size"}],["cricket","pads","sg","batting"]),
p("gym","Boldfit Sport Water Bottle 1L Stainless","Boldfit",699,1199,200,[{key:"Capacity",value:"1 Litre"},{key:"Material",value:"Stainless Steel"},{key:"Feature",value:"Insulated 12 Hours"},{key:"Leak-Proof",value:"Yes"}],["water-bottle","boldfit","stainless","1l"]),
p("gym","Decathlon Pull Down Lat Bar Attachment","Decathlon",1999,2999,60,[{key:"Type",value:"Lat Pulldown Bar"},{key:"Material",value:"Steel"},{key:"Cable",value:"Carabiner Attachment"},{key:"Length",value:"60 cm"}],["lat-bar","decathlon","cable","attachment"]),
p("gym","Boldfit Workout Bench Adjustable 3-Level","Boldfit",4999,7999,25,[{key:"Type",value:"Adjustable Bench"},{key:"Positions",value:"Flat + Incline + Decline"},{key:"Capacity",value:"200 kg"},{key:"Material",value:"Steel Frame"}],["bench","boldfit","adjustable","200kg"],{is_featured:true}),
p("yoga","Strauss Cork Yoga Block","Strauss",599,999,100,[{key:"Material",value:"Natural Cork"},{key:"Size",value:"23x15x7.5 cm"},{key:"Feature",value:"Eco-Friendly"},{key:"Density",value:"High"}],["yoga-block","strauss","cork","eco"]),
p("cycling","Decathlon Riverside 500 26T Hybrid Bike","Decathlon",12999,17999,12,[{key:"Type",value:"Hybrid Bike"},{key:"Wheel",value:"26 inch"},{key:"Gears",value:"21 Speed Shimano"},{key:"Frame",value:"Aluminium"}],["hybrid-bike","decathlon","riverside","21-speed"]),
p("swim","Speedo Learn to Swim Armbands Kids 2-12","Speedo",499,799,200,[{key:"Type",value:"Swim Armbands"},{key:"Age",value:"2-12 Years"},{key:"Material",value:"PVC"},{key:"Feature",value:"Adjustable Size"}],["armbands","speedo","kids","learn-to-swim"]),
p("gym","Kobo Multi-Grip Pull Up Bar Wall Mounted","Kobo",2499,3999,40,[{key:"Type",value:"Wall Mount Pull-Up Bar"},{key:"Load",value:"200 kg"},{key:"Grips",value:"Multiple Grip Positions"},{key:"Feature",value:"No Drilling Required"}],["pull-up-bar","kobo","wall-mount","multi-grip"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "sports-fitness" || c.slug === "sports")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing sports products`);
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
  console.log(`\n✅ Done! ${inserted} Sports products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
