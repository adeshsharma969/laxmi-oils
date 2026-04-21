import React from "react";
import { motion } from "framer-motion";

export const policyPage = (title, subtitle, sections) => () => (
  <div className="px-4 sm:px-5 md:px-10 py-10 sm:py-12 max-w-4xl mx-auto">
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="border-b-[3px] border-[#1F3D2B] pb-6 mb-8">
      <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">{subtitle}</div>
      <h1 className="font-display font-black text-4xl md:text-6xl text-[#1F3D2B] tracking-tighter">{title}</h1>
      <div className="text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-[#1F3D2B]/60 mt-3">Last updated: 18 Feb 2026</div>
    </motion.div>
    <div className="space-y-8">
      {sections.map((s,i)=>(
        <motion.section key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.04}}>
          <h2 className="font-display font-black text-2xl md:text-3xl text-[#1F3D2B] tracking-tight mb-2">{s.h}</h2>
          {s.p.map((para,j)=> typeof para === "string"
            ? <p key={j} className="text-[#1F3D2B] text-base md:text-lg leading-relaxed mt-2">{para}</p>
            : <ul key={j} className="list-disc pl-6 mt-2 space-y-1">{para.map((li,k)=><li key={k}>{li}</li>)}</ul>)}
        </motion.section>
      ))}
    </div>
  </div>
);

export const Terms = policyPage("Terms & Conditions.", "The fine print", [
  { h: "1. Acceptance", p: ["By using laxmioils.in you agree to these Terms. Don't like them? No hard feelings — just don't use the site."]},
  { h: "2. Orders & Pricing", p: ["All prices are in INR and inclusive of GST. We may revise prices and product details without notice. Order confirmation is subject to stock and address serviceability."]},
  { h: "3. Payments", p: ["We accept UPI, cards, net banking, and cash-on-delivery where available. Payments are processed by Razorpay. We do not store card data."]},
  { h: "4. Shipping", p: ["Standard delivery: 4–6 business days. Express: 1–2 business days. Free shipping on orders above ₹499. We ship pan-India via vetted logistics partners."]},
  { h: "5. Returns & Refunds", p: ["Edible oil being a consumable, returns are accepted only if the bottle is unopened and the seal is intact, within 7 days of delivery. Refunds hit your account in 5–7 business days from approval."]},
  { h: "6. Intellectual Property", p: ["All content — photos, copy, logo, design — is the property of Laxmi Oils. Please don't rip it off."]},
  { h: "7. Liability", p: ["Every batch we ship is tested in our in-house lab and meets FSSAI standards. We're liable for the oil we sell you. We're not liable for what you cook with it. Use common sense in the kitchen."]},
  { h: "8. Governing Law", p: ["These Terms are governed by the laws of India, with jurisdiction in Jaipur, Rajasthan."]},
  { h: "9. Contact", p: ["Questions? hello@laxmioils.in"]},
]);

export const Privacy = policyPage("Privacy Policy.", "Your data, our promise", [
  { h: "What we collect", p: ["Only what we need to ship your oil and remember you nicely:", ["Name, email, phone, shipping address", "Order history", "Device & basic analytics (GA)", "Photos only if you choose to upload a review"]]},
  { h: "How we use it", p: [["Process and deliver your orders", "Send order + shipping updates", "Personalise the shopping experience", "Respond to support queries"]]},
  { h: "Who we share it with", p: ["Logistics partners (Delhivery, DTDC, etc.), payment processor (Razorpay), and nothing else. We never sell your data. Ever."]},
  { h: "Cookies", p: ["We use cookies for cart persistence, authentication, and anonymous analytics. You can disable them — some features may stop working."]},
  { h: "Your rights", p: [["Access, correct, or delete your data anytime — mail privacy@laxmioils.in", "Export your order history as JSON on request", "Unsubscribe from marketing via the link in every email"]]},
  { h: "Security", p: ["Data is encrypted in transit (TLS 1.3) and at rest. Passwords are bcrypt-hashed. We run regular audits."]},
  { h: "Children", p: ["We don't knowingly collect data from anyone under 18."]},
  { h: "Updates", p: ["If this policy changes, we'll email registered users and flag it on this page."]},
]);

export const FAQ = policyPage("FAQ.", "Your questions, our answers", [
  { h: "Do you have your own manufacturing unit?", p: ["No — and we're upfront about it. Laxmi partners with trusted small-batch wood-press mills across Rajasthan. What we do own is our quality control: every batch is tested in our in-house Jaipur lab before it's packaged and shipped."]},
  { h: "What does your lab actually test?", p: ["Purity (single-seed, no blending), Free Fatty Acid levels, moisture, peroxide value, and common adulterants. Fails any parameter → that batch doesn't ship. A QR code on every bottle links to its test report."]},
  { h: "Are your oils really cold-pressed?", p: ["Yes. Our partner mills use wood kolhus (low RPM, no heat above 40°C). We verify this with each batch we source."]},
  { h: "How long does shipping take?", p: ["Standard: 4–6 days · Express: 1–2 days. Orders are packed out of our Jaipur facility within 24 hours of placement."]},
  { h: "Do you deliver to my pincode?", p: ["We ship to 19,000+ Indian pincodes. Enter yours at checkout to confirm."]},
  { h: "Is cash on delivery available?", p: ["COD is available on orders up to ₹2,000 in select pincodes."]},
  { h: "Can I return an opened bottle?", p: ["Unfortunately not — food safety laws. But if the bottle is damaged or leaked, email us with a photo and we'll replace it instantly."]},
  { h: "Do you do B2B / bulk?", p: ["Yes — minimum 100L, custom grades, private label, and contract pricing. Head to the Bulk / B2B page and drop us a line."]},
  { h: "How should I store the oil?", p: ["Cool, dark place. Cap tight. Consume within 6 months of opening for peak flavour."]},
  { h: "Why is your oil pricier than the supermarket?", p: ["Two reasons — we only source from wood-kolhu mills (10× slower than refined oil plants), and we lab-test every batch at our cost. Shortcuts don't exist in our supply chain, and our price reflects that."]},
  { h: "How do I contact you?", p: ["WhatsApp: +91 98765 43210 · Email: hello@laxmioils.in · Mon–Sat, 10am–7pm IST."]},
]);

export default Terms;
