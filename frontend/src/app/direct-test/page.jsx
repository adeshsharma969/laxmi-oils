"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DirectTest() {
  const [status, setStatus] = useState("Testing...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testDirectConnection();
  }, []);

  const testDirectConnection = async () => {
    try {
      setStatus("Testing direct fetch to backend...");
      
      // Direct fetch without any API client
      const response = await fetch('https://laxmiedibleoils.onrender.com/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('🔍 Direct fetch response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const products = await response.json();
      console.log('🔍 Direct fetch data:', products);
      
      setStatus("✅ Direct Connection Successful!");
      setData(products);
      setError(null);
      
    } catch (err) {
      console.error('❌ Direct fetch error:', err);
      setStatus("❌ Direct Connection Failed");
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
          <h1 className="font-display font-black text-3xl text-[#1F3D2B] mb-6">Direct Backend Test</h1>
          
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

          <div className="mt-6 space-x-4">
            <button 
              onClick={testDirectConnection}
              className="px-4 py-2 bg-[#D98F00] text-[#1F3D2B] font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Test Again
            </button>
            
            <button 
              onClick={() => window.open('https://laxmiedibleoils.onrender.com/api/products', '_blank')}
              className="px-4 py-2 bg-[#1F3D2B] text-white font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Open API in Browser
            </button>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 p-6">
          <h3 className="font-bold text-lg text-yellow-800 mb-3">🔍 Debugging Info</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div><strong>Backend URL:</strong> <a href="https://laxmiedibleoils.onrender.com/api/products" target="_blank" className="underline">https://laxmiedibleoils.onrender.com/api/products</a></div>
            <div><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</div>
            <div><strong>Current Time:</strong> {new Date().toLocaleString()}</div>
            <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) + '...' : 'Loading...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
