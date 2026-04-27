// Use Vercel proxy in production, direct backend in development
const useProxy = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const finalApiUrl = useProxy ? "/api/proxy" : "https://laxmiedibleoils.onrender.com/api";

// Debug: Log the API URL being used
if (typeof window !== 'undefined') {
  console.log('🔍 Using Proxy:', useProxy);
  console.log('🔍 Final API URL:', finalApiUrl);
  console.log('🔍 Hostname:', window.location.hostname);
}

export const API = finalApiUrl;

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
      const fullUrl = useProxy ? `${API}/${url}` : `${API}${url}`;
      const response = await fetch(fullUrl, fetchOptions);
      
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
        // Log everything about the error
        const errorDetails = {
          url,
          method: 'GET',
          message: error.message,
          name: error.name,
          stack: error.stack,
          toString: error.toString(),
          isNetworkError: !error.message.includes('HTTP'),
          fullUrl: `${API}${url}`,
          errorObject: error,
          errorKeys: Object.keys(error),
          errorProps: {}
        };
        
        // Try to get all possible error properties
        Object.getOwnPropertyNames(error).forEach(prop => {
          try {
            errorDetails.errorProps[prop] = error[prop];
          } catch (e) {
            errorDetails.errorProps[prop] = '[Unable to access]';
          }
        });
        
        console.error('❌ API Error:', errorDetails);
        console.error('❌ Raw Error Object:', error);
        console.error('❌ Error Constructor:', error.constructor.name);
        console.error('❌ Error Type:', typeof error);
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
      const fullUrl = useProxy ? `${API}/${url}` : `${API}${url}`;
      const response = await fetch(fullUrl, fetchOptions);
      
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
