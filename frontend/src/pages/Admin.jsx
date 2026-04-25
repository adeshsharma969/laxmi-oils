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

const EMPTY_PRODUCT = { name:"", category:"mustard", description:"", badge:"NEW", images:["","","",""], bg:"#D98F00",
  sizes:[{label:"1L", price:0}], benefits:[], nutrition:{energy:"",fat:"",sat:"",trans:""}, rating:4.8, reviews:0 };

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

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) nav("/login");
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
  const updateLeadStatus = async (id, status) => { await api.put(`/admin/leads/${id}/status`, { status }); await reload(); };

  return (
    <div data-testid="admin-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <div className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-6 mb-4 md:mb-6 flex flex-wrap justify-between items-end gap-3">
        <div>
          <div className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#B8431A]">Control Room</div>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#1F3D2B] tracking-tighter">Admin.</h1>
        </div>
        <Link to="/account" className="touch-target-sm border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm">← Account</Link>
      </div>

      <div className="flex flex-wrap gap-1 sm:gap-2 border-b-2 border-[#1F3D2B]/30 mb-4 md:mb-6">
        {TABS.map(t => (
          <button key={t.id} data-testid={`tab-${t.id}`} onClick={()=>setTab(t.id)} className={`touch-target-sm px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm border-[3px] border-b-0 -mb-[2px] ${tab===t.id?"bg-[#1F3D2B] text-[#F5F1E8] border-[#1F3D2B]":"bg-[#F5F1E8] text-[#1F3D2B] border-transparent hover:border-[#1F3D2B]"}`}>{t.label}</button>
        ))}
      </div>

      {tab==="dash" && stats && (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {[
            { icon:IndianRupee, label:"Revenue", value:`₹${stats.revenue.toLocaleString('en-IN')}`, bg:"#D98F00" },
            { icon:ShoppingCart, label:"Orders", value:stats.orders, bg:"#F5F1E8" },
            { icon:Package, label:"Products", value:stats.products, bg:"#F5F1E8" },
            { icon:Briefcase, label:"B2B Leads", value:stats.leads, bg:"#F5F1E8" },
            { icon:Users, label:"Customers", value:stats.customers, bg:"#F5F1E8" },
          ].map((s,i)=>{const Ic=s.icon;return (
            <div key={i} className="border-[3px] border-[#1F3D2B] p-3 sm:p-4 brutal-shadow-sm" style={{background:s.bg}}>
              <Ic size={20} strokeWidth={2.5}/>
              <div className="font-display font-black text-xl sm:text-2xl md:text-3xl text-[#1F3D2B] mt-2">{s.value}</div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B]/70">{s.label}</div>
            </div>
          );})}
        </motion.div>
      )}

      {tab==="products" && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div className="font-display font-black text-xl sm:text-2xl text-[#1F3D2B]">{products.length} products</div>
            <div className="flex gap-2">
              <label data-testid="csv-import" className="cursor-pointer touch-target-sm bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 hover:bg-[#D98F00]">
                <Upload size={14} strokeWidth={3}/> Import
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
              <button data-testid="new-product-btn" onClick={()=>setEditing({...EMPTY_PRODUCT})} className="touch-target-sm bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2"><Plus size={14} strokeWidth={3}/> New</button>
            </div>
          </div>
          {notice && <div className="mb-3 text-sm font-bold text-[#1F3D2B] border-2 border-[#1F3D2B] bg-[#D98F00]/30 px-3 py-2">{notice}</div>}
          {error && <div className="mb-3 text-sm font-bold text-[#B8431A] border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2">{error}</div>}
          <div className="text-[10px] sm:text-[11px] text-[#1F3D2B]/60 mb-3 font-mono hidden sm:block">CSV headers: name, category, sizes (e.g. "500ml:159|1L:289"), description, badge, image, bg, benefits, rating, reviews</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {products.map(p=>(
              <div key={p.product_id} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 sm:p-4 brutal-shadow-sm">
                <div className="flex gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-[#1F3D2B] flex-shrink-0" style={{background:p.bg}}>{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-contain"/>}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-black text-sm sm:text-base text-[#1F3D2B] truncate">{p.name}</div>
                    <div className="text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-[#1F3D2B]/70">{p.category} · {p.sizes.length} sizes</div>
                    <div className="text-xs mt-1">From <b>₹{p.sizes[0].price}</b></div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>setEditing(p)} className="touch-target-sm flex-1 border-2 border-[#1F3D2B] bg-[#D98F00] py-1.5 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-1"><Edit3 size={12} strokeWidth={3}/> Edit</button>
                  <button onClick={()=>deleteProduct(p.product_id)} className="touch-target-sm border-2 border-[#1F3D2B] bg-[#F5F1E8] px-3 py-1.5 text-[#B8431A]"><Trash2 size={14} strokeWidth={3}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="orders" && (
        <div>
          <div className="flex justify-end mb-3">
            <button data-testid="export-orders-csv" onClick={async ()=>{
              const r = await api.get("/admin/orders.csv", { responseType: "blob" });
              const url = URL.createObjectURL(r.data);
              const a = document.createElement("a"); a.href = url; a.download = "laxmi-orders.csv"; a.click(); URL.revokeObjectURL(url);
            }} className="touch-target-sm bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-black uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2 hover:bg-[#D98F00]">
              <Download size={14} strokeWidth={3}/> Export
            </button>
          </div>
          <div className="space-y-3">
            {orders.length===0 && <div className="text-xs sm:text-sm">No orders yet.</div>}
            {orders.map(o=>(
              <div key={o.order_id} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 sm:p-4 brutal-shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-mono font-black text-sm sm:text-base text-[#1F3D2B]">{o.order_id}</div>
                    <div className="text-[10px] sm:text-[11px] text-[#1F3D2B]/70">{o.address?.name} · {o.address?.phone}</div>
                    <div className="text-[10px] sm:text-[11px] text-[#1F3D2B]/70">{new Date(o.created_at).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-lg sm:text-xl text-[#1F3D2B]">₹{o.total}</div>
                    <select value={o.status} onChange={e=>updateOrderStatus(o.order_id, e.target.value)} className="mt-1 border-2 border-[#1F3D2B] bg-[#F5F1E8] px-2 py-1 text-xs sm:text-sm font-black uppercase">
                      {["paid","packed","shipped","delivered","cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-2 text-[10px] sm:text-xs">{o.items.map(i=>`${i.name} (${i.size}) × ${i.qty}`).join(" · ")}</div>
                <div className="mt-2"><Link to={`/invoice/${o.order_id}`} className="text-xs sm:text-sm font-black uppercase tracking-[0.12em] underline">View Invoice →</Link></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="leads" && (
        <div className="space-y-3">
          {leads.length===0 && <div className="text-xs sm:text-sm">No B2B leads yet.</div>}
          {leads.map(l=>(
            <div key={l.lead_id} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 sm:p-4 brutal-shadow-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="font-display font-black text-base sm:text-lg text-[#1F3D2B]">{l.company}</div>
                  <div className="text-[10px] sm:text-xs text-[#1F3D2B]/70">{l.name} · {l.phone}</div>
                  <div className="text-[10px] sm:text-xs text-[#1F3D2B]/70">Volume: <b>{l.volume||"—"} L</b></div>
                  {l.message && <div className="mt-1 text-xs sm:text-sm">"{l.message}"</div>}
                </div>
                <select value={l.status} onChange={e=>updateLeadStatus(l.lead_id, e.target.value)} className="border-2 border-[#1F3D2B] bg-[#F5F1E8] px-2 py-1 text-xs sm:text-sm font-black uppercase self-start">
                  {["new","contacted","quoted","won","lost"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
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
    <div className="fixed inset-0 bg-[#1A1814]/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#F5F1E8] border-[3px] border-[#1F3D2B] my-8 brutal-shadow">
        <div className="flex justify-between items-center p-4 border-b-[3px] border-[#1F3D2B] bg-[#D98F00]">
          <div className="font-display font-black text-2xl text-[#1F3D2B]">{p.product_id?"Edit":"New"} Product</div>
          <button onClick={onClose} className="w-8 h-8 border-2 border-[#1F3D2B]"><X size={14} strokeWidth={3}/></button>
        </div>
        <div className="p-5 space-y-3">
          {[["name","Name"],["bg","BG Color Hex"],["badge","Badge"],["description","Description"]].map(([k,l])=>(
            <label key={k} className="block">
              <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-1">{l}</div>
              {k==="description"? <textarea rows={2} value={p[k]||""} onChange={e=>set(k,e.target.value)} className="w-full border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]"/>
              : <input value={p[k]||""} onChange={e=>set(k,e.target.value)} className="w-full border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]"/>}
            </label>
          ))}
          <div className="block">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-1">Images (4 URLs)</div>
            <div className="grid grid-cols-1 gap-2">
              {p.images.map((img, i) => (
                <input key={i} placeholder={`Image ${i+1} URL`} value={img} onChange={e=>{
                  const newImages = [...p.images];
                  newImages[i] = e.target.value;
                  set("images", newImages);
                }} className="w-full border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]"/>
              ))}
            </div>
          </div>
          <label className="block">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-1">Category</div>
            <select value={p.category} onChange={e=>set("category", e.target.value)} className="w-full border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]">
              <option value="mustard">Mustard</option><option value="soyabean">Soyabean</option><option value="groundnut">Groundnut</option><option value="sunflower">Sunflower</option>
            </select>
          </label>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-2">Sizes</div>
            {p.sizes.map((s,i)=>(
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="500ml" value={s.label} onChange={e=>setSize(i,"label",e.target.value)} className="flex-1 border-2 border-[#1F3D2B] px-2 py-1.5 bg-[#F5F1E8]"/>
                <input placeholder="Price" type="number" value={s.price} onChange={e=>setSize(i,"price",e.target.value)} className="w-28 border-2 border-[#1F3D2B] px-2 py-1.5 bg-[#F5F1E8]"/>
                <button onClick={()=>rmSize(i)} className="border-2 border-[#1F3D2B] px-2 bg-[#F5F1E8] text-[#B8431A]"><Trash2 size={14} strokeWidth={3}/></button>
              </div>
            ))}
            <button onClick={addSize} className="text-xs font-black uppercase tracking-widest border-2 border-[#1F3D2B] px-3 py-1 bg-[#F5F1E8]">+ Add Size</button>
          </div>
          <label className="block">
            <div className="text-xs sm:text-sm font-black uppercase tracking-[0.16em] text-[#1F3D2B] mb-1">Benefits (comma separated)</div>
            <input value={p.benefits} onChange={e=>set("benefits",e.target.value)} className="w-full border-2 border-[#1F3D2B] px-3 py-2 bg-[#F5F1E8]"/>
          </label>
        </div>
        <div className="p-4 border-t-[3px] border-[#1F3D2B] flex justify-end gap-2">
          <button onClick={onClose} className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-2 font-black uppercase text-sm">Cancel</button>
          <button data-testid="save-product" onClick={()=>onSave(p)} className="bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 py-2 font-black uppercase tracking-widest text-sm">Save →</button>
        </div>
      </div>
    </div>
  );
}
