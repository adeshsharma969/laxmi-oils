import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product, index=0, sizeIndex=0 }) {
  const size = product.sizes[sizeIndex] || product.sizes[0];
  return (
    <motion.div
      initial={{opacity:0, y:30}}
      whileInView={{opacity:1, y:0}}
      viewport={{once:true, margin:"-50px"}}
      transition={{duration:0.5, delay:index*0.06, ease:[0.22,1,0.36,1]}}
      data-testid={`product-card-${product.id}`}
      className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-[#1F3D2B]"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F4] via-white to-[#F5F1E8] opacity-50"></div>
        
        {/* Product Image Section */}
        <div className="relative h-48 sm:h-52 md:h-56 lg:h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          {(product.images?.[0] || product.image) && (
            <motion.img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-full h-full object-contain p-6 relative z-0"
              whileHover={{scale:1.05, rotate:2}}
              transition={{duration:0.4, ease:[0.22,1,0.36,1]}}
            />
          )}
          
          {/* Floating Badges */}
          <motion.div 
            className="absolute top-4 left-4 bg-gradient-to-r from-[#D98F00] to-[#B8431A] text-white px-4 py-2 text-sm font-black uppercase tracking-wider rounded-full border-2 border-white shadow-lg z-20"
            whileHover={{scale:1.1}}
            transition={{duration:0.2}}
          >
            {size.label}
          </motion.div>
          
          <motion.div 
            className="absolute top-4 right-4 bg-gradient-to-r from-[#1F3D2B] to-[#2A5240] text-white px-4 py-2 text-sm font-black uppercase tracking-wider rounded-full border-2 border-white shadow-lg z-20"
            whileHover={{scale:1.1}}
            transition={{duration:0.2}}
          >
            {product.category}
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="relative p-6 flex-1 flex flex-col z-10">
          {/* Product Name */}
          <h3 className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B] leading-tight mb-3 line-clamp-2 group-hover:text-[#B8431A] transition-colors">
            {product.name.replace(/([a-z])-([0-9])/i, "$1 – $2")}
          </h3>
          
          {/* Special Badge */}
          {product.badge && (
            <motion.div 
              className="mb-4 inline-block"
              whileHover={{scale:1.05}}
              transition={{duration:0.2}}
            >
              <span className="bg-gradient-to-r from-[#B8431A] to-[#D98F00] text-white px-4 py-2 text-sm font-black uppercase tracking-wider rounded-full shadow-lg border-2 border-white">
                {product.badge === "BULK" ? "🔥 Bulk Deal" : `⭐ ${product.badge}`}
              </span>
            </motion.div>
          )}

          {/* Price and Cart Section */}
          <div className="mt-auto flex items-end justify-between">
            <div className="flex-1">
              <motion.div 
                className="text-3xl sm:text-4xl font-black text-[#1F3D2B] leading-none"
                whileHover={{scale:1.05}}
                transition={{duration:0.2}}
              >
                ₹{size.price}
              </motion.div>
              <div className="text-sm font-semibold text-[#1F3D2B]/70 mt-1 uppercase tracking-wider">
                {size.label}
              </div>
            </div>
            
            <motion.button 
              className="touch-target w-14 h-14 bg-gradient-to-r from-[#D98F00] to-[#B8431A] text-white rounded-full border-4 border-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-200"
              whileHover={{scale:1.1, rotate:5}}
              whileTap={{scale:0.95}}
              transition={{duration:0.2}}
            >
              <ShoppingCart size={20} strokeWidth={3} className="text-white"/>
            </motion.button>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F3D2B]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </Link>
    </motion.div>
  );
}
