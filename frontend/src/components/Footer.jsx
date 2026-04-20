import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#1F3D2B] text-[#F5F1E8] border-t-[3px] border-[#1F3D2B]">
      <div className="px-4 sm:px-6 md:px-12 py-12 md:py-16 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Laxmi Oils" className="h-12 sm:h-16 w-auto" />
            <div>
              <div className="font-display font-black text-lg sm:text-xl text-[#F5F1E8] tracking-tight">Laxmi.</div>
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#D98F00]">Edible Oils</div>
            </div>
          </div>
          <p className="mt-3 md:mt-4 text-xs sm:text-sm max-w-xs text-[#F5F1E8]/80">A Jaipur-based edible oils brand. Curated from trusted Rajasthan mills. Every batch tested in our in-house lab.</p>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Shop</div>
          <ul className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 text-xs sm:text-sm">
            <li><Link to="/products" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">All Oils</Link></li>
            <li><Link to="/products?cat=mustard" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Mustard</Link></li>
            <li><Link to="/products?cat=soyabean" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Soyabean</Link></li>
            <li><Link to="/products?cat=groundnut" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Groundnut</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Company</div>
          <ul className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 text-xs sm:text-sm">
            <li><Link to="/b2b" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Bulk / B2B</Link></li>
            <li><a href="#" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Our Story</a></li>
            <li><a href="#" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Blog</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Help</div>
          <ul className="mt-3 md:mt-4 space-y-1.5 md:space-y-2 text-xs sm:text-sm">
            <li><Link to="/faq" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">FAQ</Link></li>
            <li><Link to="/terms" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Terms</Link></li>
            <li><Link to="/privacy" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Privacy</Link></li>
            <li><Link to="/login" className="hover:text-[#D98F00] touch-target-sm inline-flex items-center">Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-12 py-4 md:py-6 border-t border-[#F5F1E8]/15 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F5F1E8]/70">
        <div>© 2026 Laxmi Oils · Made with love ❤️.</div>
        <div>Tested for purity. Trusted everywhere.</div>
      </div>
    </footer>
  );
}
