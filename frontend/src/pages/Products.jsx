import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import ProductCard from "../components/ProductCard";
import api from "../api/client";

const CATEGORIES = [
  { slug: "mustard", name: "Mustard" },
  { slug: "soyabean", name: "Soyabean" },
  { slug: "groundnut", name: "Groundnut" },
  { slug: "sunflower", name: "Sunflower" },
];
const SIZES = ["500 ml","1 L","5 L","15 L"];

function ProductsContent() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat") || "all";
  const [cat, setCat] = useState(initialCat);
  const [sizes, setSizes] = useState([]);
  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{ if (cat==="all") params.delete("cat"); else params.set("cat", cat); setParams(params, {replace:true}); /* eslint-disable-next-line */ },[cat]);

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/products")
      .then(({data}) => setProducts(data || []))
      .catch(() => setError("Could not load products. Please refresh and try again."))
      .finally(()=>setLoading(false));
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
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-6 mb-4 md:mb-6">
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">OUR COLLECTION</div>
        <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#1F3D2B] tracking-tighter mt-1">All oils, one standard.</h1>
      </motion.div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-3 md:sticky md:top-24 md:self-start">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 md:p-4 brutal-shadow-sm">
            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B] mb-2">Category</div>
            <div className="flex overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0 md:flex-col gap-2 snap-x">
              {[{slug:"all", name:"All"},...CATEGORIES].map(c=>(
                <button
                  key={c.slug}
                  data-testid={`filter-cat-${c.slug}`}
                  onClick={()=>setCat(c.slug)}
                  className={`snap-start flex-shrink-0 touch-target-sm px-4 md:w-full md:text-center md:px-2 py-1.5 md:py-2 border-2 font-bold uppercase text-[10px] sm:text-xs tracking-wider transition-colors ${cat===c.slug?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B] mt-4 mb-2">Size</div>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map(s=>(
                <button key={s} data-testid={`filter-size-${s}`} onClick={()=>toggleSize(s)} className={`touch-target-sm px-2 py-1 border-2 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-colors ${sizes.includes(s)?"bg-[#B8431A] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-[#1F3D2B] hover:bg-[#D98F00]"}`}>{s}</button>
              ))}
            </div>

            <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B] mt-4 mb-2">Sort</div>
            <select data-testid="sort-select" value={sort} onChange={e=>setSort(e.target.value)} className="w-full border-2 border-[#1F3D2B] bg-[#F5F1E8] px-2 py-1.5 font-bold text-[10px] sm:text-xs uppercase tracking-wider focus:outline-none">
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
          {error ? (
            <div className="border-[3px] border-[#B8431A] p-6 text-center bg-[#B8431A]/10 text-sm font-bold text-[#B8431A]">
              {error}
            </div>
          ) : (!loading && filtered.length===0) ? (
            <div className="border-[3px] border-[#1F3D2B] p-8 sm:p-12 text-center bg-[#F5F1E8] flex flex-col items-center">
              <div className="w-14 h-14 border-[3px] border-[#1F3D2B] bg-[#D98F00] flex items-center justify-center mb-4">
                <SearchX size={24} strokeWidth={2.5} className="text-[#1F3D2B]" />
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B]">No products match</div>
              <div className="text-xs mt-2 text-[#1F3D2B]/70 max-w-[240px]">Try removing a filter or browsing all oils.</div>
              <button
                onClick={() => { setCat("all"); setSizes([]); setSort("popular"); }}
                className="mt-4 border-[3px] border-[#1F3D2B] bg-[#1F3D2B] text-[#F5F1E8] px-5 py-2 font-black uppercase tracking-[0.14em] text-xs hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors"
              >
                Clear All Filters
              </button>
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

export default function Products() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
