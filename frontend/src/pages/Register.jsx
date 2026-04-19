import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fmtErr } from "../api/client";

export default function Register() {
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
    <div className="px-5 md:px-10 py-16 min-h-[70vh] flex items-center justify-center">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-8 brutal-shadow">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">New here?</div>
        <h1 className="font-display font-black text-4xl text-[#1F3D2B] tracking-tighter mt-1">Create account.</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {[["name","Full Name","text"],["email","Email","email"],["phone","Phone (optional)","tel"],["password","Password (min 6)","password"],["ref","Referral Code (optional)","text"]].map(([k,l,t])=>(
            <label key={k} className="block">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">{l}</div>
              <input data-testid={`register-${k}`} type={t} required={k!=="phone" && k!=="ref"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 font-bold focus:outline-none focus:bg-[#D98F00]/30"/>
            </label>
          ))}
          {err && <div data-testid="register-error" className="text-sm font-bold text-[#B8431A] bg-[#B8431A]/10 border-2 border-[#B8431A] px-3 py-2">{err}</div>}
          <button data-testid="register-submit" disabled={busy} type="submit" className="w-full bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] py-3 font-black uppercase tracking-[0.25em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors disabled:opacity-60">{busy?"...":"Create Account →"}</button>
        </form>
        <div className="mt-6 text-center text-sm">
          Already registered? <Link to="/login" className="font-black underline text-[#1F3D2B]">Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
