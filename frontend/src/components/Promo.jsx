import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

export function CouponBanner() {
  const [open, setOpen] = useState(() => typeof window === "undefined" ? true : localStorage.getItem("laxmi_coupon_dismissed") !== "1");
  const [copied, setCopied] = useState(false);
  const dismiss = () => { if (typeof window !== "undefined") localStorage.setItem("laxmi_coupon_dismissed","1"); setOpen(false); };
  const copy = () => { navigator.clipboard.writeText("LAXMI100"); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  return (
    <AnimatePresence>
      {open && (
        <motion.div data-testid="coupon-banner" initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="sticky top-0 z-50 bg-[#B8431A] text-[#F5F1E8] border-b-[3px] border-[#1F3D2B] overflow-hidden">
          <div className="relative flex items-center justify-center gap-3 px-4 md:px-10 py-2.5">
            <div className="flex items-center gap-3 text-xs md:text-sm font-black uppercase tracking-widest">
              <span className="hidden sm:inline">🎉</span>
              <span>First order? Flat <span className="text-[#D98F00]">₹100 OFF</span> with code</span>
              <button data-testid="copy-coupon" onClick={copy} className="bg-[#1F3D2B] text-[#D98F00] border-2 border-[#F5F1E8] px-2 py-0.5 font-mono flex items-center gap-1.5 hover:bg-[#F5F1E8] hover:text-[#1F3D2B]">
                LAXMI100 {copied ? <Check size={12} strokeWidth={3}/> : <Copy size={12} strokeWidth={3}/>}
              </button>
            </div>
            <button data-testid="close-coupon" onClick={dismiss} className="absolute right-4 md:right-10 w-6 h-6 border-2 border-[#F5F1E8] flex items-center justify-center hover:bg-[#F5F1E8] hover:text-[#B8431A]"><X size={12} strokeWidth={3}/></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function WhatsAppButton() {
  return (
    <motion.a
      data-testid="whatsapp-btn"
      href="https://wa.me/919876543210?text=Hi%20Laxmi%20Oils%2C%20I%27d%20like%20to%20order"
      target="_blank" rel="noopener noreferrer"
      initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.8, type:"spring"}}
      whileHover={{scale:1.08, rotate:-3}}
      className="fixed bottom-5 left-5 z-30 w-14 h-14 rounded-full bg-[#25D366] text-white border-[3px] border-[#1F3D2B] flex items-center justify-center shadow-[6px_6px_0_0_#1F3D2B]"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.3c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2.1-1.5.3-.8.3-1.4.2-1.5 0-.2-.3-.3-.6-.5zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
    </motion.a>
  );
}
