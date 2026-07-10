import { useState } from "react";
import { Link } from "react-router-dom";
import { MdExpandMore, MdGavel } from "react-icons/md";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using ShopEase ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services. These terms apply to all visitors, users, buyers and sellers on the Platform. We reserve the right to update these terms at any time with notice posted on the Platform.`
  },
  {
    title: "2. Account Registration",
    content: `You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Provide accurate and complete information during registration. ShopEase reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.`
  },
  {
    title: "3. Products & Listings",
    content: `ShopEase acts as a marketplace connecting buyers and sellers. We do not own or warehouse any products unless specified. Product descriptions, images and pricing are provided by sellers. While we make efforts to ensure accuracy, ShopEase is not responsible for seller-provided content. All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.`
  },
  {
    title: "4. Orders & Payments",
    content: `Placing an order constitutes a binding contract between you and the seller. Payment must be completed at the time of purchase. ShopEase supports UPI, Credit/Debit Cards, Net Banking, EMI and Cash on Delivery (COD). ShopEase uses PCI-DSS compliant payment gateways and does not store full card details. Orders may be cancelled by either party in accordance with our Cancellation Policy.`
  },
  {
    title: "5. Shipping & Delivery",
    content: `Delivery timelines are estimates and may vary based on location, seller processing time and logistics partner availability. ShopEase is not liable for delays caused by force majeure events, incorrect addresses or third-party logistics failures. Refer to our Shipping Policy for detailed delivery timelines and charges.`
  },
  {
    title: "6. Returns & Refunds",
    content: `Most items can be returned within 7 days of delivery subject to the item being unused and in original packaging. Certain categories such as grocery, innerwear and digital goods are non-returnable. Refunds are processed to the original payment method within 5–7 business days after return inspection. Refer to our Returns & Refunds Policy for full details.`
  },
  {
    title: "7. Intellectual Property",
    content: `All content on the ShopEase Platform including logos, design, text, graphics and software is the property of ShopEase Technologies Pvt. Ltd. or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission from ShopEase.`
  },
  {
    title: "8. Prohibited Conduct",
    content: `You agree not to: (a) use the Platform for any unlawful purpose; (b) post false, misleading or fraudulent content; (c) attempt to gain unauthorised access to our systems; (d) engage in price manipulation, review fraud or seller impersonation; (e) use automated bots or scrapers without written consent; (f) violate any applicable local, national or international law.`
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by law, ShopEase shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the Platform. Our total liability for any claim shall not exceed the amount paid by you for the specific transaction giving rise to the claim in the 3 months preceding the claim.`
  },
  {
    title: "10. Governing Law & Disputes",
    content: `These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Gurugram, Haryana. We encourage resolution through our customer support before initiating legal proceedings. For consumer disputes, you may also approach the National Consumer Disputes Redressal Commission (NCDRC).`
  },
  {
    title: "11. Privacy",
    content: `Your use of the Platform is also governed by our Privacy Policy, which is incorporated herein by reference. By using ShopEase, you consent to the collection, use and sharing of your information as described in the Privacy Policy.`
  },
  {
    title: "12. Changes to Terms",
    content: `ShopEase reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. Material changes will be communicated via email or prominent notice on the Platform. Last updated: July 1, 2026.`
  },
];

const TermsConditions = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-[860px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdGavel size={30} className="text-white"/></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Terms &amp; Conditions</h1>
          <p className="text-white/65 text-sm max-w-md mx-auto">Please read these terms carefully before using our platform. Last updated July 1, 2026.</p>
        </div>
      </div>
      <div className="max-w-[860px] mx-auto px-4 py-10 space-y-8">
        {/* Quick Nav */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <button key={i} onClick={() => setOpen(open === i ? null : i)}
                className="text-xs bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-600 hover:text-primary-600 px-2.5 py-1 rounded-lg transition-colors">
                {s.title}
              </button>
            ))}
          </div>
        </div>
        {/* Sections */}
        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="text-sm font-extrabold text-gray-800">{s.title}</span>
                <MdExpandMore size={18} className={`text-gray-400 flex-shrink-0 ml-3 transition-transform ${open === i ? "rotate-180" : ""}`}/>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">{s.content}</div>
              )}
            </div>
          ))}
        </div>
        {/* Footer links */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700">Questions about these Terms?</p>
          <div className="flex gap-3">
            <Link to="/contact-us" className="text-sm font-bold text-primary-600 hover:underline">Contact Us</Link>
            <Link to="/privacy-policy" className="text-sm font-bold text-primary-600 hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TermsConditions;
