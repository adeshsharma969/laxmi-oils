import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import B2B from "./pages/B2B";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AuthCallback from "./pages/AuthCallback";
import BlogDetail from "./pages/BlogDetail";
import Invoice from "./pages/Invoice";
import { Terms, Privacy, FAQ } from "./pages/Policies";
import { CouponBanner, WhatsAppButton } from "./components/Promo";
import { ShoppingBag } from "lucide-react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({top:0, behavior:"instant"}); }, [pathname]);
  return null;
}

const pageAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: [0.22,1,0.36,1] }
};
const wrap = (C) => <motion.div {...pageAnim}><C/></motion.div>;

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(Home)}/>
        <Route path="/products" element={wrap(Products)}/>
        <Route path="/product/:id" element={wrap(ProductDetail)}/>
        <Route path="/checkout" element={wrap(Checkout)}/>
        <Route path="/b2b" element={wrap(B2B)}/>
        <Route path="/login" element={wrap(Login)}/>
        <Route path="/register" element={wrap(Register)}/>
        <Route path="/account" element={wrap(Account)}/>
        <Route path="/admin" element={wrap(Admin)}/>
        <Route path="/admin-login" element={wrap(AdminLogin)}/>
        <Route path="/auth/callback" element={wrap(AuthCallback)}/>
        <Route path="/blog/:id" element={wrap(BlogDetail)}/>
        <Route path="/invoice/:id" element={wrap(Invoice)}/>
        <Route path="/terms" element={wrap(Terms)}/>
        <Route path="/privacy" element={wrap(Privacy)}/>
        <Route path="/faq" element={wrap(FAQ)}/>
      </Routes>
    </AnimatePresence>
  );
}

function FloatingCart() {
  const { count, setDrawerOpen } = useCart();
  if (count === 0) return null;
  return (
    <motion.button
      data-testid="floating-cart"
      initial={{scale:0, y:80}} animate={{scale:1, y:0}} exit={{scale:0}}
      onClick={()=>setDrawerOpen(true)}
      className="md:hidden fixed bottom-5 right-5 z-30 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-5 py-3 font-black uppercase tracking-widest flex items-center gap-3 shadow-[6px_6px_0_0_#D98F00]"
    >
      <ShoppingBag size={18} strokeWidth={3}/> Cart
      <span className="bg-[#D98F00] text-[#1F3D2B] px-2 py-0.5 text-xs border-2 border-[#F5F1E8]">{count}</span>
    </motion.button>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');

  return (
    <>
      <ScrollToTop/>
      <div className={`relative z-[2] min-h-screen flex flex-col ${isAdminRoute ? 'bg-[#F8F7F4]' : 'bg-[#F5F1E8]'}`}>
        {!isAdminRoute && <CouponBanner/>}
        {!isAdminRoute && <Navbar/>}
        <main className="flex-1">
          <AnimatedRoutes/>
        </main>
        {!isAdminRoute && <Footer/>}
        {!isAdminRoute && <CartDrawer/>}
        {!isAdminRoute && <FloatingCart/>}
        {!isAdminRoute && <WhatsAppButton/>}
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout/>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
