import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const processed = useRef(false);
  
  if (!auth) return (
    <div className="px-5 py-20 text-center">
      <div className="font-display font-black text-3xl text-[#1F3D2B]">Loading...</div>
    </div>
  );
  const { googleExchange } = auth;

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = loc.hash || window.location.hash;
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { nav("/login"); return; }
    const sid = decodeURIComponent(m[1]);
    googleExchange(sid).then(() => nav("/account")).catch(() => nav("/login?err=google"));
  }, [loc.hash, googleExchange, nav]);

  return (
    <div className="px-5 py-20 text-center">
      <div className="font-display font-black text-3xl text-[#1F3D2B]">Signing you in…</div>
    </div>
  );
}
