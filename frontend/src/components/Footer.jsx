import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#1F3D2B] text-[#F5F1E8]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="font-display font-black text-3xl lg:text-4xl text-[#D98F00] tracking-tighter mb-2">LAXMI</div>
              <div className="text-xs font-black tracking-[0.3em] text-[#F5F1E8]/80 mb-4">EDIBLE OILS</div>
            </div>
            <p className="text-sm text-[#F5F1E8]/70 leading-relaxed mb-6">
              Pure, cold-pressed oils from trusted Rajasthan mills. Lab-tested. No compromises on quality.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-[#D98F00]/20 border border-[#D98F00]/30 rounded-lg flex items-center justify-center text-[#D98F00] hover:bg-[#D98F00] hover:text-[#1F3D2B] transition-all">
                <Instagram size={18} strokeWidth={2} />
              </a>
              <a href="#" className="w-10 h-10 bg-[#D98F00]/20 border border-[#D98F00]/30 rounded-lg flex items-center justify-center text-[#D98F00] hover:bg-[#D98F00] hover:text-[#1F3D2B] transition-all">
                <Twitter size={18} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5F1E8] tracking-tight mb-6">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">All Products</Link></li>
              <li><Link href="/products?cat=mustard" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Mustard Oil</Link></li>
              <li><Link href="/products?cat=soyabean" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Soyabean Oil</Link></li>
              <li><Link href="/products?cat=groundnut" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Groundnut Oil</Link></li>
              <li><Link href="/products?cat=sunflower" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Sunflower Oil</Link></li>
              <li><Link href="/b2b" className="text-sm font-semibold text-[#D98F00] hover:text-[#F5F1E8] transition-colors mt-2 pt-2 border-t border-[#F5F1E8]/10">Bulk Orders</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5F1E8] tracking-tight mb-6">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/faq" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-policy" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns-policy" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Returns Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Terms & Privacy</Link></li>
              <li><Link href="/contact" className="text-sm text-[#F5F1E8]/80 hover:text-[#D98F00] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="font-display font-bold text-lg text-[#F5F1E8] tracking-tight mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#D98F00] flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#F5F1E8]">+91 9887651555</div>
                  <div className="text-xs text-[#F5F1E8]/60">Mon-Sat, 9AM-6PM</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#D98F00] flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#F5F1E8]">support@laxmioils.com</div>
                  <div className="text-xs text-[#F5F1E8]/60">We respond within 24hrs</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D98F00] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#F5F1E8]">Jaipur, Rajasthan</div>
                  <div className="text-xs text-[#F5F1E8]/60">India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#F5F1E8]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#F5F1E8]/60 text-center md:text-left">
              © 2026 Laxmi Oils. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-[#F5F1E8]/60">
              <span>Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
