import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft } from "lucide-react";
import api from "../api/client";

export default function SearchCommand({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [i, setI] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); setI(0); return; }
    const fetchAll = async () => {
      try { const { data } = await api.get("/products"); setResults(data.slice(0,8)); } catch {}
    };
    fetchAll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/products", { params: q ? { q } : {} });
        setResults(data.slice(0,8)); setI(0);
      } catch {}
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = (p) => { nav(`/product/${p.product_id}`); onClose(); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI(x=>Math.min(results.length-1, x+1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI(x=>Math.max(0, x-1)); }
    else if (e.key === "Enter" && results[i]) { go(results[i]); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-[#1A1814]/60 z-50"/>
          <motion.div data-testid="search-palette" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="fixed left-1/2 top-[12vh] -translate-x-1/2 w-[92vw] max-w-xl bg-[#F5F1E8] border-[3px] border-[#1F3D2B] shadow-[8px_8px_0_0_#1F3D2B] z-50 overflow-hidden">
            <div className="flex items-center gap-3 border-b-[3px] border-[#1F3D2B] px-4 py-3 bg-[#D98F00]">
              <Search size={18} strokeWidth={3} className="text-[#1F3D2B]"/>
              <input data-testid="search-input" autoFocus value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKey} placeholder="Search oils, categories, recipes…" className="flex-1 bg-transparent outline-none font-bold text-[#1F3D2B] placeholder:text-[#1F3D2B]/50"/>
              <button onClick={onClose} className="w-7 h-7 border-2 border-[#1F3D2B] flex items-center justify-center"><X size={12} strokeWidth={3}/></button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto">
              {results.length === 0 && <div className="p-8 text-center text-sm font-bold text-[#1F3D2B]/60">No matches.</div>}
              {results.map((p, idx) => (
                <button key={p.product_id} data-testid={`search-res-${p.product_id}`} onClick={()=>go(p)} onMouseEnter={()=>setI(idx)} className={`w-full flex items-center gap-3 px-4 py-3 border-b-2 border-[#1F3D2B]/10 text-left ${i===idx?"bg-[#D98F00]/30":""}`}>
                  <div className="w-12 h-12 border-2 border-[#1F3D2B] flex-shrink-0" style={{background:p.bg}}><img src={p.image} alt="" className="w-full h-full object-cover mix-blend-multiply"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-[#1F3D2B] truncate">{p.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1F3D2B]/70">{p.category} · from ₹{p.sizes[0].price}</div>
                  </div>
                  {i===idx && <CornerDownLeft size={14} strokeWidth={3} className="text-[#1F3D2B]"/>}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
