import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, LogOut, ShoppingBag, Gift, Copy, Check, Share2, MapPin, ReceiptText, Truck, WalletCards, ChevronDown, Filter } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { activeTimelineIndex, orderTimelineSteps } from "../lib/delivery";

const STATUS_FILTERS = ["all", "confirmed", "packed", "shipped", "delivered"];

export default function Account() {
  const auth = useAuth();
  if (!auth) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { user, logout, loading } = auth;
  const cart = useCart();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [orderErr, setOrderErr] = useState("");
  const [refErr, setRefErr] = useState("");
  const [ref, setRef] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

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
  const copy_link = (txt) => { navigator.clipboard.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false), 1500); };
  const wa = () => window.open(`https://wa.me/?text=${encodeURIComponent((ref?.share_message||"") + " " + shareUrl)}`, "_blank");
  const rewardBalance = Math.max(0, Number(ref?.rewards_earned ?? user?.rewards_earned ?? 0));
  const reorder = (order) => {
    (order.items || []).forEach((item) => cart?.addItem?.(item));
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(o => (o.status || "").toLowerCase() === statusFilter);
  }, [orders, statusFilter]);

  const toggleOrder = (id) => setExpandedOrder(prev => prev === id ? null : id);

  if (loading || !user) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;

  return (
    <div data-testid="account-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      {/* Compact Header */}
      <div className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-5 mb-5 md:mb-6 flex flex-wrap items-end justify-between gap-3">
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
        {/* Sidebar — Profile + Rewards inline */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 space-y-3">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-5 brutal-shadow-sm">
            <div className="flex items-center gap-3">
              {user.picture ? <img src={user.picture} alt="" className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#1F3D2B]"/> : <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D98F00] border-2 border-[#1F3D2B] flex items-center justify-center font-display font-black text-xl sm:text-2xl">{(user.name||user.email||"?")[0].toUpperCase()}</div>}
              <div className="min-w-0">
                <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] truncate">{user.name}</div>
                <div className="text-xs sm:text-sm text-[#1F3D2B]/80 truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Role</span><span className="font-black uppercase">{user.role}</span></div>
              {user.phone && <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Phone</span><span className="font-bold">{user.phone}</span></div>}
              <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Orders</span><span className="font-bold">{orders.length}</span></div>
              <div className="flex justify-between"><span className="text-[#1F3D2B]/80">Rewards</span><span className="font-bold text-[#B8431A]">₹{rewardBalance}</span></div>
            </div>
          </div>

          {/* Compact Referral Banner */}
          {refErr && <div className="text-xs font-bold text-[#B8431A]">{refErr}</div>}
          {ref && (
            <div data-testid="referral-card" className="border-[3px] border-[#1F3D2B] bg-[#D98F00] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} strokeWidth={3} className="text-[#1F3D2B] flex-shrink-0"/>
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B]">Refer & both get ₹100 off</div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <span className="font-mono font-black text-sm text-[#1F3D2B] border-2 border-[#1F3D2B] bg-[#F5F1E8] px-2 py-0.5">{ref.referral_code}</span>
                <span className="text-[10px] font-bold text-[#1F3D2B]/70">{ref.signups} signups · ₹{ref.rewards_earned} earned</span>
              </div>
              <div className="flex gap-1.5">
                <button data-testid="copy-referral" onClick={()=>copy_link(shareUrl)} className="touch-target-sm flex-1 bg-[#1F3D2B] text-[#F5F1E8] border-2 border-[#1F3D2B] px-2 py-1.5 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 justify-center">{copied?<Check size={12} strokeWidth={3}/>:<Copy size={12} strokeWidth={3}/>} {copied?"Copied":"Copy"}</button>
                <button data-testid="share-whatsapp" onClick={wa} className="touch-target-sm flex-1 bg-[#25D366] text-white border-2 border-[#1F3D2B] px-2 py-1.5 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 justify-center"><Share2 size={12} strokeWidth={3}/> Share</button>
              </div>
            </div>
          )}
        </aside>

        {/* Orders Section */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Package size={16} strokeWidth={2.5}/>
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B]">Orders</h2>
              <span className="text-xs font-bold text-[#1F3D2B]/60">({filteredOrders.length})</span>
            </div>
            {/* Status Filter Tabs */}
            {orders.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] transition-colors ${
                      statusFilter === f
                        ? "bg-[#1F3D2B] text-[#D98F00]"
                        : "bg-[#F5F1E8] text-[#1F3D2B] hover:bg-[#D98F00]/30"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {busy ? <div className="text-xs sm:text-sm">Loading orders…</div> : orderErr ? (
            <div className="text-sm font-bold text-[#B8431A] border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2">{orderErr}</div>
          ) : orders.length === 0 ? (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 sm:p-10 text-center">
              <ShoppingBag size={28} strokeWidth={2.5} className="mx-auto text-[#1F3D2B]"/>
              <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B] mt-3">No orders yet.</div>
              <Link to="/products" className="touch-target-sm inline-block mt-4 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 sm:px-6 py-2 sm:py-3 font-black uppercase tracking-widest text-xs sm:text-sm">Start shopping →</Link>
            </motion.div>
          ) : filteredOrders.length === 0 ? (
            <div className="border-2 border-[#1F3D2B] bg-[#F5F1E8] px-4 py-6 text-center">
              <div className="text-sm font-bold text-[#1F3D2B]/70">No {statusFilter} orders found.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map(o => {
                const isExpanded = expandedOrder === o.order_id;
                const itemCount = o.items?.reduce((s, it) => s + it.qty, 0) || 0;
                const statusColor = o.status === 'delivered'
                  ? 'bg-[#1F3D2B] text-[#D98F00] border-[#1F3D2B]'
                  : o.status === 'shipped'
                    ? 'bg-[#B8431A] text-[#F5F1E8] border-[#B8431A]'
                    : 'bg-[#D98F00] text-[#1F3D2B] border-[#1F3D2B]';

                return (
                  <div key={o.order_id} data-testid={`order-${o.order_id}`} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8]">
                    {/* Compact Order Row */}
                    <button
                      type="button"
                      onClick={() => toggleOrder(o.order_id)}
                      className="w-full text-left px-3 sm:px-4 py-3 flex items-center gap-3 hover:bg-[#D98F00]/10 transition-colors"
                    >
                      <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] border-2 ${statusColor}`}>
                        {o.status}
                      </span>
                      <span className="font-mono font-black text-xs sm:text-sm text-[#1F3D2B] flex-shrink-0">
                        {o.order_id}
                      </span>
                      <span className="hidden sm:inline text-xs text-[#1F3D2B]/70 font-bold">
                        {itemCount} item{itemCount !== 1 && "s"}
                      </span>
                      <span className="flex-1 min-w-0"/>
                      <span className="text-xs text-[#1F3D2B]/70 font-bold flex-shrink-0 hidden sm:inline">
                        {new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </span>
                      <span className="font-display font-black text-sm sm:text-base text-[#1F3D2B] flex-shrink-0">
                        ₹{o.total}
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={3}
                        className={`text-[#1F3D2B]/60 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Expandable Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t-2 border-[#1F3D2B]/15 pt-3">
                            {/* Order Date on mobile */}
                            <div className="sm:hidden text-xs font-bold text-[#1F3D2B]/70 mb-2">
                              {new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                            </div>

                            {/* Items */}
                            <div className="space-y-1.5 mb-3">
                              {o.items.map((it,i)=>(
                                <div key={i} className="flex justify-between text-xs sm:text-sm">
                                  <span className="truncate"><b>{it.name}</b> · {it.size} × {it.qty}</span>
                                  <span className="font-bold flex-shrink-0 ml-3">₹{it.price*it.qty}</span>
                                </div>
                              ))}
                            </div>

                            {/* Compact Status Progress */}
                            <div className="flex items-center gap-1 mb-3">
                              {orderTimelineSteps.map((label, index) => {
                                const done = index <= activeTimelineIndex(o.status);
                                const isLast = index === orderTimelineSteps.length - 1;
                                return (
                                  <React.Fragment key={label}>
                                    <div className="flex items-center gap-1">
                                      <div className={`flex h-5 w-5 items-center justify-center border-[1.5px] border-[#1F3D2B] text-[8px] font-black ${done ? "bg-[#1F3D2B] text-[#D98F00]" : "bg-white text-[#1F3D2B]"}`}>
                                        {done ? <Check size={10} strokeWidth={3}/> : index + 1}
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-[0.06em] text-[#1F3D2B]/70">{label}</span>
                                    </div>
                                    {!isLast && <div className={`flex-1 h-[2px] ${done ? "bg-[#1F3D2B]" : "bg-[#1F3D2B]/20"}`}/>}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* Tracking */}
                            {o.tracking?.trackingUrl && (
                              <div className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#1F3D2B]">
                                <Truck size={12} strokeWidth={3} className="mr-1 inline"/> Tracking: <a href={o.tracking.trackingUrl} target="_blank" rel="noreferrer" className="underline hover:text-[#B8431A]">{o.tracking.trackingId || "Open link"}</a>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button type="button" onClick={()=>reorder(o)} className="touch-target-sm text-xs font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] px-3 py-1.5 bg-[#D98F00] text-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-[#F5F1E8]">Buy again</button>
                              <Link to={`/invoice/${o.order_id}`} data-testid={`invoice-${o.order_id}`} className="touch-target-sm text-xs font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#D98F00]">Invoice →</Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
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
