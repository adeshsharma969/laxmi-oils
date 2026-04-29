import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, MapPin, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { deliveryPromise, readDeliveryPincode, writeDeliveryPincode } from "../lib/delivery";

export default function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, updateQty, remove, subtotal } = useCart();
  const [pincode, setPincode] = useState(() => readDeliveryPincode());
  const shipping = subtotal > 499 ? 0 : 49;
  const deliveryText = deliveryPromise(pincode);
  const setDeliveryPin = (value) => {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setPincode(next);
    writeDeliveryPincode(next);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setDrawerOpen(false)} className="fixed inset-0 bg-[#1A1814]/60 z-50" />
          <motion.aside
            data-testid="cart-drawer"
            initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}}
            transition={{type:"spring", stiffness:300, damping:32}}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[440px] bg-[#F5F1E8] border-l-[3px] border-[#1F3D2B] z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b-[3px] border-[#1F3D2B] bg-[#D98F00]">
              <div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#1F3D2B]">Your Cart</div>
                <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B]">{items.length} Item{items.length!==1&&'s'}</div>
              </div>
              <button data-testid="close-cart" onClick={()=>setDrawerOpen(false)} className="touch-target w-10 h-10 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] flex items-center justify-center hover:bg-[#1F3D2B] hover:text-[#F5F1E8]"><X strokeWidth={3} size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              {items.length===0 && (
                <div className="text-center py-16 sm:py-20">
                  <div className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">Empty.</div>
                  <div className="text-xs sm:text-sm mt-2 text-[#1F3D2B]/80">Let's fill it with something pure.</div>
                </div>
              )}
              {items.map(it => (
                <motion.div key={it.key} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:60}} className="flex gap-2 sm:gap-3 border-[3px] border-[#1F3D2B] p-1.5 sm:p-2 bg-[#F5F1E8] shadow-[4px_4px_0_0_#1F3D2B]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-[#1F3D2B] flex-shrink-0" style={{background: it.bg}}>
                    <img src={it.image} alt={it.name} className="w-full h-full object-contain p-1"/>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] truncate leading-none mt-0.5">{it.name}</div>
                      <div className="text-[10px] sm:text-xs font-bold uppercase text-[#1F3D2B]/80 tracking-[0.12em] mt-0.5">{it.size}</div>
                    </div>
                    <div className="flex items-end justify-between gap-2 mt-1">
                      <div className="flex items-center border-2 border-[#1F3D2B] bg-white h-7 sm:h-8">
                        <button data-testid={`qty-dec-${it.key}`} onClick={()=>updateQty(it.key,-1)} className="touch-target-sm w-7 sm:w-8 h-full flex items-center justify-center hover:bg-[#D98F00]"><Minus size={12} strokeWidth={3}/></button>
                        <span className="w-6 sm:w-8 text-center font-black text-xs sm:text-sm">{it.qty}</span>
                        <button data-testid={`qty-inc-${it.key}`} onClick={()=>updateQty(it.key,1)} className="touch-target-sm w-7 sm:w-8 h-full flex items-center justify-center hover:bg-[#D98F00]"><Plus size={12} strokeWidth={3}/></button>
                      </div>
                      <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] leading-none">₹{it.price*it.qty}</div>
                    </div>
                  </div>
                  <button data-testid={`remove-${it.key}`} onClick={()=>remove(it.key)} className="touch-target-sm text-[#B8431A] self-start p-1 hover:bg-[#B8431A]/10 transition-colors"><Trash2 size={14} strokeWidth={3}/></button>
                </motion.div>
              ))}
            </div>

            {items.length>0 && (
              <div className="border-t-[3px] border-[#1F3D2B] p-4 sm:p-5 bg-[#F5F1E8]">
                <div className="flex justify-between items-end mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1F3D2B]">Subtotal</div>
                    <div className="text-[10px] font-bold text-[#1F3D2B]/70 mt-0.5">Shipping calculated at checkout</div>
                  </div>
                  <div data-testid="cart-subtotal" className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B] leading-none">₹{subtotal}</div>
                </div>
                <Link to="/checkout" onClick={()=>setDrawerOpen(false)} data-testid="checkout-link" className="touch-target block text-center w-full bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] py-3 sm:py-4 font-black uppercase tracking-[0.2em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors text-sm sm:text-base">
                  Checkout →
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
