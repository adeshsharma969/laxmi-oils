import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ArrowLeft, MapPin, Truck } from "lucide-react";
import Image from "next/image";
import api from "../api/client";
import { GALLERY } from "../data/mock";
import { useCart } from "../context/CartContext";
import { deliveryPromise, readDeliveryPincode, writeDeliveryPincode } from "../lib/delivery";

export default function ProductDetail() {
  const params = useParams();
  if (!params) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [pincode, setPincode] = useState(() => readDeliveryPincode());
  const { add } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then(({data}) => { setProduct(data); setSize(data.sizes[0]); })
      .catch(()=>setProduct(false))
      .finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  if (!product) return <div className="p-10 font-display text-3xl">Product not found. <Link to="/products" className="underline">Back to shop.</Link></div>;

  const gallery = (product.images?.length > 0
    ? product.images.filter(Boolean)
    : Array.from(new Set([product.image, ...(GALLERY[product.category]||[])])).filter(Boolean)).slice(0,4);
  const handleAdd = () => { for (let i=0;i<qty;i++) add({...product, id: product.product_id}, size); };
  const setDeliveryPin = (value) => {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setPincode(next);
    writeDeliveryPincode(next);
  };

  return (
    <div data-testid="product-detail" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <Link to="/products" className="touch-target-sm inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-4 md:mb-6 hover:text-[#B8431A]"><ArrowLeft size={14} strokeWidth={3}/> Back to shelf</Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.6}} className="lg:col-span-7">
          <div className="border-[3px] border-[#1F3D2B] brutal-shadow relative overflow-hidden" style={{background: product.bg, minHeight:"240px"}}>
            <AnimatePresence mode="wait">
              <motion.div key={activeImg} initial={{opacity:0, scale:1.04}} animate={{opacity:1, scale:1}} exit={{opacity:0}} transition={{duration:0.4}} className="relative w-full h-[240px] sm:h-[340px] md:h-[400px] lg:h-[480px]">
                <Image src={gallery[activeImg]} alt={product.name} fill className="object-contain p-2" sizes="(max-width: 1024px) 100vw, 58vw" priority />
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-[#F5F1E8] text-[#1F3D2B] px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B]">{product.category}</div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#B8431A] text-[#F5F1E8] px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] rotate-3">{product.badge}</div>
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-[#F5F1E8]/90 p-1.5 border-2 border-[#1F3D2B]">
              {gallery.map((src,i)=>(
                <button key={i} data-testid={`thumb-${i}`} onClick={()=>setActiveImg(i)} className={`w-8 h-8 sm:w-10 sm:h-10 border-2 overflow-hidden aspect-square transition-all relative ${activeImg===i?"border-[#B8431A]":"border-[#1F3D2B]/20 hover:border-[#1F3D2B]/50"}`} style={{background:product.bg}}>
                  <Image src={src} alt="" fill className="object-contain" sizes="40px" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.6}} className="lg:col-span-5">
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#1F3D2B] tracking-tighter leading-[0.95]">{product.name}</h1>
          <p className="mt-3 sm:mt-4 text-[#1F3D2B]/80 text-sm sm:text-base md:text-lg">{product.description}</p>

          {/* Mobile Layout: Pack size left, total right (NO CTA HERE, moved to sticky bottom) */}
          <div className="mt-5 sm:mt-8">
            <div className="sm:hidden flex items-end justify-between gap-2 pb-2 border-b-2 border-[#1F3D2B]/10">
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1F3D2B]/60 mb-1.5">Pack Size</div>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map(s=>(
                    <button key={s.label} data-testid={`size-${s.label}`} onClick={()=>setSize(s)} className={`touch-target px-2 py-1.5 border-[2px] font-black uppercase tracking-wider transition-all text-[10px] ${size.label===s.label?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1F3D2B]/60 mb-0.5">Total</div>
                <div data-testid="pdp-price" className="font-display font-black text-2xl text-[#1F3D2B] leading-none">₹{size.price*qty}</div>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Original */}
          <div className="mt-6 sm:mt-8 hidden sm:block">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-2 sm:mb-3">Pack Size</div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {product.sizes.map(s=>(
                <button key={s.label} data-testid={`size-${s.label}`} onClick={()=>setSize(s)} className={`touch-target px-3 sm:px-5 py-2 sm:py-3 border-[3px] font-black uppercase tracking-wider transition-all text-xs sm:text-sm ${size.label===s.label?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B] shadow-[4px_4px_0_0_#1A1814]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            {/* Desktop Layout: Original side-by-side */}
            <div className="hidden sm:flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              <div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/60">Total</div>
                <div data-testid="pdp-price" className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#1F3D2B]">₹{size.price*qty}</div>
              </div>
              <div className="flex items-center border-[3px] border-[#1F3D2B]">
                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="touch-target w-10 sm:w-11 h-10 sm:h-11 flex items-center justify-center hover:bg-[#D98F00]"><Minus size={14} strokeWidth={3}/></button>
                <span data-testid="pdp-qty" className="w-8 sm:w-10 text-center font-black text-base sm:text-lg">{qty}</span>
                <button onClick={()=>setQty(q=>q+1)} className="touch-target w-10 sm:w-11 h-10 sm:h-11 flex items-center justify-center hover:bg-[#D98F00]"><Plus size={14} strokeWidth={3}/></button>
              </div>
            </div>
          </div>

          <motion.button whileTap={{scale:0.96}} data-testid="add-to-cart-btn" onClick={handleAdd} className="hidden sm:block touch-target mt-4 sm:mt-5 w-full bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-6 sm:px-8 py-4 sm:py-5 font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-base sm:text-lg hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all">
            Add to Cart →
          </motion.button>

          <div className="mt-4 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#B8431A]">
              <Truck size={14} strokeWidth={3}/> Delivery
            </div>
            <div className="mt-2 flex gap-1.5">
              <label className="relative flex-1">
                <MapPin size={14} strokeWidth={3} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1F3D2B]"/>
                <input
                  value={pincode}
                  onChange={(event)=>setDeliveryPin(event.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Pincode"
                  className="touch-target-sm w-full border-2 border-[#1F3D2B] bg-white py-1.5 pl-8 pr-2 text-xs font-black text-[#1F3D2B] outline-none focus:bg-[#D98F00]/25"
                />
              </label>
              <div className="border-2 border-[#1F3D2B] bg-[#D98F00]/35 px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#1F3D2B] flex items-center justify-center min-w-[90px] text-center">
                {deliveryPromise(pincode).replace(/Delivery by /i, "")}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-8 flex flex-wrap gap-2">
            {(product.benefits||[]).map(b=>(
              <div key={b} className="flex items-center gap-1 border-2 border-[#1F3D2B] px-2 py-1 bg-[#F5F1E8]">
                <Check size={10} strokeWidth={3} className="text-[#B8431A] flex-shrink-0"/>
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1F3D2B]">{b}</span>
              </div>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-[#F5F1E8] border-t-[3px] border-[#1F3D2B] p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex gap-2">
        <div className="flex items-center border-[2px] border-[#1F3D2B] bg-white w-24 flex-shrink-0 justify-between px-1">
          <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="touch-target-sm w-8 h-8 flex items-center justify-center hover:bg-[#D98F00]"><Minus size={12} strokeWidth={3}/></button>
          <span className="font-black text-xs">{qty}</span>
          <button onClick={()=>setQty(q=>q+1)} className="touch-target-sm w-8 h-8 flex items-center justify-center hover:bg-[#D98F00]"><Plus size={12} strokeWidth={3}/></button>
        </div>
        <motion.button whileTap={{scale:0.96}} onClick={handleAdd} className="flex-1 bg-[#D98F00] text-[#1F3D2B] border-[2px] border-[#1F3D2B] font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 touch-target">
          Add <span className="hidden min-[360px]:inline">to Cart</span> • ₹{size.price*qty}
        </motion.button>
      </div>

    </div>
  );
}
