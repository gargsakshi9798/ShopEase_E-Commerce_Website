import { useState } from "react";
import { MdArrowForward, MdCheck, MdContentCopy } from "react-icons/md";
import { FaGift } from "react-icons/fa";

const amounts = [500, 1000, 2000, 5000, 10000];
const occasions = ["Birthday 🎂","Anniversary 💑","Wedding 💒","Diwali 🪔","New Year 🎊","Thank You 🙏","Just Because 💛"];
const designs = [
  { id:1, label:"Festive",   emoji:"🎉", gradient:"from-rose-500 to-pink-600"   },
  { id:2, label:"Birthday",  emoji:"🎂", gradient:"from-amber-500 to-orange-600"},
  { id:3, label:"Premium",   emoji:"✨", gradient:"from-violet-600 to-purple-700"},
  { id:4, label:"Corporate", emoji:"🏢", gradient:"from-blue-600 to-indigo-700" },
  { id:5, label:"Wedding",   emoji:"💒", gradient:"from-pink-400 to-rose-500"   },
  { id:6, label:"Minimal",   emoji:"🌿", gradient:"from-teal-500 to-cyan-600"   },
];

const GiftCards = () => {
  const [step, setStep]           = useState(1);
  const [amount, setAmount]       = useState(1000);
  const [custom, setCustom]       = useState("");
  const [design, setDesign]       = useState(1);
  const [occasion, setOccasion]   = useState("Birthday 🎂");
  const [toName, setToName]       = useState("");
  const [toEmail, setToEmail]     = useState("");
  const [fromName, setFromName]   = useState("");
  const [message, setMessage]     = useState("");
  const [purchased, setPurchased] = useState(false);
  const [code] = useState("GIFT-SE-" + Math.random().toString(36).substring(2,8).toUpperCase());

  const finalAmt = custom ? +custom : amount;
  const selectedDesign = designs.find(d => d.id === design);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white">
        <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FaGift size={30} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Gift Cards</h1>
          <p className="text-white/75 text-sm max-w-md mx-auto">Give the gift of choice. Redeemable on 20L+ products across every category.</p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10">
        {purchased ? (
          /* ── Success State ── */
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className={`bg-gradient-to-br ${selectedDesign.gradient} rounded-3xl p-10 text-white shadow-2xl`}>
              <span className="text-6xl block mb-4">{selectedDesign.emoji}</span>
              <p className="text-sm font-semibold text-white/80 mb-1">ShopEase Gift Card</p>
              <p className="text-5xl font-extrabold mb-2">&#8377;{finalAmt.toLocaleString()}</p>
              <p className="text-white/70 text-sm mb-4">For {toName} · {occasion}</p>
              {message && <p className="text-white/80 text-xs italic bg-white/10 rounded-xl px-4 py-2">"{message}"</p>}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-500 mb-2 font-medium">Your Gift Card Code</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-extrabold text-xl text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 tracking-widest text-center">{code}</span>
                <button onClick={() => navigator.clipboard.writeText(code)}
                  className="w-11 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                  <MdContentCopy size={17}/>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Valid for 1 year from purchase. Enter at checkout.</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-green-800">&#10003; Gift card sent to {toEmail}</p>
              <p className="text-xs text-green-600 mt-0.5">A copy has also been sent to your email.</p>
            </div>
            <button onClick={() => { setPurchased(false); setStep(1); }}
              className="text-sm text-primary-600 font-semibold hover:underline">Send another gift card</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* ── Form ── */}
            <div className="lg:col-span-3 space-y-5">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-2">
                {["Choose Amount","Personalise","Send"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${step > i+1 ? "bg-green-500 text-white" : step === i+1 ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {step > i+1 ? <MdCheck size={14}/> : i+1}
                    </div>
                    <span className={`text-xs font-semibold ${step === i+1 ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
                    {i < 2 && <div className="w-8 h-0.5 bg-gray-200"/>}
                  </div>
                ))}
              </div>

              {/* Step 1 – Amount */}
              {step === 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                  <h2 className="text-base font-extrabold text-gray-900">Choose Amount</h2>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {amounts.map((a) => (
                      <button key={a} onClick={() => { setAmount(a); setCustom(""); }}
                        className={`py-3 rounded-xl text-sm font-extrabold border-2 transition-all ${!custom && amount === a ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                        &#8377;{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Custom Amount (&#8377;100 – &#8377;50,000)</label>
                    <input type="number" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Enter custom amount"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"/>
                  </div>
                  <h3 className="text-sm font-extrabold text-gray-900 mt-2">Choose Design</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {designs.map((d) => (
                      <button key={d.id} onClick={() => setDesign(d.id)}
                        className={`rounded-xl overflow-hidden border-2 transition-all ${design === d.id ? "border-primary-500 scale-105 shadow" : "border-transparent"}`}>
                        <div className={`bg-gradient-to-br ${d.gradient} h-14 flex items-center justify-center text-2xl`}>{d.emoji}</div>
                        <p className="text-[10px] font-bold text-gray-600 py-1 text-center bg-white">{d.label}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!finalAmt || finalAmt < 100}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    Continue <MdArrowForward size={16}/>
                  </button>
                </div>
              )}

              {/* Step 2 – Personalise */}
              {step === 2 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-extrabold text-gray-900">Personalise Your Gift</h2>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Occasion</label>
                    <div className="flex flex-wrap gap-2">
                      {occasions.map((o) => (
                        <button key={o} onClick={() => setOccasion(o)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${occasion === o ? "bg-primary-600 text-white border-primary-600" : "bg-white border-gray-200 text-gray-600 hover:border-primary-400"}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    { label:"Recipient Name *", val:toName,   set:setToName,   ph:"Friend or family name" },
                    { label:"Recipient Email *",val:toEmail,  set:setToEmail,  ph:"their@email.com"       },
                    { label:"Your Name",        val:fromName, set:setFromName, ph:"Your name"             },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">{f.label}</label>
                      <input value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500"/>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Personal Message (optional)</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Write a heartfelt message…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 resize-none"/>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">Back</button>
                    <button onClick={() => setStep(3)} disabled={!toName || !toEmail}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                      Preview &amp; Pay <MdArrowForward size={15}/>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 – Confirm */}
              {step === 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-extrabold text-gray-900">Confirm &amp; Pay</h2>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                    {[
                      ["Amount",    `₹${finalAmt.toLocaleString()}`],
                      ["Design",    selectedDesign.label],
                      ["Occasion",  occasion],
                      ["To",        `${toName} (${toEmail})`],
                      ["From",      fromName || "—"],
                      ["Message",   message || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">{k}</span>
                        <span className="text-gray-900 font-semibold text-right max-w-[60%] truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-xl p-4">
                    <span className="text-sm font-bold text-gray-800">Total to Pay</span>
                    <span className="text-xl font-extrabold text-primary-700">&#8377;{finalAmt.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">Back</button>
                    <button onClick={() => setPurchased(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm">
                      Pay &amp; Send Gift &#127873;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Live Preview ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Live Preview</p>
                <div className={`bg-gradient-to-br ${selectedDesign.gradient} rounded-3xl p-8 text-white shadow-xl`}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-widest">ShopEase Gift Card</span>
                    <span className="text-3xl">{selectedDesign.emoji}</span>
                  </div>
                  <p className="text-5xl font-extrabold mb-2">&#8377;{finalAmt > 0 ? finalAmt.toLocaleString() : "—"}</p>
                  <p className="text-white/70 text-sm">{occasion}</p>
                  {toName && <p className="text-white/90 text-sm mt-1 font-semibold">For: {toName}</p>}
                  {fromName && <p className="text-white/60 text-xs mt-0.5">From: {fromName}</p>}
                  {message && <p className="text-white/70 text-xs italic mt-3 bg-white/10 rounded-xl px-3 py-2">"{message}"</p>}
                  <p className="text-white/40 text-[10px] mt-6">Valid for 12 months from date of purchase</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2.5">
                  {["Redeemable on 20L+ products","No expiry extension","Multiple cards can be combined","Balance viewable in My Account"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <MdCheck size={14} className="text-green-500 flex-shrink-0"/> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default GiftCards;
