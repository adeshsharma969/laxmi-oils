"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TestProxy() {
  const [status, setStatus] = useState("Loading...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testProxy();
  }, []);

  const testProxy = async () => {
    try {
      setStatus("Testing Vercel proxy...");
      
      // Test the proxy endpoint
      const response = await fetch('/api/proxy/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 Proxy response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const products = await response.json();
      console.log('🔍 Proxy data:', products);
      
      setStatus("✅ Proxy Working!");
      setData(products);
      setError(null);
      
    } catch (err) {
      console.error('❌ Proxy error:', err);
      setStatus("❌ Proxy Failed");
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
          <h1 className="font-display font-black text-3xl text-[#1F3D2B] mb-6">Vercel Proxy Test</h1>
          
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
                ✅ Found {Array.isArray(data) ? data.length : 0} Products via Proxy
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

          <div className="mt-6 space-x-4">
            <button 
              onClick={testProxy}
              className="px-4 py-2 bg-[#D98F00] text-[#1F3D2B] font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Test Proxy Again
            </button>
            
            <button 
              onClick={() => window.open('/api/proxy/products', '_blank')}
              className="px-4 py-2 bg-[#1F3D2B] text-white font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Open Proxy Directly
            </button>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border-2 border-green-200 p-6">
          <h3 className="font-bold text-lg text-green-800 mb-3">🚀 How This Works</h3>
          <div className="text-sm text-green-700 space-y-2">
            <div><strong>Frontend:</strong> Calls /api/proxy/products (same origin)</div>
            <div><strong>Vercel Proxy:</strong> Forwards to https://laxmiedibleoils.onrender.com/api/products</div>
            <div><strong>Backend:</strong> Responds to Vercel server (no CORS issues)</div>
            <div><strong>Result:</strong> Products delivered to frontend! 🎉</div>
          </div>
        </div>
      </div>
    </div>
  );
}
