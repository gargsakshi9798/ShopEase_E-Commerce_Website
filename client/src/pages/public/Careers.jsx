import { useState } from "react";
import { Link } from "react-router-dom";
import { MdArrowForward, MdLocationOn, MdWork, MdSearch } from "react-icons/md";
import { FaUsers, FaRocket, FaHeart, FaLaptopCode } from "react-icons/fa";

const jobs = [
  { id:1, title:"Senior Frontend Engineer",    dept:"Engineering",     loc:"Gurugram",   type:"Full-Time", exp:"3-5 years" },
  { id:2, title:"Backend Engineer (Node.js)",  dept:"Engineering",     loc:"Remote",     type:"Full-Time", exp:"2-4 years" },
  { id:3, title:"Product Manager – Payments",  dept:"Product",         loc:"Gurugram",   type:"Full-Time", exp:"4-6 years" },
  { id:4, title:"UX/UI Designer",              dept:"Design",          loc:"Bangalore",  type:"Full-Time", exp:"2-4 years" },
  { id:5, title:"Data Analyst",                dept:"Analytics",       loc:"Gurugram",   type:"Full-Time", exp:"1-3 years" },
  { id:6, title:"Customer Success Manager",    dept:"Customer Support",loc:"Remote",     type:"Full-Time", exp:"1-2 years" },
  { id:7, title:"Seller Growth Executive",     dept:"Business Dev",    loc:"Multiple",   type:"Full-Time", exp:"0-2 years" },
  { id:8, title:"Marketing Manager – SEO/SEM", dept:"Marketing",       loc:"Gurugram",   type:"Full-Time", exp:"3-5 years" },
  { id:9, title:"iOS Developer",               dept:"Engineering",     loc:"Gurugram",   type:"Full-Time", exp:"2-4 years" },
  { id:10,title:"Finance & Accounts Executive",dept:"Finance",         loc:"Gurugram",   type:"Full-Time", exp:"1-3 years" },
  { id:11,title:"HR Business Partner",         dept:"Human Resources", loc:"Gurugram",   type:"Full-Time", exp:"2-4 years" },
  { id:12,title:"Graphic Design Intern",       dept:"Design",          loc:"Remote",     type:"Internship",exp:"Fresher" },
];

const depts = ["All", "Engineering", "Product", "Design", "Analytics", "Marketing", "Business Dev", "Finance", "Human Resources", "Customer Support"];
const deptColors = { Engineering:"bg-blue-100 text-blue-700", Product:"bg-purple-100 text-purple-700", Design:"bg-pink-100 text-pink-700", Analytics:"bg-amber-100 text-amber-700", Marketing:"bg-green-100 text-green-700", "Business Dev":"bg-cyan-100 text-cyan-700", Finance:"bg-indigo-100 text-indigo-700", "Human Resources":"bg-rose-100 text-rose-700", "Customer Support":"bg-orange-100 text-orange-700" };

const perks = [
  { icon:"💰", title:"Competitive Pay",        desc:"Industry-leading salaries + equity for senior roles" },
  { icon:"🏥", title:"Health Insurance",        desc:"Full family medical, dental & vision coverage" },
  { icon:"🏖️", title:"Unlimited PTO",           desc:"We trust our team to manage their own time" },
  { icon:"🎓", title:"Learning Budget",         desc:"₹50,000/year for courses, books and conferences" },
  { icon:"🍔", title:"Free Meals",              desc:"Daily lunch and snacks at office campuses" },
  { icon:"🏋️", title:"Wellness Allowance",      desc:"Monthly gym/wellness reimbursement of ₹3,000" },
  { icon:"🏠", title:"Remote Flexibility",      desc:"Hybrid & remote options for most roles" },
  { icon:"🎂", title:"Birthday Leave",          desc:"Extra day off on your birthday — no questions asked" },
];

const Careers = () => {
  const [search, setSearch]   = useState("");
  const [activeDept, setDept] = useState("All");

  const filtered = jobs.filter((j) => {
    const matchDept   = activeDept === "All" || j.dept === activeDept;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.dept.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"/>
          <div className="absolute -bottom-10 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-[1000px] mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur">
            <FaRocket size={12} className="text-yellow-400"/> {jobs.length} Open Positions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Build the Future of<br />
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">E-Commerce in India</span>
          </h1>
          <p className="text-white/65 text-sm max-w-xl mx-auto mb-8">
            Join a team of passionate people building products used by 10 million+ Indians every day. We're hiring across engineering, product, design and more.
          </p>
          <div className="relative max-w-lg mx-auto">
            <MdSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, departments…"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-800 text-sm outline-none shadow-xl focus:ring-2 focus:ring-white/50"/>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon:<FaUsers size={22} className="text-blue-600"/>,     stat:"1,200+",label:"Employees",      bg:"bg-blue-50 border-blue-100"   },
            { icon:<FaLaptopCode size={22} className="text-purple-600"/>,stat:"12",   label:"Open Roles",     bg:"bg-purple-50 border-purple-100"},
            { icon:<FaRocket size={22} className="text-amber-500"/>,   stat:"8",     label:"Office Locations",bg:"bg-amber-50 border-amber-100"  },
            { icon:<FaHeart size={22} className="text-rose-500"/>,     stat:"4.7★",  label:"Glassdoor Rating",bg:"bg-rose-50 border-rose-100"    },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm`}>
              {s.icon}
              <p className="text-xl font-extrabold text-gray-900">{s.stat}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Job Listings */}
        <section>
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Open Positions</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {depts.map((d) => (
              <button key={d} onClick={() => setDept(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeDept === d ? "bg-primary-600 text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"}`}>
                {d}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-gray-500 mt-3 text-sm">No roles found. <button onClick={() => { setSearch(""); setDept("All"); }} className="text-primary-600 font-semibold hover:underline">Clear filters</button></p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((j) => (
                <div key={j.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MdWork size={20} className="text-primary-600"/>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray-900 group-hover:text-primary-600">{j.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deptColors[j.dept] || "bg-gray-100 text-gray-600"}`}>{j.dept}</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-500"><MdLocationOn size={12}/> {j.loc}</span>
                        <span className="text-[11px] text-gray-500">· {j.exp}</span>
                        {j.type === "Internship" && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Internship</span>}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex-shrink-0">
                    Apply Now <MdArrowForward size={13}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Perks */}
        <section className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900 mb-6">Life at ShopEase</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {perks.map((p) => (
              <div key={p.title} className="bg-gray-50 rounded-xl p-4">
                <span className="text-3xl">{p.icon}</span>
                <p className="text-xs font-extrabold text-gray-800 mt-3 mb-1">{p.title}</p>
                <p className="text-[11px] text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-xl font-extrabold mb-2">Don't see the right role?</h2>
          <p className="text-white/70 text-sm mb-5">Send us your resume and we'll reach out when something fits.</p>
          <a href="mailto:careers@shopease.in"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow">
            Send Resume <MdArrowForward size={15}/>
          </a>
        </section>
      </div>
    </div>
  );
};
export default Careers;
