"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { testAPIConnectivity } from "@/api/client";

export default function TestAPI() {
  const [status, setStatus] = useState("Loading...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setStatus("Testing API connection...");
      
      // Use the connectivity test function
      const result = await testAPIConnectivity();
      
      if (result.success) {
        setStatus("✅ API Connected Successfully!");
        setData(result.data);
        setError(null);
      } else {
        setStatus("❌ API Connection Failed");
        setError(result.error);
        setData(null);
      }
      
    } catch (err) {
      setStatus("❌ API Connection Failed");
      setError(err.message);
      setData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#1F3D2B] hover:text-[#B8431A] mb-6">
          ← Back to Home
        </Link>
        
        <div className="bg-white border-[3px] border-[#1F3D2B] p-8 shadow-[4px_4px_0_0_#1F3D2B]">
          <h1 className="font-display font-black text-3xl text-[#1F3D2B] mb-6">API Connection Test</h1>
          
          <div className="mb-6 p-4 border-2 border-[#E5E5E0] rounded-lg">
            <div className="text-lg font-semibold mb-2">Status: {status}</div>
            {error && (
              <div className="text-red-600 text-sm mt-2">
                Error: {error}
              </div>
            )}
          </div>

          {data && (
            <div className="space-y-4">
              <h2 className="font-bold text-xl text-[#1F3D2B]">
                ✅ Found {Array.isArray(data) ? data.length : 0} Products
              </h2>
              
              {Array.isArray(data) && data.length > 0 && (
                <div className="grid gap-4">
                  {data.slice(0, 3).map((product, index) => (
                    <div key={product.product_id || index} className="border border-[#E5E5E0] p-4 rounded-lg">
                      <h3 className="font-semibold text-[#1F3D2B]">{product.name}</h3>
                      <p className="text-sm text-[#1F3D2B]/70">{product.category} • {product.sizes?.[0]?.label} • ₹{product.sizes?.[0]?.price}</p>
                    </div>
                  ))}
                  {data.length > 3 && (
                    <p className="text-sm text-[#1F3D2B]/60">... and {data.length - 3} more products</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <button 
              onClick={testAPI}
              className="px-4 py-2 bg-[#D98F00] text-[#1F3D2B] font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Test Again
            </button>
          </div>
        </div>

        <div className="mt-6 bg-[#D98F00]/10 border-[3px] border-[#D98F00] p-6">
          <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Debugging Info</h3>
          <div className="text-sm text-[#1F3D2B]/80 space-y-1">
            <div><strong>API URL:</strong> https://laxmiedibleoils.onrender.com/api/products</div>
            <div><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV || 'Unknown'}</div>
            <div><strong>API Env Var:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
