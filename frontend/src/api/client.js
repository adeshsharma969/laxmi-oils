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
}

export const API = finalApiUrl.endsWith("/api") ? finalApiUrl : `${finalApiUrl}/api`;

// Create a simple API client using fetch
const api = {
  get: async (url, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("laxmi_token") : null;
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      mode: 'cors',
      ...options
    };

    if (typeof window !== 'undefined') {
      console.log('🚀 API Request:', 'GET', url);
    }

    try {
      const response = await fetch(`${API}${url}`, fetchOptions);
      
      if (typeof window !== 'undefined') {
        console.log('✅ API Response:', 'GET', url, `Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('❌ API Error:', {
          url,
          method: 'GET',
          message: error.message,
          isNetworkError: !error.message.includes('HTTP'),
          fullUrl: `${API}${url}`
        });
      }
      throw error;
    }
  },

  post: async (url, data, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("laxmi_token") : null;
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      body: JSON.stringify(data),
      mode: 'cors',
      ...options
    };

    if (typeof window !== 'undefined') {
      console.log('🚀 API Request:', 'POST', url);
    }

    try {
      const response = await fetch(`${API}${url}`, fetchOptions);
      
      if (typeof window !== 'undefined') {
        console.log('✅ API Response:', 'POST', url, `Status: ${response.status}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      return { data: responseData, status: response.status };
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error('❌ API Error:', {
          url,
          method: 'POST',
          message: error.message,
          isNetworkError: !error.message.includes('HTTP'),
          fullUrl: `${API}${url}`
        });
      }
      throw error;
    }
  }
};

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
    
    const response = await api.get('/products');
    
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
