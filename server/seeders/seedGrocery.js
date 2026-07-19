/**
 * seedGrocery.js — 100 Grocery Products
 * Run: node server/seeders/seedGrocery.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  grocery: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80","https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80","https://images.unsplash.com/photo-1506617420156-8e4536971650?w=600&q=80"],
  dairy:   ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80","https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80","https://images.unsplash.com/photo-1531695760996-cf53b69a4e6e?w=600&q=80","https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"],
  snack:   ["https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=600&q=80","https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80","https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80"],
  bev:     ["https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600&q=80","https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80","https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80","https://images.unsplash.com/photo-1506617420156-8e4536971650?w=600&q=80"],
  grain:   ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80","https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80","https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80"],
  spice:   ["https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&q=80","https://images.unsplash.com/photo-1506617420156-8e4536971650?w=600&q=80","https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80","https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80"],
  health:  ["https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&q=80","https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=600&q=80","https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80","https://images.unsplash.com/photo-1506617420156-8e4536971650?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(10, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 500, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── STAPLES & GRAINS (1-15) ───────────────────────────────────────────────────
p("grain","India Gate Basmati Rice Classic 5kg","India Gate",499,599,300,[{key:"Weight",value:"5 kg"},{key:"Type",value:"Basmati Rice"},{key:"Grain",value:"Extra Long Grain"},{key:"Feature",value:"Aged Basmati"}],["rice","basmati","india-gate","5kg"],{is_bestseller:true}),
p("grain","Daawat Rozana Super Basmati Rice 5kg","Daawat",449,549,280,[{key:"Weight",value:"5 kg"},{key:"Type",value:"Basmati"},{key:"Feature",value:"Slender Grain"},{key:"Cooking",value:"Everyday Use"}],["rice","basmati","daawat","5kg"]),
p("grain","Aashirvaad Whole Wheat Atta 10kg","Aashirvaad",469,549,250,[{key:"Weight",value:"10 kg"},{key:"Type",value:"Whole Wheat Atta"},{key:"Feature",value:"100% MP Sharbati Wheat"},{key:"Fibre",value:"High Fibre"}],["atta","wheat","aashirvaad","10kg"],{is_bestseller:true}),
p("grain","Pillsbury Chakki Fresh Atta 5kg","Pillsbury",239,279,300,[{key:"Weight",value:"5 kg"},{key:"Type",value:"Whole Wheat"},{key:"Feature",value:"Fresh Chakki Grinding"},{key:"Shelf Life",value:"6 Months"}],["atta","wheat","pillsbury","5kg"]),
p("grain","Tata Sampann Chana Dal 500g","Tata",89,109,500,[{key:"Weight",value:"500 g"},{key:"Type",value:"Chana Dal"},{key:"Feature",value:"100% Natural"},{key:"Cooking",value:"Cleaned + Sorted"}],["dal","chana","tata","500g"]),
p("grain","Tata Sampann Moong Dal 500g","Tata",99,129,500,[{key:"Weight",value:"500 g"},{key:"Type",value:"Yellow Moong Dal"},{key:"Feature",value:"100% Natural"},{key:"Cooking",value:"Cleaned + Sorted"}],["dal","moong","tata","500g"]),
p("grain","24 Mantra Organic Toor Dal 1kg","24 Mantra",189,249,300,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Organic Toor Dal"},{key:"Certification",value:"USDA Organic"},{key:"Feature",value:"Chemical-Free"}],["dal","toor","organic","24-mantra"]),
p("grain","Patanjali Poha Medium 500g","Patanjali",39,55,600,[{key:"Weight",value:"500 g"},{key:"Type",value:"Flattened Rice (Poha)"},{key:"Feature",value:"Naturally Processed"},{key:"Use",value:"Breakfast/Snacks"}],["poha","patanjali","500g","breakfast"]),
p("grain","Fortune Sunflower Cooking Oil 5L","Fortune",749,879,200,[{key:"Volume",value:"5 Litres"},{key:"Type",value:"Refined Sunflower Oil"},{key:"Feature",value:"Light + Healthy"},{key:"Vitamin E",value:"Rich in Vitamin E"}],["cooking-oil","sunflower","fortune","5l"],{is_bestseller:true}),
p("grain","Dhara Refined Soybean Oil 5L","Dhara",699,849,200,[{key:"Volume",value:"5 Litres"},{key:"Type",value:"Refined Soybean Oil"},{key:"Feature",value:"Heart Healthy"},{key:"Process",value:"Multi-Stage Refining"}],["cooking-oil","soybean","dhara","5l"]),
p("grain","Saffola Gold Blended Oil 5L","Saffola",849,999,180,[{key:"Volume",value:"5 Litres"},{key:"Type",value:"Rice Bran + Safflower Blend"},{key:"Feature",value:"Heart Healthy"},{key:"Oryzanol",value:"Natural Oryzanol"}],["cooking-oil","saffola","blended","5l"]),
p("grain","Sona Masoori Raw Rice 5kg","AP Grains",349,449,250,[{key:"Weight",value:"5 kg"},{key:"Type",value:"Sona Masoori"},{key:"Feature",value:"Aromatic Medium Grain"},{key:"Origin",value:"Andhra Pradesh"}],["rice","sona-masoori","5kg","south-india"]),
p("spice","Tata Salt Iodised 1kg","Tata",24,29,1000,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Iodised Salt"},{key:"Feature",value:"Crystal Salt"},{key:"Feature2",value:"Anti-caking agent"}],["salt","tata","iodised","1kg"],{is_bestseller:true}),
p("spice","MDH Rajma Masala 100g","MDH",75,89,600,[{key:"Weight",value:"100 g"},{key:"Type",value:"Masala Powder"},{key:"Use",value:"Kidney Bean Curry"},{key:"Feature",value:"Authentic Spice Blend"}],["masala","mdh","rajma","spice"]),
p("spice","Everest Kitchen King Masala 200g","Everest",149,185,500,[{key:"Weight",value:"200 g"},{key:"Type",value:"Kitchen King Masala"},{key:"Feature",value:"20+ Spice Blend"},{key:"Use",value:"Multi-Purpose"}],["masala","everest","kitchen-king","200g"],{is_bestseller:true}),

// ── SPICES & CONDIMENTS (16-30) ───────────────────────────────────────────────
p("spice","MDH Chole Masala 100g","MDH",75,89,600,[{key:"Weight",value:"100 g"},{key:"Use",value:"Chole Bhature"},{key:"Feature",value:"Authentic Spice Blend"},{key:"Type",value:"Masala Powder"}],["masala","mdh","chole","100g"]),
p("spice","Everest Garam Masala 100g","Everest",85,99,600,[{key:"Weight",value:"100 g"},{key:"Type",value:"Garam Masala"},{key:"Feature",value:"Aromatic Spice Blend"},{key:"Use",value:"Finishing Spice"}],["masala","everest","garam","100g"],{is_bestseller:true}),
p("spice","Shan Biryani Masala 60g","Shan",99,125,400,[{key:"Weight",value:"60 g"},{key:"Use",value:"Biryani"},{key:"Origin",value:"Pakistani Recipe"},{key:"Feature",value:"Authentic Taste"}],["masala","shan","biryani","60g"],{is_bestseller:true}),
p("spice","Catch Turmeric Powder 200g","Catch",69,89,800,[{key:"Weight",value:"200 g"},{key:"Type",value:"Turmeric Powder"},{key:"Curcumin",value:"High Curcumin"},{key:"Feature",value:"Pure Ground"}],["haldi","turmeric","catch","200g"]),
p("spice","Catch Red Chilli Powder 200g","Catch",79,99,700,[{key:"Weight",value:"200 g"},{key:"Type",value:"Red Chilli Powder"},{key:"Heat",value:"Medium Hot"},{key:"Feature",value:"Pure Ground"}],["chilli","catch","200g","spice"]),
p("spice","Tata Salt Rock Salt 1kg","Tata",45,59,800,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Rock Salt (Sendha Namak)"},{key:"Feature",value:"Mineral Rich"},{key:"Use",value:"Cooking + Fasting"}],["rock-salt","tata","sendha-namak","1kg"]),
p("spice","Weikfield Custard Powder Vanilla 100g","Weikfield",85,99,500,[{key:"Weight",value:"100 g"},{key:"Flavour",value:"Vanilla"},{key:"Use",value:"Custard + Desserts"},{key:"Feature",value:"Quick Mix"}],["custard","weikfield","vanilla","baking"]),
p("spice","Maggi Hot & Sweet Tomato Chilli Sauce 1kg","Maggi",189,229,400,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Tomato Chilli Sauce"},{key:"Feature",value:"Hot & Sweet"},{key:"Use",value:"Dipping + Cooking"}],["sauce","maggi","tomato","chilli"],{is_bestseller:true}),
p("spice","Kissan Mixed Fruit Jam 500g","Kissan",149,179,500,[{key:"Weight",value:"500 g"},{key:"Type",value:"Mixed Fruit Jam"},{key:"Feature",value:"Real Fruit Pieces"},{key:"Use",value:"Bread + Toast"}],["jam","kissan","fruit","500g"],{is_bestseller:true}),
p("spice","Heinz Tomato Ketchup 910g","Heinz",249,299,400,[{key:"Weight",value:"910 g"},{key:"Type",value:"Tomato Ketchup"},{key:"Feature",value:"No Artificial Colours"},{key:"Use",value:"Dipping + Cooking"}],["ketchup","heinz","tomato","910g"]),
p("spice","Ching's Secret Green Chilli Sauce 680g","Chings",149,189,400,[{key:"Weight",value:"680 g"},{key:"Type",value:"Green Chilli Sauce"},{key:"Feature",value:"Indo-Chinese Taste"},{key:"Use",value:"Noodles + Momos"}],["sauce","chings","green-chilli","indo-chinese"]),
p("spice","Dr. Oetker FunFoods Mayonnaise 875g","Dr Oetker",349,419,300,[{key:"Weight",value:"875 g"},{key:"Type",value:"Mayonnaise Veg"},{key:"Feature",value:"Rich + Creamy"},{key:"Use",value:"Sandwich + Dip"}],["mayo","dr-oetker","veg","875g"]),
p("spice","Knorr Chicken Soup Mix 44g Pack 10","Knorr",249,299,350,[{key:"Pack",value:"10 Sachets x 44g"},{key:"Type",value:"Instant Soup"},{key:"Flavour",value:"Chicken"},{key:"Use",value:"Quick Soup"}],["soup","knorr","chicken","instant"]),
p("spice","Saffola Masala Oats Veggie Twist 720g","Saffola",349,449,300,[{key:"Weight",value:"720 g"},{key:"Type",value:"Masala Oats"},{key:"Flavour",value:"Veggie Twist"},{key:"Feature",value:"High Fibre + Protein"}],["oats","saffola","masala","healthy"]),
p("grain","Quaker Oats 2kg","Quaker",349,429,300,[{key:"Weight",value:"2 kg"},{key:"Type",value:"Rolled Oats"},{key:"Feature",value:"100% Whole Grain"},{key:"Beta Glucan",value:"Heart Healthy"}],["oats","quaker","rolled","2kg"],{is_bestseller:true}),

// ── SNACKS & BISCUITS (31-50) ─────────────────────────────────────────────────
p("snack","Haldiram's Bhujia 400g","Haldirams",149,179,500,[{key:"Weight",value:"400 g"},{key:"Type",value:"Namkeen Bhujia"},{key:"Feature",value:"Crispy + Spicy"},{key:"Origin",value:"Bikaner Recipe"}],["snacks","haldirams","bhujia","namkeen"],{is_bestseller:true}),
p("snack","Lay's Classic Salted Chips 52g Pack 12","Lays",349,419,400,[{key:"Pack",value:"12 x 52g"},{key:"Flavour",value:"Classic Salted"},{key:"Type",value:"Potato Chips"},{key:"Feature",value:"Crispy Thin"}],["chips","lays","salted","12-pack"],{is_bestseller:true}),
p("snack","Bingo Mad Angles Achari Masti 80g Pack 6","Bingo",199,249,400,[{key:"Pack",value:"6 x 80g"},{key:"Flavour",value:"Achaari Masti"},{key:"Type",value:"Triangle Chips"},{key:"Feature",value:"Tangy Taste"}],["chips","bingo","achari","triangles"]),
p("snack","Pringles Original 134g","Pringles",249,299,300,[{key:"Weight",value:"134 g"},{key:"Flavour",value:"Original"},{key:"Type",value:"Stackable Potato Crisps"},{key:"Feature",value:"USA Import"}],["pringles","crisps","original","imported"]),
p("snack","Haldiram's Aloo Bhujia 400g","Haldirams",139,165,500,[{key:"Weight",value:"400 g"},{key:"Type",value:"Aloo Bhujia"},{key:"Feature",value:"Crispy + Savoury"},{key:"Ingredients",value:"Potato + Spices"}],["snacks","haldirams","aloo","namkeen"]),
p("snack","Britannia Good Day Cashew Cookies 600g","Britannia",149,185,600,[{key:"Weight",value:"600 g"},{key:"Type",value:"Butter Cookies"},{key:"Feature",value:"Real Cashew Pieces"},{key:"Texture",value:"Crispy"}],["biscuit","britannia","good-day","cashew"],{is_bestseller:true}),
p("snack","Parle-G Original Glucose Biscuit 800g","Parle",60,75,1000,[{key:"Weight",value:"800 g"},{key:"Type",value:"Glucose Biscuit"},{key:"Feature",value:"India's Most Popular Biscuit"},{key:"Texture",value:"Crispy"}],["biscuit","parle-g","glucose","iconic"],{is_bestseller:true}),
p("snack","McVitie's Digestive Biscuit 400g","McVities",149,179,500,[{key:"Weight",value:"400 g"},{key:"Type",value:"Digestive Wheat Biscuit"},{key:"Feature",value:"High Fibre"},{key:"Origin",value:"UK Recipe"}],["biscuit","mcvities","digestive","wheat"]),
p("snack","Oreo Chocolate Sandwich Cookies 308g","Oreo",149,179,600,[{key:"Weight",value:"308 g"},{key:"Type",value:"Chocolate Sandwich Cookie"},{key:"Feature",value:"Twist + Lick + Dunk"},{key:"Filling",value:"Vanilla Cream"}],["biscuit","oreo","chocolate","cookies"],{is_bestseller:true}),
p("snack","Sunfeast Dark Fantasy Choco Fills 300g","Sunfeast",149,179,500,[{key:"Weight",value:"300 g"},{key:"Type",value:"Filled Cookies"},{key:"Filling",value:"Dark Choco Cream"},{key:"Feature",value:"Premium Indulgence"}],["cookies","sunfeast","dark-fantasy","chocolate"]),
p("snack","Kurkure Masala Munch 90g Pack 10","Kurkure",299,359,400,[{key:"Pack",value:"10 x 90g"},{key:"Flavour",value:"Masala Munch"},{key:"Type",value:"Puffed Corn Snack"},{key:"Feature",value:"Tetrahedral Crunch"}],["kurkure","masala","snacks","pack"]),
p("snack","Act II Instant Popcorn Butter 30g Pack 12","Act II",199,249,500,[{key:"Pack",value:"12 x 30g"},{key:"Flavour",value:"Butter"},{key:"Type",value:"Microwave Popcorn"},{key:"Time",value:"3 Minutes"}],["popcorn","act-ii","butter","microwave"]),
p("snack","Bikaji Navratan Mix 400g","Bikaji",129,159,500,[{key:"Weight",value:"400 g"},{key:"Type",value:"Navratan Mix"},{key:"Feature",value:"9 Varieties Mixed"},{key:"Taste",value:"Spicy + Tangy"}],["namkeen","bikaji","navratan","mix"]),
p("snack","Cadbury Dairy Milk Silk 145g","Cadbury",199,245,400,[{key:"Weight",value:"145 g"},{key:"Type",value:"Milk Chocolate"},{key:"Feature",value:"Silky Smooth Texture"},{key:"Range",value:"Premium"}],["chocolate","cadbury","dairy-milk","silk"],{is_bestseller:true}),
p("snack","KitKat 4 Finger Chocolate 41.5g Pack 12","KitKat",299,359,400,[{key:"Pack",value:"12 x 41.5g"},{key:"Type",value:"Wafer Chocolate"},{key:"Feature",value:"Have a Break!"},{key:"Layers",value:"4 Finger Wafer"}],["chocolate","kitkat","wafer","pack"]),
p("snack","Cadbury 5 Star 43g Pack 12","Cadbury",249,299,400,[{key:"Pack",value:"12 x 43g"},{key:"Type",value:"Caramel Nougat Chocolate"},{key:"Feature",value:"Get Lost in 5Star"},{key:"Texture",value:"Chewy + Crunchy"}],["chocolate","cadbury","5-star","caramel"]),
p("snack","Ferrero Rocher 16pcs Gift Box","Ferrero",599,699,200,[{key:"Pieces",value:"16"},{key:"Type",value:"Hazelnut Chocolate"},{key:"Feature",value:"Premium Gifting"},{key:"Layers",value:"4-Layer Crunch"}],["chocolate","ferrero","rocher","gifting"],{is_featured:true}),
p("snack","Amul Milk Chocolate 150g","Amul",149,179,600,[{key:"Weight",value:"150 g"},{key:"Type",value:"Milk Chocolate"},{key:"Feature",value:"Rich Creamy Milk"},{key:"Origin",value:"Made in India"}],["chocolate","amul","milk","indian"]),
p("snack","Choco Pie Lotte 12pcs Box","Lotte",199,249,400,[{key:"Pieces",value:"12"},{key:"Type",value:"Marshmallow Choco Pie"},{key:"Feature",value:"Soft + Chocolatey"},{key:"Origin",value:"Korean Brand"}],["choco-pie","lotte","marshmallow","korean"]),
p("snack","Peanut Butter Creamy MyFitness 1kg","MyFitness",499,699,300,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Creamy Peanut Butter"},{key:"Protein",value:"25g per 100g"},{key:"Feature",value:"No Added Sugar"}],["peanut-butter","myfitness","creamy","protein"],{is_bestseller:true}),

// ── BEVERAGES (51-65) ─────────────────────────────────────────────────────────
p("bev","Nescafe Classic Instant Coffee 200g","Nescafe",499,599,300,[{key:"Weight",value:"200 g"},{key:"Type",value:"Instant Coffee"},{key:"Feature",value:"100% Pure Coffee"},{key:"Strength",value:"Strong"}],["coffee","nescafe","instant","200g"],{is_bestseller:true}),
p("bev","Bru Instant Coffee Gold 200g","Bru",449,549,300,[{key:"Weight",value:"200 g"},{key:"Type",value:"Instant Coffee"},{key:"Feature",value:"Chicory Blend"},{key:"Roast",value:"Medium Dark"}],["coffee","bru","instant","200g"]),
p("bev","Tata Tea Premium Leaf 500g","Tata",249,299,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Black Leaf Tea"},{key:"Feature",value:"Strong + Refreshing"},{key:"Origin",value:"Assam"}],["tea","tata","premium","leaf"],{is_bestseller:true}),
p("bev","Brooke Bond Taj Mahal Tea 500g","Brooke Bond",299,369,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Premium Leaf Tea"},{key:"Feature",value:"Darjeeling Long Leaf"},{key:"Feature2",value:"Endorsed by Zakir Hussain"}],["tea","brooke-bond","taj-mahal","premium"]),
p("bev","Red Label Natural Care Tea 500g","Red Label",249,299,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Tea with Spices"},{key:"Feature",value:"Ginger + Tulsi + Cardamom"},{key:"Benefit",value:"Immunity Support"}],["tea","red-label","spiced","immunity"]),
p("bev","Tetley Green Tea 25 Bags","Tetley",149,185,500,[{key:"Bags",value:"25 Tea Bags"},{key:"Type",value:"Green Tea"},{key:"Feature",value:"Natural Antioxidants"},{key:"Flavour",value:"Original"}],["green-tea","tetley","bags","antioxidant"]),
p("bev","Lipton Yellow Label Tea 900g","Lipton",399,479,350,[{key:"Weight",value:"900 g"},{key:"Type",value:"Black Leaf Tea"},{key:"Feature",value:"Bright + Fresh Taste"},{key:"Origin",value:"Sri Lanka + India"}],["tea","lipton","yellow-label","900g"]),
p("bev","Complan Chocolate Malt Drink 500g","Complan",449,549,300,[{key:"Weight",value:"500 g"},{key:"Flavour",value:"Chocolate"},{key:"Feature",value:"23 Vital Nutrients"},{key:"Use",value:"Children 2-12 Years"}],["malt","complan","chocolate","nutrition"]),
p("bev","Horlicks Classic Malt 500g","Horlicks",379,449,300,[{key:"Weight",value:"500 g"},{key:"Flavour",value:"Classic Malt"},{key:"Feature",value:"Protein + Calcium + Vitamin D"},{key:"Age",value:"All Ages"}],["malt","horlicks","classic","nutrition"]),
p("bev","Bournvita 5 Star Magic 1kg","Cadbury",499,599,300,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Chocolate Malt Drink"},{key:"Feature",value:"Tayyari Jeet Ki"},{key:"Nutrients",value:"Vitamins + Minerals"}],["bournvita","cadbury","chocolate","malt"],{is_bestseller:true}),
p("bev","Tropicana Apple 100% Juice 1L Pack 6","Tropicana",899,1079,200,[{key:"Pack",value:"6 x 1 Litre"},{key:"Type",value:"Apple Juice"},{key:"Feature",value:"100% Fruit Juice"},{key:"Preservative",value:"No Added Preservatives"}],["juice","tropicana","apple","pack-6"]),
p("bev","Real Fruit Power Mango 1L","Real",89,109,600,[{key:"Volume",value:"1 Litre"},{key:"Type",value:"Mango Drink"},{key:"Feature",value:"Real Fruit Power"},{key:"Preservative",value:"No Added Colour"}],["juice","real","mango","1l"],{is_bestseller:true}),
p("bev","Minute Maid Guava 1L Pack 6","Minute Maid",699,849,200,[{key:"Pack",value:"6 x 1 Litre"},{key:"Flavour",value:"Guava"},{key:"Feature",value:"Pulpy Texture"},{key:"Use",value:"Ready to Drink"}],["juice","minute-maid","guava","1l"]),
p("bev","Appy Fizz Apple Sparkling 300ml Pack 24","Appy Fizz",599,719,200,[{key:"Pack",value:"24 x 300ml"},{key:"Type",value:"Sparkling Apple Drink"},{key:"Feature",value:"Refreshing Fizzy Taste"},{key:"Calorie",value:"Low Calorie"}],["apple-drink","appy-fizz","sparkling","24-pack"]),
p("bev","Milo Choco Malt Drink 1kg","Nestle",599,749,250,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Chocolate Malt"},{key:"Feature",value:"Actigen-E + Vitamins"},{key:"Use",value:"Sports + Active Kids"}],["milo","nestle","chocolate","malt"]),

// ── DAIRY & INSTANT FOODS (66-80) ─────────────────────────────────────────────
p("dairy","Amul Butter Salted 500g","Amul",299,349,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Salted Butter"},{key:"Fat",value:"80% Milk Fat"},{key:"Feature",value:"Utterly Butterly Delicious"}],["butter","amul","salted","500g"],{is_bestseller:true}),
p("dairy","Mother Dairy Paneer 200g","Mother Dairy",99,119,500,[{key:"Weight",value:"200 g"},{key:"Type",value:"Fresh Paneer"},{key:"Fat",value:"Full Fat"},{key:"Shelf Life",value:"5 Days Refrigerated"}],["paneer","mother-dairy","fresh","200g"],{is_bestseller:true}),
p("dairy","Nestlé MUNCH Activ Granola Bar 35g Pack 12","Nestle",299,359,400,[{key:"Pack",value:"12 x 35g"},{key:"Type",value:"Granola Bar"},{key:"Feature",value:"Real Nuts + Grains"},{key:"Benefit",value:"Energy Boost"}],["granola","nestle","munch","bar"]),
p("dairy","Amul Mozzarella Cheese Block 400g","Amul",299,349,300,[{key:"Weight",value:"400 g"},{key:"Type",value:"Mozzarella Cheese"},{key:"Feature",value:"For Pizza + Pasta"},{key:"Texture",value:"Stretchy Melt"}],["cheese","amul","mozzarella","pizza"]),
p("dairy","Maggi 2-Minute Noodles Masala 70g Pack 12","Maggi",180,216,600,[{key:"Pack",value:"12 x 70g"},{key:"Flavour",value:"Masala"},{key:"Type",value:"Instant Noodles"},{key:"Time",value:"2 Minutes Cook"}],["noodles","maggi","masala","12-pack"],{is_bestseller:true}),
p("dairy","Yippee Mood Masala Noodles 70g Pack 8","Yippee",120,144,500,[{key:"Pack",value:"8 x 70g"},{key:"Flavour",value:"Mood Masala"},{key:"Type",value:"Instant Noodles"},{key:"Feature",value:"Long Round Noodles"}],["noodles","yippee","masala","pack"]),
p("dairy","Top Ramen Smoodles Chicken 70g Pack 12","Top Ramen",149,179,500,[{key:"Pack",value:"12 x 70g"},{key:"Flavour",value:"Chicken"},{key:"Type",value:"Instant Noodles"},{key:"Style",value:"Smooth Noodles"}],["noodles","top-ramen","chicken","pack"]),
p("dairy","Ching's Secret Schezwan Chutney 250g","Chings",99,125,500,[{key:"Weight",value:"250 g"},{key:"Type",value:"Schezwan Chutney"},{key:"Use",value:"Noodles + Momos + Dipping"},{key:"Feature",value:"Indo-Chinese Authentic"}],["chutney","chings","schezwan","indo-chinese"]),
p("snack","Sunfeast Farmlite Digestive High Fibre 400g","Sunfeast",149,179,400,[{key:"Weight",value:"400 g"},{key:"Type",value:"Digestive Biscuit"},{key:"Fibre",value:"High Fibre"},{key:"Sugar",value:"Less Sugar"}],["biscuit","sunfeast","digestive","high-fibre"]),
p("dairy","Del Monte Penne Pasta 500g","Del Monte",99,129,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Penne Pasta"},{key:"Feature",value:"Durum Wheat Semolina"},{key:"Cook Time",value:"12 Minutes"}],["pasta","del-monte","penne","italian"]),
p("dairy","Borges Fusilli Pasta 500g","Borges",149,179,300,[{key:"Weight",value:"500 g"},{key:"Type",value:"Fusilli Pasta"},{key:"Feature",value:"100% Durum Wheat"},{key:"Origin",value:"Spanish"}],["pasta","borges","fusilli","imported"]),
p("dairy","MTR Ready-to-Eat Dal Makhani 300g","MTR",149,179,400,[{key:"Weight",value:"300 g"},{key:"Type",value:"Ready to Eat"},{key:"Heat",value:"Microwave 2 Min"},{key:"Feature",value:"No Preservatives"}],["ready-to-eat","mtr","dal-makhani","instant"],{is_bestseller:true}),
p("dairy","ITC Kitchens of India Dal Bukhara 285g","ITC",199,249,300,[{key:"Weight",value:"285 g"},{key:"Type",value:"Ready to Eat"},{key:"Recipe",value:"Bukhara Restaurant Style"},{key:"Heat",value:"Microwave or Boil"}],["ready-to-eat","itc","dal-bukhara","premium"]),
p("health","Patanjali Cow Ghee 1L","Patanjali",699,849,300,[{key:"Volume",value:"1 Litre"},{key:"Type",value:"Cow Ghee"},{key:"Feature",value:"Pure + Natural A2"},{key:"Process",value:"Bilona Method"}],["ghee","patanjali","cow","1l"]),
p("health","Amul Pure Ghee 905ml","Amul",599,699,350,[{key:"Volume",value:"905 ml"},{key:"Type",value:"Clarified Butter Ghee"},{key:"Feature",value:"Rich Aroma + Taste"},{key:"Fat",value:"99.7% Butterfat"}],["ghee","amul","pure","clarified"],{is_bestseller:true}),

// ── HEALTH FOODS & PERSONAL CARE (81-100) ────────────────────────────────────
p("health","Saffola Oats 1kg","Saffola",199,249,400,[{key:"Weight",value:"1 kg"},{key:"Type",value:"Rolled Oats"},{key:"Beta Glucan",value:"Heart Healthy"},{key:"Feature",value:"No Added Sugar"}],["oats","saffola","health","1kg"]),
p("health","Yoga Bar Multigrain Energy Bar Choco Almond 38g Pack 6","Yoga Bar",299,359,300,[{key:"Pack",value:"6 x 38g"},{key:"Flavour",value:"Choco Almond"},{key:"Protein",value:"4.3g per bar"},{key:"Feature",value:"No Refined Sugar"}],["energy-bar","yoga-bar","protein","6-pack"]),
p("health","RiteBite Max Protein Active Bar 75g Pack 6","RiteBite",399,499,200,[{key:"Pack",value:"6 x 75g"},{key:"Protein",value:"20g per bar"},{key:"Calories",value:"200 kcal"},{key:"Flavour",value:"Choco Slim"}],["protein-bar","ritebite","20g","pack-6"]),
p("health","True Elements Mixed Nuts 250g","True Elements",499,699,200,[{key:"Weight",value:"250 g"},{key:"Mix",value:"Almonds+Cashew+Walnuts+Pistachios"},{key:"Feature",value:"Roasted + Unsalted"},{key:"Allergen",value:"Tree Nuts"}],["mixed-nuts","true-elements","premium","250g"],{is_featured:true}),
p("health","Happilo Premium Almonds 500g","Happilo",599,799,200,[{key:"Weight",value:"500 g"},{key:"Type",value:"California Almonds"},{key:"Feature",value:"Natural + Unprocessed"},{key:"Storage",value:"Resealable Pack"}],["almonds","happilo","california","500g"],{is_bestseller:true}),
p("health","Rostaa Trail Mix Roasted 200g","Rostaa",349,499,250,[{key:"Weight",value:"200 g"},{key:"Mix",value:"Nuts + Berries + Seeds"},{key:"Feature",value:"Roasted + No Added Sugar"},{key:"Antioxidants",value:"Rich in Antioxidants"}],["trail-mix","rostaa","nuts","200g"]),
p("health","Tata NutriCorner Chia Seeds 150g","Tata",199,249,300,[{key:"Weight",value:"150 g"},{key:"Type",value:"Chia Seeds"},{key:"Omega",value:"Rich in Omega-3"},{key:"Fibre",value:"High Dietary Fibre"}],["chia-seeds","tata","omega3","healthy"]),
p("health","Patanjali Ashwagandha Powder 100g","Patanjali",89,109,400,[{key:"Weight",value:"100 g"},{key:"Type",value:"Ayurvedic Powder"},{key:"Benefit",value:"Stress Relief + Immunity"},{key:"Origin",value:"Pure Herbal"}],["ashwagandha","patanjali","ayurvedic","immunity"]),
p("health","Organic India Tulsi Green Tea 25 Bags","Organic India",199,249,300,[{key:"Bags",value:"25 Tea Bags"},{key:"Type",value:"Tulsi Green Tea"},{key:"Benefit",value:"Immunity + Antioxidants"},{key:"Certification",value:"USDA Organic"}],["green-tea","organic-india","tulsi","immunity"]),
p("health","Twinings Earl Grey Tea 25 Bags","Twinings",249,299,250,[{key:"Bags",value:"25 Tea Bags"},{key:"Type",value:"Earl Grey Black Tea"},{key:"Feature",value:"Bergamot Flavour"},{key:"Origin",value:"UK"}],["tea","twinings","earl-grey","imported"]),
p("health","Epigamia Greek Yogurt Mango 90g Pack 6","Epigamia",349,419,200,[{key:"Pack",value:"6 x 90g"},{key:"Type",value:"Greek Yogurt"},{key:"Flavour",value:"Mango"},{key:"Protein",value:"High Protein"}],["yogurt","epigamia","greek","mango"]),
p("health","Sleepy Owl Cold Brew Coffee 270ml Pack 3","Sleepy Owl",449,549,150,[{key:"Pack",value:"3 x 270ml"},{key:"Type",value:"Cold Brew Coffee"},{key:"Feature",value:"Ready to Drink"},{key:"Roast",value:"Medium Roast"}],["cold-brew","sleepy-owl","coffee","3-pack"],{is_featured:true}),
p("health","Blue Tokai Vienna Roast Ground Coffee 250g","Blue Tokai",799,999,100,[{key:"Weight",value:"250 g"},{key:"Type",value:"Medium Roast Ground"},{key:"Origin",value:"Single Origin Indian"},{key:"Roast",value:"Vienna Roast"}],["coffee","blue-tokai","ground","single-origin"]),
p("health","Nescafe Gold Blend Instant Coffee 200g","Nescafe",799,949,200,[{key:"Weight",value:"200 g"},{key:"Type",value:"Premium Instant"},{key:"Feature",value:"Smooth + Refined Taste"},{key:"Beans",value:"Arabica + Robusta"}],["coffee","nescafe","gold","premium"],{is_featured:true}),
p("health","Tetley Immunity Black Tea Ginger Mint 25 Bags","Tetley",149,179,400,[{key:"Bags",value:"25 Tea Bags"},{key:"Type",value:"Black Tea"},{key:"Infusion",value:"Ginger + Mint"},{key:"Benefit",value:"Immunity Boost"}],["tea","tetley","immunity","ginger"]),
p("snack","Too Yumm Multigrain Chips Peri Peri 70g Pack 8","Too Yumm",299,359,300,[{key:"Pack",value:"8 x 70g"},{key:"Type",value:"Baked Multigrain Chips"},{key:"Flavour",value:"Peri Peri"},{key:"Calories",value:"30% Less Fat"}],["chips","too-yumm","baked","multigrain"]),
p("snack","Britannia NutriChoice Digestive Zero 300g","Britannia",149,179,400,[{key:"Weight",value:"300 g"},{key:"Type",value:"Sugar-Free Digestive"},{key:"Feature",value:"Zero Added Sugar"},{key:"Fibre",value:"High Fibre Wheat"}],["biscuit","britannia","sugar-free","digestive"]),
p("dairy","Epigamia Super Smoothie Mango 200ml Pack 4","Epigamia",249,299,200,[{key:"Pack",value:"4 x 200ml"},{key:"Type",value:"Protein Smoothie"},{key:"Flavour",value:"Alphonso Mango"},{key:"Protein",value:"5g per bottle"}],["smoothie","epigamia","mango","protein"]),
p("snack","Amul Macho Wafers Chocolate 28g Pack 24","Amul",299,359,300,[{key:"Pack",value:"24 x 28g"},{key:"Type",value:"Wafer Biscuit"},{key:"Flavour",value:"Chocolate"},{key:"Feature",value:"Crispy Layers"}],["wafers","amul","chocolate","pack-24"]),
p("health","Dabur Honey Squeeze Bottle 500g","Dabur",299,369,400,[{key:"Weight",value:"500 g"},{key:"Type",value:"Pure Honey"},{key:"Feature",value:"100% Pure NMR Tested"},{key:"Antioxidants",value:"Rich Antioxidants"}],["honey","dabur","pure","500g"],{is_bestseller:true}),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "grocery")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing grocery products`);
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
  console.log(`\n✅ Done! ${inserted} Grocery products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
