import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function ProductCard({ product, index=0, sizeIndex=0 }) {
  const size = product.sizes[sizeIndex] || product.sizes[0];
  return (
    <motion.div
      initial={{opacity:0, y:30}}
      whileInView={{opacity:1, y:0}}
      viewport={{once:true, margin:"-50px"}}
      whileTap={{ scale: 0.97 }}
      transition={{duration:0.5, delay:index*0.06, ease:[0.22,1,0.36,1]}}
      data-testid={`product-card-${product.id}`}
      className="brutal-card group flex flex-col h-full cursor-pointer"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <div className="relative h-44 sm:h-48 md:h-52 lg:h-56 overflow-hidden border-b-[3px] border-[#1F3D2B]" style={{background: product.bg}}>
          {(product.images?.[0] || product.image) && (
            <div className="relative w-full h-full">
              <Image
                src={product.images?.[0] || product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          )}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-[#D98F00] text-[#1F3D2B] px-2.5 py-1 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#1F3D2B]">
            {size.label}
          </div>
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#1F3D2B] text-[#F5F1E8] px-2 py-0.5 sm:py-1 text-xs font-black uppercase tracking-[0.16em] border-2 border-[#F5F1E8]">
            {product.category}
          </div>
        </div>
        <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="font-display font-black text-sm sm:text-base md:text-lg text-[#1F3D2B] leading-tight line-clamp-2">{product.name.replace(/([a-z])-([0-9])/i, "$1 – $2")}</h3>
          {product.badge && (
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#B8431A]">{product.badge === "BULK" ? "Bulk Deal" : product.badge}</div>
          )}
          <div className="flex items-end justify-between mt-2 sm:mt-3">
            <div>
              <div className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-[#1F3D2B]">₹{size.price}</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#1F3D2B]/70">{size.label}</div>
            </div>
            <motion.div
              whileHover={{ scale: 1.12, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="touch-target w-8 h-8 sm:w-9 sm:h-9 border-[3px] border-[#1F3D2B] bg-[#D98F00] flex items-center justify-center group-hover:bg-[#B8431A] group-hover:text-[#F5F1E8] transition-colors"
            >
              <ShoppingCart size={14} strokeWidth={3}/>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
