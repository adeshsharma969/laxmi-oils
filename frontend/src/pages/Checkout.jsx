import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

const steps = [{ id:1, label:"Address", icon:User }, { id:2, label:"Delivery", icon:Truck }, { id:3, label:"Payment", icon:CreditCard }];

export default function Checkout() {
  const nav = useNavigate();
  const cart = useCart();
  const auth = useAuth();
  if (!cart || !auth) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { items, subtotal, clear } = cart;
  const { user } = auth;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user?.name||"", email: user?.email||"", phone: user?.phone||"", address:"", city:"", pincode:"" });
  const [delivery, setDelivery] = useState("standard");
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // {code, discount, kind} or null
  const [couponMsg, setCouponMsg] = useState("");
  const [useCredit, setUseCredit] = useState(false);
  const creditBalance = Math.max(0, Math.floor(user?.rewards_earned || 0));

  const shipping = delivery==="express"?79:subtotal>499?0:49;
  const discount = couponApplied?.discount || 0;
  const afterDiscount = Math.max(0, subtotal + shipping - discount);
  const creditUsed = useCredit ? Math.min(creditBalance, afterDiscount) : 0;
  const total = Math.max(0, afterDiscount - creditUsed);

  const applyCoupon = async () => {
    setCouponMsg("");
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon.trim(), email: form.email || user?.email });
      if (data.valid) { setCouponApplied(data); setCouponMsg(`✓ ₹${data.discount} off applied`); }
      else { setCouponApplied(null); setCouponMsg(data.reason || "Invalid code"); }
    } catch { setCouponMsg("Could not validate"); }
  };
  const clearCoupon = () => { setCouponApplied(null); setCoupon(""); setCouponMsg(""); };

  const next = () => setStep(s=>Math.min(3, s+1));
  const back = () => setStep(s=>Math.max(1, s-1));

  const pay = async () => {
    setBusy(true);
    try {
      const payload = {
        items: items.map(i => ({ product_id: i.id, name: i.name, size: i.size, price: i.price, qty: i.qty, image: i.image, bg: i.bg })),
        address: form, delivery, payment_method: "razorpay_mock",
        coupon_code: couponApplied?.code || null,
        use_credit: useCredit,
        credit_amount: creditUsed
      };
      const { data } = await api.post("/orders", payload);
      setSuccess(data);
      clear();
    } catch (e) { alert("Order failed: " + (e?.response?.data?.detail || e.message)); }
    finally { setBusy(false); }
  };

  if (items.length===0 && !success) return (
    <div className="px-5 md:px-10 py-20 text-center">
      <h1 className="font-display font-black text-5xl text-[#1F3D2B]">Cart's empty.</h1>
      <Link to="/products" className="inline-block mt-6 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-8 py-4 font-black uppercase tracking-[0.2em] hover:bg-[#B8431A] hover:border-[#B8431A]">Start shopping →</Link>
    </div>
  );

  if (success) return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.5}} data-testid="checkout-success" className="px-5 md:px-10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto border-[3px] border-[#1F3D2B] brutal-shadow-lg bg-[#D98F00] p-10 md:p-14 text-center">
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2, type:"spring"}} className="w-20 h-20 mx-auto bg-[#1F3D2B] text-[#D98F00] border-[3px] border-[#1F3D2B] flex items-center justify-center mb-6">
          <Check size={44} strokeWidth={4}/>
        </motion.div>
        <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B]">Order Placed</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1F3D2B] mt-2 tracking-tighter">Shukriya!</h1>
        <p className="mt-4 text-[#1F3D2B] text-base md:text-lg">Your order is pressing its way to you. Tracking link on your phone.</p>
        <div className="mt-2 text-sm font-bold text-[#1F3D2B]">Order ID: <span className="font-mono">{success.order_id}</span></div>
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          {user && <Link to="/account" className="bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 py-3 font-black uppercase tracking-[0.2em] hover:bg-[#B8431A] hover:border-[#B8431A]">View Orders →</Link>}
          <Link to="/" className="bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-6 py-3 font-black uppercase tracking-[0.2em] hover:bg-[#D98F00]">Back Home</Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div data-testid="checkout-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <div className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-6 mb-6 md:mb-8">
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Almost there</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#1F3D2B] tracking-tighter">Checkout.</h1>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-8">
          {/* Stepper */}
          <div className="grid grid-cols-3 mb-6 md:mb-8 border-[3px] border-[#1F3D2B]">
            {steps.map((s,i)=>{const Ic=s.icon; const active=step===s.id; const done=step>s.id;return (
              <div key={s.id} className={`p-2 sm:p-3 md:p-4 flex items-center gap-2 md:gap-3 ${i<2?"border-r-[3px] border-[#1F3D2B]":""} ${active?"bg-[#D98F00]":done?"bg-[#1F3D2B] text-[#F5F1E8]":"bg-[#F5F1E8]"}`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border-2 ${done?"bg-[#D98F00] border-[#D98F00] text-[#1F3D2B]":active?"bg-[#1F3D2B] border-[#1F3D2B] text-[#D98F00]":"border-[#1F3D2B]"} flex items-center justify-center flex-shrink-0`}>{done?<Check size={14} sm:size={16} strokeWidth={3}/>:<Ic size={14} sm:size={16} strokeWidth={2.5}/>}</div>
                <div className="hidden sm:block"><div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] opacity-70">Step {s.id}</div><div className="font-display font-black text-sm sm:text-base">{s.label}</div></div>
              </div>
            );})}
          </div>

          <AnimatePresence mode="wait">
            {step===1 && (
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-6 brutal-shadow">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[['name','Full Name',2],['email','Email',1],['phone','Phone',1],['address','Address',2],['city','City',1],['pincode','Pincode',1]].map(([k,l,sp])=>(
                    <label key={k} className={`block ${sp===2?'col-span-2':'col-span-2 sm:col-span-1'}`}>
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-1">{l}</div>
                      <input data-testid={`field-${k}`} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 sm:py-2.5 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"/>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
            {step===2 && (
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                {[{id:"standard", t:"Standard", d:"4-6 days · Free over ₹499", p:49},{id:"express", t:"Express", d:"1-2 days", p:79}].map(o=>(
                  <button key={o.id} data-testid={`ship-${o.id}`} onClick={()=>setDelivery(o.id)} className={`w-full text-left p-5 border-[3px] flex justify-between items-center ${delivery===o.id?"bg-[#D98F00] border-[#1F3D2B] shadow-[6px_6px_0_0_#1F3D2B]":"bg-[#F5F1E8] border-[#1F3D2B]"}`}>
                    <div><div className="font-display font-black text-xl text-[#1F3D2B]">{o.t}</div><div className="text-sm text-[#1F3D2B]/80">{o.d}</div></div>
                    <div className="font-display font-black text-2xl text-[#1F3D2B]">₹{o.p}</div>
                  </button>
                ))}
              </motion.div>
            )}
            {step===3 && (
              <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 brutal-shadow">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-4">Select Payment</div>
                <div className="space-y-3">
                  {["Razorpay (UPI / Card)","Cash on Delivery"].map((m,i)=>(
                    <label key={i} className="flex items-center gap-3 p-4 border-[3px] border-[#1F3D2B] cursor-pointer hover:bg-[#D98F00]">
                      <input type="radio" name="pm" defaultChecked={i===0} className="w-4 h-4 accent-[#1F3D2B]"/>
                      <div className="font-display font-black text-[#1F3D2B]">{m}</div>
                    </label>
                  ))}
                </div>
                <div className="mt-5 text-xs text-[#1F3D2B]/70 bg-[#D98F00]/30 border-2 border-[#1F3D2B] p-3">Demo mode — no real payment is processed.</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <button onClick={back} disabled={step===1} className="touch-target border-[3px] border-[#1F3D2B] px-4 sm:px-6 py-3 font-black uppercase tracking-widest bg-[#F5F1E8] disabled:opacity-40 text-sm sm:text-base">← Back</button>
            {step<3 ? (
              <button data-testid="next-step" onClick={next} className="touch-target bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 sm:px-8 py-3 font-black uppercase tracking-widest hover:bg-[#B8431A] hover:border-[#B8431A] text-sm sm:text-base">Continue →</button>
            ) : (
              <button data-testid="place-order-btn" disabled={busy} onClick={pay} className="touch-target bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-6 sm:px-8 py-3 font-black uppercase tracking-widest hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all disabled:opacity-60 text-sm sm:text-base">{busy?"Processing…":"Place Order →"}</button>
            )}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 mt-6 lg:mt-0">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-5 brutal-shadow sticky top-24">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-4">Order Summary</div>
            <div className="space-y-3 max-h-64 overflow-auto">
              {items.map(it=>(
                <div key={it.key} className="flex gap-3">
                  <div className="w-14 h-14 border-2 border-[#1F3D2B]" style={{background:it.bg}}><img src={it.image} alt="" className="w-full h-full object-cover mix-blend-multiply"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-[#1F3D2B] truncate">{it.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#1F3D2B]/70">{it.size} × {it.qty}</div>
                  </div>
                  <div className="font-black text-[#1F3D2B]">₹{it.price*it.qty}</div>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-[#1F3D2B]/30 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="font-bold">{shipping===0?"FREE":`₹${shipping}`}</span></div>
              {discount>0 && <div className="flex justify-between text-[#B8431A]"><span>Coupon ({couponApplied.code})</span><span className="font-bold">−₹{discount}</span></div>}
              {creditUsed>0 && <div className="flex justify-between text-[#B8431A]"><span>Store Credit</span><span className="font-bold">−₹{creditUsed}</span></div>}
            </div>
            {user && creditBalance>0 && (
              <div className="mt-3 border-t-2 border-[#1F3D2B]/30 pt-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input data-testid="use-credit" type="checkbox" checked={useCredit} onChange={e=>setUseCredit(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#1F3D2B]"/>
                  <div>
                    <div className="font-display font-black text-sm text-[#1F3D2B]">Use ₹{creditBalance} store credit</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]/60 mt-0.5">Earned from your referrals — applies to this order.</div>
                  </div>
                </label>
              </div>
            )}
            <div className="mt-3 border-t-2 border-[#1F3D2B]/30 pt-3">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-2">Coupon / Referral Code</div>
              {couponApplied ? (
                <div className="flex items-center justify-between border-2 border-[#1F3D2B] bg-[#D98F00]/40 px-3 py-2">
                  <div className="text-sm font-black uppercase tracking-wider text-[#1F3D2B]">{couponApplied.code} · ₹{couponApplied.discount} off</div>
                  <button onClick={clearCoupon} className="text-xs font-black uppercase text-[#B8431A]">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input data-testid="coupon-input" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="LAXMI100" className="flex-1 border-2 border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-mono font-bold text-sm focus:outline-none"/>
                  <button data-testid="apply-coupon" onClick={applyCoupon} className="bg-[#1F3D2B] text-[#F5F1E8] border-2 border-[#1F3D2B] px-4 font-black uppercase text-xs tracking-widest">Apply</button>
                </div>
              )}
              {couponMsg && <div className={`text-xs mt-1.5 font-bold ${couponApplied?"text-[#1F3D2B]":"text-[#B8431A]"}`}>{couponMsg}</div>}
            </div>
            <div className="flex justify-between items-end mt-4 pt-4 border-t-[3px] border-[#1F3D2B]">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B]">Total</div>
              <div data-testid="checkout-total" className="font-display font-black text-3xl text-[#1F3D2B]">₹{total}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
