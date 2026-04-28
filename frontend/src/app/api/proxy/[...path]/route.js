const BACKEND_API_URL = (process.env.BACKEND_API_URL || "https://laxmiedibleoils.onrender.com/api").replace(/\/+$/, "");

async function routePath(params) {
  const resolved = await params;
  return Array.isArray(resolved?.path) ? resolved.path.join("/") : "";
}

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
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function responseHeaders(response) {
  const headers = corsHeaders();
  const contentType = response.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
}

async function proxyRequest(request, params, method) {
  try {
    const path = await routePath(params);
    const search = request.nextUrl?.search || "";
    const init = {
      method,
      headers: proxyHeaders(request),
      cache: "no-store",
    };

    if (method !== "GET") {
      const body = await request.text();
      if (body) init.body = body;
    }

    const response = await fetch(`${BACKEND_API_URL}/${path}${search}`, init);
    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: responseHeaders(response),
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Backend unavailable" }), {
      status: 500,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    });
  }
}

export async function GET(request, { params }) {
  return proxyRequest(request, params, "GET");
}

export async function POST(request, { params }) {
  return proxyRequest(request, params, "POST");
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params, "PUT");
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params, "DELETE");
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
