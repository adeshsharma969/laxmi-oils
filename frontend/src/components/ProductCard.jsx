import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, index=0, sizeIndex=0 }) {
  const { add } = useCart();
  const size = product.sizes[sizeIndex] || product.sizes[0];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, size);
  };

  return (
    <motion.div
      initial={{opacity:0, y:30}}
      whileInView={{opacity:1, y:0}}
      viewport={{once:true, margin:"-50px"}}
      transition={{duration:0.5, delay:index*0.06, ease:[0.22,1,0.36,1]}}
      data-testid={`product-card-${product.id}`}
      className="brutal-card group flex flex-col h-full overflow-hidden"
    >
      {/* Product Tags Header */}
      <div className="flex justify-between items-stretch border-b-[3px] border-[#1F3D2B] bg-[#F5F1E8]">
        <div className="bg-[#D98F00] text-[#1F3D2B] px-3 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider border-r-[3px] border-[#1F3D2B]">
          {size.label}
        </div>
        <div className="flex-1 bg-[#1F3D2B]/5"></div>
        <div className="bg-[#1F3D2B] text-[#F5F1E8] px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em]">
          {product.category}
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="block flex-1 flex flex-col">
        <div className="relative h-44 sm:h-48 md:h-52 lg:h-56 overflow-hidden border-b-[3px] border-[#1F3D2B]" style={{background: product.bg}}>
          {(product.images?.[0] || product.image) && (
            <div className="relative w-full h-full">
              <Image
                src={product.images?.[0] || product.image}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold sm:font-black text-[14px] sm:text-base md:text-lg text-[#1F3D2B] leading-[1.2] sm:leading-tight line-clamp-2 mb-1">
              {product.name.replace(/([a-z])-([0-9])/i, "$1 – $2")}
            </h3>
            {product.badge && (
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-[#B8431A]">
                {product.badge === "BULK" ? "Bulk Deal" : product.badge}
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-[#1F3D2B]">₹{size.price}</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#1F3D2B]/60">{size.label} pack</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-3 sm:p-4 pt-0">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] py-2.5 font-black uppercase tracking-[0.1em] text-xs sm:text-sm hover:bg-[#1F3D2B] hover:text-[#F5F1E8] transition-all duration-300 flex items-center justify-center gap-2 brutal-shadow-sm"
        >
          <ShoppingCart size={16} strokeWidth={3}/>
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}

