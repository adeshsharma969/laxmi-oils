const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export const paymentLabel = (method) => {
  if (method === "razorpay") return "Razorpay (UPI / Card)";
  if (method === "cod") return "Cash on Delivery";
  if (method === "razorpay_mock") return "Razorpay (UPI / Card)";
  if (method === "store_credit") return "Store Credit";
  return method ? String(method).replace(/_/g, " ") : "Payment";
};

export const formatInvoiceDate = (value) => {
  if (!value) return new Date().toLocaleString("en-IN");
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export function buildInvoiceHtml(order) {
  const address = order?.address || {};
  const items = Array.isArray(order?.items) ? order.items : [];
  const rows = items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.size)}</span>
          </td>
          <td>${escapeHtml(item.qty)}</td>
          <td>${escapeHtml(formatMoney(item.price))}</td>
          <td>${escapeHtml(formatMoney(Number(item.price || 0) * Number(item.qty || 0)))}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Laxmi Invoice ${escapeHtml(order?.order_id || "")}</title>
  <style>
    :root { color: #1F3D2B; background: #F5F1E8; font-family: Arial, sans-serif; }
    body { margin: 0; padding: 32px; }
    .invoice { max-width: 820px; margin: 0 auto; background: #fffaf0; border: 3px solid #1F3D2B; padding: 36px; }
    .top, .grid, .line { display: flex; justify-content: space-between; gap: 24px; }
    .top { border-bottom: 3px solid #1F3D2B; padding-bottom: 20px; }
    h1, h2, p { margin: 0; }
    h1 { font-size: 34px; letter-spacing: -1px; }
    h2 { font-size: 18px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .muted { color: rgba(31, 61, 43, 0.72); font-size: 13px; }
    .badge { display: inline-block; margin-top: 8px; border: 2px solid #1F3D2B; background: #D98F00; padding: 4px 8px; font-weight: 800; text-transform: uppercase; font-size: 12px; }
    .grid { margin-top: 28px; }
    .grid > div { width: 50%; }
    table { width: 100%; margin-top: 28px; border-collapse: collapse; }
    th { background: rgba(217, 143, 0, 0.18); border-top: 3px solid #1F3D2B; border-bottom: 3px solid #1F3D2B; padding: 10px; text-align: left; }
    td { border-bottom: 1px solid rgba(31, 61, 43, 0.18); padding: 12px 10px; vertical-align: top; }
    td:not(:first-child), th:not(:first-child) { text-align: right; }
    td span { display: block; margin-top: 4px; color: rgba(31, 61, 43, 0.72); font-size: 12px; }
    .totals { width: min(340px, 100%); margin: 24px 0 0 auto; }
    .line { padding: 5px 0; }
    .grand { border-top: 3px solid #1F3D2B; margin-top: 8px; padding-top: 12px; font-size: 20px; font-weight: 900; }
    .thanks { border-top: 2px solid rgba(31, 61, 43, 0.25); margin-top: 32px; padding-top: 18px; text-align: center; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    @media print {
      body { padding: 0; background: #fff; }
      .invoice { border: 0; max-width: none; }
    }
    @media (max-width: 640px) {
      body { padding: 14px; }
      .invoice { padding: 18px; }
      .top, .grid { display: block; }
      .grid > div { width: 100%; margin-bottom: 18px; }
      h1 { font-size: 28px; }
    }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="top">
      <div>
        <h1>LAXMI</h1>
        <p class="muted">Edible Oils - Jaipur</p>
        <p class="muted" style="margin-top: 10px;">hello@laxmioils.in - +91 98765 43210</p>
      </div>
      <div style="text-align: right;">
        <h2>Payment Invoice</h2>
        <p><strong>${escapeHtml(order?.order_id || "Draft")}</strong></p>
        <p class="muted">${escapeHtml(formatInvoiceDate(order?.created_at))}</p>
        <span class="badge">${escapeHtml(order?.payment_status || order?.status || "paid")}</span>
      </div>
    </section>

    <section class="grid">
      <div>
        <h2>Billed To</h2>
        <p><strong>${escapeHtml(address.name)}</strong></p>
        <p>${escapeHtml(address.address)}</p>
        ${address.landmark ? `<p>${escapeHtml(address.landmark)}</p>` : ""}
        <p>${escapeHtml([address.city, address.pincode].filter(Boolean).join(" - "))}</p>
        <p>${escapeHtml(address.phone)}</p>
        <p>${escapeHtml(address.email)}</p>
      </div>
      <div>
        <h2>Delivery</h2>
        <p><strong>${escapeHtml(order?.delivery || "standard")}</strong></p>
        <p class="muted">Payment: ${escapeHtml(paymentLabel(order?.payment_method))}</p>
      </div>
    </section>

    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <section class="totals">
      <div class="line"><span>Subtotal</span><strong>${escapeHtml(formatMoney(order?.subtotal))}</strong></div>
      <div class="line"><span>Shipping</span><strong>${Number(order?.shipping || 0) === 0 ? "FREE" : escapeHtml(formatMoney(order?.shipping))}</strong></div>
      ${Number(order?.discount || 0) > 0 ? `<div class="line"><span>Coupon ${order?.coupon_code ? `(${escapeHtml(order.coupon_code)})` : ""}</span><strong>- ${escapeHtml(formatMoney(order.discount))}</strong></div>` : ""}
      ${Number(order?.credit_used || 0) > 0 ? `<div class="line"><span>Store Credit</span><strong>- ${escapeHtml(formatMoney(order.credit_used))}</strong></div>` : ""}
      <div class="line grand"><span>Total Paid</span><span>${escapeHtml(formatMoney(order?.total))}</span></div>
    </section>

    <p class="thanks">Thank you for choosing Laxmi - GST inclusive invoice</p>
  </main>
</body>
</html>`;
}

export function downloadInvoice(order) {
  if (typeof window === "undefined" || !order) return;

  const blob = new Blob([buildInvoiceHtml(order)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laxmi-invoice-${order.order_id || "order"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
