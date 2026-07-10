import { useState } from "react";
import { MdLocationOn, MdPhone, MdAccessTime, MdSearch, MdDirections } from "react-icons/md";
import { FaStore } from "react-icons/fa";

const stores = [
  { id:1, name:"ShopEase Experience Centre — Gurugram", city:"Gurugram",  state:"Haryana",           address:"Ground Floor, DLF Mega Mall, Sector 28, Gurugram, Haryana 122002",     phone:"+91 124-456-7890", hours:"10 AM – 9 PM (Mon–Sun)", lat:28.47, lng:77.02, type:"Experience Centre", tag:"bg-purple-100 text-purple-700" },
  { id:2, name:"ShopEase Experience Centre — Bangalore",city:"Bangalore", state:"Karnataka",          address:"Forum Mall, Ground Floor, Koramangala, Bangalore 560034",              phone:"+91 80-234-5678",  hours:"10 AM – 9:30 PM (Mon–Sun)",lat:12.93, lng:77.62, type:"Experience Centre", tag:"bg-purple-100 text-purple-700" },
  { id:3, name:"ShopEase Experience Centre — Mumbai",   city:"Mumbai",    state:"Maharashtra",        address:"Level 1, Palladium Mall, Lower Parel, Mumbai 400013",                  phone:"+91 22-567-8901",  hours:"11 AM – 10 PM (Mon–Sun)",  lat:19.00, lng:72.82, type:"Experience Centre", tag:"bg-purple-100 text-purple-700" },
  { id:4, name:"ShopEase Returns Hub — Delhi",          city:"Delhi",     state:"Delhi",              address:"Plot 12, Okhla Industrial Area Phase 2, New Delhi 110020",             phone:"+91 11-345-6789",  hours:"9 AM – 7 PM (Mon–Sat)",    lat:28.55, lng:77.27, type:"Returns Hub",        tag:"bg-orange-100 text-orange-700" },
  { id:5, name:"ShopEase Returns Hub — Chennai",        city:"Chennai",   state:"Tamil Nadu",         address:"Anna Nagar East, 5th Avenue, Chennai 600040",                         phone:"+91 44-678-9012",  hours:"9 AM – 7 PM (Mon–Sat)",    lat:13.08, lng:80.21, type:"Returns Hub",        tag:"bg-orange-100 text-orange-700" },
  { id:6, name:"ShopEase Pickup Point — Hyderabad",     city:"Hyderabad", state:"Telangana",          address:"Jubilee Hills Checkpost, Road No. 36, Hyderabad 500033",              phone:"+91 40-123-4567",  hours:"8 AM – 10 PM (Mon–Sun)",   lat:17.43, lng:78.41, type:"Pickup Point",       tag:"bg-blue-100 text-blue-700" },
  { id:7, name:"ShopEase Pickup Point — Pune",          city:"Pune",      state:"Maharashtra",        address:"Near Pheonix Marketcity, Viman Nagar, Pune 411014",                   phone:"+91 20-234-5678",  hours:"9 AM – 9 PM (Mon–Sun)",    lat:18.57, lng:73.91, type:"Pickup Point",       tag:"bg-blue-100 text-blue-700" },
  { id:8, name:"ShopEase Pickup Point — Kolkata",       city:"Kolkata",   state:"West Bengal",        address:"CF-201, Salt Lake Sector 1, Kolkata 700064",                          phone:"+91 33-456-7890",  hours:"9 AM – 8 PM (Mon–Sat)",    lat:22.57, lng:88.37, type:"Pickup Point",       tag:"bg-blue-100 text-blue-700" },
  { id:9, name:"ShopEase Service Centre — Jaipur",      city:"Jaipur",    state:"Rajasthan",          address:"C-Scheme, Ashok Marg, Near SMS Hospital, Jaipur 302001",              phone:"+91 141-345-6789", hours:"10 AM – 7 PM (Mon–Sat)",   lat:26.92, lng:75.82, type:"Service Centre",     tag:"bg-green-100 text-green-700" },
  { id:10,name:"ShopEase Service Centre — Ahmedabad",   city:"Ahmedabad", state:"Gujarat",            address:"CG Road, Navrangpura, Ahmedabad 380009",                              phone:"+91 79-456-7890",  hours:"10 AM – 7 PM (Mon–Sat)",   lat:23.02, lng:72.57, type:"Service Centre",     tag:"bg-green-100 text-green-700" },
];

const types = ["All","Experience Centre","Returns Hub","Pickup Point","Service Centre"];
const cities = ["All", ...new Set(stores.map(s => s.city))];

const StoreLocator = () => {
  const [search, setSearch]   = useState("");
  const [activeType, setType] = useState("All");
  const [activeCity, setCity] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = stores.filter((s) => {
    const matchType = activeType === "All" || s.type === activeType;
    const matchCity = activeCity === "All" || s.city === activeCity;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()) || s.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCity && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white">
        <div className="max-w-[1100px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FaStore size={28} className="text-white"/>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Store Locator</h1>
          <p className="text-white/70 text-sm max-w-md mx-auto mb-7">Find ShopEase Experience Centres, Returns Hubs and Pickup Points near you.</p>
          <div className="relative max-w-lg mx-auto">
            <MdSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, area or store name…"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-800 text-sm outline-none shadow-xl focus:ring-2 focus:ring-white/50"/>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { stat:stores.filter(s=>s.type==="Experience Centre").length, label:"Experience Centres", icon:"🏬", color:"bg-purple-50 border-purple-100" },
            { stat:stores.filter(s=>s.type==="Returns Hub").length,       label:"Returns Hubs",       icon:"↩️", color:"bg-orange-50 border-orange-100" },
            { stat:stores.filter(s=>s.type==="Pickup Point").length,      label:"Pickup Points",      icon:"📦", color:"bg-blue-50 border-blue-100"     },
            { stat:stores.filter(s=>s.type==="Service Centre").length,    label:"Service Centres",    icon:"🔧", color:"bg-green-50 border-green-100"   },
          ].map((s) => (
            <div key={s.label} className={`${s.color} border rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
              <span className="text-3xl">{s.icon}</span>
              <div><p className="text-xl font-extrabold text-gray-900">{s.stat}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${activeType === t ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="border-l border-gray-100 pl-4">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5">City</p>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c) => (
                <button key={c} onClick={() => setCity(c)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${activeCity === c ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="text-xs text-gray-500"><span className="font-extrabold text-gray-800">{filtered.length}</span> location{filtered.length !== 1 ? "s" : ""} found</p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-sm">
            <span className="text-5xl">🔍</span>
            <p className="text-gray-500 mt-3 text-sm">No stores found. <button onClick={() => { setSearch(""); setType("All"); setCity("All"); }} className="text-primary-600 font-semibold hover:underline">Clear filters</button></p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((store) => (
              <div key={store.id} onClick={() => setSelected(selected?.id === store.id ? null : store)}
                className={`bg-white rounded-2xl border-2 p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${selected?.id === store.id ? "border-primary-400 shadow-md" : "border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaStore size={17} className="text-primary-600"/>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${store.tag}`}>{store.type}</span>
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2 leading-snug">{store.name}</h3>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <MdLocationOn size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MdPhone size={13} className="text-green-500 flex-shrink-0"/>
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MdAccessTime size={13} className="text-blue-500 flex-shrink-0"/>
                    <span>{store.hours}</span>
                  </div>
                </div>
                <a href={`https://maps.google.com/?q=${store.address}`} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 w-full flex items-center justify-center gap-2 border border-primary-300 text-primary-600 hover:bg-primary-50 font-bold py-2 rounded-xl text-xs transition-colors">
                  <MdDirections size={15}/> Get Directions
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-4xl flex-shrink-0">📍</span>
          <div>
            <p className="text-sm font-extrabold text-blue-800">Can't find a store near you?</p>
            <p className="text-xs text-blue-600 mt-0.5">We're expanding fast! In the meantime, all orders can be delivered to your doorstep with free delivery on orders above ₹499.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StoreLocator;
