"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CouponBanner, WhatsAppButton } from "@/components/Promo";

const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any },
};

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}

function FloatingCart() {
  const { count, setDrawerOpen } = useCart();

  if (count === 0) return null;

  return (
    <motion.button
      data-testid="floating-cart"
      initial={{ scale: 0, y: 80 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0 }}
      onClick={() => setDrawerOpen(true)}
      className="md:hidden fixed bottom-5 right-5 z-30 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-5 py-3 font-black uppercase tracking-widest flex items-center gap-3 shadow-[6px_6px_0_0_#D98F00]"
    >
      <ShoppingBag size={18} strokeWidth={3} /> Cart
      <span className="bg-[#D98F00] text-[#1F3D2B] px-2 py-0.5 text-xs border-2 border-[#F5F1E8]">{count}</span>
    </motion.button>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="noise-overlay"></div>
        <div className="relative z-[2] min-h-screen flex flex-col bg-[#F5F1E8]">
          <CouponBanner />
          <Navbar />
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={pathname} {...pageAnim}>
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
          <CartDrawer />
          <FloatingCart />
          <WhatsAppButton />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
