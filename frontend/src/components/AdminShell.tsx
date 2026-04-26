"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/context/AuthContext";

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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="relative z-[2] min-h-screen flex flex-col bg-[#F8F7F4]">
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={pathname || 'admin'} {...pageAnim}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AuthProvider>
  );
}
