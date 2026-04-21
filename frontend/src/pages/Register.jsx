import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fmtErr } from "../api/client";

function RegisterContent() {
  const auth = useAuth();
  if (!auth) return <div className="p-10 text-center">Loading...</div>;
  const { register } = auth;
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", ref: params.get("ref") || "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { const r = params.get("ref"); if (r) setForm(f=>({...f, ref: r})); }, [params]);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await register(form); nav("/account"); }
    catch(e) { setErr(fmtErr(e)); } finally { setBusy(false); }
  };

  return (
    <div className="px-4 sm:px-5 md:px-10 py-10 sm:py-12 md:py-16 min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 sm:p-8 brutal-shadow">
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">New here?</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1F3D2B] tracking-tighter mt-1">Create account.</h1>
        <form onSubmit={submit} className="mt-5 sm:mt-6 space-y-4">
          {[["name","Full Name","text"],["email","Email","email"],["phone","Phone (optional)","tel"],["password","Password (min 6)","password"],["ref","Referral Code (optional)","text"]].map(([k,l,t])=>(
            <label key={k} className="block">
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">{l}</div>
              <input data-testid={`register-${k}`} type={t} required={k!=="phone" && k!=="ref"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 sm:py-2.5 font-bold text-sm focus:outline-none focus:bg-[#D98F00]/30"/>
            </label>
          ))}
          {err && <div data-testid="register-error" className="text-xs sm:text-sm font-bold text-[#B8431A] bg-[#B8431A]/10 border-2 border-[#B8431A] px-3 py-2">{err}</div>}
          <button data-testid="register-submit" disabled={busy} type="submit" className="touch-target w-full bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] py-3 font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors disabled:opacity-60 text-sm sm:text-base">{busy?"...":"Create Account →"}</button>
        </form>
        <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm">
          Already registered? <Link to="/login" className="font-black underline text-[#1F3D2B]">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
