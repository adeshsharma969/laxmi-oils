import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#1F3D2B] text-[#F5F1E8] border-t-[3px] border-[#D98F00]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Brand Section */}
          <div className="border-[3px] border-[#D98F00] bg-[#D98F00] p-6 shadow-[6px_6px_0_0_#0A0A0A]">
            <div>
              <div className="font-display font-black text-3xl text-[#1F3D2B] tracking-tighter mb-1">LAXMI</div>
              <div className="text-xs font-black tracking-[0.3em] text-[#1F3D2B] mb-4">EDIBLE OILS</div>
            </div>
            <p className="text-xs font-bold text-[#1F3D2B] leading-relaxed">
              Pure, cold-pressed oils from trusted Rajasthan mills. Lab-tested. No compromises.
            </p>
          </div>

          {/* Contact Section */}
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 shadow-[6px_6px_0_0_#1F3D2B]">
            <h4 className="font-display font-black text-lg text-[#1F3D2B] tracking-tight mb-5">CONNECT</h4>
            <div className="space-y-3.5">
              <a href="tel:+919999999999" className="flex items-start gap-3 group">
                <Phone size={18} className="text-[#D98F00] flex-shrink-0 mt-0.5 stroke-[3]" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#1F3D2B]/60 uppercase tracking-wider">Phone</span>
                  <span className="text-sm font-bold text-[#1F3D2B] group-hover:text-[#D98F00]">+91 9887651555</span>
                </div>
              </a>
              <a href="mailto:hello@laxmioils.in" className="flex items-start gap-3 group">
                <Mail size={18} className="text-[#D98F00] flex-shrink-0 mt-0.5 stroke-[3]" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#1F3D2B]/60 uppercase tracking-wider">Email</span>
                  <span className="text-sm font-bold text-[#1F3D2B] group-hover:text-[#D98F00]">hello@laxmioils.in</span>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D98F00] flex-shrink-0 mt-0.5 stroke-[3]" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#1F3D2B]/60 uppercase tracking-wider">Location</span>
                  <span className="text-sm font-bold text-[#1F3D2B]">Jaipur, Rajasthan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-[3px] border-[#1F3D2B] p-6 bg-[#1F3D2B]">
            <h4 className="font-display font-black text-lg text-[#D98F00] tracking-tight mb-5 uppercase">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">All Oils</Link></li>
              <li><Link to="/products?cat=mustard" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Mustard Oil</Link></li>
              <li><Link to="/products?cat=soyabean" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Soyabean Oil</Link></li>
              <li><Link to="/products?cat=groundnut" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Groundnut Oil</Link></li>
              <li><Link to="/b2b" className="touch-target-sm text-sm font-bold text-[#D98F00] hover:text-[#F5F1E8] transition-colors uppercase tracking-wide mt-3 border-t border-[#D98F00]/30 pt-2">Bulk / B2B</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="border-[3px] border-[#1F3D2B] p-6 bg-[#1F3D2B]">
            <h4 className="font-display font-black text-lg text-[#D98F00] tracking-tight mb-5 uppercase">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">FAQ</Link></li>
              <li><Link to="/terms" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Shipping Policy</Link></li>
              <li><Link to="/terms" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Returns Policy</Link></li>
              <li><Link to="/terms" className="touch-target-sm text-sm font-bold text-[#F5F1E8] hover:text-[#D98F00] transition-colors uppercase tracking-wide">Terms & Privacy</Link></li>
              <li><a href="mailto:hello@laxmioils.in" className="touch-target-sm text-sm font-bold text-[#D98F00] hover:text-[#F5F1E8] transition-colors uppercase tracking-wide mt-3 border-t border-[#D98F00]/30 pt-2">Contact Us</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-[3px] border-[#D98F00]"></div>

      {/* Bottom Bar */}
      <div className="bg-[#0A0A0A] px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
            <div className="text-xs font-bold text-[#F5F1E8]/70 text-center sm:text-left uppercase tracking-wider">
              © 2026 Laxmi Oils. Made in Jaipur, India.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="touch-target w-11 h-11 border-[2px] border-[#D98F00] flex items-center justify-center text-[#D98F00] hover:bg-[#D98F00] hover:text-[#0A0A0A] transition-all"><Instagram size={16} strokeWidth={2.5} /></a>
              <a href="#" className="touch-target w-11 h-11 border-[2px] border-[#D98F00] flex items-center justify-center text-[#D98F00] hover:bg-[#D98F00] hover:text-[#0A0A0A] transition-all"><Twitter size={16} strokeWidth={2.5} /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
