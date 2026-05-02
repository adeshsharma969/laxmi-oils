import { env } from "../../config/env.js";
import { AppError } from "../../utils/http.js";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

let cachedToken = "";
let tokenExpiresAt = 0;

async function shiprocketFetch(path: string, init: RequestInit, withAuth = true) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (withAuth) headers.Authorization = `Bearer ${await getToken()}`;

  const res = await fetch(`${SHIPROCKET_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    throw new AppError(res.status, "Shiprocket request failed", body);
  }

  return body;
}

export async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  if (!env.shiprocketEmail || !env.shiprocketPassword) {
    throw new AppError(500, "Shiprocket credentials are not configured");
  }

  const data = await shiprocketFetch(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: env.shiprocketEmail,
        password: env.shiprocketPassword,
      }),
    },
    false,
  );
  if (!data?.token) throw new AppError(502, "Shiprocket token missing");

  cachedToken = data.token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;
  return cachedToken;
}

export async function createAdhocOrder(payload: Record<string, unknown>) {
  return shiprocketFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getServiceability(shipmentId: number) {
  return shiprocketFetch(`/courier/serviceability/?shipment_id=${shipmentId}`, {
    method: "GET",
  });
}

export async function assignAwb(shipmentId: number, courierId: number) {
  return shiprocketFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId }),
  });
}
