import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);

const readStoredCart = () => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("laxmi_cart")) || []; } catch { return []; }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    localStorage.setItem("laxmi_cart", JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!user || !ready) return;

    let cancelled = false;
    api.get("/cart").then(({ data }) => {
      if (cancelled) return;
      const remoteItems = data?.items || [];
      if (remoteItems.length) setItems(remoteItems);
      else if (items.length) api.put("/cart", { items }).catch(() => {});
    }).catch(() => {});

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, ready]);

  useEffect(() => {
    if (!user || !ready) return;
    const t = setTimeout(() => {
      api.put("/cart", { items }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [items, user, ready]);

  const add = useCallback((product, size) => {
    const key = `${product.id}-${size.label}`;
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key===key ? {...i, qty: i.qty+1} : i);
      return [...prev, { key, id: product.id, name: product.name, image: product.image, bg: product.bg, size: size.label, price: size.price, qty: 1 }];
    });
    setBump(b => b+1);
    setDrawerOpen(true);
  }, []);

  const addItem = useCallback((item) => {
    const key = `${item.id || item.product_id}-${item.size}`;
    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? {...i, qty: i.qty + (item.qty || 1)} : i);
      return [...prev, {
        key,
        id: item.id || item.product_id,
        name: item.name,
        image: item.image,
        bg: item.bg,
        size: item.size,
        price: item.price,
        qty: item.qty || 1,
      }];
    });
    setBump(b => b+1);
    setDrawerOpen(true);
  }, []);

  const updateQty = (key, delta) => setItems(prev => prev.flatMap(i => {
    if (i.key !== key) return [i];
    const q = i.qty + delta;
    return q <= 0 ? [] : [{...i, qty: q}];
  }));
  const remove = (key) => setItems(prev => prev.filter(i => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s,i) => s+i.qty, 0);
  const subtotal = items.reduce((s,i) => s + i.qty*i.price, 0);

  return (
    <CartCtx.Provider value={{ items, add, addItem, updateQty, remove, clear, count, subtotal, drawerOpen, setDrawerOpen, bump }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
