import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SearchCommand from "./SearchCommand";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/b2b", label: "Bulk / B2B" },
];

const CATEGORIES = [
  { slug: "mustard", name: "Mustard Oil", color: "#D98F00" },
  { slug: "soyabean", name: "Soyabean Oil", color: "#4A7C59" },
  { slug: "groundnut", name: "Groundnut Oil", color: "#B8431A" },
  { slug: "sunflower", name: "Sunflower Oil", color: "#F4B942" },
];

export default function Navbar() {
  const { count, setDrawerOpen, bump } = useCart();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <header data-testid="navbar" className={`sticky top-0 z-40 bg-[#F5F1E8] border-b-[3px] border-[#1F3D2B] transition-shadow ${scrolled?"shadow-[0_6px_0_0_#1F3D2B]":""}`}>
      <div className="flex items-center justify-between px-4 sm:px-5 md:px-10 py-3 md:py-4">
        <Link to="/" data-testid="brand-logo" className="flex items-center group">
          <img src="/logo.png" alt="Laxmi Oils" className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto group-hover:scale-105 transition-transform" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase()}`} className={({isActive}) => `font-bold uppercase text-sm tracking-wider ${isActive?"text-[#B8431A]":"text-[#1F3D2B]"} hover:text-[#B8431A] transition-colors`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button data-testid="search-trigger" onClick={()=>setSearchOpen(true)} className="touch-target border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-2 sm:px-3 py-2 font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2 hover:bg-[#D98F00]" aria-label="Search">
            <Search size={16} strokeWidth={3}/>
            <span className="hidden lg:inline text-xs tracking-widest">search</span>
          </button>
          {user ? (
            <div className="relative hidden md:block">
              <button data-testid="account-btn" onClick={()=>setMenuOpen(o=>!o)} className="touch-target border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2">
                <UserIcon size={16} strokeWidth={3}/> <span className="truncate max-w-[80px]">{user.name?.split(" ")[0] || "Account"}</span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} className="absolute right-0 mt-2 w-56 bg-[#F5F1E8] border-[3px] border-[#1F3D2B] shadow-[5px_5px_0_0_#1F3D2B] z-50">
                    <Link to="/account" onClick={()=>setMenuOpen(false)} className="block px-4 py-3 border-b-2 border-[#1F3D2B]/20 font-bold uppercase text-xs tracking-widest hover:bg-[#D98F00]">My Orders</Link>
                    <button onClick={()=>{logout(); setMenuOpen(false); nav("/");}} className="w-full text-left px-4 py-3 font-bold uppercase text-xs tracking-widest text-[#B8431A] hover:bg-[#B8431A] hover:text-[#F5F1E8] flex items-center gap-2"><LogOut size={12} strokeWidth={3}/> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" data-testid="nav-login" className="hidden md:inline-flex touch-target border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold uppercase text-xs sm:text-sm tracking-wider items-center gap-2 hover:bg-[#D98F00]">
              <UserIcon size={16} strokeWidth={3}/> <span>Login</span>
            </Link>
          )}
          <motion.button
            data-testid="cart-button"
            onClick={() => setDrawerOpen(true)}
            key={bump}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.35 }}
            className="touch-target relative bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-3 sm:px-4 py-2 font-bold uppercase text-xs sm:text-sm tracking-wider hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors flex items-center gap-1 sm:gap-2"
          >
            <ShoppingBag size={18} strokeWidth={3}/>
            <span className="hidden sm:inline">Cart</span>
            <span data-testid="cart-count" className="bg-[#D98F00] text-[#1F3D2B] px-1.5 sm:px-2 py-0.5 text-xs font-black border-2 border-[#F5F1E8]">{count}</span>
          </motion.button>
          <button data-testid="menu-toggle" onClick={() => setOpen(o=>!o)} className="touch-target md:hidden w-11 h-11 border-[3px] border-[#1F3D2B] flex items-center justify-center">
            {open ? <X size={22} strokeWidth={3}/> : <Menu size={22} strokeWidth={3}/>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} transition={{duration:0.2}} className="md:hidden overflow-hidden border-t-[3px] border-[#1F3D2B] bg-[#F5F1E8]">
            <div className="flex flex-col">
              {/* Main Navigation */}
              <div className="py-2">
                <div className="px-6 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8431A]">Menu</div>
                {links.map(l => {
                  const isActive = location.pathname === l.to;
                  return (
                    <NavLink key={l.to} to={l.to} onClick={()=>setOpen(false)} className={`touch-target px-6 py-3.5 border-b border-[#1F3D2B]/10 font-bold uppercase tracking-wide text-sm ${isActive ? "text-[#B8431A] bg-[#D98F00]/20" : "text-[#1F3D2B]"} active:bg-[#D98F00]`}>{l.label}</NavLink>
                  );
                })}
              </div>

              {/* Category Filters */}
              <div className="py-2 border-t-2 border-[#1F3D2B]/10">
                <div className="px-6 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8431A]">Shop by Category</div>
                <div className="grid grid-cols-2 gap-2 px-4 py-2">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/products?cat=${cat.slug}`}
                      onClick={()=>setOpen(false)}
                      className="touch-target flex items-center gap-2 px-3 py-3 border-2 border-[#1F3D2B] bg-[#F5F1E8] hover:bg-[#D98F00] transition-colors"
                      style={{borderLeftWidth: "4px", borderLeftColor: cat.color}}
                    >
                      <span className="text-xs font-bold uppercase tracking-wide text-[#1F3D2B]">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <Link to="/products" onClick={()=>setOpen(false)} className="touch-target mx-4 mt-1 block text-center px-4 py-3 border-2 border-[#1F3D2B] bg-[#1F3D2B] text-[#F5F1E8] font-bold uppercase text-xs tracking-wider hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors">
                  View All Products →
                </Link>
              </div>

              {/* Account Section */}
              <div className="py-2 border-t-2 border-[#1F3D2B]/10">
                <div className="px-6 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8431A]">Account</div>
                {user ? (
                  <>
                    <NavLink to="/account" onClick={()=>setOpen(false)} className="touch-target px-6 py-3.5 border-b border-[#1F3D2B]/10 font-bold uppercase tracking-wide text-sm text-[#1F3D2B] active:bg-[#D98F00] flex items-center gap-2">
                      <UserIcon size={16} strokeWidth={3}/> My Orders
                    </NavLink>
                    <button onClick={()=>{logout(); setOpen(false);}} className="touch-target w-full text-left px-6 py-3.5 font-bold uppercase tracking-wide text-sm text-[#B8431A] active:bg-[#B8431A]/10 flex items-center gap-2">
                      <LogOut size={16} strokeWidth={3}/> Logout
                    </button>
                  </>
                ) : (
                  <NavLink to="/login" onClick={()=>setOpen(false)} className="touch-target px-6 py-3.5 font-bold uppercase tracking-wide text-sm text-[#1F3D2B] active:bg-[#D98F00] flex items-center gap-2">
                    <UserIcon size={16} strokeWidth={3}/> Login
                  </NavLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchCommand open={searchOpen} onClose={()=>setSearchOpen(false)}/>
    </header>
  );
}
