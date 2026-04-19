import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer } from "lucide-react";
import api from "../api/client";

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({data})=>setOrder(data)).catch(()=>setErr(true));
  }, [id]);

  if (err) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Order not found or not yours.</div>;
  if (!order) return <div className="p-10 text-center text-sm">Loading…</div>;

  const a = order.address || {};
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 font-body text-[#1F3D2B]">
      <div className="flex justify-between items-start gap-3 print:hidden mb-4">
        <Link to="/account" className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B] hover:text-[#B8431A]">← Account</Link>
        <button data-testid="print-invoice" onClick={()=>window.print()} className="bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 py-2 font-black uppercase tracking-widest text-xs flex items-center gap-2"><Printer size={14} strokeWidth={3}/> Print / Save PDF</button>
      </div>

      <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 md:p-10">
        <div className="flex flex-wrap justify-between items-start gap-4 border-b-[3px] border-[#1F3D2B] pb-5">
          <div>
            <div className="font-display font-black text-3xl text-[#1F3D2B]">LAXMI</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/70">Edible Oils · Jaipur</div>
            <div className="text-xs mt-2">hello@laxmioils.in · +91 98765 43210</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Invoice</div>
            <div className="font-mono font-black text-lg">{order.order_id}</div>
            <div className="text-xs mt-1">{new Date(order.created_at).toLocaleString('en-IN')}</div>
            <div className="inline-block mt-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-[#1F3D2B] bg-[#D98F00]">{order.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-5 text-sm">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60 mb-1">Billed To</div>
            <div className="font-black">{a.name}</div>
            <div>{a.address}</div>
            <div>{a.city} — {a.pincode}</div>
            <div>{a.phone}</div>
            <div>{a.email}</div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60 mb-1">Delivery</div>
            <div className="capitalize font-bold">{order.delivery}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60 mt-3 mb-1">Payment</div>
            <div className="font-bold uppercase text-xs">{order.payment_method}</div>
          </div>
        </div>

        <table className="w-full mt-6 text-sm border-collapse">
          <thead><tr className="border-y-[3px] border-[#1F3D2B] bg-[#D98F00]/20"><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Rate</th><th className="text-right p-2">Amount</th></tr></thead>
          <tbody>
            {order.items.map((it,i)=>(
              <tr key={i} className="border-b border-[#1F3D2B]/20">
                <td className="p-2"><div className="font-black">{it.name}</div><div className="text-xs text-[#1F3D2B]/70">{it.size}</div></td>
                <td className="p-2 text-right">{it.qty}</td>
                <td className="p-2 text-right">₹{it.price}</td>
                <td className="p-2 text-right font-bold">₹{it.price * it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-xs text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">₹{order.subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="font-bold">{order.shipping===0?"FREE":`₹${order.shipping}`}</span></div>
            {order.discount>0 && <div className="flex justify-between text-[#B8431A]"><span>Coupon {order.coupon_code && `(${order.coupon_code})`}</span><span className="font-bold">−₹{order.discount}</span></div>}
            {order.credit_used>0 && <div className="flex justify-between text-[#B8431A]"><span>Store Credit</span><span className="font-bold">−₹{order.credit_used}</span></div>}
            <div className="flex justify-between pt-2 border-t-[3px] border-[#1F3D2B] font-display font-black text-lg"><span>Total</span><span>₹{order.total}</span></div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t-2 border-[#1F3D2B]/30 text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B]/60 text-center">
          Thank you for choosing Laxmi · Curated in Jaipur · GST inclusive
        </div>
      </div>
    </div>
  );
}
