/**
 * seedBooks.js — 100 Books
 * Run: node server/seeders/seedBooks.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");
const Category = require("../models/Category");
const Brand    = require("../models/Brand");

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IMGS = {
  book: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80","https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80","https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80"],
  novel:["https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&q=80","https://images.unsplash.com/photo-1430990480609-2bf7c02a6b1a?w=600&q=80","https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80","https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80"],
  child:["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80","https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80","https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80","https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80"],
};

const p = (type, name, brand, price, mrp, stock, specs, tags, extra = {}) => ({
  name, slug: toSlug(name),
  short_description: specs.slice(0,2).map(s=>`${s.key}: ${s.value}`).join(", "),
  description: `${name}. ${specs.map(s=>`${s.key}: ${s.value}`).join(" | ")}`,
  price, mrp, discount_percent: Math.round(((mrp-price)/mrp)*100),
  sku: toSlug(name).slice(0,18).toUpperCase().replace(/-/g,"")+"-"+Math.floor(Math.random()*9000+1000),
  stock, low_stock_threshold: Math.max(5, Math.floor(stock*0.1)),
  thumbnail: IMGS[type][0], images: IMGS[type], tags, specifications: specs,
  weight: 300, rating_avg: parseFloat((3.8+Math.random()*1.2).toFixed(1)),
  rating_count: Math.floor(50+Math.random()*800), total_sold: Math.floor(100+Math.random()*2000),
  status: true, _brandName: brand, ...extra,
});

const PRODUCTS = [
// ── FICTION & NOVELS (1-20) ───────────────────────────────────────────────────
p("novel","The Alchemist by Paulo Coelho","HarperCollins",299,350,300,[{key:"Author",value:"Paulo Coelho"},{key:"Pages",value:"208"},{key:"Language",value:"English"},{key:"Genre",value:"Fiction/Inspirational"}],["fiction","novel","coelho","inspirational"],{is_bestseller:true,is_featured:true}),
p("novel","Atomic Habits by James Clear","Penguin",499,599,250,[{key:"Author",value:"James Clear"},{key:"Pages",value:"320"},{key:"Language",value:"English"},{key:"Genre",value:"Self-Help"}],["self-help","atomic-habits","habits","non-fiction"],{is_bestseller:true}),
p("novel","The Psychology of Money by Morgan Housel","Jaico",399,499,220,[{key:"Author",value:"Morgan Housel"},{key:"Pages",value:"256"},{key:"Language",value:"English"},{key:"Genre",value:"Finance/Self-Help"}],["finance","money","self-help","non-fiction"],{is_featured:true}),
p("novel","Rich Dad Poor Dad by Robert Kiyosaki","Manjul",299,399,300,[{key:"Author",value:"Robert Kiyosaki"},{key:"Pages",value:"336"},{key:"Language",value:"English"},{key:"Genre",value:"Personal Finance"}],["finance","rich-dad","money","bestseller"],{is_bestseller:true}),
p("novel","Harry Potter and the Sorcerer's Stone","Bloomsbury",499,599,200,[{key:"Author",value:"J.K. Rowling"},{key:"Pages",value:"309"},{key:"Language",value:"English"},{key:"Series",value:"Book 1 of 7"}],["fiction","harry-potter","fantasy","rowling"],{is_featured:true}),
p("novel","Harry Potter and the Chamber of Secrets","Bloomsbury",499,599,180,[{key:"Author",value:"J.K. Rowling"},{key:"Pages",value:"341"},{key:"Language",value:"English"},{key:"Series",value:"Book 2 of 7"}],["fiction","harry-potter","fantasy"]),
p("novel","The Lord of the Rings by J.R.R. Tolkien","HarperCollins",699,899,120,[{key:"Author",value:"J.R.R. Tolkien"},{key:"Pages",value:"1178"},{key:"Language",value:"English"},{key:"Format",value:"3-in-1 Volume"}],["fantasy","tolkien","lotr","classic"]),
p("novel","1984 by George Orwell","Penguin",249,299,250,[{key:"Author",value:"George Orwell"},{key:"Pages",value:"328"},{key:"Language",value:"English"},{key:"Genre",value:"Dystopian Fiction"}],["classic","orwell","dystopia","political"]),
p("novel","To Kill a Mockingbird by Harper Lee","Arrow",299,399,200,[{key:"Author",value:"Harper Lee"},{key:"Pages",value:"324"},{key:"Language",value:"English"},{key:"Genre",value:"Classic Fiction"}],["classic","fiction","harper-lee","pulitzer"]),
p("novel","The Great Gatsby by F. Scott Fitzgerald","Fingerprint",199,249,300,[{key:"Author",value:"F. Scott Fitzgerald"},{key:"Pages",value:"180"},{key:"Language",value:"English"},{key:"Genre",value:"Classic Fiction"}],["classic","gatsby","fiction","american"]),
p("novel","Sapiens: A Brief History of Humankind","Vintage",599,799,180,[{key:"Author",value:"Yuval Noah Harari"},{key:"Pages",value:"464"},{key:"Language",value:"English"},{key:"Genre",value:"Non-Fiction History"}],["non-fiction","sapiens","history","harari"],{is_featured:true}),
p("novel","Think and Grow Rich by Napoleon Hill","Fingerprint",199,299,350,[{key:"Author",value:"Napoleon Hill"},{key:"Pages",value:"272"},{key:"Language",value:"English"},{key:"Genre",value:"Self-Help"}],["self-help","napoleon-hill","motivation","wealth"]),
p("novel","The 5 AM Club by Robin Sharma","HarperCollins",349,499,250,[{key:"Author",value:"Robin Sharma"},{key:"Pages",value:"320"},{key:"Language",value:"English"},{key:"Genre",value:"Self-Help"}],["self-help","robin-sharma","morning","discipline"]),
p("novel","Ikigai: The Japanese Secret to a Long and Happy Life","HarperCollins",299,399,300,[{key:"Author",value:"Hector Garcia"},{key:"Pages",value:"208"},{key:"Language",value:"English"},{key:"Origin",value:"Japanese Wisdom"}],["ikigai","self-help","happiness","japanese"],{is_bestseller:true}),
p("novel","The Power of Your Subconscious Mind","Fingerprint",149,249,400,[{key:"Author",value:"Joseph Murphy"},{key:"Pages",value:"304"},{key:"Language",value:"English"},{key:"Genre",value:"Self-Help/Spirituality"}],["self-help","subconscious","mind","classic"]),
p("novel","Wings of Fire by A.P.J. Abdul Kalam","Universities Press",149,199,500,[{key:"Author",value:"A.P.J. Abdul Kalam"},{key:"Pages",value:"180"},{key:"Language",value:"English"},{key:"Genre",value:"Autobiography"}],["autobiography","kalam","indian","inspiration"],{is_bestseller:true}),
p("novel","The Diary of a Young Girl by Anne Frank","Penguin",249,349,300,[{key:"Author",value:"Anne Frank"},{key:"Pages",value:"352"},{key:"Language",value:"English"},{key:"Genre",value:"Autobiography/Historical"}],["autobiography","anne-frank","wwii","classic"]),
p("novel","Zero to One by Peter Thiel","Virgin Books",449,599,150,[{key:"Author",value:"Peter Thiel"},{key:"Pages",value:"224"},{key:"Language",value:"English"},{key:"Genre",value:"Business/Startups"}],["business","startup","peter-thiel","entrepreneurship"]),
p("novel","Rework by Jason Fried","Crown Business",399,499,130,[{key:"Author",value:"Jason Fried"},{key:"Pages",value:"288"},{key:"Language",value:"English"},{key:"Genre",value:"Business"}],["business","startup","37signals","work"]),
p("novel","Deep Work by Cal Newport","Piatkus",399,499,150,[{key:"Author",value:"Cal Newport"},{key:"Pages",value:"304"},{key:"Language",value:"English"},{key:"Genre",value:"Productivity"}],["productivity","deep-work","newport","focus"]),
// ── INDIAN AUTHORS (21-35) ────────────────────────────────────────────────────
p("novel","The White Tiger by Aravind Adiga","HarperCollins",299,399,200,[{key:"Author",value:"Aravind Adiga"},{key:"Pages",value:"321"},{key:"Language",value:"English"},{key:"Award",value:"Man Booker Prize 2008"}],["indian","fiction","booker","adiga"]),
p("novel","2 States by Chetan Bhagat","Rupa",199,249,400,[{key:"Author",value:"Chetan Bhagat"},{key:"Pages",value:"261"},{key:"Language",value:"English"},{key:"Genre",value:"Contemporary Romance"}],["indian","chetan-bhagat","romance","movie"],{is_bestseller:true}),
p("novel","Five Point Someone by Chetan Bhagat","Rupa",175,225,350,[{key:"Author",value:"Chetan Bhagat"},{key:"Pages",value:"243"},{key:"Language",value:"English"},{key:"Genre",value:"Campus Fiction"}],["indian","chetan-bhagat","iit","campus"]),
p("novel","The God of Small Things by Arundhati Roy","Penguin",299,399,200,[{key:"Author",value:"Arundhati Roy"},{key:"Pages",value:"340"},{key:"Award",value:"Booker Prize 1997"},{key:"Language",value:"English"}],["indian","booker","arundhati-roy","literary"]),
p("novel","Train to Pakistan by Khushwant Singh","Penguin",199,299,250,[{key:"Author",value:"Khushwant Singh"},{key:"Pages",value:"212"},{key:"Language",value:"English"},{key:"Genre",value:"Historical Fiction"}],["indian","partition","khushwant","historical"]),
p("novel","Gitanjali by Rabindranath Tagore","Fingerprint",149,199,300,[{key:"Author",value:"Rabindranath Tagore"},{key:"Pages",value:"128"},{key:"Language",value:"English"},{key:"Award",value:"Nobel Prize 1913"}],["indian","tagore","poetry","nobel"],{is_featured:true}),
p("book","India After Gandhi by Ramachandra Guha","Picador",799,999,100,[{key:"Author",value:"Ramachandra Guha"},{key:"Pages",value:"900"},{key:"Language",value:"English"},{key:"Genre",value:"History/Non-Fiction"}],["indian","history","guha","independence"]),
p("novel","The Namesake by Jhumpa Lahiri","HarperCollins",299,399,150,[{key:"Author",value:"Jhumpa Lahiri"},{key:"Pages",value:"291"},{key:"Language",value:"English"},{key:"Award",value:"Pulitzer Prize winning author"}],["indian","diaspora","lahiri","literary"]),
p("novel","Midnight's Children by Salman Rushdie","Vintage",399,499,120,[{key:"Author",value:"Salman Rushdie"},{key:"Pages",value:"647"},{key:"Award",value:"Booker of Bookers"},{key:"Language",value:"English"}],["indian","rushdie","magical-realism","booker"]),
p("novel","Discovery of India by Jawaharlal Nehru","Penguin",399,499,150,[{key:"Author",value:"Jawaharlal Nehru"},{key:"Pages",value:"572"},{key:"Language",value:"English"},{key:"Genre",value:"History/Politics"}],["indian","nehru","history","independence"]),
p("novel","Ramayana by Valmiki (Modern Translation)","Penguin",499,649,200,[{key:"Author",value:"Valmiki (tr. Arshia Sattar)"},{key:"Pages",value:"688"},{key:"Language",value:"English"},{key:"Genre",value:"Mythology/Epic"}],["mythology","ramayana","valmiki","epic"]),
p("novel","Mahabharata Retold by C. Rajagopalachari","Bharatiya Vidya Bhavan",299,399,250,[{key:"Author",value:"C. Rajagopalachari"},{key:"Pages",value:"434"},{key:"Language",value:"English"},{key:"Genre",value:"Mythology"}],["mythology","mahabharata","rajaji","classic"],{is_bestseller:true}),
p("novel","Sita: Warrior of Mithila by Amish Tripathi","Westland",349,449,200,[{key:"Author",value:"Amish Tripathi"},{key:"Pages",value:"389"},{key:"Language",value:"English"},{key:"Series",value:"Ram Chandra Series Book 2"}],["mythology","amish","sita","ram-chandra"]),
p("novel","Shiva Trilogy: The Immortals of Meluha","Westland",349,449,300,[{key:"Author",value:"Amish Tripathi"},{key:"Pages",value:"412"},{key:"Language",value:"English"},{key:"Series",value:"Shiva Trilogy Book 1"}],["mythology","amish","shiva","meluha"],{is_bestseller:true}),
p("novel","The Krishna Key by Ashwin Sanghi","Westland",299,399,200,[{key:"Author",value:"Ashwin Sanghi"},{key:"Pages",value:"464"},{key:"Language",value:"English"},{key:"Genre",value:"Thriller/Mythology"}],["thriller","sanghi","krishna","mystery"]),
// ── TEXTBOOKS & ACADEMIC (36-55) ──────────────────────────────────────────────
p("book","Physics NCERT Class 12 Part 1 & 2","NCERT",249,249,500,[{key:"Subject",value:"Physics"},{key:"Class",value:"12"},{key:"Publisher",value:"NCERT"},{key:"Language",value:"English"}],["ncert","physics","class-12","cbse"],{is_bestseller:true}),
p("book","Chemistry NCERT Class 12 Part 1 & 2","NCERT",249,249,500,[{key:"Subject",value:"Chemistry"},{key:"Class",value:"12"},{key:"Publisher",value:"NCERT"},{key:"Language",value:"English"}],["ncert","chemistry","class-12","cbse"]),
p("book","Mathematics NCERT Class 10","NCERT",129,129,600,[{key:"Subject",value:"Mathematics"},{key:"Class",value:"10"},{key:"Publisher",value:"NCERT"},{key:"Language",value:"English"}],["ncert","maths","class-10","cbse"],{is_bestseller:true}),
p("book","Objective NCERT at Your Fingertips Physics","MTG",449,599,300,[{key:"Subject",value:"Physics"},{key:"Publisher",value:"MTG Learning Media"},{key:"Feature",value:"NEET/JEE Prep"},{key:"Language",value:"English"}],["physics","mtg","neet","jee"]),
p("book","DC Pandey Waves and Thermodynamics","Arihant",399,549,250,[{key:"Subject",value:"Physics"},{key:"Author",value:"DC Pandey"},{key:"Publisher",value:"Arihant"},{key:"Exam",value:"JEE Main + Advanced"}],["physics","dc-pandey","jee","arihant"]),
p("book","RD Sharma Mathematics Class 11","Dhanpat Rai",699,899,200,[{key:"Subject",value:"Mathematics"},{key:"Class",value:"11"},{key:"Publisher",value:"Dhanpat Rai"},{key:"Feature",value:"Solved Examples + Exercises"}],["maths","rd-sharma","class-11","cbse"]),
p("book","HC Verma Concepts of Physics Vol 1","Bharati Bhawan",399,499,300,[{key:"Subject",value:"Physics"},{key:"Author",value:"H.C. Verma"},{key:"Volume",value:"Part 1"},{key:"Exam",value:"JEE/NEET Prep"}],["physics","hc-verma","jee","classic"],{is_bestseller:true}),
p("book","Organic Chemistry by MS Chauhan","Balaji Publications",499,649,200,[{key:"Subject",value:"Organic Chemistry"},{key:"Author",value:"M.S. Chauhan"},{key:"Exam",value:"JEE Advanced"},{key:"Publisher",value:"Balaji"}],["chemistry","ms-chauhan","jee","organic"]),
p("book","Quantitative Aptitude by RS Aggarwal","S. Chand",499,649,400,[{key:"Subject",value:"Quantitative Aptitude"},{key:"Author",value:"R.S. Aggarwal"},{key:"Use",value:"SSC/Bank/Railway Exams"},{key:"Chapters",value:"40+ Chapters"}],["aptitude","rs-aggarwal","ssc","bank"],{is_bestseller:true}),
p("book","English Grammar & Composition by Wren & Martin","S. Chand",349,449,400,[{key:"Subject",value:"English Grammar"},{key:"Author",value:"Wren & Martin"},{key:"Feature",value:"High School Grammar"},{key:"Language",value:"English"}],["english","grammar","wren-martin","school"],{is_bestseller:true}),
p("book","UPSC Civil Services Examination GS Manual","Tata McGraw Hill",999,1299,100,[{key:"Subject",value:"General Studies"},{key:"Exam",value:"UPSC CSE"},{key:"Publisher",value:"TMH"},{key:"Edition",value:"Latest Edition"}],["upsc","gs","civil-services","prelims"]),
p("book","Indian Polity by M. Laxmikanth","McGraw Hill",699,899,200,[{key:"Author",value:"M. Laxmikanth"},{key:"Subject",value:"Indian Polity"},{key:"Exam",value:"UPSC/State PCS"},{key:"Feature",value:"Latest Constitution Amendments"}],["polity","laxmikanth","upsc","constitution"],{is_bestseller:true}),
p("book","Ancient India by Ram Sharan Sharma","NCERT",149,199,300,[{key:"Author",value:"Ram Sharan Sharma"},{key:"Subject",value:"Ancient Indian History"},{key:"Publisher",value:"NCERT"},{key:"Exam",value:"UPSC"}],["history","ancient-india","ncert","upsc"]),
p("book","Introduction to Python Programming","Pearson",699,899,150,[{key:"Author",value:"Kenneth Lambert"},{key:"Subject",value:"Python Programming"},{key:"Publisher",value:"Pearson"},{key:"Level",value:"Beginner to Intermediate"}],["programming","python","beginners","computer"]),
p("book","Data Structures & Algorithms Made Easy by Karumanchi","CareerMonk",599,799,150,[{key:"Author",value:"Narasimha Karumanchi"},{key:"Subject",value:"DSA"},{key:"Feature",value:"500+ Interview Questions"},{key:"Language",value:"Java/Python/C++"}],["dsa","algorithms","interview","programming"]),
p("book","Operating System Concepts - Silberschatz","Wiley",1299,1699,80,[{key:"Author",value:"Silberschatz"},{key:"Edition",value:"10th Edition"},{key:"Subject",value:"Operating Systems"},{key:"Use",value:"Engineering Degree"}],["os","computer-science","engineering","textbook"]),
p("book","Computer Networks by Tanenbaum","Pearson",999,1299,80,[{key:"Author",value:"Andrew Tanenbaum"},{key:"Subject",value:"Computer Networks"},{key:"Edition",value:"5th Edition"},{key:"Level",value:"Engineering"}],["networking","tanenbaum","computer-science","engineering"]),
p("book","Database Management Systems by Ramakrishnan","McGraw Hill",799,1099,80,[{key:"Subject",value:"DBMS"},{key:"Author",value:"Ramakrishnan & Gehrke"},{key:"Edition",value:"3rd Edition"},{key:"Level",value:"Engineering"}],["dbms","database","engineering","sql"]),
p("book","Fundamentals of Electrical Engineering","Pearson",699,899,100,[{key:"Subject",value:"Electrical Engineering"},{key:"Author",value:"Giorgio Rizzoni"},{key:"Level",value:"Engineering"},{key:"Publisher",value:"Pearson"}],["electrical","engineering","fundamentals","circuits"]),
p("book","Business Studies Class 12 NCERT","NCERT",129,129,500,[{key:"Subject",value:"Business Studies"},{key:"Class",value:"12"},{key:"Publisher",value:"NCERT"},{key:"Language",value:"English"}],["ncert","business","class-12","cbse"]),

// ── CHILDREN'S BOOKS (56-70) ──────────────────────────────────────────────────
p("child","The Jungle Book by Rudyard Kipling","Penguin",199,249,300,[{key:"Author",value:"Rudyard Kipling"},{key:"Pages",value:"230"},{key:"Age",value:"8-12 Years"},{key:"Genre",value:"Adventure/Classic"}],["children","jungle-book","kipling","classic"],{is_bestseller:true}),
p("child","Charlie and the Chocolate Factory","Puffin",249,299,250,[{key:"Author",value:"Roald Dahl"},{key:"Pages",value:"176"},{key:"Age",value:"7-12 Years"},{key:"Genre",value:"Fantasy/Adventure"}],["children","roald-dahl","chocolate","fantasy"]),
p("child","Matilda by Roald Dahl","Puffin",249,299,250,[{key:"Author",value:"Roald Dahl"},{key:"Pages",value:"232"},{key:"Age",value:"7-12 Years"},{key:"Genre",value:"Fantasy"}],["children","roald-dahl","matilda","school"]),
p("child","The BFG by Roald Dahl","Puffin",249,299,200,[{key:"Author",value:"Roald Dahl"},{key:"Pages",value:"208"},{key:"Age",value:"8-12 Years"},{key:"Genre",value:"Fantasy/Adventure"}],["children","roald-dahl","bfg","giant"]),
p("child","Diary of a Wimpy Kid Book 1","Penguin",299,399,300,[{key:"Author",value:"Jeff Kinney"},{key:"Pages",value:"217"},{key:"Age",value:"8-12 Years"},{key:"Genre",value:"Humour/Diary"}],["children","diary-wimpy-kid","comic","school"],{is_bestseller:true}),
p("child","Geronimo Stilton: Cat and Mouse Box","Scholastic",999,1399,150,[{key:"Author",value:"Geronimo Stilton"},{key:"Set",value:"5 Books"},{key:"Age",value:"6-10 Years"},{key:"Genre",value:"Adventure/Humour"}],["children","geronimo","mouse","set-5"]),
p("child","Panchatantra Stories for Children","Maple Press",249,349,400,[{key:"Type",value:"Story Collection"},{key:"Stories",value:"30+ Classic Tales"},{key:"Age",value:"5-10 Years"},{key:"Feature",value:"Illustrated"}],["children","panchatantra","stories","illustrated"],{is_bestseller:true}),
p("child","Moral Stories for Kids Illustrated 200 Stories","Navneet",299,499,300,[{key:"Stories",value:"200 Stories"},{key:"Age",value:"5-12 Years"},{key:"Feature",value:"Color Illustrations"},{key:"Language",value:"English"}],["children","moral-stories","illustrated","200-stories"]),
p("child","Amar Chitra Katha Ramayana Collection 10 Comics","Diamond",699,999,200,[{key:"Type",value:"Comic Book Set"},{key:"Set",value:"10 Comics"},{key:"Age",value:"8+ Years"},{key:"Language",value:"English + Hindi"}],["children","amar-chitra-katha","ramayana","comics"]),
p("child","Tinkle Comics Annual 2024","Diamond",499,699,150,[{key:"Type",value:"Comic Annual"},{key:"Year",value:"2024"},{key:"Age",value:"7-14 Years"},{key:"Feature",value:"Suppandi + Shikari Shambu"}],["children","tinkle","comics","annual"]),
p("child","My First Encyclopedia Science for Kids","DK Books",799,1199,100,[{key:"Subject",value:"Science"},{key:"Age",value:"5-9 Years"},{key:"Publisher",value:"DK Books"},{key:"Feature",value:"Full Color Illustrations"}],["children","science","encyclopedia","dk-books"]),
p("child","The Complete Collection of Famous Five 21 Books","Enid Blyton",3499,4999,60,[{key:"Author",value:"Enid Blyton"},{key:"Set",value:"21 Books"},{key:"Age",value:"8-12 Years"},{key:"Series",value:"Famous Five Complete Set"}],["children","enid-blyton","famous-five","set"],{is_featured:true}),
p("child","Jataka Tales Illustrated 5 Book Set","Maple Press",699,999,150,[{key:"Set",value:"5 Books"},{key:"Stories",value:"25+ Tales"},{key:"Age",value:"5-10 Years"},{key:"Feature",value:"Color Illustrations"}],["children","jataka-tales","buddhist","illustrated"]),
p("child","Goosebumps Most Wanted Haunted Library 5 Books","Scholastic",999,1499,100,[{key:"Author",value:"R.L. Stine"},{key:"Set",value:"5 Books"},{key:"Age",value:"9-12 Years"},{key:"Genre",value:"Horror/Thriller"}],["children","goosebumps","horror","rl-stine"]),
p("child","Baby Touch and Feel Animals DK Book","DK Books",399,599,200,[{key:"Age",value:"0-3 Years"},{key:"Feature",value:"Touch and Feel Textures"},{key:"Publisher",value:"DK Books"},{key:"Format",value:"Board Book"}],["baby","touch-feel","animals","dk-books"]),
// ── COOKING, TRAVEL & MISC (71-100) ───────────────────────────────────────────
p("book","Sanjeev Kapoor's Khazana of Indian Recipes","Popular Prakashan",499,699,150,[{key:"Author",value:"Sanjeev Kapoor"},{key:"Recipes",value:"500+ Indian Recipes"},{key:"Publisher",value:"Popular Prakashan"},{key:"Feature",value:"Color Photos"}],["cooking","sanjeev-kapoor","indian","recipes"],{is_bestseller:true}),
p("book","Tarla Dalal's Punjabi Recipes","Sanjay & Co",299,399,150,[{key:"Author",value:"Tarla Dalal"},{key:"Cuisine",value:"Punjabi"},{key:"Recipes",value:"100+"},{key:"Feature",value:"Step-by-Step"}],["cooking","tarla-dalal","punjabi","indian"]),
p("book","The Complete Vegetarian Cookbook by Nita Mehta","SNAB Publishers",399,549,100,[{key:"Author",value:"Nita Mehta"},{key:"Type",value:"Vegetarian"},{key:"Recipes",value:"200+"},{key:"Feature",value:"Easy to Follow"}],["cooking","vegetarian","nita-mehta","easy"]),
p("book","Lonely Planet India Travel Guide","Lonely Planet",1499,1999,80,[{key:"Publisher",value:"Lonely Planet"},{key:"Type",value:"Travel Guide"},{key:"Edition",value:"Latest Edition"},{key:"Feature",value:"Maps + Itineraries"}],["travel","india","lonely-planet","guide"]),
p("book","50 Places to Visit in India Before You Die","Westland",399,549,100,[{key:"Type",value:"Travel"},{key:"Destinations",value:"50 Places"},{key:"Feature",value:"Color Photos + Travel Tips"},{key:"Author",value:"Various"}],["travel","india","destinations","bucket-list"]),
p("book","The Secret by Rhonda Byrne","Simon & Schuster",299,399,350,[{key:"Author",value:"Rhonda Byrne"},{key:"Pages",value:"198"},{key:"Genre",value:"Spirituality/Self-Help"},{key:"Feature",value:"Law of Attraction"}],["self-help","secret","law-of-attraction","rhonda"],{is_bestseller:true}),
p("book","The Monk Who Sold His Ferrari by Robin Sharma","Jaico",249,349,300,[{key:"Author",value:"Robin Sharma"},{key:"Pages",value:"208"},{key:"Genre",value:"Fiction/Self-Help"},{key:"Feature",value:"Fable for Living"}],["self-help","robin-sharma","monk","motivation"],{is_bestseller:true}),
p("book","Can't Hurt Me by David Goggins","Lioncrest",599,799,100,[{key:"Author",value:"David Goggins"},{key:"Pages",value:"364"},{key:"Genre",value:"Autobiography/Self-Help"},{key:"Feature",value:"Unbreakable Mindset"}],["self-help","goggins","discipline","mindset"]),
p("book","The 7 Habits of Highly Effective People","Simon & Schuster",499,699,200,[{key:"Author",value:"Stephen Covey"},{key:"Pages",value:"381"},{key:"Genre",value:"Business/Self-Help"},{key:"Feature",value:"Principles of Effectiveness"}],["self-help","covey","7-habits","effectiveness"]),
p("book","How to Win Friends and Influence People","Fingerprint",199,299,400,[{key:"Author",value:"Dale Carnegie"},{key:"Pages",value:"288"},{key:"Genre",value:"Self-Help"},{key:"Feature",value:"Human Relations Classic"}],["self-help","carnegie","influence","classic"],{is_bestseller:true}),
p("book","The Lean Startup by Eric Ries","Penguin",449,599,100,[{key:"Author",value:"Eric Ries"},{key:"Pages",value:"336"},{key:"Genre",value:"Business/Entrepreneurship"},{key:"Feature",value:"Build-Measure-Learn"}],["startup","lean","business","entrepreneurship"]),
p("book","Shoe Dog by Phil Knight","Simon & Schuster",499,699,120,[{key:"Author",value:"Phil Knight"},{key:"Pages",value:"400"},{key:"Genre",value:"Memoir/Business"},{key:"Subject",value:"Nike's Origin Story"}],["memoir","phil-knight","nike","business"]),
p("book","Elon Musk Biography by Walter Isaacson","Simon & Schuster",899,1199,80,[{key:"Author",value:"Walter Isaacson"},{key:"Pages",value:"688"},{key:"Subject",value:"Elon Musk"},{key:"Year",value:"2023"}],["biography","elon-musk","isaacson","2023"],{is_featured:true}),
p("book","Steve Jobs by Walter Isaacson","Simon & Schuster",699,899,100,[{key:"Author",value:"Walter Isaacson"},{key:"Pages",value:"656"},{key:"Subject",value:"Steve Jobs"},{key:"Genre",value:"Biography"}],["biography","steve-jobs","isaacson","apple"]),
p("book","Brief Answers to the Big Questions by Stephen Hawking","John Murray",449,599,100,[{key:"Author",value:"Stephen Hawking"},{key:"Pages",value:"255"},{key:"Genre",value:"Science/Non-Fiction"},{key:"Feature",value:"10 Big Questions"}],["science","hawking","physics","universe"]),
p("book","Homo Deus by Yuval Noah Harari","Vintage",499,699,120,[{key:"Author",value:"Yuval Noah Harari"},{key:"Pages",value:"448"},{key:"Genre",value:"Non-Fiction"},{key:"Feature",value:"Future of Humanity"}],["non-fiction","harari","future","science"],{is_featured:true}),
p("book","Thinking Fast and Slow by Daniel Kahneman","Penguin",499,699,120,[{key:"Author",value:"Daniel Kahneman"},{key:"Pages",value:"499"},{key:"Genre",value:"Psychology"},{key:"Award",value:"Nobel Prize Winning Author"}],["psychology","kahneman","behaviour","thinking"]),
p("book","The Art of War by Sun Tzu","Penguin",149,199,500,[{key:"Author",value:"Sun Tzu"},{key:"Pages",value:"160"},{key:"Translation",value:"With Commentary"},{key:"Genre",value:"Strategy/Philosophy"}],["strategy","sun-tzu","war","classic"],{is_bestseller:true}),
p("book","Meditations by Marcus Aurelius","Penguin",199,299,300,[{key:"Author",value:"Marcus Aurelius"},{key:"Pages",value:"208"},{key:"Genre",value:"Philosophy/Stoicism"},{key:"Translation",value:"Gregory Hays"}],["stoicism","philosophy","marcus-aurelius","classic"]),
p("book","Autobiograpy of a Yogi by Paramahansa Yogananda","Jaico",299,399,200,[{key:"Author",value:"Paramahansa Yogananda"},{key:"Pages",value:"672"},{key:"Genre",value:"Spiritual Autobiography"},{key:"Feature",value:"Steve Jobs's Favourite"}],["spirituality","yoga","yogananda","meditation"]),
p("book","The Bhagavad Gita As It Is by A.C. Bhaktivedanta","ISKCON",349,499,300,[{key:"Author",value:"A.C. Bhaktivedanta Swami Prabhupada"},{key:"Pages",value:"924"},{key:"Language",value:"Sanskrit + English"},{key:"Feature",value:"Word-for-word translation"}],["bhagavad-gita","krishna","spiritual","iskcon"]),
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
  const categories = await Category.find({ status: true });
  const brands     = await Brand.find({ status: true });
  if (!categories.length) { console.error("❌ No categories found."); process.exit(1); }
  const catId = categories.find(c => c.slug === "books")?._id || categories[0]._id;
  const brandMap = {};
  brands.forEach(b => { brandMap[b.name.toLowerCase()] = b._id; });
  const defaultBrand = brands[0]._id;
  const deleted = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing books products`);
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
  console.log(`\n✅ Done! ${inserted} Books products seeded.`);
  await mongoose.disconnect();
}
run().catch(err => { console.error(err); process.exit(1); });
