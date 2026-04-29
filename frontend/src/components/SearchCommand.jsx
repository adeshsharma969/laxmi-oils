import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft } from "lucide-react";
import Image from "next/image";
import api from "../api/client";

export default function SearchCommand({ open, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); setI(0); return; }
    const fetchAll = async () => {
      setBusy(true);
      setError("");
      try {
        const { data } = await api.get("/products");
        setResults(data.slice(0,8));
      } catch {
        setError("Could not load search suggestions.");
      } finally {
        setBusy(false);
      }
    };
    fetchAll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setBusy(true);
      setError("");
      try {
        const { data } = await api.get("/products", { params: q ? { q } : {} });
        setResults(data.slice(0,8)); setI(0);
      } catch {
        setError("Search is temporarily unavailable.");
      } finally {
        setBusy(false);
      }
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
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="fixed left-1/2 top-[6vh] sm:top-[8vh] -translate-x-1/2 w-[94vw] max-w-xl bg-[#F5F1E8] border-[3px] border-[#1F3D2B] shadow-[8px_8px_0_0_#1F3D2B] z-50 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 sm:gap-3 border-b-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 sm:py-3 bg-[#D98F00] flex-shrink-0">
              <Search size={18} strokeWidth={3} className="text-[#1F3D2B] flex-shrink-0"/>
              <input data-testid="search-input" autoFocus value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKey} placeholder="Search oils..." className="flex-1 min-w-0 bg-transparent outline-none font-bold text-sm sm:text-base text-[#1F3D2B] placeholder:text-[#1F3D2B]/60"/>
              <button onClick={onClose} className="touch-target-sm w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#1F3D2B] flex items-center justify-center bg-[#F5F1E8] hover:bg-[#B8431A] hover:text-[#F5F1E8] transition-colors"><X size={12} strokeWidth={3}/></button>
            </div>
            <div className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto overscroll-contain pb-4">
              {busy && <div className="p-6 text-center text-sm font-bold text-[#1F3D2B]/80">Searching...</div>}
              {!busy && error && <div className="p-6 text-center text-sm font-bold text-[#B8431A]">{error}</div>}
              {!busy && !error && results.length === 0 && <div className="p-8 text-center text-sm font-bold text-[#1F3D2B]/80">No matches.</div>}
              {results.map((p, idx) => (
                <button key={p.product_id} data-testid={`search-res-${p.product_id}`} onClick={()=>go(p)} onMouseEnter={()=>setI(idx)} className={`w-full flex items-center gap-3 px-4 py-3 border-b-2 border-[#1F3D2B]/10 text-left ${i===idx?"bg-[#D98F00]/30":""}`}>
                  <div className="w-12 h-12 border-2 border-[#1F3D2B] flex-shrink-0 relative overflow-hidden" style={{background:p.bg}}>
                    <Image src={p.image} alt="" fill className="object-contain p-1" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] truncate">{p.name}</div>
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B]/80">{p.category} · from ₹{p.sizes[0].price}</div>
                  </div>
                  {i===idx && <CornerDownLeft size={14} strokeWidth={3} className="text-[#1F3D2B] hidden sm:block"/>}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
