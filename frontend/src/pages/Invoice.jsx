import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, ReceiptText } from "lucide-react";
import api from "../api/client";
import { downloadInvoice, formatInvoiceDate, formatMoney, paymentLabel } from "../lib/invoice";

export default function Invoice() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!id) return;
    setErr(false);
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setErr(true));
  }, [id]);

  if (!id) return <div className="p-10 text-center text-sm">Loading...</div>;
  if (err) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Order not found or not yours.</div>;
  if (!order) return <div className="p-10 text-center text-sm">Loading...</div>;

  const address = order.address || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 md:px-8 py-6 md:py-10 font-body text-[#1F3D2B]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between print:hidden mb-4">
        <Link
          to="/account"
          className="touch-target-sm inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] hover:text-[#B8431A]"
        >
          <ArrowLeft size={15} strokeWidth={3} /> Account
        </Link>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            data-testid="download-invoice"
            onClick={() => downloadInvoice(order)}
            className="touch-target-sm inline-flex items-center justify-center gap-2 bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-black uppercase tracking-[0.14em] text-xs sm:text-sm"
          >
            <Download size={14} strokeWidth={3} /> Download
          </button>
          <button
            data-testid="print-invoice"
            onClick={() => window.print()}
            className="touch-target-sm inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-black uppercase tracking-[0.14em] text-xs sm:text-sm"
          >
            <Printer size={14} strokeWidth={3} /> Print / PDF
          </button>
        </div>
      </div>

      <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-6 md:p-10 brutal-shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4 border-b-[3px] border-[#1F3D2B] pb-4 md:pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-12 w-12 items-center justify-center border-[3px] border-[#1F3D2B] bg-[#D98F00] text-[#1F3D2B]">
                <ReceiptText size={24} strokeWidth={3} />
              </div>
              <div>
                <div className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">LAXMI</div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80">Edible Oils - Jaipur</div>
              </div>
            </div>
            <div className="text-xs sm:text-sm mt-3">hello@laxmioils.in - +91 98765 43210</div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">Payment Invoice</div>
            <div className="font-mono font-black text-base sm:text-lg">{order.order_id}</div>
            <div className="text-xs sm:text-sm mt-1">{formatInvoiceDate(order.created_at)}</div>
            <div className="inline-block mt-2 px-2 py-0.5 text-xs sm:text-sm font-black uppercase tracking-[0.12em] border-2 border-[#1F3D2B] bg-[#D98F00]">
              {order.payment_status || order.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 text-sm">
          <div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80 mb-1">Billed To</div>
            <div className="font-black">{address.name}</div>
            <div>{address.address}</div>
            {address.landmark && <div>{address.landmark}</div>}
            <div>{[address.city, address.pincode].filter(Boolean).join(" - ")}</div>
            <div>{address.phone}</div>
            <div>{address.email}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80 mb-1">Delivery</div>
            <div className="capitalize font-bold">{order.delivery}</div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80 mt-3 mb-1">Payment</div>
            <div className="font-bold">{paymentLabel(order.payment_method)}</div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-y-[3px] border-[#1F3D2B] bg-[#D98F00]/20">
                <th className="text-left p-2">Item</th>
                <th className="text-right p-2">Qty</th>
                <th className="text-right p-2">Rate</th>
                <th className="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={`${item.product_id || item.name}-${index}`} className="border-b border-[#1F3D2B]/20">
                  <td className="p-2">
                    <div className="font-black">{item.name}</div>
                    <div className="text-[10px] sm:text-xs text-[#1F3D2B]/80">{item.size}</div>
                  </td>
                  <td className="p-2 text-right">{item.qty}</td>
                  <td className="p-2 text-right">{formatMoney(item.price)}</td>
                  <td className="p-2 text-right font-bold">{formatMoney(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 md:mt-5 flex justify-end">
          <div className="w-full max-w-xs text-xs sm:text-sm space-y-1">
            <InvoiceLine label="Subtotal" value={formatMoney(order.subtotal)} />
            <InvoiceLine label="Shipping" value={order.shipping === 0 ? "FREE" : formatMoney(order.shipping)} />
            {order.discount > 0 && <InvoiceLine label={`Coupon ${order.coupon_code ? `(${order.coupon_code})` : ""}`} value={`- ${formatMoney(order.discount)}`} tone="save" />}
            {order.credit_used > 0 && <InvoiceLine label="Store Credit" value={`- ${formatMoney(order.credit_used)}`} tone="save" />}
            <div className="flex justify-between pt-2 border-t-[3px] border-[#1F3D2B] font-display font-black text-base sm:text-lg">
              <span>Total Paid</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 pt-4 md:pt-5 border-t-2 border-[#1F3D2B]/30 text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/80 text-center">
          Thank you for choosing Laxmi - GST inclusive
        </div>
      </div>
    </div>
  );
}

function InvoiceLine({ label, value, tone }) {
  return (
    <div className={`flex justify-between gap-3 ${tone === "save" ? "text-[#B8431A]" : ""}`}>
      <span>{label}</span>
      <span className="font-bold text-right">{value}</span>
    </div>
  );
}
