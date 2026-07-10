import { useState } from "react";
import { Link } from "react-router-dom";
import { MdExpandMore, MdSecurity, MdCheck } from "react-icons/md";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect the following types of information: (a) Personal Information — name, email, phone number, delivery address when you register or place an order; (b) Payment Information — card type, last 4 digits and billing address (full card numbers are never stored); (c) Device & Usage Data — IP address, browser type, pages visited, time on site and clickstream data; (d) Location Data — with your consent, we may collect precise location for delivery estimation; (e) Communications — emails and chat records when you contact our support team.`
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to: process and fulfil your orders; send order confirmations, shipping updates and delivery notifications; personalise your shopping experience and product recommendations; improve our platform, resolve bugs and enhance performance; send promotional emails and offers (you can opt out any time); comply with legal obligations under Indian law including IT Act 2000 and Consumer Protection Act 2019; detect and prevent fraud, abuse and security incidents.`
  },
  {
    title: "3. How We Share Your Information",
    content: `We do not sell your personal data. We share information with: (a) Sellers — your name, phone and delivery address to fulfil your order; (b) Logistics Partners — Delhivery, Blue Dart, Ekart and others to enable delivery; (c) Payment Processors — Razorpay, Paytm and banks for transaction processing; (d) Analytics Providers — anonymised usage data with Google Analytics and internal tools; (e) Legal Authorities — when required by law, court order or government request. All third parties are contractually obligated to protect your data.`
  },
  {
    title: "4. Data Retention",
    content: `We retain your personal data for as long as necessary to provide our services and comply with legal obligations: Account data is retained while your account is active and for 3 years after closure. Order data is retained for 7 years for tax and legal compliance. Payment data is retained per PCI-DSS requirements. You may request deletion of your account data at any time by contacting us, subject to legal retention requirements.`
  },
  {
    title: "5. Cookies & Tracking",
    content: `We use cookies and similar technologies to: keep you signed in across sessions; remember your cart and preferences; measure website performance and visitor analytics; deliver personalised advertisements on third-party platforms. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain platform functionality. We support Do Not Track (DNT) browser signals for analytics cookies.`
  },
  {
    title: "6. Data Security",
    content: `We implement industry-standard security measures: 256-bit SSL/TLS encryption for all data in transit; AES-256 encryption for sensitive data at rest; PCI-DSS Level 1 compliance for payment processing; regular penetration testing and security audits; role-based access controls limiting employee data access; two-factor authentication for all admin systems. Despite these measures, no internet transmission is 100% secure. Report security concerns to security@shopease.in.`
  },
  {
    title: "7. Your Rights",
    content: `Under the Digital Personal Data Protection Act (DPDPA) 2023 and applicable Indian law, you have the right to: access a copy of your personal data; correct inaccurate or incomplete data; request deletion of your personal data; object to certain processing; data portability in a machine-readable format; withdraw consent at any time without affecting prior processing. To exercise these rights, contact privacy@shopease.in or visit your Account Settings.`
  },
  {
    title: "8. Children's Privacy",
    content: `ShopEase is not intended for children under 18. We do not knowingly collect personal data from minors. If we discover that a minor has provided us with personal data, we will promptly delete it. Parents or guardians who believe their child has provided data to us should contact us immediately at privacy@shopease.in.`
  },
  {
    title: "9. Third-Party Links",
    content: `Our platform may contain links to third-party websites, payment gateways and social media platforms. This Privacy Policy does not apply to those third-party sites. We encourage you to review the privacy policies of any third-party services you access through our platform. ShopEase is not responsible for the privacy practices of third-party sites.`
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify you of material changes via email or a prominent notice on our platform. Your continued use of ShopEase after changes constitutes acceptance of the updated policy. This policy was last updated on July 1, 2026. For questions, contact privacy@shopease.in.`
  },
];

const PrivacyPolicy = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-violet-800 to-purple-900 text-white">
        <div className="max-w-[860px] mx-auto px-4 py-14 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5"><MdSecurity size={30} className="text-white"/></div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-white/65 text-sm max-w-md mx-auto">We're committed to protecting your personal data. Here's exactly how we handle it.</p>
        </div>
      </div>
      <div className="max-w-[860px] mx-auto px-4 py-10 space-y-8">
        {/* Trust Highlights */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon:"🔒", title:"256-bit SSL Encryption",   desc:"All data encrypted in transit and at rest"    },
            { icon:"🚫", title:"We Never Sell Your Data",  desc:"Your personal info stays with us, always"     },
            { icon:"✅", title:"DPDPA 2023 Compliant",     desc:"Aligned with India's latest data privacy law" },
          ].map((h) => (
            <div key={h.title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <span className="text-3xl">{h.icon}</span>
              <p className="text-xs font-extrabold text-gray-800 mt-3">{h.title}</p>
              <p className="text-[11px] text-gray-500 mt-1">{h.desc}</p>
            </div>
          ))}
        </div>
        {/* Policy Sections */}
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
        {/* Rights Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4">Your Privacy Rights at a Glance</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {["Access your personal data anytime","Correct inaccurate information","Request deletion of your data","Object to marketing communications","Download your data (portability)","Withdraw consent at any time"].map((r) => (
              <div key={r} className="flex items-start gap-2 text-xs text-gray-600">
                <MdCheck size={14} className="text-green-500 flex-shrink-0 mt-0.5"/> {r}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">To exercise your rights, email <a href="mailto:privacy@shopease.in" className="text-primary-600 font-semibold hover:underline">privacy@shopease.in</a></p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700">Have a privacy concern?</p>
          <div className="flex gap-3">
            <Link to="/contact-us" className="text-sm font-bold text-primary-600 hover:underline">Contact Us</Link>
            <Link to="/terms-conditions" className="text-sm font-bold text-primary-600 hover:underline">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
