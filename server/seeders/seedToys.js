/**
 * seedToys.js — 100 Toys Products
 * Run: node server/seeders/seedToys.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  lego:   ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80","https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&q=80","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80"],
  action: ["https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80","https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&q=80"],
  board:  ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600&q=80","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80"],
  soft:   ["https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80","https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&q=80"],
  rc:     ["https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80"],
  baby:   ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80","https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80"],
  puzzle: ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600&q=80","https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&q=80","https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80","https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 400, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── LEGO (1-15) ───────────────────────────────────────────────────────────────
p("lego","LEGO City Police Station 60316","Lego",7999,9999,60,[{key:"Pieces",value:"668"},{key:"Age",value:"6-14 Years"},{key:"Series",value:"LEGO City"},{key:"Feature",value:"Police Car + Bike Included"}],["lego","city","police","building"],{is_featured:true,is_bestseller:true}),
p("lego","LEGO Technic Bugatti Chiron 42083","Lego",44999,54999,15,[{key:"Pieces",value:"3599"},{key:"Age",value:"16+ Years"},{key:"Series",value:"LEGO Technic"},{key:"Feature",value:"Scale 1:8 Working Engine"}],["lego","technic","bugatti","adult"],{is_featured:true}),
p("lego","LEGO Star Wars Millennium Falcon 75257","Lego",19999,24999,20,[{key:"Pieces",value:"1351"},{key:"Age",value:"9-16 Years"},{key:"Series",value:"LEGO Star Wars"},{key:"Feature",value:"Iconic Ship with Mini Figures"}],["lego","star-wars","millennium-falcon"],{is_featured:true}),
p("lego","LEGO Harry Potter Hogwarts Castle 71043","Lego",34999,44999,10,[{key:"Pieces",value:"6020"},{key:"Age",value:"16+ Years"},{key:"Series",value:"LEGO Harry Potter"},{key:"Feature",value:"27 Mini Figures Included"}],["lego","harry-potter","hogwarts","castle"],{is_featured:true}),
p("lego","LEGO Architecture Taj Mahal 21056","Lego",12999,15999,25,[{key:"Pieces",value:"2022"},{key:"Age",value:"18+ Years"},{key:"Series",value:"LEGO Architecture"},{key:"Feature",value:"Indian Landmark"}],["lego","architecture","taj-mahal","india"]),
p("lego","LEGO Friends Heartlake City School 41682","Lego",3499,4499,80,[{key:"Pieces",value:"605"},{key:"Age",value:"6-12 Years"},{key:"Series",value:"LEGO Friends"},{key:"Feature",value:"School Playset with Characters"}],["lego","friends","school","girls"]),
p("lego","LEGO Minecraft The Nether Fortress 21122","Lego",5999,7999,40,[{key:"Pieces",value:"468"},{key:"Age",value:"8-14 Years"},{key:"Series",value:"LEGO Minecraft"},{key:"Feature",value:"Zombie Pigman + Wither Skeleton"}],["lego","minecraft","nether","gaming"]),
p("lego","LEGO Creator 3in1 Deep Sea Creatures 31088","Lego",1299,1799,100,[{key:"Pieces",value:"230"},{key:"Age",value:"7-12 Years"},{key:"Series",value:"LEGO Creator"},{key:"Feature",value:"3-in-1 Build: Shark/Squid/Angler"}],["lego","creator","3in1","sea"]),
p("lego","LEGO Classic Large Creative Brick Box 10698","Lego",5499,6999,60,[{key:"Pieces",value:"790"},{key:"Age",value:"4-99 Years"},{key:"Series",value:"LEGO Classic"},{key:"Feature",value:"Ideas Booklet Included"}],["lego","classic","creative","bricks"],{is_bestseller:true}),
p("lego","LEGO Duplo My First Number Train 10954","Lego",2499,3299,80,[{key:"Pieces",value:"23"},{key:"Age",value:"1.5-5 Years"},{key:"Series",value:"LEGO DUPLO"},{key:"Feature",value:"Count 1-10 Numbers"}],["lego","duplo","toddler","train"]),
p("lego","LEGO Speed Champions McLaren Senna 75892","Lego",2999,3999,50,[{key:"Pieces",value:"219"},{key:"Age",value:"7-14 Years"},{key:"Series",value:"Speed Champions"},{key:"Feature",value:"Accurate Scale Model"}],["lego","speed-champions","mclaren","car"]),
p("lego","LEGO Marvel Spider-Man Bridge Battle 76114","Lego",3999,5499,45,[{key:"Pieces",value:"284"},{key:"Age",value:"7-14 Years"},{key:"Series",value:"LEGO Marvel"},{key:"Feature",value:"Spider-Man + Vulture Figures"}],["lego","marvel","spider-man","superhero"]),
p("lego","LEGO Ideas NASA Apollo Saturn V 92176","Lego",14999,18999,20,[{key:"Pieces",value:"1969"},{key:"Age",value:"14+ Years"},{key:"Series",value:"LEGO Ideas"},{key:"Feature",value:"100cm Tall Display Model"}],["lego","nasa","apollo","adult"]),
p("lego","LEGO Disney Princess Cinderella's Castle 43222","Lego",8999,11999,30,[{key:"Pieces",value:"567"},{key:"Age",value:"6-12 Years"},{key:"Series",value:"LEGO Disney"},{key:"Feature",value:"5 Disney Princess Mini Dolls"}],["lego","disney","cinderella","princess"]),
p("lego","LEGO Jurassic World T. rex Breakout 76944","Lego",5999,7999,35,[{key:"Pieces",value:"576"},{key:"Age",value:"7-12 Years"},{key:"Series",value:"Jurassic World"},{key:"Feature",value:"T-Rex + Helicopter"}],["lego","jurassic","t-rex","dinosaur"]),
// ── ACTION FIGURES (16-30) ────────────────────────────────────────────────────
p("action","Hot Wheels 20 Car Gift Pack Assorted","Mattel",699,999,300,[{key:"Cars",value:"20 Die-Cast Cars"},{key:"Scale",value:"1:64"},{key:"Age",value:"3+ Years"},{key:"Material",value:"Die-Cast Metal"}],["hot-wheels","cars","mattel","die-cast"],{is_bestseller:true}),
p("action","Hot Wheels Ultimate Garage Playset","Mattel",5999,7999,40,[{key:"Type",value:"Mega Playset"},{key:"Age",value:"4+ Years"},{key:"Feature",value:"5 Floors + Shark Jump"},{key:"Includes",value:"1 Car + 1 Bike"}],["hot-wheels","garage","playset","cars"]),
p("action","Marvel Legends Iron Man 6-inch Action Figure","Hasbro",1999,2999,80,[{key:"Height",value:"6 inch"},{key:"Character",value:"Iron Man Mark L"},{key:"Feature",value:"15+ Articulation Points"},{key:"Accessories",value:"2 Blast Effects"}],["action-figure","marvel","iron-man","hasbro"]),
p("action","Marvel Legends Spider-Man 6-inch Figure","Hasbro",1999,2999,70,[{key:"Height",value:"6 inch"},{key:"Character",value:"Spider-Man Classic"},{key:"Feature",value:"Movie Accuracy"},{key:"Accessories",value:"Web Accessories"}],["action-figure","spider-man","marvel","6-inch"]),
p("action","DC Comics Batman 12-inch Action Figure","Mattel",1499,2199,90,[{key:"Height",value:"12 inch"},{key:"Character",value:"Batman"},{key:"Feature",value:"17+ Articulation Points"},{key:"Accessories",value:"Cape + Batarang"}],["action-figure","dc","batman","12-inch"]),
p("action","Masters of the Universe He-Man Figure","Mattel",1299,1899,60,[{key:"Height",value:"5.5 inch"},{key:"Character",value:"He-Man"},{key:"Feature",value:"Classic Retro Design"},{key:"Accessories",value:"Sword + Shield"}],["action-figure","he-man","mattel","retro"]),
p("action","WWE Elite John Cena Action Figure","Mattel",1999,2999,50,[{key:"Height",value:"6 inch"},{key:"Character",value:"John Cena"},{key:"Feature",value:"18 Articulation Points"},{key:"Accessories",value:"Wrestling Gear"}],["action-figure","wwe","john-cena","wrestling"]),
p("action","Transformers Bumblebee Converting Figure","Hasbro",2999,3999,40,[{key:"Height",value:"8 inch"},{key:"Feature",value:"Converts Car to Robot"},{key:"Steps",value:"15-Step Conversion"},{key:"Age",value:"6+ Years"}],["transformers","bumblebee","hasbro","converting"],{is_featured:true}),
p("action","Avengers Infinity Gauntlet Electronic Glove","Hasbro",2499,3499,60,[{key:"Type",value:"Electronic Role Play"},{key:"Feature",value:"4 Sounds + Light Fx"},{key:"Size",value:"Wearable Kids"},{key:"Age",value:"5+ Years"}],["avengers","thanos","gauntlet","electronic"]),
p("action","Disney Frozen Elsa 12-inch Doll with Accessories","Hasbro",999,1499,120,[{key:"Height",value:"12 inch"},{key:"Character",value:"Queen Elsa"},{key:"Feature",value:"Signature Blue Dress"},{key:"Accessories",value:"Tiara + Wand"}],["doll","frozen","elsa","disney"],{is_bestseller:true}),
p("action","Barbie Dreamhouse Adventure Doll","Mattel",1499,1999,100,[{key:"Height",value:"11.5 inch"},{key:"Type",value:"Fashion Doll"},{key:"Feature",value:"35+ Accessories"},{key:"Outfit",value:"Trendy Fashion"}],["doll","barbie","mattel","fashion"],{is_bestseller:true}),
p("action","Ben 10 Omnitrix Roleplay Toy","Playmates",1299,1899,80,[{key:"Type",value:"Electronic Role Play"},{key:"Feature",value:"Lights + Sounds"},{key:"Characters",value:"10 Alien Activations"},{key:"Age",value:"5+ Years"}],["ben-10","omnitrix","roleplay","electronic"]),
p("action","Chhota Bheem Action Figure 7-inch","Green Gold",599,899,150,[{key:"Height",value:"7 inch"},{key:"Character",value:"Chhota Bheem"},{key:"Material",value:"PVC"},{key:"Age",value:"3+ Years"}],["chhota-bheem","indian","action-figure","cartoon"]),
p("action","Doraemon 10-inch Soft Figure Plush","Bandai",799,1199,120,[{key:"Height",value:"10 inch"},{key:"Material",value:"Soft Plush"},{key:"Character",value:"Doraemon"},{key:"Washable",value:"Machine Washable"}],["doraemon","plush","soft-toy","japan"]),
p("action","Pokemon Pikachu 8-inch Plush Stuffed Toy","Pokemon Center",999,1499,100,[{key:"Height",value:"8 inch"},{key:"Material",value:"Soft Plush"},{key:"Character",value:"Pikachu"},{key:"Age",value:"3+ Years"}],["pokemon","pikachu","plush","soft-toy"]),

// ── BOARD GAMES & PUZZLES (31-50) ─────────────────────────────────────────────
p("board","Monopoly Classic Board Game","Hasbro",999,1499,150,[{key:"Players",value:"2-8"},{key:"Age",value:"8+ Years"},{key:"Duration",value:"1-3 Hours"},{key:"Language",value:"English"}],["board-game","monopoly","hasbro","family"],{is_bestseller:true}),
p("board","Scrabble Word Game Classic","Mattel",799,1199,120,[{key:"Players",value:"2-4"},{key:"Age",value:"8+ Years"},{key:"Tiles",value:"100 Letter Tiles"},{key:"Feature",value:"Deluxe Board"}],["board-game","scrabble","word","mattel"]),
p("board","Ludo Star Classic Board Game","Funskool",349,499,200,[{key:"Players",value:"2-4"},{key:"Age",value:"5+ Years"},{key:"Feature",value:"Classic Indian Game"},{key:"Include",value:"Board + Dice + Tokens"}],["ludo","board-game","funskool","classic"],{is_bestseller:true}),
p("board","Chess Set Wooden Standard Tournament","Wenge",999,1499,100,[{key:"Material",value:"Wood"},{key:"Board",value:"20x20 inch Folding"},{key:"Pieces",value:"32 Weighted Pieces"},{key:"Age",value:"7+ Years"}],["chess","board-game","wooden","tournament"]),
p("board","Carom Board Full Size 32-inch","A Plus",1999,2999,60,[{key:"Size",value:"32x32 inch"},{key:"Material",value:"Plywood + Laminate"},{key:"Feature",value:"Smooth Playing Surface"},{key:"Include",value:"Striker + Coins"}],["carrom","board","indian","full-size"],{is_bestseller:true}),
p("board","Jenga Classic Block Stacking Game","Hasbro",799,1199,150,[{key:"Blocks",value:"54 Hardwood Blocks"},{key:"Players",value:"1+"},{key:"Age",value:"6+ Years"},{key:"Feature",value:"Skill + Luck Game"}],["jenga","stacking","hasbro","party"]),
p("board","UNO Card Game Classic","Mattel",299,449,300,[{key:"Cards",value:"112 Cards"},{key:"Players",value:"2-10"},{key:"Age",value:"7+ Years"},{key:"Feature",value:"Colour + Number Matching"}],["uno","card-game","mattel","family"],{is_bestseller:true}),
p("board","Snakes & Ladders Jumbo Floor Game","Frank",599,899,120,[{key:"Size",value:"120x120 cm"},{key:"Players",value:"2-6"},{key:"Age",value:"3+ Years"},{key:"Material",value:"Vinyl Mat"}],["snakes-ladders","floor-game","jumbo","kids"]),
p("board","Risk Strategy Board Game","Hasbro",1999,2999,50,[{key:"Players",value:"2-6"},{key:"Age",value:"10+ Years"},{key:"Feature",value:"World Domination Strategy"},{key:"Duration",value:"1-8 Hours"}],["risk","strategy","hasbro","world"]),
p("board","Cluedo Mystery Board Game","Hasbro",1199,1799,60,[{key:"Players",value:"2-6"},{key:"Age",value:"8+ Years"},{key:"Feature",value:"Solve the Murder Mystery"},{key:"Duration",value:"45-90 Minutes"}],["cluedo","mystery","hasbro","detective"]),
p("puzzle","Ravensburger 1000pc Disney Puzzle","Ravensburger",1499,1999,80,[{key:"Pieces",value:"1000"},{key:"Size",value:"70x50 cm"},{key:"Age",value:"12+ Years"},{key:"Theme",value:"Disney Classics"}],["puzzle","ravensburger","disney","1000pc"],{is_featured:true}),
p("puzzle","Funskool 500pc India Map Puzzle","Funskool",599,899,100,[{key:"Pieces",value:"500"},{key:"Theme",value:"India Political Map"},{key:"Size",value:"50x70 cm"},{key:"Age",value:"8+ Years"}],["puzzle","india-map","funskool","educational"]),
p("puzzle","Frank 3D Foam Floor Puzzle 48pcs","Frank",799,1199,150,[{key:"Pieces",value:"48 Foam Pieces"},{key:"Size",value:"120x120 cm"},{key:"Age",value:"3+ Years"},{key:"Feature",value:"Interlocking Foam"}],["puzzle","foam","floor","3d"]),
p("board","Taboo Party Game","Hasbro",1499,1999,60,[{key:"Players",value:"4-10"},{key:"Age",value:"13+ Years"},{key:"Cards",value:"260+ Taboo Cards"},{key:"Duration",value:"30-60 Min"}],["taboo","party-game","hasbro","adults"]),
p("board","Pictionary Air Drawing Game","Mattel",1299,1899,50,[{key:"Players",value:"2-6"},{key:"Age",value:"8+ Years"},{key:"Feature",value:"Draw in the Air with Smart Pen"},{key:"App",value:"Free App Required"}],["pictionary","drawing","mattel","party"]),
p("puzzle","Skillofun Wooden Puzzle Dinosaurs 7pcs","Skillofun",499,799,150,[{key:"Pieces",value:"7 Wooden Pieces"},{key:"Age",value:"2-5 Years"},{key:"Material",value:"Non-Toxic Wood"},{key:"Theme",value:"Dinosaurs"}],["puzzle","wooden","dinosaurs","toddler"]),
p("board","Exploding Kittens Card Game","Exploding Kittens",1299,1799,80,[{key:"Players",value:"2-5"},{key:"Cards",value:"56 Cards"},{key:"Age",value:"7+ Years"},{key:"Feature",value:"Highly Strategic Kitty Card Game"}],["card-game","exploding-kittens","strategy","funny"]),
p("board","Codenames Party Card Game","Czech Games",1499,2199,60,[{key:"Players",value:"2-8"},{key:"Age",value:"14+ Years"},{key:"Feature",value:"Word Spy Guessing Game"},{key:"Duration",value:"15-30 Min"}],["codenames","party","word-game","adults"]),
p("board","Ticket to Ride Board Game","Days of Wonder",3999,5499,30,[{key:"Players",value:"2-5"},{key:"Age",value:"8+ Years"},{key:"Feature",value:"Train Adventure Board Game"},{key:"Duration",value:"45-75 Min"}],["ticket-to-ride","trains","strategy","award-winning"],{is_featured:true}),
p("puzzle","Melissa & Doug 100pc Floor Puzzle Safari","Melissa & Doug",1299,1899,70,[{key:"Pieces",value:"100"},{key:"Size",value:"91x61 cm"},{key:"Age",value:"3-8 Years"},{key:"Theme",value:"Safari Animals"}],["puzzle","floor","melissa-doug","safari"]),
// ── SOFT TOYS (51-65) ─────────────────────────────────────────────────────────
p("soft","Hamleys Giant Teddy Bear 3 feet","Hamleys",2999,4499,60,[{key:"Height",value:"3 feet / 90 cm"},{key:"Material",value:"Soft Plush"},{key:"Fill",value:"PP Cotton"},{key:"Age",value:"1+ Years"}],["teddy-bear","hamleys","giant","soft-toy"],{is_bestseller:true}),
p("soft","Tickles Brown Panda Stuffed Toy 50cm","Tickles",699,1199,120,[{key:"Height",value:"50 cm"},{key:"Material",value:"Plush Fabric"},{key:"Fill",value:"PP Fiber"},{key:"Washable",value:"Machine Washable"}],["stuffed-toy","panda","tickles","soft"]),
p("soft","Webkinz Husky Puppy 9-inch Plush","Ganz",899,1299,80,[{key:"Height",value:"9 inch"},{key:"Material",value:"Soft Plush"},{key:"Feature",value:"Online Game Code Included"},{key:"Age",value:"3+ Years"}],["plush","webkinz","puppy","online"]),
p("soft","Squishmallow Kellytoy 16-inch Cat","Squishmallow",1499,1999,70,[{key:"Size",value:"16 inch"},{key:"Material",value:"Ultra-Soft Marshmallow Fill"},{key:"Character",value:"Cat"},{key:"Feature",value:"Super Squishy"}],["squishmallow","cat","soft","marshmallow"]),
p("soft","GUND Pusheen Plush Cat 9-inch","GUND",1299,1799,60,[{key:"Size",value:"9 inch"},{key:"Material",value:"Super-Soft Plush"},{key:"Character",value:"Pusheen Cat"},{key:"Washable",value:"Surface Wash"}],["plush","pusheen","gund","cat"]),
p("soft","Wild Republic Alligator Soft Toy 76cm","Wild Republic",1799,2499,50,[{key:"Length",value:"76 cm"},{key:"Material",value:"Plush"},{key:"Feature",value:"Lifelike Design"},{key:"Age",value:"3+ Years"}],["stuffed-toy","alligator","wild-republic","realistic"]),
p("soft","Jellycat Bashful Bunny 12-inch Pink","Jellycat",2499,3299,40,[{key:"Size",value:"12 inch"},{key:"Material",value:"Ultra-Soft Plush"},{key:"Character",value:"Bunny"},{key:"Feature",value:"Award-Winning Design"}],["jellycat","bunny","premium","soft"],{is_featured:true}),
p("soft","Simba Tom & Jerry Plush Pair Set","Simba",999,1499,100,[{key:"Set",value:"Tom + Jerry Pair"},{key:"Size",value:"25 cm each"},{key:"Material",value:"Soft Plush"},{key:"Age",value:"3+ Years"}],["tom-jerry","plush","set","cartoon"]),
p("soft","Hamleys Elephant Soft Toy 40cm","Hamleys",1299,1899,80,[{key:"Height",value:"40 cm"},{key:"Material",value:"Plush Fabric"},{key:"Feature",value:"Lifelike Eyes"},{key:"Age",value:"1+ Years"}],["elephant","soft-toy","hamleys","animal"]),
p("soft","Funskool Giggles Tummy Time Mat Toy","Funskool",799,1199,90,[{key:"Type",value:"Tummy Time Mat"},{key:"Age",value:"0-12 Months"},{key:"Feature",value:"Crinkle + Rattle + Mirror"},{key:"Material",value:"Safe Fabric"}],["tummy-time","baby","funskool","activity"]),
p("soft","Melissa & Doug Giant Stuffed Giraffe 82cm","Melissa & Doug",3499,4999,30,[{key:"Height",value:"82 cm"},{key:"Material",value:"Plush + PVC Feet"},{key:"Feature",value:"Lifelike Spots"},{key:"Age",value:"3+ Years"}],["giraffe","melissa-doug","giant","stuffed"],{is_featured:true}),
p("soft","Cute Lion Cartoon Soft Plush 30cm","Generic",399,699,200,[{key:"Height",value:"30 cm"},{key:"Material",value:"Plush"},{key:"Fill",value:"PP Cotton"},{key:"Age",value:"1+ Years"}],["lion","plush","soft-toy","cartoon"]),
p("soft","Minnie Mouse 18-inch Soft Plush Disney","Disney",1299,1799,90,[{key:"Height",value:"18 inch"},{key:"Character",value:"Minnie Mouse"},{key:"Material",value:"Soft Plush"},{key:"Age",value:"2+ Years"}],["minnie-mouse","disney","plush","18-inch"]),
p("soft","Simba Smurfs Papa Smurf Plush 35cm","Simba",699,999,110,[{key:"Height",value:"35 cm"},{key:"Character",value:"Papa Smurf"},{key:"Material",value:"Plush"},{key:"Age",value:"3+ Years"}],["smurfs","papa-smurf","plush","35cm"]),
p("soft","Steiff Classic Teddy Bear 25cm Light Brown","Steiff",4999,6999,15,[{key:"Height",value:"25 cm"},{key:"Material",value:"Premium Mohair"},{key:"Feature",value:"Button in Ear Signature"},{key:"Age",value:"0+ Years"}],["teddy","steiff","premium","collectible"],{is_featured:true}),
// ── RC TOYS & BABY TOYS (66-100) ──────────────────────────────────────────────
p("rc","Syma X5C RC Quadcopter Drone for Beginners","Syma",2999,4499,80,[{key:"Camera",value:"0.3 MP HD"},{key:"Range",value:"50 metres"},{key:"Battery",value:"500mAh 7 Min"},{key:"Age",value:"14+ Years"}],["drone","rc","syma","quadcopter"],{is_bestseller:true}),
p("rc","DJI Tello Mini Drone 720P Camera","Ryze",9999,12999,30,[{key:"Camera",value:"720P HD"},{key:"Flight Time",value:"13 Min"},{key:"Range",value:"100m"},{key:"Feature",value:"EZ Shots Mode"}],["drone","dji","tello","720p"],{is_featured:true}),
p("rc","Webby 1:12 RC Ferrari Sports Car","Webby",1999,2999,100,[{key:"Scale",value:"1:12"},{key:"Speed",value:"25 km/h"},{key:"Battery",value:"9.6V NiCd Rechargeable"},{key:"Range",value:"30 metres"}],["rc-car","ferrari","webby","1:12"]),
p("rc","Zephyr Stunt RC Car 360° Rotation","Zephyr",1499,2199,120,[{key:"Feature",value:"360° Stunt Rotation"},{key:"Speed",value:"20 km/h"},{key:"Battery",value:"Rechargeable"},{key:"Age",value:"6+ Years"}],["rc-car","stunt","360","kids"]),
p("rc","Dickie RC Police Car with Siren Lights","Dickie",1299,1899,100,[{key:"Scale",value:"1:16"},{key:"Feature",value:"Siren + LED Lights"},{key:"Speed",value:"10 km/h"},{key:"Battery",value:"6V Battery"}],["rc-car","police","dickie","siren"]),
p("rc","Saffire RC Mini Monster Truck Truck 4WD","Saffire",2499,3499,70,[{key:"Drive",value:"4WD"},{key:"Feature",value:"Off-Road Suspension"},{key:"Speed",value:"25 km/h"},{key:"Scale",value:"1:10"}],["rc-car","monster-truck","4wd","off-road"]),
p("rc","Silverlit Spy Cam RC Plane 2.4GHz","Silverlit",3999,5499,40,[{key:"Type",value:"RC Aeroplane"},{key:"Camera",value:"Built-in Spy Cam"},{key:"Range",value:"60 metres"},{key:"Battery",value:"USB Rechargeable"}],["rc-plane","silverlit","camera","spy"]),
p("rc","Propel Star Wars Speeder Bike RC","Propel",4999,6999,25,[{key:"Type",value:"RC Speeder Bike"},{key:"Feature",value:"LED Light Effects"},{key:"Speed",value:"35 km/h"},{key:"License",value:"Official Star Wars"}],["rc","star-wars","speeder","led"],{is_featured:true}),
p("rc","Maisto Lamborghini RC Car 1:24","Maisto",1499,2199,90,[{key:"Scale",value:"1:24"},{key:"Model",value:"Lamborghini Huracán"},{key:"Battery",value:"Rechargeable"},{key:"Age",value:"5+ Years"}],["rc-car","lamborghini","maisto","1:24"]),
p("baby","Fisher-Price Kick and Play Piano Gym Mat","Fisher-Price",2499,3499,80,[{key:"Age",value:"0-18 Months"},{key:"Feature",value:"5 Piano Keys + Melodies"},{key:"Use",value:"Tummy + Back Play"},{key:"Material",value:"Safe Fabric + Plastic"}],["baby","piano-mat","fisher-price","activity"],{is_bestseller:true}),
p("baby","Funskool Giggles Stacker Rings Toy","Funskool",499,799,200,[{key:"Pieces",value:"5 Rings + Base"},{key:"Age",value:"6-36 Months"},{key:"Material",value:"BPA-Free Plastic"},{key:"Feature",value:"Colour Learning"}],["baby","stacker","rings","funskool"]),
p("baby","Infantino Go GaGa Jumbo Activity Gym","Infantino",3499,4999,50,[{key:"Age",value:"0-12 Months"},{key:"Features",value:"20+ Activities"},{key:"Material",value:"Safe Fabric"},{key:"Feature",value:"Tummy Time + Arch Play"}],["baby","activity-gym","infantino","newborn"]),
p("baby","Mee Mee Baby Walker With Toys","Mee Mee",2999,4499,60,[{key:"Age",value:"6-18 Months"},{key:"Feature",value:"Adjustable Height 3 Levels"},{key:"Activity",value:"Front Tray Toys"},{key:"Weight Capacity",value:"15 kg"}],["baby","walker","mee-mee","activity"]),
p("baby","Chicco Baby Senses First Activities Cube","Chicco",1299,1899,70,[{key:"Age",value:"6+ Months"},{key:"Activities",value:"5 Faces of Play"},{key:"Material",value:"BPA-Free"},{key:"Feature",value:"Shape Sorter + Mirror"}],["baby","activity-cube","chicco","sensory"]),
p("baby","NHR Musical Rattle Set for Infants 5pcs","NHR",499,799,200,[{key:"Set",value:"5 Rattles"},{key:"Age",value:"0-12 Months"},{key:"Material",value:"BPA-Free Plastic"},{key:"Feature",value:"Teether + Rattle + Sounds"}],["baby","rattle","newborn","teether"],{is_bestseller:true}),
p("baby","Pigeon Baby Teether Silicone Set 3pcs","Pigeon",599,899,150,[{key:"Material",value:"Food-Grade Silicone"},{key:"Set",value:"3 Teethers"},{key:"Age",value:"3-12 Months"},{key:"Feature",value:"Soothing + Chewable"}],["baby","teether","pigeon","silicone"]),
p("baby","Munchkin White Hot Safety Bath Spout Cover","Munchkin",599,899,120,[{key:"Type",value:"Spout Cover"},{key:"Feature",value:"Turns White When Water Too Hot"},{key:"Material",value:"Soft"},{key:"Age",value:"6-36 Months"}],["baby","bath","safety","munchkin"]),
p("baby","VTech Sit-to-Stand Learning Walker Toy","VTech",3999,5499,40,[{key:"Age",value:"9-36 Months"},{key:"Feature",value:"5 Piano Keys + Activities"},{key:"Mode",value:"Walker + Tabletop"},{key:"Language",value:"English"}],["baby","walker","vtech","learning"]),
p("baby","Skip Hop Baby Activity Gym Farmstand","Skip Hop",4999,6999,25,[{key:"Age",value:"0-12 Months"},{key:"Activities",value:"25+ Activities"},{key:"Feature",value:"Light + Sound Toy"},{key:"Material",value:"Non-toxic Fabrics"}],["baby","activity-gym","skip-hop","premium"],{is_featured:true}),
p("rc","CADA Technic Bulldozer Building Block 2573pcs","CADA",8999,12999,20,[{key:"Pieces",value:"2573"},{key:"Feature",value:"Remote Controlled Motors"},{key:"Age",value:"14+ Years"},{key:"Compatible",value:"Technic Bricks"}],["building-blocks","technic","rc","advanced"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "toys-baby" || c.slug === "toys")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing toys products`);
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
  console.log(`\n✅ Done! ${inserted} Toys products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
