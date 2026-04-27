const BACKEND_API_URL = (process.env.BACKEND_API_URL || "https://laxmiedibleoils.onrender.com/api").replace(/\/+$/, "");

function proxyHeaders(request) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Vercel-Proxy",
  };
  const authorization = request.headers.get("authorization");
  if (authorization) headers.Authorization = authorization;
  return headers;
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function GET(request) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/products`, {
      method: "GET",
      headers: proxyHeaders(request),
      cache: "no-store",
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Backend unavailable" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
