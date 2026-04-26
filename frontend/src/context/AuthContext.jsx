import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("laxmi_token");
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("laxmi_token");
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("laxmi_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post("/auth/admin-login", { email, password });
    localStorage.setItem("laxmi_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("laxmi_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const googleExchange = async (session_id) => {
    const { data } = await api.post("/auth/google-session", { session_id });
    localStorage.setItem("laxmi_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("laxmi_token");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, adminLogin, register, googleExchange, logout, checkAuth }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);
