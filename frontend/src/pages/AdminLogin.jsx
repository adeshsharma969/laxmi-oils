import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { adminLogin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Route guards: redirect if already authenticated
  useEffect(() => {
    if (authLoading) return;
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user && user.role !== "admin") {
      navigate("/account", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="text-[#1F3D2B] font-bold">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await adminLogin(email, password);
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        setError("Unauthorized access. Admin credentials required.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1F3D2B] rounded-lg mb-4 shadow-sm">
            <Shield size={28} className="text-[#F5F1E8]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#1F3D2B] tracking-tight">
            Admin Access
          </h1>
          <p className="text-[#1F3D2B]/60 text-sm mt-2">
            Authorized personnel only
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[#E5E5E0] p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] text-[#B8431A] px-4 py-3 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
              Admin Email
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F3D2B]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E5E5E0] rounded-lg text-[#1F3D2B] pl-10 pr-4 py-3 focus:border-[#1F3D2B] focus:outline-none transition-colors"
                placeholder="admin@laxmioils.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#1F3D2B]/70">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F3D2B]/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E5E5E0] rounded-lg text-[#1F3D2B] pl-10 pr-4 py-3 focus:border-[#1F3D2B] focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3D2B] text-white font-semibold py-3 rounded-lg hover:bg-[#2A5240] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#1F3D2B]/40">
            Restricted area. Unauthorized access is prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
