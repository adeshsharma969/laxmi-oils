import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Truck, Star } from "lucide-react";
import Image from "next/image";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, TESTIMONIALS, BLOGS, TRUST } from "../data/mock";
import api from "../api/client";

const fadeUp = { initial:{opacity:0,y:30}, whileInView:{opacity:1,y:0}, viewport:{once:true,margin:"-60px"}, transition:{duration:0.6, ease:[0.22,1,0.36,1]} };

export default function Home() {
  const storyRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset:["start end","end start"] });
  const storyY = useTransform(scrollYProgress, [0,1], [60, -60]);
  const [bestsellers, setBestsellers] = useState([]);
  const [bestErr, setBestErr] = useState("");
  useEffect(() => {
    api.get("/products")
      .then(({data}) => {
        const categories = ['mustard', 'soyabean', 'groundnut', 'sunflower'];
        const categoryProducts = {};
        categories.forEach(cat => {
          const catProducts = data.filter(p => p.category === cat);
          categoryProducts[cat] = catProducts[Math.floor(Math.random() * catProducts.length)];
        });
        const selected = categories
          .map(cat => categoryProducts[cat])
          .filter(p => p)
          .map(p => ({...p, id: p.product_id}));
        setBestsellers(selected);
      })
      .catch(() => setBestErr("Could not load bestsellers right now."));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO BENTO */}
      <section className="px-4 sm:px-5 md:px-10 pt-6 md:pt-8 pb-12 md:pb-16">
        <div className="grid grid-cols-12 gap-3 md:gap-4 lg:gap-5">
          <motion.div {...fadeUp} className="col-span-12 lg:col-span-8 bg-[#D98F00] border-[3px] border-[#1F3D2B] p-4 sm:p-5 md:p-6 lg:p-10 relative overflow-hidden min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex flex-col justify-between brutal-shadow">
            <div className="eyebrow text-[#1F3D2B]">Better Oil. Better Life.</div>
            <div className="relative z-10">
              <h1 data-testid="hero-heading" className="font-display font-black text-[#1F3D2B] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.85] tracking-tighter uppercase">Pure<br/>Natural.<br/><span className="text-[#B8431A]">Trusted.</span></h1>
              <p className="mt-4 md:mt-5 max-w-lg font-body text-[#1F3D2B] text-sm sm:text-base md:text-lg font-medium">Cold-pressed oils, crafted in Jaipur.
Sourced from trusted wood-press mills across Rajasthan and
lab-tested for purity before reaching your home.</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6 md:mt-8">
              <Link to="/products" data-testid="hero-cta-shop" className="touch-target bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-5 sm:px-7 py-3 md:py-4 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1A1814] transition-all flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">Shop Oils <ArrowRight size={18} strokeWidth={3}/></Link>
              <Link to="/b2b" className="touch-target bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-5 sm:px-7 py-3 md:py-4 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all text-center sm:text-left text-sm sm:text-base">B2B Bulk →</Link>
            </div>
            <Image src="/logo.png" alt="Laxmi Oils" width={384} height={384} priority className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-32 sm:h-40 md:h-56 lg:h-72 xl:h-96 w-auto hidden md:block pointer-events-none drop-shadow-[0_4px_20px_rgba(31,61,43,0.3)]" />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 text-[#1F3D2B]/10 font-display font-black text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] leading-none select-none pointer-events-none">L</div>
          </motion.div>

          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4 lg:gap-5">
            {bestsellers[0] ? (
              <motion.div {...fadeUp} transition={{...fadeUp.transition, delay:0.1}} className="bg-[#2B2A28] border-[3px] border-[#1F3D2B] p-3 sm:p-4 md:p-5 text-[#F5F1E8] brutal-shadow relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-between">
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#D98F00]">Bestseller</div>
                <div>
                  <div className="font-display font-black text-xl sm:text-2xl md:text-3xl leading-tight">{bestsellers[0].name.replace(/Laxmi\s/i, "").replace(/\s*\(.*\)/, "")}</div>
                  <div className="text-xs sm:text-sm mt-1 md:mt-2 opacity-80">{bestsellers[0].sizes[0]?.label} · {bestsellers[0].category === "mustard" ? "Cold Pressed" : bestsellers[0].category === "soyabean" ? "Refined" : bestsellers[0].category === "groundnut" ? "Filtered" : "Light & Healthy"}</div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#D98F00]">₹{bestsellers[0].sizes[0]?.price || 0}</div>
                  <Link to={`/product/${bestsellers[0].id || bestsellers[0].product_id}`} className="touch-target w-10 h-10 border-2 border-[#F5F1E8] flex items-center justify-center hover:bg-[#D98F00] hover:text-[#1F3D2B]"><ArrowRight size={16} strokeWidth={3}/></Link>
                </div>
              </motion.div>
            ) : (
              <motion.div {...fadeUp} transition={{...fadeUp.transition, delay:0.1}} className="bg-[#2B2A28] border-[3px] border-[#1F3D2B] p-3 sm:p-4 md:p-5 text-[#F5F1E8] brutal-shadow relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col justify-between">
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#D98F00]">Bestseller</div>
                <div>
                  <div className="font-display font-black text-xl sm:text-2xl md:text-3xl leading-tight">Kachi Ghani Mustard</div>
                  <div className="text-xs sm:text-sm mt-1 md:mt-2 opacity-80">1L · Cold Pressed</div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#D98F00]">₹289</div>
                  <Link to="/product/mustard-1l" className="touch-target w-10 h-10 border-2 border-[#F5F1E8] flex items-center justify-center hover:bg-[#D98F00] hover:text-[#1F3D2B]"><ArrowRight size={16} strokeWidth={3}/></Link>
                </div>
              </motion.div>
            )}
            <motion.div {...fadeUp} transition={{...fadeUp.transition, delay:0.2}} className="bg-[#F5F1E8] border-[3px] border-[#1F3D2B] brutal-shadow relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
              <Image src="https://images.unsplash.com/photo-1515931215890-366d3990cf8d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" alt="cooking" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              <div className="absolute top-3 left-3 bg-[#B8431A] text-[#F5F1E8] px-2 py-1 text-xs font-black tracking-[0.12em] border-2 border-[#1F3D2B] rotate-[-3deg]">FRESH BATCH</div>
            </motion.div>
          </div>
        </div>

        {/* Trust numbers */}
        <motion.div {...fadeUp} className="mt-3 md:mt-4 flex flex-wrap lg:grid lg:grid-cols-4 border-[3px] border-[#1F3D2B]">
          {TRUST.map((t,i)=>(
            <div key={i} className={`flex-1 min-w-[45%] lg:min-w-0 p-3 sm:p-4 md:p-5 border-[#1F3D2B] ${i%2===0?"border-r-[3px]":""} ${i<2?"border-b-[3px] lg:border-b-0":""} lg:border-r-[3px] last:border-r-0`}>
              <div className="font-display font-black text-xl md:text-3xl text-[#1F3D2B] leading-none">{t.num}</div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-[#1F3D2B]/70 mt-0.5">{t.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <Marquee />

      {/* CATEGORIES */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20">
        <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 md:mb-10 gap-3">
          <div>
            <div className="eyebrow text-[#B8431A]">Four Oils. One Purity.</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#1F3D2B] tracking-tighter">Choose what fits you.</h2>
          </div>
          <Link to="/products" className="font-black uppercase text-xs sm:text-sm tracking-widest text-[#1F3D2B] border-b-[3px] border-[#1F3D2B] pb-1">Explore All →</Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((c,i)=>(
            <motion.div key={c.slug} initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5, delay:i*0.1, ease:[0.22,1,0.36,1]}}>
              <Link data-testid={`category-${c.slug}`} to={`/products?cat=${c.slug}`} className="block border-[3px] border-[#1F3D2B] brutal-shadow hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] hover:scale-[1.02] transition-all relative overflow-hidden h-[160px] sm:h-[220px] md:h-[260px]" style={{background:c.bg}}>
                <Image src={c.image} alt={c.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw" />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 text-white" style={{textShadow: "0 2px 8px rgba(0,0,0,0.8)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-[#D98F00]">0{i+1} · {c.tagline}</div>
                  <h3 className="font-black text-lg sm:text-xl md:text-2xl leading-tight uppercase mb-2 drop-shadow-md">{c.name}</h3>
                  <button className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-[1px] hover:text-[#D98F00] transition-all duration-300">
                    Shop Now 
                    <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY LAXMI */}
      <section className="bg-[#1F3D2B] text-[#F5F1E8] px-4 sm:px-5 md:px-10 py-12 md:py-20 border-y-[3px] border-[#1F3D2B]">
        <motion.div {...fadeUp}>
            <div className="eyebrow text-[#D98F00]">Why Laxmi</div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tighter mt-2 max-w-3xl">Small batch. High standards. No shortcuts.</h2>
        </motion.div>
        <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {[
            { icon: Leaf, title: "Partner-Pressed", desc: "No heat. No chemicals." },
            { icon: ShieldCheck, title: "Lab-Tested", desc: "Tested for purity & FFA." },
            { icon: Truck, title: "QR-Traceable", desc: "Fresh & verified dispatch." },
          ].map((f,i)=>{const Ic = f.icon; return (
            <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1, duration:0.5}} className="border-[3px] border-[#D98F00] p-4 sm:p-5 bg-[#1F3D2B] hover:bg-[#D98F00] hover:text-[#1F3D2B] transition-colors group flex items-start gap-4">
              <Ic size={28} strokeWidth={2.5} className="text-[#D98F00] group-hover:text-[#1F3D2B] flex-shrink-0 mt-1"/>
              <div>
                <div className="font-display font-black text-lg sm:text-xl">{f.title}</div>
                <div className="mt-1 text-[10px] sm:text-xs opacity-90 uppercase tracking-widest">{f.desc}</div>
              </div>
            </motion.div>
          );})}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20">
        <motion.div {...fadeUp} className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <div className="eyebrow text-[#B8431A]">Loved. Trusted. Reordered.</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1F3D2B] tracking-tighter">Bestsellers.</h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {bestsellers.map((p,i)=>(<ProductCard key={p.id} product={p} index={i} sizeIndex={Math.floor(Math.random() * p.sizes.length)}/>))}
        </div>
        {bestErr && <div className="mt-4 text-sm font-bold text-[#B8431A]">{bestErr}</div>}
      </section>

      {/* STORY PARALLAX */}
      <section ref={storyRef} className="bg-[#D98F00] px-4 sm:px-5 md:px-10 py-16 md:py-24 border-y-[3px] border-[#1F3D2B] relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <motion.div style={{y: storyY}} className="relative z-10">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#1F3D2B]">Our Story</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#1F3D2B] tracking-tighter mt-2 leading-[0.9]">
              Purity you can <span className="text-[#B8431A]">trust</span>.
            </h2>
            <p className="mt-4 md:mt-5 text-[#1F3D2B] text-sm sm:text-base md:text-lg max-w-md">Laxmi is a Jaipur-based edible oils brand. We partner with small-batch wood-press mills across Rajasthan — but we don't trust blindly. Every batch lands at our lab first, gets tested for purity, FFA, moisture, and adulteration. If it doesn't pass, it doesn't leave. Your bottle's QR code is our receipt.</p>
          </motion.div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <motion.img initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} src="https://images.unsplash.com/photo-1646476110859-f1d73d8436b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" alt="field" className="border-[3px] border-[#1F3D2B] h-40 sm:h-48 md:h-56 w-full object-cover brutal-shadow"/>
            <motion.img initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6, delay:0.1}} src="https://images.unsplash.com/photo-1671116810287-f2081bb6597a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600" alt="family" className="border-[3px] border-[#1F3D2B] h-40 sm:h-48 md:h-56 w-full object-cover brutal-shadow mt-6 md:mt-10"/>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20">
        <motion.div {...fadeUp}>
          <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">REAL KITCHENS. REAL TASTE.</div>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#1F3D2B] tracking-tighter">Loved in every home.</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6 md:mt-10">
          {TESTIMONIALS.map((t,i)=>(
            <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08, duration:0.5}} className="border-[3px] border-[#1F3D2B] p-4 sm:p-5 md:p-6 bg-[#F5F1E8] brutal-shadow">
<div className="flex gap-0.5">{Array(t.rating).fill(0).map((_,j)=><Star key={j} size={12} fill="#D98F00" stroke="#1F3D2B"/>)}</div>
              <p className="mt-3 md:mt-4 font-display font-bold text-lg sm:text-xl text-[#1F3D2B] leading-tight">"{t.quote}"</p>
              <div className="mt-3 md:mt-5 text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-[#1F3D2B]/70">{t.name} · {t.city}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BLOGS */}
      <section className="px-4 sm:px-5 md:px-10 py-12 md:py-20 bg-[#F5F1E8] border-t-[3px] border-[#1F3D2B]">
        <motion.div {...fadeUp}>
          <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">LEARN</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1F3D2B] tracking-tighter">Stories behind every drop.</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 md:mt-10">
          {BLOGS.map((b,i)=>(
            <motion.a key={b.id} href={`/blog/${b.id}`} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="brutal-card block group">
              <div className="h-40 sm:h-44 md:h-52 border-b-[3px] border-[#1F3D2B] overflow-hidden relative">
                <Image src={b.image} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/70"><span>{b.tag}</span><span>{b.read}</span></div>
                <div className="font-display font-black text-lg sm:text-xl md:text-2xl text-[#1F3D2B] mt-2 leading-tight">{b.title}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}
