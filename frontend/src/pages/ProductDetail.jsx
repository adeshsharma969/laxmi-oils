import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, Star, ArrowLeft } from "lucide-react";
import api from "../api/client";
import { GALLERY } from "../data/mock";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const params = useParams();
  if (!params) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then(({data}) => { setProduct(data); setSize(data.sizes[0]); })
      .catch(()=>setProduct(false))
      .finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  if (!product) return <div className="p-10 font-display text-3xl">Product not found. <Link to="/products" className="underline">Back to shop.</Link></div>;

  const gallery = Array.from(new Set([product.image, ...(GALLERY[product.category]||[])])).slice(0,4);
  const handleAdd = () => { for (let i=0;i<qty;i++) add({...product, id: product.product_id}, size); };

  return (
    <div data-testid="product-detail" className="px-5 md:px-10 py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-6 hover:text-[#B8431A]"><ArrowLeft size={14} strokeWidth={3}/> Back to shelf</Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.6}} className="lg:col-span-7">
          <div className="border-[3px] border-[#1F3D2B] brutal-shadow relative overflow-hidden" style={{background: product.bg, minHeight:"520px"}}>
            <AnimatePresence mode="wait">
              <motion.img key={activeImg} initial={{opacity:0, scale:1.04}} animate={{opacity:1, scale:1}} exit={{opacity:0}} transition={{duration:0.4}} src={gallery[activeImg]} alt={product.name} className="w-full h-[520px] object-cover mix-blend-multiply"/>
            </AnimatePresence>
            <div className="absolute top-5 left-5 bg-[#F5F1E8] text-[#1F3D2B] px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-[#1F3D2B]">{product.category}</div>
            <div className="absolute top-5 right-5 bg-[#B8431A] text-[#F5F1E8] px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-[#1F3D2B] rotate-3">{product.badge}</div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {gallery.map((src,i)=>(
              <button key={i} data-testid={`thumb-${i}`} onClick={()=>setActiveImg(i)} className={`border-[3px] overflow-hidden aspect-square transition-all ${activeImg===i?"border-[#B8431A] shadow-[4px_4px_0_0_#1F3D2B]":"border-[#1F3D2B] hover:-translate-y-0.5"}`} style={{background:product.bg}}>
                <img src={src} alt="" className="w-full h-full object-cover mix-blend-multiply"/>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.6}} className="lg:col-span-5">
          <div className="flex items-center gap-1">{Array(5).fill(0).map((_,i)=><Star key={i} size={16} fill={i<Math.floor(product.rating)?"#D98F00":"none"} stroke="#1F3D2B"/>)}<span className="ml-2 text-xs font-bold text-[#1F3D2B]">{product.rating} · {product.reviews} reviews</span></div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1F3D2B] tracking-tighter mt-3 leading-[0.95]">{product.name}</h1>
          <p className="mt-4 text-[#1F3D2B]/80 text-base md:text-lg">{product.description}</p>

          <div className="mt-8">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-3">Pack Size</div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(s=>(
                <button key={s.label} data-testid={`size-${s.label}`} onClick={()=>setSize(s)} className={`px-5 py-3 border-[3px] font-black uppercase tracking-wider transition-all ${size.label===s.label?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B] shadow-[4px_4px_0_0_#1A1814]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>
                  {s.label} <span className="ml-1 opacity-80">₹{s.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-end gap-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60">Total</div>
              <div data-testid="pdp-price" className="font-display font-black text-4xl md:text-5xl text-[#1F3D2B]">₹{size.price*qty}</div>
            </div>
            <div className="flex items-center border-[3px] border-[#1F3D2B]">
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-10 h-11 flex items-center justify-center hover:bg-[#D98F00]"><Minus size={14} strokeWidth={3}/></button>
              <span data-testid="pdp-qty" className="w-10 text-center font-black text-lg">{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} className="w-10 h-11 flex items-center justify-center hover:bg-[#D98F00]"><Plus size={14} strokeWidth={3}/></button>
            </div>
          </div>

          <motion.button whileTap={{scale:0.96}} data-testid="add-to-cart-btn" onClick={handleAdd} className="mt-5 w-full bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-8 py-5 font-black uppercase tracking-[0.25em] text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all">
            Add to Cart →
          </motion.button>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {(product.benefits||[]).map(b=>(
              <div key={b} className="flex items-center gap-2 border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]">
                <Check size={14} strokeWidth={3} className="text-[#B8431A]"/>
                <span className="text-xs font-black uppercase tracking-wider text-[#1F3D2B]">{b}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-5">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B]">Nutrition (per 100g)</div>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {Object.entries(product.nutrition||{}).map(([k,v])=>(
                <div key={k}><div className="font-display font-black text-xl text-[#1F3D2B]">{v}</div><div className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]/60">{k}</div></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
