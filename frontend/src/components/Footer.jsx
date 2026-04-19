import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#1F3D2B] text-[#F5F1E8] border-t-[3px] border-[#1F3D2B]">
      <div className="px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Laxmi Oils" className="h-16 w-auto" />
            <div>
              <div className="font-display font-black text-xl text-[#F5F1E8] tracking-tight">Laxmi.</div>
              <div className="text-xs font-bold tracking-[0.25em] text-[#D98F00]">Edible Oils</div>
            </div>
          </div>
          <p className="mt-4 text-sm max-w-xs text-[#F5F1E8]/80">A Jaipur-based edible oils brand. Curated from trusted Rajasthan mills. Every batch tested in our in-house lab.</p>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Shop</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-[#D98F00]">All Oils</Link></li>
            <li><Link to="/products?cat=mustard" className="hover:text-[#D98F00]">Mustard</Link></li>
            <li><Link to="/products?cat=soyabean" className="hover:text-[#D98F00]">Soyabean</Link></li>
            <li><Link to="/products?cat=groundnut" className="hover:text-[#D98F00]">Groundnut</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Company</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/b2b" className="hover:text-[#D98F00]">Bulk / B2B</Link></li>
            <li><a href="#" className="hover:text-[#D98F00]">Our Story</a></li>
            <li><a href="#" className="hover:text-[#D98F00]">Blog</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-[#D98F00]">Help</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-[#D98F00]">FAQ</Link></li>
            <li><Link to="/terms" className="hover:text-[#D98F00]">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-[#D98F00]">Privacy Policy</Link></li>
            <li><Link to="/login" className="hover:text-[#D98F00]">Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="px-6 md:px-12 py-6 border-t border-[#F5F1E8]/15 flex flex-col md:flex-row justify-between text-xs uppercase tracking-[0.2em] text-[#F5F1E8]/70">
        <div>© 2026 Laxmi Oils · Made with love ❤️.</div>
        <div>Tested for purity. Trusted everywhere.</div>
      </div>
    </footer>
  );
}
