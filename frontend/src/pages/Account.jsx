import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, LogOut, ShoppingBag, User as UserIcon, Gift, Copy, Check, Share2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const auth = useAuth();
  if (!auth) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { user, logout, loading } = auth;
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [orderErr, setOrderErr] = useState("");
  const [refErr, setRefErr] = useState("");
  const [ref, setRef] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav("/login", { state: { from: "/account" } });
    if (!loading && user?.role === "admin") nav("/admin");
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    api.get("/orders/me")
      .then(({data}) => setOrders(data))
      .catch(()=>setOrderErr("Could not load your orders right now."))
      .finally(()=>setBusy(false));
    api.get("/referrals/me")
      .then(({data}) => setRef(data))
      .catch(()=>setRefErr("Referral info is temporarily unavailable."));
  }, [user]);

  const shareUrl = ref ? `${window.location.origin}/register?ref=${ref.referral_code}` : "";
  const copy = (txt) => { navigator.clipboard.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false), 1500); };
  const wa = () => window.open(`https://wa.me/?text=${encodeURIComponent((ref?.share_message||"") + " " + shareUrl)}`, "_blank");

  if (loading || !user) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;

  return (
    <div data-testid="account-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <div className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-6 mb-6 md:mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">Namaste</div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#1F3D2B] tracking-tighter">{user.name || user.email}.</h1>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && <Link to="/admin" data-testid="go-admin" className="touch-target-sm border-[3px] border-[#1F3D2B] bg-[#D98F00] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm">Admin →</Link>}
          <button data-testid="logout-btn" onClick={()=>{logout(); nav("/");}} className="touch-target-sm border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2"><LogOut size={14} strokeWidth={3}/> Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-5 brutal-shadow-sm">
            <div className="flex items-center gap-3">
              {user.picture ? <img src={user.picture} alt="" className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#1F3D2B]"/> : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D98F00] border-2 border-[#1F3D2B] flex items-center justify-center font-display font-black text-xl sm:text-2xl">{(user.name||user.email||"?")[0].toUpperCase()}</div>}
              <div className="min-w-0">
                <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] truncate">{user.name}</div>
                <div className="text-xs sm:text-sm text-[#1F3D2B]/80 truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-4 sm:mt-5 space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Role</span><span className="font-black uppercase">{user.role}</span></div>
              {user.phone && <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Phone</span><span className="font-bold">{user.phone}</span></div>}
              <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Orders</span><span className="font-bold">{orders.length}</span></div>
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-8 lg:col-span-9 space-y-8">
          {refErr && <div className="text-sm font-bold text-[#B8431A]">{refErr}</div>}
          {ref && (
            <div data-testid="referral-card" className="border-[3px] border-[#1F3D2B] bg-[#D98F00] p-4 sm:p-5 brutal-shadow relative overflow-hidden">
              <Gift size={60} strokeWidth={1.5} className="absolute -right-4 -bottom-4 text-[#1F3D2B]/10"/>
              <div className="relative">
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#1F3D2B]">Refer & Both Get ₹100 Off</div>
                <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#1F3D2B] tracking-tighter mt-1">Spread the liquid gold.</h2>
                <p className="text-xs sm:text-sm text-[#1F3D2B] mt-2 max-w-md">Your friend saves ₹100 on their first order. You earn ₹100 when they shop. Fair and square.</p>
                <div className="mt-3 sm:mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-xl">
                  <Stat label="Your Code" value={ref.referral_code} mono/>
                  <Stat label="Signups" value={ref.signups}/>
                  <Stat label="Orders" value={ref.orders_redeemed}/>
                  <Stat label="Earned" value={`₹${ref.rewards_earned}`}/>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                  <button data-testid="copy-referral" onClick={()=>copy(shareUrl)} className="touch-target-sm bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 py-2 font-black uppercase text-xs tracking-widest flex items-center gap-2 justify-center">{copied?<Check size={14} strokeWidth={3}/>:<Copy size={14} strokeWidth={3}/>} {copied?"Copied":"Copy Link"}</button>
                  <button data-testid="share-whatsapp" onClick={wa} className="touch-target-sm bg-[#25D366] text-white border-[3px] border-[#1F3D2B] px-4 py-2 font-black uppercase text-xs tracking-widest flex items-center gap-2 justify-center"><Share2 size={14} strokeWidth={3}/> Share on WhatsApp</button>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4"><Package size={16} strokeWidth={2.5}/><h2 className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B]">Order History</h2></div>
          {busy ? <div className="text-xs sm:text-sm">Loading orders…</div> : orderErr ? (
            <div className="text-sm font-bold text-[#B8431A] border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2">{orderErr}</div>
          ) : orders.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 sm:p-10 text-center">
              <ShoppingBag size={28} strokeWidth={2.5} className="mx-auto text-[#1F3D2B]"/>
              <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B] mt-3">No orders yet.</div>
              <Link to="/products" className="touch-target-sm inline-block mt-4 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 sm:px-6 py-2 sm:py-3 font-black uppercase tracking-widest text-xs sm:text-sm">Start shopping →</Link>
            </motion.div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map(o => (
                <div key={o.order_id} data-testid={`order-${o.order_id}`} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-5 brutal-shadow-sm">
                  <div className="flex flex-wrap justify-between gap-3 border-b-2 border-[#1F3D2B]/20 pb-3 mb-3">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B]/80">Order</div>
                      <div className="font-mono font-black text-base sm:text-lg text-[#1F3D2B]">{o.order_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#1F3D2B]/80">{new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      <div className={`inline-block mt-1 px-2 py-0.5 text-xs font-black uppercase tracking-[0.12em] border-2 ${o.status==='delivered'?'bg-[#1F3D2B] text-[#D98F00] border-[#1F3D2B]':'bg-[#D98F00] text-[#1F3D2B] border-[#1F3D2B]'}`}>{o.status}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {o.items.map((it,i)=>(
                      <div key={i} className="flex justify-between text-xs sm:text-sm">
                        <span className="truncate"><b>{it.name}</b> · {it.size} × {it.qty}</span>
                        <span className="font-bold">₹{it.price*it.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t-2 border-[#1F3D2B]/20">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80">Total</span>
                    <span className="font-display font-black text-lg sm:text-xl text-[#1F3D2B]">₹{o.total}</span>
                  </div>
                  {o.tracking?.trackingUrl && (
                    <div className="mt-2 text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-[#1F3D2B]">
                      Tracking: <a href={o.tracking.trackingUrl} target="_blank" rel="noreferrer" className="underline hover:text-[#B8431A]">{o.tracking.trackingId || "Open link"}</a>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <Link to={`/invoice/${o.order_id}`} data-testid={`invoice-${o.order_id}`} className="touch-target-sm text-xs sm:text-sm font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#D98F00]">View Invoice →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="bg-[#F5F1E8] border-2 border-[#1F3D2B] px-2 sm:px-3 py-2">
      <div className={`font-display font-black text-base sm:text-lg text-[#1F3D2B] ${mono?"font-mono tracking-tight":""}`}>{value}</div>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80">{label}</div>
    </div>
  );
}
