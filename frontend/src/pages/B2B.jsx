import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Truck, Package, Users, Phone } from "lucide-react";
import api from "../api/client";

export default function B2B() {
  const [form, setForm] = useState({ company:"", name:"", email:"", phone:"", volume:"", message:"" });
  const [sent, setSent] = useState(false);
  const submit = async (e) => { e.preventDefault(); try { await api.post("/b2b/leads", form); setSent(true); } catch (err) { alert("Failed: " + (err?.response?.data?.detail || err.message)); } };

  return (
    <div data-testid="b2b-page">
      {/* HERO */}
      <section className="bg-[#1F3D2B] text-[#F5F1E8] px-4 sm:px-5 md:px-10 py-16 sm:py-20 md:py-24 lg:py-32 border-b-[3px] border-[#1F3D2B] relative overflow-hidden">
        <div className="max-w-5xl relative z-10">
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#D98F00] border-2 border-[#D98F00] px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Users size={14} /> For Businesses
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.88] tracking-tighter mt-2 uppercase">
              Bulk oils.<br/>
              <span className="text-[#D98F00]">Consistent quality.</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg max-w-xl opacity-90 leading-relaxed">
              Hotels · Cloud kitchens · Halwais · Retailers.<br className="hidden sm:block"/>
              Monthly contracts from 50L to 50,000L. Lab-tested, pan-India logistics, no middlemen.
            </p>
          </motion.div>
        </div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 font-display font-black text-[#D98F00]/10 text-[10rem] sm:text-[15rem] lg:text-[20rem] leading-none select-none pointer-events-none">B2B</div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20 bg-[#F5F1E8]">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-8 md:mb-12">
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Why Partner With Us</div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#1F3D2B] tracking-tighter mt-2">Built for scale. Tested for purity.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[
            {icon:ShieldCheck, t:"Lab-Tested Quality", d:"Every batch tested in our Jaipur for purity, FFA, and adulteration. QR-traceable from mill to delivery."},
            {icon:Package, t:"Flexible Volumes", d:"From 50L starter packs to 50,000L contracts. Scale up as your business grows."},
            {icon:Truck, t:"Pan-India Logistics", d:"FTL/LTL delivery to 200+ cities. Temperature-controlled transport for freshness."}
          ].map((b,i)=>{const Ic=b.icon; return (
            <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="border-[3px] border-[#1F3D2B] bg-white p-5 sm:p-6 md:p-8 brutal-shadow hover:translate-y-[-4px] transition-transform">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D98F00] border-[3px] border-[#1F3D2B] flex items-center justify-center">
                <Ic size={24} sm:size={28} strokeWidth={2} className="text-[#1F3D2B]"/>
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B] mt-4 sm:mt-5">{b.t}</div>
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#1F3D2B]/80 leading-relaxed">{b.d}</div>
            </motion.div>
          );})}
        </div>
      </section>

      {/* PRICING + FORM */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20 bg-[#D98F00] border-y-[3px] border-[#1F3D2B]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-start max-w-6xl mx-auto">
          {/* Pricing Table */}
          <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="bg-[#F5F1E8] border-[3px] border-[#1F3D2B] p-5 sm:p-6 md:p-8 brutal-shadow-lg">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Volume Discounts</div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B] mt-2 tracking-tighter">Honest pricing.<br/>No hidden costs.</h3>
            <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              {[["100L+","15% off","Small hotels"],["1,000L+","22% off","Cloud kitchens"],["10,000L+","30% off + free","Large retailers"],["50,000L+","Custom","Enterprise"]].map(([vol,off,tag])=>(
                <li key={vol} className="border-2 border-[#1F3D2B] bg-white p-3 sm:p-4 flex items-center justify-between">
                  <div>
                    <span className="font-display font-black text-lg sm:text-xl text-[#1F3D2B] block">{vol}</span>
                    <span className="text-[10px] sm:text-xs text-[#1F3D2B]/60 uppercase tracking-wide">{tag}</span>
                  </div>
                  <span className="font-black text-[#B8431A] text-sm sm:text-lg">{off}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#1F3D2B]/80">
              <Phone size={14} sm:size={16} />
              <span>Need a custom quote? Call: <a href="tel:+919999999999" className="font-bold underline">+91 9999-999-999</a></span>
            </div>
          </motion.div>

          {/* Contact Form */}
          {sent ? (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} data-testid="b2b-success" className="border-[3px] border-[#1F3D2B] bg-[#1F3D2B] text-[#F5F1E8] p-6 sm:p-10 text-center brutal-shadow h-full flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#D98F00] flex items-center justify-center mb-4 sm:mb-6"><Check size={36} sm:size={48} strokeWidth={4}/></div>
              <div className="font-display font-black text-3xl sm:text-4xl text-[#D98F00]">Got it!</div>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg">Our B2B desk will call you within 24 hours.</p>
              <button onClick={()=>setSent(false)} className="touch-target-sm mt-6 sm:mt-8 border-2 border-[#F5F1E8]/30 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm uppercase tracking-widest hover:border-[#F5F1E8] transition-colors mx-auto">Send another enquiry</button>
            </motion.div>
          ) : (
            <motion.form onSubmit={submit} initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} data-testid="b2b-form" className="border-[3px] border-[#1F3D2B] bg-white p-4 sm:p-6 md:p-8 brutal-shadow">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Get Started</div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B] mt-1 mb-4 sm:mb-6">Talk to our team.</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Company / Outlet</div>
                    <input required data-testid="b2b-company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors"/>
                  </label>
                  <label>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Your Name</div>
                    <input required data-testid="b2b-name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors"/>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Email</div>
                    <input required type="email" data-testid="b2b-email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors"/>
                  </label>
                  <label>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Phone</div>
                    <input required type="tel" data-testid="b2b-phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors"/>
                  </label>
                </div>
                <label>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Monthly Volume (Litres)</div>
                  <select data-testid="b2b-volume" value={form.volume} onChange={e=>setForm({...form,volume:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors">
                    <option value="">Select volume range</option>
                    <option value="100-1000">100L - 1,000L</option>
                    <option value="1000-10000">1,000L - 10,000L</option>
                    <option value="10000-50000">10,000L - 50,000L</option>
                    <option value="50000+">50,000L+</option>
                  </select>
                </label>
                <label>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Message (Optional)</div>
                  <textarea data-testid="b2b-message" rows={3} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us about your requirements..." className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 sm:py-3 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/20 transition-colors resize-none"/>
                </label>
              </div>
              <button type="submit" data-testid="b2b-submit" className="touch-target mt-4 sm:mt-6 w-full bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] py-3 sm:py-4 font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-all hover:shadow-[4px_4px_0_0_#1F3D2B] text-sm sm:text-base">Send Enquiry →</button>
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-[#1F3D2B]/60 text-center">We typically respond within 4 business hours.</p>
            </motion.form>
          )}
        </div>
      </section>

    </div>
  );
}
