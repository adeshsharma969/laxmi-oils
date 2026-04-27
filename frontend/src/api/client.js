import axios from "axios";

const rawApi =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "https://laxmiedibleoils.onrender.com/api";

// Force production API URL for deployed site
const finalApiUrl = (typeof window !== 'undefined' && window.location.hostname !== 'localhost') 
  ? "https://laxmiedibleoils.onrender.com/api" 
  : rawApi;

// Debug: Log the API URL being used
if (typeof window !== 'undefined') {
  console.log('🔍 Raw API URL:', rawApi);
  console.log('🔍 Final API URL:', finalApiUrl);
  console.log('🔍 Hostname:', window.location.hostname);
  console.log('🔍 Environment vars:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL
  });
}

export const API = finalApiUrl.endsWith("/api") ? finalApiUrl : `${finalApiUrl}/api`;

const api = axios.create({ 
  baseURL: API,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((cfg) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("laxmi_token") : null;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  
  // Debug: Log outgoing requests
  if (typeof window !== 'undefined') {
    console.log('🚀 API Request:', cfg.method?.toUpperCase(), cfg.url);
  }
  
  return cfg;
});

api.interceptors.response.use(
  (response) => {
    // Debug: Log successful responses
    if (typeof window !== 'undefined') {
      console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, `Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Debug: Log detailed errors
    if (typeof window !== 'undefined') {
      const errorInfo = {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
        code: error.code,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        isCORS: error.message.includes('CORS'),
        baseURL: error.config?.baseURL,
        fullHeaders: error.config?.headers
      };
      
      console.error('❌ API Error Details:', errorInfo);
      
      // Additional network error info
      if (!error.response) {
        console.error('🌐 Network Error - Possible causes:', [
          'CORS issue',
          'Backend down',
          'Network connectivity',
          'Firewall/blocking',
          'Invalid URL'
        ]);
      }
    }
    return Promise.reject(error);
  }
);

export const fmtErr = (e) => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map(x => x?.msg || JSON.stringify(x)).join(" ");
  return e?.message || "Something went wrong";
};

// Simple connectivity test
export const testAPIConnectivity = async () => {
  try {
    if (typeof window !== 'undefined') {
      console.log('🔍 Testing API connectivity to:', API);
    }
    
    const response = await api.get('/products', { 
      timeout: 10000,
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });
    
    if (typeof window !== 'undefined') {
      console.log('✅ API Connectivity Test Passed:', {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('❌ API Connectivity Test Failed:', error.message);
    }
    return { success: false, error: error.message };
  }
};

export default api;
