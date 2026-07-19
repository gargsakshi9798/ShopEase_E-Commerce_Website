/**
 * seedBeauty.js — 100 Beauty Products
 * Run: node server/seeders/seedBeauty.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  skincare: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80","https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80","https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80","https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80"],
  makeup:   ["https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80","https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80","https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80"],
  haircare: ["https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80","https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80","https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80"],
  perfume:  ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80","https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80","https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&q=80","https://images.unsplash.com/photo-1576481440926-00c8f8a33e09?w=600&q=80"],
  tool:     ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80","https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80","https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80","https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80"],
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
// ── SKINCARE (1-25) ───────────────────────────────────────────────────────────
p("skincare","Himalaya Purifying Neem Face Wash 150ml","Himalaya",145,199,500,[{key:"Type",value:"Face Wash"},{key:"Volume",value:"150 ml"},{key:"Key Ingredient",value:"Neem + Turmeric"},{key:"Skin Type",value:"Oily"}],["face-wash","himalaya","neem","oily-skin"],{is_bestseller:true}),
p("skincare","Cetaphil Gentle Skin Cleanser 250ml","Cetaphil",499,599,300,[{key:"Type",value:"Cleanser"},{key:"Volume",value:"250 ml"},{key:"Skin Type",value:"Sensitive/Dry"},{key:"Feature",value:"Non-irritating"}],["cleanser","cetaphil","sensitive","gentle"]),
p("skincare","Neutrogena Deep Clean Face Wash 150g","Neutrogena",299,399,400,[{key:"Type",value:"Face Wash"},{key:"Weight",value:"150 g"},{key:"Feature",value:"Blackhead Removal"},{key:"Skin Type",value:"Normal/Oily"}],["face-wash","neutrogena","deep-clean","blackhead"]),
p("skincare","Lakme 9 to 5 Vitamin C+ Day Cream 50g","Lakme",399,499,350,[{key:"Type",value:"Day Cream"},{key:"Weight",value:"50 g"},{key:"Key Ingredient",value:"Vitamin C"},{key:"SPF",value:"SPF 20"}],["moisturizer","lakme","vitamin-c","spf"],{is_bestseller:true}),
p("skincare","Pond's White Beauty SPF 15 Cream 50g","Ponds",299,399,450,[{key:"Type",value:"Moisturiser"},{key:"Weight",value:"50 g"},{key:"Feature",value:"Whitening + SPF 15"},{key:"Texture",value:"Lightweight"}],["cream","ponds","whitening","spf-15"]),
p("skincare","Garnier Bright Complete Vitamin C Serum 30ml","Garnier",449,599,350,[{key:"Type",value:"Serum"},{key:"Volume",value:"30 ml"},{key:"Key Ingredient",value:"Vitamin C"},{key:"Concern",value:"Pigmentation"}],["serum","garnier","vitamin-c","brightening"]),
p("skincare","The Ordinary Niacinamide 10% + Zinc 1% 30ml","The Ordinary",849,999,250,[{key:"Type",value:"Serum"},{key:"Volume",value:"30 ml"},{key:"Key Ingredient",value:"Niacinamide 10%"},{key:"Concern",value:"Pores + Blemishes"}],["serum","the-ordinary","niacinamide","pores"],{is_featured:true}),
p("skincare","Plum Bright Years Vitamin C Clay Mask 75g","Plum",599,799,200,[{key:"Type",value:"Clay Mask"},{key:"Weight",value:"75 g"},{key:"Key Ingredient",value:"Vitamin C + AHA"},{key:"Skin Type",value:"All Skin Types"}],["mask","plum","vitamin-c","clay"]),
p("skincare","Dot & Key Watermelon Hyaluronic Moisturizer 85g","Dot & Key",649,849,200,[{key:"Type",value:"Moisturizer"},{key:"Key Ingredient",value:"Hyaluronic Acid + Watermelon"},{key:"Concern",value:"Hydration"},{key:"Skin Type",value:"All Types"}],["moisturizer","dot-key","hyaluronic","hydration"]),
p("skincare","Minimalist 10% Niacinamide Face Serum 30ml","Minimalist",599,699,300,[{key:"Type",value:"Serum"},{key:"Volume",value:"30 ml"},{key:"Active",value:"Niacinamide 10%"},{key:"Concern",value:"Uneven Skin Tone"}],["serum","minimalist","niacinamide","10-percent"]),
p("skincare","WOW Skin Science Apple Cider Vinegar Toner 200ml","WOW",399,549,280,[{key:"Type",value:"Toner"},{key:"Volume",value:"200 ml"},{key:"Key Ingredient",value:"ACV + Witch Hazel"},{key:"Skin Type",value:"Oily/Combination"}],["toner","wow","acv","pore-minimizing"]),
p("skincare","Biotique Bio Coconut Whitening Scrub 175g","Biotique",199,299,400,[{key:"Type",value:"Face Scrub"},{key:"Weight",value:"175 g"},{key:"Key Ingredient",value:"Coconut"},{key:"Feature",value:"Natural + Ayurvedic"}],["scrub","biotique","coconut","ayurvedic"]),
p("skincare","Nivea Men Face Wash Oil Control 100ml","Nivea",179,229,500,[{key:"Type",value:"Face Wash"},{key:"Volume",value:"100 ml"},{key:"Target",value:"Men"},{key:"Concern",value:"Oil Control"}],["face-wash","nivea","men","oil-control"]),
p("skincare","L'Oreal Paris Revitalift Night Cream 50ml","LOreal",749,999,200,[{key:"Type",value:"Night Cream"},{key:"Volume",value:"50 ml"},{key:"Key Ingredient",value:"Pro-Retinol + Centella"},{key:"Concern",value:"Anti-Aging"}],["night-cream","loreal","anti-aging","retinol"]),
p("skincare","Mamaearth Vitamin C Face Wash 100ml","Mamaearth",249,349,400,[{key:"Type",value:"Face Wash"},{key:"Volume",value:"100 ml"},{key:"Key Ingredient",value:"Vitamin C + Turmeric"},{key:"Toxin-free",value:"Paraben Free"}],["face-wash","mamaearth","vitamin-c","natural"]),
p("skincare","Aqualogica Glow+ Face Moisturizer 50g","Aqualogica",499,699,250,[{key:"Type",value:"Moisturizer"},{key:"Weight",value:"50 g"},{key:"Key Ingredient",value:"Papaya + Niacinamide"},{key:"SPF",value:"SPF 25 PA+++"}],["moisturizer","aqualogica","glow","spf"]),
p("skincare","Be Bodywise 1% Salicylic Acid Spot Gel 30ml","Bodywise",349,499,300,[{key:"Type",value:"Spot Treatment"},{key:"Volume",value:"30 ml"},{key:"Active",value:"Salicylic Acid 1%"},{key:"Concern",value:"Acne + Pimples"}],["spot-treatment","bodywise","salicylic","acne"]),
p("skincare","Forest Essentials Facial Sunscreen SPF 50 50g","Forest Essentials",1750,2200,80,[{key:"Type",value:"Sunscreen"},{key:"SPF",value:"SPF 50 PA+++"},{key:"Texture",value:"Lightweight Matte"},{key:"Feature",value:"Ayurvedic Ingredients"}],["sunscreen","forest-essentials","spf50","luxury"],{is_featured:true}),
p("skincare","Neutrogena Ultra Sheer Sunscreen SPF 50+ 30ml","Neutrogena",499,649,300,[{key:"Type",value:"Sunscreen"},{key:"SPF",value:"SPF 50+"},{key:"Volume",value:"30 ml"},{key:"Texture",value:"Non-Greasy"}],["sunscreen","neutrogena","spf50","non-greasy"],{is_bestseller:true}),
p("skincare","Simple Kind to Skin Moisturising Lotion 125ml","Simple",399,499,280,[{key:"Type",value:"Moisturizer"},{key:"Volume",value:"125 ml"},{key:"Feature",value:"No Perfume/Dye"},{key:"Skin Type",value:"Sensitive"}],["moisturizer","simple","sensitive","no-perfume"]),
p("skincare","Dermalogica Daily Microfoliant 74g","Dermalogica",3500,4200,60,[{key:"Type",value:"Exfoliating Powder"},{key:"Weight",value:"74 g"},{key:"Feature",value:"Daily Enzyme Exfoliation"},{key:"Skin Type",value:"All Types"}],["exfoliant","dermalogica","enzyme","premium"],{is_featured:true}),
p("skincare","CeraVe Moisturising Cream 454g","CeraVe",1499,1799,150,[{key:"Type",value:"Moisturizing Cream"},{key:"Weight",value:"454 g"},{key:"Key Ingredient",value:"Ceramides + Hyaluronic Acid"},{key:"Feature",value:"Non-comedogenic"}],["moisturizer","cerave","ceramides","body"]),
p("skincare","Lotus Herbals Safe Sun Sunscreen SPF 70 50g","Lotus Herbals",499,699,250,[{key:"Type",value:"Sunscreen"},{key:"SPF",value:"SPF 70"},{key:"Weight",value:"50 g"},{key:"Feature",value:"Anti-Pollution"}],["sunscreen","lotus","spf70","anti-pollution"]),
p("skincare","Re'equil Ultra Matte Dry Touch Sunscreen SPF 50 50g","Requid",699,899,200,[{key:"SPF",value:"SPF 50 PA++++"},{key:"Type",value:"Dry Touch"},{key:"Volume",value:"50 g"},{key:"Feature",value:"Zero White Cast"}],["sunscreen","requid","matte","no-white-cast"]),
p("skincare","Kiehl's Ultra Facial Moisturizer SPF 30 125ml","Kiehls",3499,4200,50,[{key:"Type",value:"Moisturizer"},{key:"Volume",value:"125 ml"},{key:"SPF",value:"SPF 30"},{key:"Feature",value:"24H Hydration"}],["moisturizer","kiehls","spf30","premium"]),

// ── MAKEUP (26-50) ────────────────────────────────────────────────────────────
p("makeup","Maybelline Fit Me Matte+Poreless Foundation 30ml","Maybelline",499,649,300,[{key:"Type",value:"Foundation"},{key:"Finish",value:"Matte"},{key:"Coverage",value:"Medium to Full"},{key:"Shades",value:"40+ Shades"}],["foundation","maybelline","matte","drugstore"],{is_bestseller:true}),
p("makeup","Lakme Absolute Skin Natural Mousse Foundation","Lakme",699,899,250,[{key:"Type",value:"Mousse Foundation"},{key:"Coverage",value:"Medium"},{key:"Finish",value:"Natural"},{key:"Feature",value:"SPF 8"}],["foundation","lakme","mousse","natural"]),
p("makeup","SUGAR Cosmetics Nothing Else Matter Lip Colour","SUGAR",499,699,200,[{key:"Type",value:"Lipstick"},{key:"Finish",value:"Matte"},{key:"Feature",value:"Long-Lasting 12 Hours"},{key:"Shades",value:"20+ Shades"}],["lipstick","sugar","matte","long-lasting"]),
p("makeup","Maybelline New York Colossal Kajal Black","Maybelline",199,279,600,[{key:"Type",value:"Kajal"},{key:"Feature",value:"16HR Smudge-proof"},{key:"Color",value:"Intense Black"},{key:"Retractable",value:"No"}],["kajal","maybelline","smudge-proof","black"],{is_bestseller:true}),
p("makeup","Lakme Eyeconic Kajal Black 0.35g","Lakme",199,275,500,[{key:"Type",value:"Kajal"},{key:"Feature",value:"Waterproof"},{key:"Color",value:"Black"},{key:"Formula",value:"Long-Staying"}],["kajal","lakme","waterproof","black"]),
p("makeup","NYX Professional Lip Liner Soft Matte","NYX",699,899,200,[{key:"Type",value:"Lip Liner"},{key:"Finish",value:"Soft Matte"},{key:"Feature",value:"Smudge-proof"},{key:"Shades",value:"10+ Shades"}],["lip-liner","nyx","matte","professional"]),
p("makeup","L'Oreal True Match Foundation 30ml","LOreal",699,899,250,[{key:"Type",value:"Foundation"},{key:"Coverage",value:"Light to Medium"},{key:"Feature",value:"SPF 17"},{key:"Shades",value:"30+ Shades"}],["foundation","loreal","true-match","spf"]),
p("makeup","MAC Retro Matte Lipstick 3g","MAC",1900,2200,100,[{key:"Type",value:"Lipstick"},{key:"Finish",value:"Retro Matte"},{key:"Weight",value:"3 g"},{key:"Feature",value:"High Pigment"}],["lipstick","mac","matte","premium"],{is_featured:true}),
p("makeup","SUGAR Blend The Rules Eyeshadow Palette 9 Shades","SUGAR",999,1399,150,[{key:"Type",value:"Eyeshadow Palette"},{key:"Shades",value:"9 Pigmented Shades"},{key:"Finish",value:"Matte + Shimmer"},{key:"Feature",value:"Mirror Included"}],["eyeshadow","sugar","palette","9-shades"]),
p("makeup","Colorbar Matte Touch Lipstick","Colorbar",499,699,200,[{key:"Type",value:"Lipstick"},{key:"Finish",value:"Matte"},{key:"Feature",value:"Moisturizing Formula"},{key:"Shades",value:"20+ Shades"}],["lipstick","colorbar","matte","moisturizing"]),
p("makeup","Maybelline Sky High Mascara Black 7.2ml","Maybelline",549,699,300,[{key:"Type",value:"Mascara"},{key:"Volume",value:"7.2 ml"},{key:"Feature",value:"Lengthening + Volumizing"},{key:"Color",value:"Blackest Black"}],["mascara","maybelline","sky-high","volumizing"],{is_bestseller:true}),
p("makeup","Faces Canada Ultime Pro Eyeshadow Palette","Faces Canada",799,1099,150,[{key:"Type",value:"Eyeshadow"},{key:"Shades",value:"8 Shades"},{key:"Finish",value:"Multi-finish"},{key:"Feature",value:"Buildable Coverage"}],["eyeshadow","faces-canada","palette","8-shades"]),
p("makeup","Swiss Beauty Liquid Eyeliner Black 5ml","Swiss Beauty",199,349,400,[{key:"Type",value:"Liquid Eyeliner"},{key:"Volume",value:"5 ml"},{key:"Feature",value:"Waterproof"},{key:"Tip",value:"Precision Tip"}],["eyeliner","swiss-beauty","liquid","waterproof"]),
p("makeup","Lakme Cushion Matte Lipstick","Lakme",349,499,300,[{key:"Type",value:"Matte Lipstick"},{key:"Feature",value:"Stays 8 Hours"},{key:"Moisture",value:"Jojoba Oil"},{key:"Shades",value:"Multiple"}],["lipstick","lakme","cushion","matte"]),
p("makeup","Huda Beauty Desert Dusk Eyeshadow Palette","Huda Beauty",5000,6000,30,[{key:"Type",value:"Eyeshadow Palette"},{key:"Shades",value:"18 Shades"},{key:"Finish",value:"Matte + Shimmer + Glitter"},{key:"Feature",value:"Ultra Pigmented"}],["eyeshadow","huda-beauty","palette","premium"],{is_featured:true}),
p("makeup","Nykaa Cosmetics All Day Matte Liquid Lipstick","Nykaa",349,499,250,[{key:"Type",value:"Liquid Lipstick"},{key:"Finish",value:"All-Day Matte"},{key:"Feature",value:"Transfer-Proof 12 Hrs"},{key:"Shades",value:"30+ Shades"}],["lipstick","nykaa","liquid","matte"]),
p("makeup","Coloressence Compact Powder SPF 15","Coloressence",349,499,200,[{key:"Type",value:"Compact Powder"},{key:"SPF",value:"SPF 15"},{key:"Feature",value:"Oil Control"},{key:"Shades",value:"5 Shades"}],["compact","coloressence","powder","spf"]),
p("makeup","RENEE Cheek Play Blush Soft Peach","RENEE",499,699,200,[{key:"Type",value:"Blush"},{key:"Finish",value:"Satin"},{key:"Feature",value:"Long-Lasting"},{key:"Shade",value:"Soft Peach"}],["blush","renee","cheek","satin"]),
p("makeup","Benefit Cosmetics BADgal BANG Mascara 8.5g","Benefit",2500,3000,60,[{key:"Type",value:"Mascara"},{key:"Weight",value:"8.5 g"},{key:"Feature",value:"Volumizing + Lengthening"},{key:"Formula",value:"Aerospace Technology"}],["mascara","benefit","premium","volumizing"]),
p("makeup","Urban Decay All Nighter Makeup Setting Spray 118ml","Urban Decay",2800,3500,50,[{key:"Type",value:"Setting Spray"},{key:"Volume",value:"118 ml"},{key:"Feature",value:"16-Hour Hold"},{key:"Finish",value:"Natural"}],["setting-spray","urban-decay","16-hour","premium"]),
p("makeup","Kiko Milano Smart Colour Lipstick","Kiko Milano",799,1099,100,[{key:"Type",value:"Lipstick"},{key:"Finish",value:"Semi-Matte"},{key:"Shades",value:"Multiple"},{key:"Feature",value:"Long-Lasting 6 Hours"}],["lipstick","kiko","semi-matte","italian"]),
p("makeup","Makeup Revolution Pressed Glitter Palette","Makeup Revolution",499,799,150,[{key:"Type",value:"Glitter Palette"},{key:"Shades",value:"6 Glitters"},{key:"Feature",value:"High Intensity Glitter"},{key:"Use",value:"Eyes + Face + Body"}],["glitter","makeup-revolution","palette","festival"]),
p("makeup","Maybelline Master Strobing Stick Highlighter","Maybelline",399,549,200,[{key:"Type",value:"Highlighter Stick"},{key:"Feature",value:"Blendable"},{key:"Finish",value:"Dewy Glow"},{key:"Shades",value:"2 Shades"}],["highlighter","maybelline","stick","glow"]),
p("makeup","Bare Body Face Primer Matte Finish","Bare Body",299,499,250,[{key:"Type",value:"Face Primer"},{key:"Finish",value:"Matte"},{key:"Feature",value:"Pore Filling"},{key:"Volume",value:"30 ml"}],["primer","bare-body","matte","pore-filling"]),
p("makeup","Charlotte Tilbury Pillow Talk Lipstick","Charlotte Tilbury",3800,4500,40,[{key:"Type",value:"Lipstick"},{key:"Shade",value:"Pillow Talk"},{key:"Finish",value:"Matte"},{key:"Feature",value:"Hyaluronic Acid"}],["lipstick","charlotte-tilbury","pillow-talk","luxury"],{is_featured:true}),
// ── HAIRCARE (51-70) ─────────────────────────────────────────────────────────
p("haircare","L'Oreal Paris Total Repair 5 Shampoo 640ml","LOreal",549,699,300,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"640 ml"},{key:"Feature",value:"5 Repair Actions"},{key:"Hair Type",value:"Damaged Hair"}],["shampoo","loreal","repair","damaged"],{is_bestseller:true}),
p("haircare","Pantene Advanced Hair Fall Solution Shampoo 650ml","Pantene",499,649,350,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"650 ml"},{key:"Feature",value:"Anti-Hair Fall"},{key:"Ingredient",value:"Pro-V + Biotin"}],["shampoo","pantene","anti-hairfall","pro-v"]),
p("haircare","Dove Intense Repair Conditioner 335g","Dove",349,449,400,[{key:"Type",value:"Conditioner"},{key:"Weight",value:"335 g"},{key:"Feature",value:"Fiber Actives"},{key:"Hair Type",value:"Damaged"}],["conditioner","dove","repair","fiber"]),
p("haircare","TRESemmé Keratin Smooth Shampoo 585ml","TRESemme",449,599,300,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"585 ml"},{key:"Feature",value:"Keratin Smoothing"},{key:"Hair Type",value:"Frizzy"}],["shampoo","tresemme","keratin","frizz"]),
p("haircare","Mamaearth Onion Hair Oil 250ml","Mamaearth",349,449,350,[{key:"Type",value:"Hair Oil"},{key:"Volume",value:"250 ml"},{key:"Key Ingredient",value:"Onion + Redensyl"},{key:"Concern",value:"Hair Fall Control"}],["hair-oil","mamaearth","onion","hair-fall"],{is_bestseller:true}),
p("haircare","Indulekha Bringha Hair Oil 100ml","Indulekha",399,499,300,[{key:"Type",value:"Hair Oil"},{key:"Volume",value:"100 ml"},{key:"Key Ingredient",value:"Bringharaj"},{key:"Feature",value:"Selfie Comb Applicator"}],["hair-oil","indulekha","bringha","ayurvedic"]),
p("haircare","WOW Onion Black Seed Hair Oil 200ml","WOW",499,699,250,[{key:"Type",value:"Hair Oil"},{key:"Volume",value:"200 ml"},{key:"Key Ingredient",value:"Onion + Black Seed Oil"},{key:"Concern",value:"Hair Growth"}],["hair-oil","wow","onion","black-seed"]),
p("haircare","Streax Hair Serum Ultra Lite Shine 100ml","Streax",199,299,400,[{key:"Type",value:"Hair Serum"},{key:"Volume",value:"100 ml"},{key:"Feature",value:"Walnut Oil + UV Filter"},{key:"Finish",value:"Shine + Frizz Control"}],["hair-serum","streax","shine","walnut"]),
p("haircare","L'Oreal Elvive Total Repair 5 Mask 300ml","LOreal",649,849,200,[{key:"Type",value:"Hair Mask"},{key:"Weight",value:"300 ml"},{key:"Feature",value:"5-Repair Actions"},{key:"Hair Type",value:"Damaged/Fragile"}],["hair-mask","loreal","repair","weekly"]),
p("haircare","Schwarzkopf BC Repair Rescue Deep Nourishing Mask 200ml","Schwarzkopf",999,1299,100,[{key:"Type",value:"Deep Nourishing Mask"},{key:"Weight",value:"200 ml"},{key:"Feature",value:"Intensive Care"},{key:"Hair Type",value:"Damaged"}],["hair-mask","schwarzkopf","nourishing","deep"]),
p("haircare","Trichup Healthy Long & Strong Hair Oil 200ml","Trichup",249,349,400,[{key:"Type",value:"Hair Oil"},{key:"Volume",value:"200 ml"},{key:"Key Ingredient",value:"Bhringraj + Amla + Coconut"},{key:"Concern",value:"Hair Growth"}],["hair-oil","trichup","herbal","long-hair"]),
p("haircare","Dove Dryness Care Hair Oil 100ml","Dove",199,279,450,[{key:"Type",value:"Hair Oil"},{key:"Volume",value:"100 ml"},{key:"Feature",value:"Nutri-Oils Complex"},{key:"Hair Type",value:"Dry/Frizzy"}],["hair-oil","dove","dryness","nutri"]),
p("haircare","Head & Shoulders Anti-Dandruff Shampoo 650ml","Head & Shoulders",499,649,350,[{key:"Type",value:"Anti-Dandruff Shampoo"},{key:"Volume",value:"650 ml"},{key:"Feature",value:"Pyrithione Zinc"},{key:"Use",value:"Daily"}],["shampoo","head-shoulders","anti-dandruff","daily"],{is_bestseller:true}),
p("haircare","Biotique Bio Bhringraj Fresh Growth Shampoo 200ml","Biotique",199,299,400,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"200 ml"},{key:"Key Ingredient",value:"Bhringraj"},{key:"Feature",value:"Ayurvedic Paraben-Free"}],["shampoo","biotique","bhringraj","ayurvedic"]),
p("haircare","Wella Professionals Invigo Nutri-Enrich Shampoo 250ml","Wella",799,999,100,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"250 ml"},{key:"Feature",value:"Goji Berry + Wheat Protein"},{key:"Hair Type",value:"Dull/Dry"}],["shampoo","wella","professional","goji"]),
p("haircare","Moroccanoil Treatment 100ml","Moroccanoil",3000,3800,40,[{key:"Type",value:"Hair Treatment"},{key:"Volume",value:"100 ml"},{key:"Key Ingredient",value:"Argan Oil"},{key:"Feature",value:"Frizz Control + Shine"}],["hair-treatment","moroccanoil","argan","premium"],{is_featured:true}),
p("haircare","Kerastase Nutritive Masquintense Thick Hair 200ml","Kerastase",2999,3599,30,[{key:"Type",value:"Hair Mask"},{key:"Weight",value:"200 ml"},{key:"Feature",value:"Intense Nourishment"},{key:"Hair Type",value:"Dry/Thick"}],["hair-mask","kerastase","professional","nourishing"]),
p("haircare","Clinic Plus Strong & Long Shampoo 650ml","Clinic Plus",249,349,600,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"650 ml"},{key:"Feature",value:"Milk Proteins"},{key:"Concern",value:"Strength + Length"}],["shampoo","clinic-plus","strength","budget"]),
p("haircare","Livon Hair Serum 100ml","Livon",249,329,400,[{key:"Type",value:"Hair Serum"},{key:"Volume",value:"100 ml"},{key:"Feature",value:"5-in-1 Nourishment"},{key:"Finish",value:"Frizz-free Shine"}],["serum","livon","shine","5-in-1"],{is_bestseller:true}),
p("haircare","Sunsilk Thick & Long Shampoo 650ml","Sunsilk",249,349,500,[{key:"Type",value:"Shampoo"},{key:"Volume",value:"650 ml"},{key:"Feature",value:"Biotin + Aloe"},{key:"Concern",value:"Long Strong Hair"}],["shampoo","sunsilk","biotin","long"]),
// ── FRAGRANCES & TOOLS (71-100) ───────────────────────────────────────────────
p("perfume","Davidoff Cool Water EDT 125ml Men","Davidoff",2499,3500,100,[{key:"Type",value:"EDT"},{key:"Volume",value:"125 ml"},{key:"Target",value:"Men"},{key:"Notes",value:"Aquatic + Woodsy"}],["perfume","davidoff","men","aquatic"],{is_bestseller:true}),
p("perfume","Calvin Klein CK One EDT 200ml Unisex","Calvin Klein",3499,4500,80,[{key:"Type",value:"EDT"},{key:"Volume",value:"200 ml"},{key:"Target",value:"Unisex"},{key:"Notes",value:"Citrus + Floral + Musk"}],["perfume","calvin-klein","unisex","ck-one"],{is_featured:true}),
p("perfume","Versace Pour Homme EDT 100ml Men","Versace",5499,7000,40,[{key:"Type",value:"EDT"},{key:"Volume",value:"100 ml"},{key:"Target",value:"Men"},{key:"Notes",value:"Aquatic + Citrus + Woody"}],["perfume","versace","men","luxury"]),
p("perfume","Fogg Fresh Oriental Scent 150ml","Fogg",299,499,500,[{key:"Type",value:"Deodorant Body Spray"},{key:"Volume",value:"150 ml"},{key:"Feature",value:"No Gas, Pure Perfume"},{key:"Longevity",value:"All Day"}],["deodorant","fogg","oriental","budget"],{is_bestseller:true}),
p("perfume","Engage Femme Cologne Spray 150ml","Engage",299,449,400,[{key:"Type",value:"Cologne Spray"},{key:"Volume",value:"150 ml"},{key:"Target",value:"Women"},{key:"Notes",value:"Floral"}],["deodorant","engage","women","floral"]),
p("perfume","Titan Skinn Titan Raw EDP 50ml","Titan",1499,1999,100,[{key:"Type",value:"EDP"},{key:"Volume",value:"50 ml"},{key:"Notes",value:"Bergamot + Sandalwood"},{key:"Longevity",value:"8 Hours"}],["perfume","titan","skinn","indian"]),
p("perfume","Park Avenue Good Morning Deodorant 220ml","Park Avenue",299,399,500,[{key:"Type",value:"Aerosol Deodorant"},{key:"Volume",value:"220 ml"},{key:"Target",value:"Men"},{key:"Feature",value:"48H Protection"}],["deodorant","park-avenue","men","48h"]),
p("perfume","Bella Vita Luxury Queen EDP 100ml","Bella Vita",999,1499,150,[{key:"Type",value:"EDP"},{key:"Volume",value:"100 ml"},{key:"Target",value:"Women"},{key:"Notes",value:"Floral + Musk"}],["perfume","bella-vita","women","floral"]),
p("perfume","Wild Stone Ultra Sensual EDP 50ml","Wild Stone",499,699,200,[{key:"Type",value:"EDP"},{key:"Volume",value:"50 ml"},{key:"Target",value:"Men"},{key:"Notes",value:"Spicy + Woody"}],["perfume","wild-stone","men","sensual"]),
p("perfume","Chanel Chance EDP 100ml Women","Chanel",14000,16000,15,[{key:"Type",value:"EDP"},{key:"Volume",value:"100 ml"},{key:"Target",value:"Women"},{key:"Notes",value:"Floral + Citrus"}],["perfume","chanel","chance","luxury"],{is_featured:true}),
p("tool","Philips BHH222 Hair Dryer 1200W","Philips",1299,1799,150,[{key:"Type",value:"Hair Dryer"},{key:"Power",value:"1200W"},{key:"Feature",value:"Diffuser + Concentrator"},{key:"Settings",value:"2 Speed + 1 Cool"}],["hair-dryer","philips","1200w","budget"]),
p("tool","Remington Curl & Straight Confidence Hair Styler","Remington",2999,4299,80,[{key:"Type",value:"2-in-1 Styler"},{key:"Temp",value:"Up to 230°C"},{key:"Feature",value:"Curl + Straighten"},{key:"Plate",value:"Ceramic Coated"}],["hair-styler","remington","2-in-1","ceramic"]),
p("tool","BaByliss Pro Ceramic Straightener 230°C","BaByliss",4999,6999,50,[{key:"Type",value:"Hair Straightener"},{key:"Plate Size",value:"35mm"},{key:"Temp",value:"Up to 235°C"},{key:"Feature",value:"Digital Temperature Control"}],["straightener","babyliss","ceramic","professional"],{is_featured:true}),
p("tool","Vega Ultra-Curl Hair Curler","Vega",1299,1899,120,[{key:"Type",value:"Hair Curler"},{key:"Barrel",value:"25mm"},{key:"Temp",value:"Up to 200°C"},{key:"Feature",value:"Ceramic Coated Barrel"}],["curler","vega","ceramic","25mm"]),
p("tool","Nova NHP 8200 Professional Hair Dryer 2200W","Nova",1499,2199,120,[{key:"Type",value:"Hair Dryer"},{key:"Power",value:"2200W"},{key:"Feature",value:"Concentrator + Diffuser"},{key:"Settings",value:"3 Heat + 2 Speed"}],["hair-dryer","nova","2200w","professional"]),
p("tool","Havells HC4045 Hair Dryer 1800W","Havells",1299,1899,130,[{key:"Type",value:"Hair Dryer"},{key:"Power",value:"1800W"},{key:"Accessories",value:"Concentrator Nozzle"},{key:"Feature",value:"Cool Shot Button"}],["hair-dryer","havells","1800w","cool-shot"]),
p("tool","Philips Straightener BHS375 Thermal Protect","Philips",2299,3299,100,[{key:"Type",value:"Hair Straightener"},{key:"Plate",value:"Ceramic Coated"},{key:"Temp",value:"Up to 230°C"},{key:"Feature",value:"ThermalProtect Technology"}],["straightener","philips","ceramic","thermal-protect"]),
p("tool","Syska Grooming Kit HBS100 Trimmer + Shaver","Syska",799,1299,150,[{key:"Type",value:"Grooming Kit"},{key:"Items",value:"Trimmer + Nose Trim + Shaver"},{key:"Battery",value:"AA Battery"},{key:"Waterproof",value:"Yes"}],["grooming","syska","trimmer","kit"]),
p("tool","Braun Series 5 5018s Electric Shaver","Braun",6999,9999,50,[{key:"Type",value:"Electric Shaver"},{key:"Feature",value:"AutoSensing Motor"},{key:"Battery",value:"50 Min"},{key:"Waterproof",value:"Wet + Dry"}],["shaver","braun","series5","premium"],{is_featured:true}),
p("tool","Havells Face Roller Rose Quartz","Havells",499,799,200,[{key:"Type",value:"Face Roller"},{key:"Material",value:"Rose Quartz"},{key:"Use",value:"De-puff + Massage"},{key:"Feature",value:"Dual Roller"}],["face-roller","rose-quartz","massage","skincare"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "beauty-personal" || c.slug === "beauty")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing beauty products`);
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
  console.log(`\n✅ Done! ${inserted} Beauty products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
