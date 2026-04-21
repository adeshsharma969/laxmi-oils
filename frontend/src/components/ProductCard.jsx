import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product, index=0 }) {
  const size = product.sizes[0];
  return (
    <motion.div
      initial={{opacity:0, y:30}}
      whileInView={{opacity:1, y:0}}
      viewport={{once:true, margin:"-50px"}}
      transition={{duration:0.5, delay:index*0.06, ease:[0.22,1,0.36,1]}}
      data-testid={`product-card-${product.id}`}
      className="brutal-card group flex flex-col h-full"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="relative h-44 sm:h-48 md:h-52 lg:h-56 overflow-hidden border-b-[3px] border-[#1F3D2B]" style={{background: product.bg}}>
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply"
            whileHover={{scale:1.08}}
            transition={{duration:0.6, ease:[0.22,1,0.36,1]}}
          />
          {/* Size Badge - Prominent */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[#D98F00] text-[#1F3D2B] px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#1F3D2B]">
            {size.label}
          </div>
          {/* Category Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#1F3D2B] text-[#F5F1E8] px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border-2 border-[#F5F1E8]">
            {product.category}
          </div>
        </div>
        <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-[8px] sm:text-[10px] font-black tracking-[0.3em] uppercase text-[#1F3D2B]/60">{product.rating}★</div>
            {product.badge && (
              <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-[#B8431A]">{product.badge === "BULK" ? "Bulk Deal" : product.badge}</div>
            )}
          </div>
          <h3 className="font-display font-black text-base sm:text-lg md:text-xl text-[#1F3D2B] mt-1 leading-tight line-clamp-2">{product.name.replace(/([a-z])-([0-9])/i, "$1 – $2")}</h3>
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div>
              <div className="text-sm sm:text-base font-black uppercase tracking-wider text-[#1F3D2B]">₹{size.price}</div>
              <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[#1F3D2B]/40">{size.label}</div>
            </div>
            <div className="touch-target w-9 h-9 sm:w-10 sm:h-10 border-[3px] border-[#1F3D2B] bg-[#D98F00] flex items-center justify-center group-hover:bg-[#B8431A] group-hover:text-[#F5F1E8] transition-colors">
              <ShoppingCart size={16} strokeWidth={3}/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
