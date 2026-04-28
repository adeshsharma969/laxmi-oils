// Use local backend in development and the same-origin proxy in production.
// Direct production API URLs are opt-in so a bad env value cannot break the public site.
const normalizeBaseUrl = (url) => String(url || "").replace(/\/+$/, "");

const configuredApiUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
);
const allowDirectApi = process.env.NEXT_PUBLIC_USE_DIRECT_API === "true";
const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const useProxy = isBrowser && !isLocalhost && !allowDirectApi;
const finalApiUrl = useProxy ? "/api/proxy" : configuredApiUrl || "http://localhost:8000/api";
const debugApi = process.env.NEXT_PUBLIC_API_DEBUG === "true";

export const API = finalApiUrl;

const buildUrl = (url) => {
  const cleanUrl = String(url || "").replace(/^\/+/, "");
  return `${API}/${cleanUrl}`;
};

const getDetailMessage = (data) => {
  const detail = data?.detail ?? data?.error ?? data?.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || String(item)).join(" ");
  return "";
};

const parseResponseBody = async (response, responseType) => {
  if (responseType === "blob") return response.blob();
  if (responseType === "text") return response.text();

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const createApiError = ({ message, method, url, fullUrl, status, statusText, data, cause }) => {
  const error = new Error(message || "API request failed");
  error.name = "ApiError";
  error.isApiError = true;
  error.method = method;
  error.url = url;
  error.fullUrl = fullUrl;
  error.response = status
    ? {
        status,
        statusText,
        data,
      }
    : undefined;
  error.cause = cause;
  return error;
};

const request = async (method, url, data, options = {}) => {
  const token = isBrowser ? localStorage.getItem("laxmi_token") : null;
  const fullUrl = buildUrl(url);
  const headers = {
    Accept: "application/json",
    ...(data !== undefined && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const { responseType, headers: _headers, ...fetchOverrides } = options;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      ...(data !== undefined && { body: JSON.stringify(data) }),
      ...fetchOverrides,
    });
    const responseData = await parseResponseBody(response, responseType);

    if (!response.ok) {
      const detail = getDetailMessage(responseData);
      throw createApiError({
        message: detail || `HTTP ${response.status}: ${response.statusText}`,
        method,
        url,
        fullUrl,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    }

    return { data: responseData, status: response.status };
  } catch (error) {
    if (error?.isApiError) throw error;

    const message =
      error instanceof TypeError
        ? `Unable to reach API at ${fullUrl}. Make sure the backend server is running and reachable.`
        : error?.message || "API request failed";

    const apiError = createApiError({
      message,
      method,
      url,
      fullUrl,
      cause: error,
    });

    if (isBrowser && debugApi) {
      console.warn("API request failed", {
        method,
        url,
        fullUrl,
        message: apiError.message,
      });
    }

    throw apiError;
  }
};

// Create a simple API client using fetch.
const api = {
  get: (url, options = {}) => request("GET", url, undefined, options),
  post: (url, data, options = {}) => request("POST", url, data, options),
  put: (url, data, options = {}) => request("PUT", url, data, options),
  delete: (url, options = {}) => request("DELETE", url, undefined, options),
};

export const fmtErr = (e) => {
  const detail = e?.response?.data?.detail ?? e?.response?.data?.error ?? e?.response?.data?.message;
  const extra = e?.response?.data?.details;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || JSON.stringify(item)).join(" ");
  if (typeof extra === "string") return extra;
  return e?.message || "Something went wrong";
};

// Simple connectivity test.
export const testAPIConnectivity = async () => {
  try {
    const response = await api.get("/products");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: fmtErr(error) };
  }
};

export default api;
