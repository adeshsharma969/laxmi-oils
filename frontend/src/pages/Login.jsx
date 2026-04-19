import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fmtErr } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/account";
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(form.email, form.password);
      nav(from);
    } catch (e) { setErr(fmtErr(e)); } finally { setBusy(false); }
  };

  const google = () => {
    // Google OAuth - configure with your own client ID
    setErr("Google OAuth not configured. Please use email/password login.");
  };

  return (
    <div className="px-5 md:px-10 py-16 min-h-[70vh] flex items-center justify-center">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-8 brutal-shadow">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Welcome back</div>
        <h1 className="font-display font-black text-4xl text-[#1F3D2B] tracking-tighter mt-1">Login.</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Email</div>
            <input data-testid="login-email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 font-bold focus:outline-none focus:bg-[#D98F00]/30"/>
          </label>
          <label className="block">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">Password</div>
            <input data-testid="login-password" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2.5 font-bold focus:outline-none focus:bg-[#D98F00]/30"/>
          </label>
          {err && <div data-testid="login-error" className="text-sm font-bold text-[#B8431A] bg-[#B8431A]/10 border-2 border-[#B8431A] px-3 py-2">{err}</div>}
          <button data-testid="login-submit" disabled={busy} type="submit" className="w-full bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] py-3 font-black uppercase tracking-[0.25em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors disabled:opacity-60">{busy?"...":"Login →"}</button>
        </form>
        <div className="my-5 flex items-center gap-3"><div className="h-[2px] flex-1 bg-[#1F3D2B]/30"/><div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60">or</div><div className="h-[2px] flex-1 bg-[#1F3D2B]/30"/></div>
        <button data-testid="google-login" onClick={google} className="w-full bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] py-3 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#D98F00]">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.2 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.2 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-1.9 1.3-4.3 2.1-7.2 2.1-5.2 0-9.6-3.3-11.3-8L6 32.4C9.4 39.2 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.3l6.2 5.2c-.4.4 6.2-4.5 6.2-14.5 0-1.3-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>
        <div className="mt-6 text-center text-sm">
          No account? <Link to="/register" className="font-black underline text-[#1F3D2B]">Register</Link>
        </div>
      </motion.div>
    </div>
  );
}
