import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#1F3D2B] text-[#F5F1E8]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand & Contact Column */}
          <div className="lg:col-span-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="Laxmi Oils" className="h-14 sm:h-16 md:h-18 w-auto" />
              <div>
                <div className="font-display font-black text-lg text-[#F5F1E8] tracking-tight">Laxmi.</div>
                <div className="text-xs font-bold tracking-[0.2em] text-[#D98F00]">Edible Oils</div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-[#F5F1E8]/80 leading-relaxed mb-6 max-w-md">
              A Jaipur-based edible oils brand. Curated from trusted Rajasthan mills. Every batch tested in our in-house lab for purity and quality.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+919999999999" className="flex items-center gap-3 text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors group">
                <div className="w-9 h-9 border border-[#D98F00]/30 flex items-center justify-center group-hover:border-[#D98F00] transition-colors">
                  <Phone size={16} className="text-[#D98F00]" />
                </div>
                <span>+91 9999-999-999</span>
              </a>
              <a href="mailto:hello@laxmioils.in" className="flex items-center gap-3 text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors group">
                <div className="w-9 h-9 border border-[#D98F00]/30 flex items-center justify-center group-hover:border-[#D98F00] transition-colors">
                  <Mail size={16} className="text-[#D98F00]" />
                </div>
                <span>hello@laxmioils.in</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#F5F1E8]/80">
                <div className="w-9 h-9 border border-[#D98F00]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-[#D98F00]" />
                </div>
                <span>Jaipur, Rajasthan, India</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6">
              {/* Shop */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D98F00] mb-4">Shop</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/products" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">All Oils</Link></li>
                  <li><Link to="/products?cat=mustard" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Mustard Oil</Link></li>
                  <li><Link to="/products?cat=soyabean" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Soyabean Oil</Link></li>
                  <li><Link to="/products?cat=groundnut" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Groundnut Oil</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D98F00] mb-4">Company</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/b2b" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Bulk / B2B</Link></li>
                  <li><Link to="/faq" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Our Story & FAQ</Link></li>
                  <li><Link to="/blog/1" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Blog</Link></li>
                  <li><Link to="/terms" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Company Terms</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#D98F00] mb-4">Support</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/faq" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">FAQ</Link></li>
                  <li><Link to="/terms" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Shipping Policy</Link></li>
                  <li><Link to="/terms" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Returns Policy</Link></li>
                  <li><a href="mailto:hello@laxmioils.in" className="touch-target-sm inline-flex items-center text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#F5F1E8]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#F5F1E8]/60">
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2">
              <Link to="/terms" className="hover:text-[#D98F00] transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-[#D98F00] transition-colors">Privacy</Link>
              <Link to="/login" className="hover:text-[#D98F00] transition-colors">Login</Link>
            </div>
            <div className="text-center sm:text-right">
              © 2026 Laxmi Oils. Made with love in Jaipur.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
