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

const api = axios.create({ baseURL: API });

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
    // Debug: Log errors
    if (typeof window !== 'undefined') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      });
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

export default api;
