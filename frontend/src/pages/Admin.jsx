import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Package, ShoppingCart, Briefcase, IndianRupee, Users, Trash2, Edit3, Plus, X, Upload, Download } from "lucide-react";

const TABS = [
  { id: "dash", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "leads", label: "B2B Leads" },
];

const ORDER_STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "pending_verification", label: "Pending Verification" },
  { id: "verified", label: "Verified" },
  { id: "shipment_created", label: "Shipment Created" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const ORDER_STATUS_LABELS = ORDER_STATUS_OPTIONS.reduce((acc, item) => {
  if (item.id !== "all") acc[item.id] = item.label;
  return acc;
}, {});

const EMPTY_PRODUCT = { name:"", category:"mustard", description:"", badge:"NEW", images:["","","",""], bg:"#D98F00",
  sizes:[{label:"1L", price:0}], benefits:[], rating:4.8, reviews:0 };

export default function Admin() {
  const auth = useAuth();
  if (!auth) return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading…</div>;
  const { user, loading } = auth;
  const nav = useNavigate();
  const [tab, setTab] = useState("dash");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [editing, setEditing] = useState(null); // product obj or null
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) nav("/admin-login");
  }, [loading, user, nav]);

  const reload = async () => {
    const [s, p, o, l] = await Promise.all([
      api.get("/admin/stats").then(r=>r.data),
      api.get("/products").then(r=>r.data),
      api.get("/admin/orders").then(r=>r.data),
      api.get("/admin/leads").then(r=>r.data),
    ]);
    setStats(s); setProducts(p); setOrders(o); setLeads(l);
  };
  useEffect(() => { if (user?.role==="admin") reload(); /* eslint-disable-next-line */ }, [user]);

  if (!user || user.role !== "admin") return null;

  const logout = () => {
    localStorage.removeItem("laxmi_token");
    window.location.href = "/admin-login";
  };

  const saveProduct = async (p) => {
    const images = Array.isArray(p.images) ? p.images.filter(x=>x.trim()!=="") : [];
    const payload = { ...p, images, sizes: p.sizes.map(s=>({label:s.label, price: Number(s.price)})), reviews: Number(p.reviews)||0, rating: Number(p.rating)||4.8,
      benefits: typeof p.benefits === "string" ? p.benefits.split(",").map(x=>x.trim()).filter(Boolean) : p.benefits };
    if (p.product_id) await api.put(`/products/${p.product_id}`, payload);
    else await api.post("/products", payload);
    setEditing(null); await reload();
  };
  const deleteProduct = async (id) => { if (!window.confirm("Delete this product?")) return; await api.delete(`/products/${id}`); await reload(); };
  const updateOrderStatus = async (id, status) => { await api.put(`/admin/orders/${id}/status`, { status }); await reload(); };
  const verifyOrder = async (id) => { await api.post(`/admin/orders/${id}/verify`, {}); await reload(); };
  const createShipment = async (id, currentAddress) => {
    const shouldEditAddress = window.confirm("Do you want to edit the shipping address before shipment creation?");
    let addressPayload = {};
    if (shouldEditAddress) {
      const address = window.prompt("Address", currentAddress?.address || "");
      const city = window.prompt("City", currentAddress?.city || "");
      const pincode = window.prompt("Pincode", currentAddress?.pincode || "");
      addressPayload = {
        address: {
          address: address || currentAddress?.address || "",
          city: city || currentAddress?.city || "",
          pincode: pincode || currentAddress?.pincode || "",
        },
      };
    }
    await api.post(`/admin/orders/${id}/create-shipment`, addressPayload);
    await reload();
  };
  const updateLeadStatus = async (id, status) => { await api.put(`/admin/leads/${id}/status`, { status }); await reload(); };
  const filteredOrders = orders.filter((order) => (orderFilter === "all" ? true : order.order_status === orderFilter));

  return (
    <div data-testid="admin-page" className="min-h-screen bg-[#F8F7F4] px-4 sm:px-5 md:px-10 py-6 md:py-10">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-4 md:p-6 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/60">Admin Dashboard</div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1F3D2B] tracking-tight mt-1">Control Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#1F3D2B] font-medium">{user?.email}</span>
            <button onClick={logout} className="px-4 py-2 bg-[#1F3D2B] text-white text-sm font-medium rounded-lg hover:bg-[#2A5240] transition-colors">Logout</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            data-testid={`tab-${t.id}`}
            onClick={()=>setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              tab===t.id
                ? "bg-[#1F3D2B] text-white shadow-sm"
                : "bg-white text-[#1F3D2B] hover:text-[#F5F1E8] hover:bg-[#1F3D2B] border border-[#E5E5E0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab==="dash" && stats && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon:IndianRupee, label:"Revenue", value:`₹${(stats.revenue || 0).toLocaleString('en-IN')}`, accent:true, isRevenue:true },
            { icon:ShoppingCart, label:"Orders", value:stats.orders },
            { icon:Package, label:"Products", value:stats.products },
            { icon:Briefcase, label:"B2B Leads", value:stats.leads },
            { icon:Users, label:"Customers", value:stats.customers },
          ].map((s,i)=>{const Ic=s.icon;return (
            <div key={i} className={`rounded-xl p-4 shadow-sm border ${
              s.isRevenue 
                ? "border-[#1F3D2B] bg-[#1F3D2B]" 
                : s.accent 
                  ? "border-[#1F3D2B] bg-[#1F3D2B]" 
                  : "border-[#E5E5E0] bg-white"
            }`}>
              <Ic size={20} strokeWidth={2} className={s.accent?"text-[#D98F00]":"text-[#1F3D2B]"}/>
              <div className={`font-display font-bold text-xl sm:text-2xl mt-2 ${
                s.isRevenue || s.accent 
                  ? "text-white font-black drop-shadow-sm" 
                  : "text-[#1F3D2B]"
              }`}>{s.value || '0'}</div>
              <div className={`text-xs font-medium uppercase tracking-wider ${
                s.isRevenue || s.accent 
                  ? "text-white/90" 
                  : "text-[#1F3D2B]/80"
              }`}>{s.label}</div>
            </div>
          );})}
        </motion.div>
      )}

      {tab==="products" && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-4 md:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="font-display font-bold text-xl text-[#1F3D2B]">{products.length} Products</div>
            <div className="flex gap-2">
              <label data-testid="csv-import" className="cursor-pointer px-4 py-2 bg-[#F8F7F4] text-[#1F3D2B] border border-[#E5E5E0] rounded-lg text-sm font-medium flex items-center gap-2 hover:border-[#1F3D2B] transition-colors">
                <Upload size={16}/> Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={async (e)=>{
                  const f = e.target.files?.[0]; if (!f) return;
                  const text = await f.text();
                  try {
                    const rows = parseCSV(text);
                    if (!rows.length) throw new Error("Empty CSV");
                    const payload = { products: rows.map(r=>({
                      name: r.name, category: (r.category||"mustard").toLowerCase(),
                      sizes: (r.sizes||"1L:0").split("|").map(s=>{ const [label, price] = s.split(":"); return {label: label.trim(), price: Number(price)||0}; }),
                      description: r.description||"", badge: r.badge||"NEW",
                      image: r.image||"", bg: r.bg||"#D98F00",
                      benefits: (r.benefits||"").split(",").map(x=>x.trim()).filter(Boolean),
                      rating: Number(r.rating)||4.8, reviews: Number(r.reviews)||0
                    })) };
                    const { data } = await api.post("/admin/products/import", payload);
                    setError("");
                    setNotice(`Imported ${data.created} products`);
                    await reload();
                  } catch(err) {
                    setNotice("");
                    setError("Import failed: " + (err?.response?.data?.detail || err.message));
                  }
                  finally { e.target.value = ""; }
                }}/>
              </label>
              <button data-testid="new-product-btn" onClick={()=>setEditing({...EMPTY_PRODUCT})} className="px-4 py-2 bg-[#1F3D2B] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#2A5240] transition-colors"><Plus size={16}/> Add Product</button>
            </div>
          </div>
          {notice && <div className="mb-4 text-sm font-medium text-[#1F3D2B] bg-[#F0FDF4] border border-[#86EFAC] rounded-lg px-4 py-3">{notice}</div>}
          {error && <div className="mb-4 text-sm font-medium text-[#B8431A] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-3">{error}</div>}
          <div className="text-xs text-[#1F3D2B]/40 mb-4 font-mono hidden sm:block">CSV headers: name, category, sizes (e.g. "500ml:159|1L:289"), description, badge, image, bg, benefits, rating, reviews</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p=>(
              <div key={p.product_id} className="bg-[#F8F7F4] rounded-lg border border-[#E5E5E0] p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg border border-[#E5E5E0] flex-shrink-0 overflow-hidden" style={{background:p.bg}}>{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-contain"/>}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm text-[#1F3D2B] truncate">{p.name}</div>
                    <div className="text-xs font-medium text-[#1F3D2B]/80 capitalize">{p.category} · {p.sizes.length} sizes</div>
                    <div className="text-xs mt-1 text-[#1F3D2B]/80">From <span className="font-semibold text-[#1F3D2B]">₹{p.sizes[0].price}</span></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={()=>setEditing(p)} className="flex-1 py-2 bg-white border border-[#E5E5E0] rounded-lg text-sm font-medium text-[#1F3D2B] hover:border-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-white transition-colors flex items-center justify-center gap-1"><Edit3 size={14}/> Edit</button>
                  <button onClick={()=>deleteProduct(p.product_id)} className="px-3 py-2 bg-white border border-[#FECACA] text-[#B8431A] rounded-lg hover:bg-[#FEF2F2] transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-4 md:p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div className="font-display font-bold text-xl text-[#1F3D2B]">{filteredOrders.length} Orders</div>
            <div className="flex items-center gap-2">
              <select
                value={orderFilter}
                onChange={(event) => setOrderFilter(event.target.value)}
                className="bg-white border border-[#E5E5E0] rounded px-3 py-2 text-xs font-medium text-[#1F3D2B]"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
              <button data-testid="export-orders-csv" onClick={async ()=>{
              const r = await api.get("/admin/orders.csv", { responseType: "blob" });
              const url = URL.createObjectURL(r.data);
              const a = document.createElement("a"); a.href = url; a.download = "laxmi-orders.csv"; a.click(); URL.revokeObjectURL(url);
            }} className="px-4 py-2 bg-[#F8F7F4] text-[#1F3D2B] border border-[#E5E5E0] rounded-lg text-sm font-medium flex items-center gap-2 hover:border-[#1F3D2B] transition-colors">
              <Download size={16}/> Export CSV
            </button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredOrders.length===0 && <div className="text-sm text-[#1F3D2B]/50 py-8 text-center">No orders yet.</div>}
            {filteredOrders.map(o=>(
              <div key={o.order_id} className="bg-[#F8F7F4] rounded-lg border border-[#E5E5E0] p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-mono font-semibold text-sm text-[#1F3D2B]">{o.order_id}</div>
                    <div className="text-xs text-[#1F3D2B]/80">{o.address?.name} · {o.address?.phone}</div>
                    <div className="text-xs text-[#1F3D2B]/70">{new Date(o.created_at).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-lg text-[#1F3D2B]">₹{o.total}</div>
                    <div className="mt-1 bg-white border border-[#E5E5E0] rounded px-2 py-1 text-xs font-semibold text-[#1F3D2B]">
                      {ORDER_STATUS_LABELS[o.order_status] || o.order_status || o.status}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#1F3D2B]/80">{o.items.map(i=>`${i.name} (${i.size}) × ${i.qty}`).join(" · ")}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.order_status === "pending_verification" && (
                    <button onClick={()=>verifyOrder(o.order_id)} className="px-3 py-1.5 bg-[#1F3D2B] text-white rounded text-xs font-medium">
                      Verify Order
                    </button>
                  )}
                  {o.order_status === "verified" && (
                    <button onClick={()=>createShipment(o.order_id, o.address)} className="px-3 py-1.5 bg-[#D98F00] text-[#1F3D2B] rounded text-xs font-semibold">
                      Create Shipment
                    </button>
                  )}
                  {o.order_status === "shipment_created" && (
                    <button onClick={()=>updateOrderStatus(o.order_id, "shipped")} className="px-3 py-1.5 bg-white border border-[#E5E5E0] rounded text-xs font-medium text-[#1F3D2B]">
                      Mark Shipped
                    </button>
                  )}
                </div>
                
                {(o.tracking || o.awb_code || o.shipment_id) && (
                  <div className="mt-3 flex items-center justify-between border-t border-[#E5E5E0] pt-3">
                    <div className="text-xs text-[#1F3D2B]">
                      <span className="font-medium text-[#1F3D2B]/70">Courier:</span> {o.courier_name || o.tracking?.courier || "Assigned"}
                      <span className="mx-2 text-[#E5E5E0]">|</span>
                      <span className="font-medium text-[#1F3D2B]/70">AWB:</span> <span className="font-mono bg-[#E5E5E0]/50 px-1 py-0.5 rounded">{o.awb_code || o.tracking?.trackingId || "-"}</span>
                      <span className="mx-2 text-[#E5E5E0]">|</span>
                      <span className="font-medium text-[#1F3D2B]/70">Shipment ID:</span> {o.shipment_id || "-"}
                    </div>
                    {(o.tracking_url || o.tracking?.trackingUrl) && (
                      <a href={o.tracking_url || o.tracking?.trackingUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#D98F00] hover:text-[#1F3D2B] transition-colors">
                        Track Shipment →
                      </a>
                    )}
                  </div>
                )}
                
                <div className="mt-3"><Link to={`/invoice/${o.order_id}`} className="text-sm font-medium text-[#1F3D2B] hover:text-[#D98F00] transition-colors">View Invoice →</Link></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="leads" && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-display font-bold text-xl text-[#1F3D2B]">{leads.length} B2B Leads</div>
          </div>
          <div className="space-y-3">
            {leads.length===0 && <div className="text-sm text-[#1F3D2B]/50 py-8 text-center">No B2B leads yet.</div>}
            {leads.map(l=>(
              <div key={l.lead_id} className="bg-[#F8F7F4] rounded-lg border border-[#E5E5E0] p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-display font-semibold text-base text-[#1F3D2B]">{l.company}</div>
                    <div className="text-xs text-[#1F3D2B]/80">{l.name} · {l.phone}</div>
                    <div className="text-xs text-[#1F3D2B]/70">Volume: <span className="font-semibold">{l.volume||"—"} L</span></div>
                    {l.message && <div className="mt-2 text-sm text-[#1F3D2B]/80 bg-white p-3 rounded border border-[#E5E5E0]">&ldquo;{l.message}&rdquo;</div>}
                  </div>
                  <select value={l.status} onChange={e=>updateLeadStatus(l.lead_id, e.target.value)} className="bg-white border border-[#E5E5E0] rounded px-3 py-1.5 text-xs font-medium text-[#1F3D2B] capitalize self-start">
                    {["new","contacted","quoted","won","lost"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && <ProductEditor product={editing} onClose={()=>setEditing(null)} onSave={saveProduct}/>}
    </div>
  );
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h=>h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const parts = []; let cur = ""; let inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { parts.push(cur); cur = ""; }
      else cur += ch;
    }
    parts.push(cur);
    const row = {}; headers.forEach((h,i)=>{ row[h] = (parts[i]||"").trim(); });
    return row;
  });
}

function ProductEditor({ product, onClose, onSave }) {
  const ensureImages = (imgs) => { const arr = Array.isArray(imgs) ? imgs.filter(Boolean) : []; while (arr.length < 4) arr.push(""); return arr.slice(0,4); };
  const [p, setP] = useState({ ...product, images: ensureImages(product.images), benefits: Array.isArray(product.benefits)? product.benefits.join(", ") : (product.benefits||"") });
  const set = (k,v) => setP(x=>({...x, [k]: v}));
  const setSize = (i, k, v) => setP(x=>({...x, sizes: x.sizes.map((s,idx)=>idx===i?{...s,[k]:v}:s)}));
  const addSize = () => setP(x=>({...x, sizes: [...x.sizes, {label:"", price:0}]}));
  const rmSize = (i) => setP(x=>({...x, sizes: x.sizes.filter((_,idx)=>idx!==i)}));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg my-8 border border-[#E5E5E0]">
        <div className="flex justify-between items-center p-5 border-b border-[#E5E5E0] bg-[#F8F7F4] rounded-t-xl">
          <div className="font-display font-bold text-xl text-[#1F3D2B]">{p.product_id?"Edit":"New"} Product</div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E0] flex items-center justify-center hover:border-[#1F3D2B] transition-colors"><X size={16}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Name</span>
              <input value={p.name||""} onChange={e=>set("name",e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Category</span>
              <select value={p.category} onChange={e=>set("category", e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors">
                <option value="mustard">Mustard</option><option value="soyabean">Soyabean</option><option value="groundnut">Groundnut</option><option value="sunflower">Sunflower</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Description</span>
            <textarea rows={3} value={p.description||""} onChange={e=>set("description",e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Badge</span>
              <input value={p.badge||""} onChange={e=>set("badge",e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Background Color</span>
              <input value={p.bg||""} onChange={e=>set("bg",e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors" placeholder="#D98F00"/>
            </label>
          </div>
          <div>
            <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Images (4 URLs)</span>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {p.images.map((img, i) => (
                <input key={i} placeholder={`Image ${i+1} URL`} value={img} onChange={e=>{
                  const newImages = [...p.images];
                  newImages[i] = e.target.value;
                  set("images", newImages);
                }} className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Sizes</span>
            <div className="space-y-2 mt-1">
              {p.sizes.map((s,i)=>(
                <div key={i} className="flex gap-2">
                  <input placeholder="500ml" value={s.label} onChange={e=>setSize(i,"label",e.target.value)} className="flex-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
                  <input placeholder="Price" type="number" value={s.price} onChange={e=>setSize(i,"price",e.target.value)} className="w-32 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors"/>
                  <button onClick={()=>rmSize(i)} className="px-3 py-2 bg-white border border-[#FECACA] text-[#B8431A] rounded-lg hover:bg-[#FEF2F2] transition-colors"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            <button onClick={addSize} className="mt-2 text-sm font-medium text-[#1F3D2B] hover:text-[#2A5240] transition-colors">+ Add Size</button>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-[#1F3D2B]/80 uppercase tracking-wider">Benefits (comma separated)</span>
            <input value={p.benefits} onChange={e=>set("benefits",e.target.value)} className="w-full mt-1 border border-[#E5E5E0] rounded-lg px-3 py-2 bg-[#F8F7F4] focus:border-[#1F3D2B] focus:outline-none transition-colors" placeholder="Healthy, Organic, Fresh"/>
          </label>
        </div>
        <div className="p-5 border-t border-[#E5E5E0] flex justify-end gap-3 bg-[#F8F7F4] rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2.5 border border-[#E5E5E0] bg-white text-[#1F3D2B] font-medium rounded-lg hover:border-[#1F3D2B] transition-colors">Cancel</button>
          <button data-testid="save-product" onClick={()=>onSave(p)} className="px-6 py-2.5 bg-[#1F3D2B] text-white font-medium rounded-lg hover:bg-[#2A5240] transition-colors">Save Product</button>
        </div>
      </div>
    </div>
  );
}
