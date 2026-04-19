import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ProductCard({ product, index=0 }) {
  const from = product.sizes[0].price;
  return (
    <motion.div
      initial={{opacity:0, y:30}}
      whileInView={{opacity:1, y:0}}
      viewport={{once:true, margin:"-50px"}}
      transition={{duration:0.5, delay:index*0.06, ease:[0.22,1,0.36,1]}}
      data-testid={`product-card-${product.id}`}
      className="brutal-card group flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-56 overflow-hidden border-b-[3px] border-[#1F3D2B]" style={{background: product.bg}}>
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover mix-blend-multiply"
            whileHover={{scale:1.08}}
            transition={{duration:0.6, ease:[0.22,1,0.36,1]}}
          />
          <div className="absolute top-3 right-3 bg-[#B8431A] text-[#F5F1E8] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-[#1F3D2B] rotate-3">{product.badge}</div>
          <div className="absolute bottom-3 left-3 bg-[#F5F1E8] text-[#1F3D2B] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-[#1F3D2B]">{product.category}</div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#1F3D2B]/60">{product.rating}★ · {product.reviews} reviews</div>
          <h3 className="font-display font-black text-xl text-[#1F3D2B] mt-1 leading-tight">{product.name}</h3>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#1F3D2B]/60">from</div>
              <div className="font-display font-black text-2xl text-[#1F3D2B]">₹{from}</div>
            </div>
            <div className="w-10 h-10 border-[3px] border-[#1F3D2B] bg-[#D98F00] flex items-center justify-center group-hover:bg-[#B8431A] group-hover:text-[#F5F1E8] transition-colors">
              <ArrowUpRight size={18} strokeWidth={3}/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
