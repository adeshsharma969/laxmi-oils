"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SimpleTest() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const tests = [];

    // Test 1: Direct URL access
    try {
      const response = await fetch('https://laxmiedibleoils.onrender.com/health');
      const data = await response.json();
      tests.push({
        name: "Direct Health Check",
        status: response.ok ? "✅ PASS" : "❌ FAIL",
        details: `Status: ${response.status}, Data: ${JSON.stringify(data)}`
      });
    } catch (error) {
      tests.push({
        name: "Direct Health Check",
        status: "❌ FAIL",
        details: `Error: ${error.message}`
      });
    }

    // Test 2: Products endpoint
    try {
      const response = await fetch('https://laxmiedibleoils.onrender.com/api/products');
      const data = await response.json();
      tests.push({
        name: "Direct Products",
        status: response.ok ? "✅ PASS" : "❌ FAIL",
        details: `Status: ${response.status}, Count: ${Array.isArray(data) ? data.length : 'N/A'}`
      });
    } catch (error) {
      tests.push({
        name: "Direct Products",
        status: "❌ FAIL",
        details: `Error: ${error.message}`
      });
    }

    // Test 3: With CORS headers
    try {
      const response = await fetch('https://laxmiedibleoils.onrender.com/api/products', {
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      const data = await response.json();
      tests.push({
        name: "With CORS Headers",
        status: response.ok ? "✅ PASS" : "❌ FAIL",
        details: `Status: ${response.status}, Count: ${Array.isArray(data) ? data.length : 'N/A'}`
      });
    } catch (error) {
      tests.push({
        name: "With CORS Headers",
        status: "❌ FAIL",
        details: `Error: ${error.message}`
      });
    }

    // Test 4: Check current site info
    tests.push({
      name: "Site Info",
      status: "ℹ️ INFO",
      details: `Current URL: ${window.location.href}, Origin: ${window.location.origin}`
    });

    setResults(tests);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#1F3D2B] hover:text-[#B8431A] mb-6">
          ← Back to Home
        </Link>
        
        <div className="bg-white border-[3px] border-[#1F3D2B] p-8 shadow-[4px_4px_0_0_#1F3D2B]">
          <h1 className="font-display font-black text-3xl text-[#1F3D2B] mb-6">Simple Backend Tests</h1>
          
          <div className="space-y-4">
            {results.map((test, index) => (
              <div key={index} className={`p-4 border-2 rounded-lg ${
                test.status.includes("PASS") ? "border-green-300 bg-green-50" :
                test.status.includes("FAIL") ? "border-red-300 bg-red-50" :
                "border-blue-300 bg-blue-50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{test.name}</h3>
                  <span className={`text-sm font-bold ${
                    test.status.includes("PASS") ? "text-green-700" :
                    test.status.includes("FAIL") ? "text-red-700" :
                    "text-blue-700"
                  }`}>{test.status}</span>
                </div>
                <div className="text-sm text-gray-700 font-mono break-all">
                  {test.details}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-x-4">
            <button 
              onClick={runTests}
              className="px-4 py-2 bg-[#D98F00] text-[#1F3D2B] font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Run Tests Again
            </button>
            
            <button 
              onClick={() => window.open('https://laxmiedibleoils.onrender.com/api/products', '_blank')}
              className="px-4 py-2 bg-[#1F3D2B] text-white font-bold uppercase tracking-wider hover:bg-[#B8431A] transition-colors"
            >
              Open API Directly
            </button>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 p-6">
          <h3 className="font-bold text-lg text-yellow-800 mb-3">🔍 What These Tests Tell Us</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div><strong>Direct Health Check:</strong> Can we reach the backend at all?</div>
            <div><strong>Direct Products:</strong> Can we get product data?</div>
            <div><strong>With CORS Headers:</strong> Does CORS work properly?</div>
            <div><strong>Site Info:</strong> Current site details</div>
          </div>
        </div>
      </div>
    </div>
  );
}
