import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import api from "../api/client";

const CATEGORIES = [
  { slug: "mustard", name: "Mustard" },
  { slug: "soyabean", name: "Soyabean" },
  { slug: "groundnut", name: "Groundnut" },
  { slug: "sunflower", name: "Sunflower" },
];
const SIZES = ["500 ml","1 L","5 L","15 L"];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") || "all";
  const [cat, setCat] = useState(initialCat);
  const [sizes, setSizes] = useState([]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ if (cat==="all") params.delete("cat"); else params.set("cat", cat); setParams(params, {replace:true}); /* eslint-disable-next-line */ },[cat]);

  useEffect(() => {
    setLoading(true);
    api.get("/products").then(({data}) => setProducts(data || [])).finally(()=>setLoading(false));
  }, []);

  const filtered = useMemo(()=>{
    let list = products.slice();
    if (cat!=="all") list = list.filter(p=>p.category===cat);
    if (sizes.length) list = list.filter(p=>p.sizes.some(s=>sizes.includes(s.label)));
    if (sort==="price-low") list.sort((a,b)=>a.sizes[0].price-b.sizes[0].price);
    if (sort==="price-high") list.sort((a,b)=>b.sizes[0].price-a.sizes[0].price);
    if (sort==="rating") list.sort((a,b)=>b.rating-a.rating);
    return list;
  },[cat,sizes,sort,products]);

  const toggleSize = (s) => setSizes(prev => prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);

  return (
    <div data-testid="products-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="border-b-[3px] border-[#1F3D2B] pb-6 md:pb-8 mb-6 md:mb-8">
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">OUR COLLECTION</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#1F3D2B] tracking-tighter">All oils, one standard.</h1>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-3 md:sticky md:top-24 md:self-start">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 md:p-5 brutal-shadow-sm">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-2 md:mb-3">Category</div>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
              {[{slug:"all", name:"All"},...CATEGORIES].map(c=>(
                <button key={c.slug} data-testid={`filter-cat-${c.slug}`} onClick={()=>setCat(c.slug)} className={`touch-target-sm text-left px-3 py-2 border-2 font-bold uppercase text-xs sm:text-sm tracking-wider transition-colors whitespace-nowrap ${cat===c.slug?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>{c.name}</button>
              ))}
            </div>

            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mt-4 md:mt-6 mb-2 md:mb-3">Size</div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s=>(
                <button key={s} data-testid={`filter-size-${s}`} onClick={()=>toggleSize(s)} className={`touch-target-sm px-2 sm:px-3 py-1.5 border-2 font-bold text-xs uppercase tracking-wider transition-colors ${sizes.includes(s)?"bg-[#B8431A] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>{s}</button>
              ))}
            </div>

            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mt-4 md:mt-6 mb-2 md:mb-3">Sort</div>
            <select data-testid="sort-select" value={sort} onChange={e=>setSort(e.target.value)} className="w-full border-2 border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-xs sm:text-sm uppercase tracking-wider">
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </aside>

        <div className="col-span-12 md:col-span-9 lg:col-span-9">
          <div className="flex justify-between items-center mb-4 md:mb-5">
            <div data-testid="products-count" className="text-xs sm:text-sm font-bold text-[#1F3D2B]">{loading?"Loading…":`${filtered.length} products`}</div>
          </div>
          {(!loading && filtered.length===0) ? (
            <div className="border-[3px] border-[#1F3D2B] p-8 sm:p-12 md:p-16 text-center bg-[#F5F1E8]">
              <div className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">No matches.</div>
              <div className="text-xs sm:text-sm mt-2 text-[#1F3D2B]/70">Try removing a filter.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {filtered.map((p,i)=>(<ProductCard key={p.product_id} product={{...p, id: p.product_id}} index={i}/>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
