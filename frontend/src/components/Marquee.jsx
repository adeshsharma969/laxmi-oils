import React from "react";

export default function Marquee({ text="100% PURE · COLD-PRESSED · NO CHEMICALS · TESTED IN JAIPUR", bg="#2B2A28", color="#F5F1E8" }) {
  const items = Array(8).fill(text);
  return (
    <div className="marquee border-y-[3px] border-[#1F3D2B] py-4 font-display font-black text-xl md:text-2xl tracking-tight uppercase" style={{background:bg, color}}>
      <div className="marquee-track">
        {items.map((t,i)=>(<span key={i} className="px-8 flex items-center gap-8">{t} <span className="text-[#D98F00]">✦</span></span>))}
        {items.map((t,i)=>(<span key={`d${i}`} className="px-8 flex items-center gap-8">{t} <span className="text-[#D98F00]">✦</span></span>))}
      </div>
    </div>
  );
}
