/**
 * Shiprocket API Client
 *
 * Centralised module for all Shiprocket interactions.
 * - Token is cached in-memory and reused across requests.
 * - Auto-refreshes when the token is about to expire (9-day TTL; Shiprocket tokens last ~10 days).
 * - Every order is forced to "Prepaid" — no COD logic.
 * - Courier selection always picks the cheapest *surface* option.
 */

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

// ─── Token Cache ────────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // epoch ms

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days (Shiprocket tokens expire after ~10 days)

// ─── Error Class ────────────────────────────────────────────────────────────────
export class ShiprocketError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.name = "ShiprocketError";
    this.status = status;
    this.details = details;
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────────

function log(action: string, payload?: unknown) {
  console.log(`[Shiprocket] ${action}`, payload ?? "");
}

async function shiprocketFetch<T = any>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const url = `${SHIPROCKET_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await getToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const msg =
      typeof data === "object"
        ? data?.message || data?.error || JSON.stringify(data)
        : String(data);
    log(`ERROR ${response.status}`, { path, msg });
    throw new ShiprocketError(
      `Shiprocket API error: ${msg}`,
      response.status,
      data,
    );
  }

  return data as T;
}

// ─── Authentication ─────────────────────────────────────────────────────────────

/**
 * Returns a valid Shiprocket auth token, reusing cached value when possible.
 */
export async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new ShiprocketError(
      "SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in environment variables",
      500,
    );
  }

  log("Authenticating (token expired or missing)");

  const data = await shiprocketFetch<{ token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false, // login does not require an existing token
  );

  if (!data?.token) {
    throw new ShiprocketError("Shiprocket login failed: no token returned", 401, data);
  }

  cachedToken = data.token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;

  log("Authenticated successfully, token cached");
  return cachedToken;
}

// ─── Create Order ───────────────────────────────────────────────────────────────

export type CreateOrderPayload = {
  order_id: string;
  order_date: string;
  pickup_location?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    hsn?: string;
  }>;
  sub_total: number;
  weight: number;
  dimensions?: {
    length: number;
    breadth: number;
    height: number;
  };
};

export type CreateOrderResponse = {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string;
  courier_company_id: string;
  courier_name: string;
};

export async function createOrder(payload: CreateOrderPayload) {
  log("Creating order", { order_id: payload.order_id });

  const body = {
    order_id: payload.order_id,
    order_date: payload.order_date,
    pickup_location: payload.pickup_location || "Primary",
    billing_customer_name: payload.customer.name,
    billing_last_name: "",
    billing_address: payload.address.address,
    billing_city: payload.address.city,
    billing_pincode: payload.address.pincode,
    billing_state: payload.address.state,
    billing_country: payload.address.country || "India",
    billing_email: payload.customer.email,
    billing_phone: payload.customer.phone,
    shipping_is_billing: true,
    order_items: payload.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.selling_price,
      ...(item.hsn ? { hsn: item.hsn } : {}),
    })),
    payment_method: "Prepaid",
    sub_total: payload.sub_total,
    length: payload.dimensions?.length || 25,
    breadth: payload.dimensions?.breadth || 20,
    height: payload.dimensions?.height || 15,
    weight: payload.weight,
  };

  const data = await shiprocketFetch<CreateOrderResponse>(
    "/orders/create/adhoc",
    { method: "POST", body: JSON.stringify(body) },
  );

  log("Order created", {
    order_id: data.order_id,
    shipment_id: data.shipment_id,
  });

  return data;
}

// ─── Courier Services ───────────────────────────────────────────────────────────

export type CourierInfo = {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  etd: string;
  rate: number;
  courier_type: string; // "surface" | "air"
  min_weight: number;
};

export type AvailableCouriersResponse = {
  data: {
    available_courier_companies: CourierInfo[];
  };
  status: number;
};

/**
 * Fetch couriers available for a given shipment.
 */
export async function getAvailableCouriers(shipmentId: number) {
  log("Fetching available couriers", { shipmentId });

  const data = await shiprocketFetch<AvailableCouriersResponse>(
    `/courier/serviceability/?shipment_id=${shipmentId}`,
    { method: "GET" },
  );

  const couriers = data?.data?.available_courier_companies || [];
  log(`Found ${couriers.length} couriers`);

  return couriers;
}

/**
 * Find the cheapest surface courier from a list.
 * Falls back to cheapest overall if no surface courier is available.
 */
export function pickCheapestSurfaceCourier(couriers: CourierInfo[]): CourierInfo | null {
  if (!couriers.length) return null;

  // Filter surface couriers
  const surfaceCouriers = couriers.filter(
    (c) => c.courier_type?.toLowerCase() === "surface",
  );

  // Sort by freight_charge ascending
  const pool = surfaceCouriers.length > 0 ? surfaceCouriers : couriers;
  const sorted = [...pool].sort((a, b) => (a.freight_charge ?? a.rate) - (b.freight_charge ?? b.rate));

  const selected = sorted[0];
  log("Selected courier", {
    courier: selected.courier_name,
    charge: selected.freight_charge,
    type: selected.courier_type,
    isSurface: surfaceCouriers.length > 0,
  });

  return selected;
}

export type AssignCourierResponse = {
  awb_assign_status: number;
  response: {
    data: {
      awb_code: string;
      courier_company_id: number;
      courier_name: string;
      assigned_date_time: {
        date: string;
      };
    };
  };
};

/**
 * Assign a specific courier to a shipment and get the AWB number.
 */
export async function assignCourier(shipmentId: number, courierId: number) {
  log("Assigning courier", { shipmentId, courierId });

  const data = await shiprocketFetch<AssignCourierResponse>(
    "/courier/assign/awb",
    {
      method: "POST",
      body: JSON.stringify({
        shipment_id: shipmentId,
        courier_id: courierId,
      }),
    },
  );

  const awb = data?.response?.data?.awb_code;
  const courierName = data?.response?.data?.courier_name;

  if (!awb) {
    log("AWB assignment failed", data);
    throw new ShiprocketError(
      "Failed to assign AWB — Shiprocket did not return an AWB code",
      500,
      data,
    );
  }

  log("Courier assigned", { awb, courierName });
  return { awb, courier_name: courierName, raw: data };
}

/**
 * Full flow: fetch couriers → pick cheapest surface → assign AWB.
 */
export async function assignCheapestSurfaceCourier(shipmentId: number) {
  const couriers = await getAvailableCouriers(shipmentId);
  const selected = pickCheapestSurfaceCourier(couriers);

  if (!selected) {
    throw new ShiprocketError(
      "No couriers available for this shipment",
      404,
      { shipmentId, couriers },
    );
  }

  try {
    const result = await assignCourier(shipmentId, selected.courier_company_id);
    return {
      ...result,
      courier_id: selected.courier_company_id,
      freight_charge: selected.freight_charge,
    };
  } catch (error) {
    // Return a structured error with the available couriers for fallback
    throw new ShiprocketError(
      `Courier assignment failed for ${selected.courier_name}. ${(error as Error).message}`,
      500,
      {
        attempted_courier: selected,
        available_couriers: couriers.map((c) => ({
          id: c.courier_company_id,
          name: c.courier_name,
          charge: c.freight_charge,
          type: c.courier_type,
        })),
      },
    );
  }
}

// ─── Tracking ───────────────────────────────────────────────────────────────────

export type TrackingActivity = {
  date: string;
  activity: string;
  location: string;
};

export type TrackingResponse = {
  tracking_data: {
    track_status: number;
    shipment_status: number;
    shipment_track: Array<{
      id: number;
      awb_code: string;
      courier_company_id: number;
      shipment_type: string;
      current_status: string;
      delivered_date: string;
      edd: string;
      courier_name: string;
    }>;
    shipment_track_activities: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
    }>;
    track_url: string;
  };
};

/**
 * Track a shipment by its AWB number.
 */
export async function trackByAwb(awb: string) {
  log("Tracking shipment", { awb });

  const data = await shiprocketFetch<TrackingResponse>(
    `/courier/track/awb/${encodeURIComponent(awb)}`,
    { method: "GET" },
  );

  const td = data?.tracking_data;
  const shipment = td?.shipment_track?.[0];
  const activities: TrackingActivity[] = (td?.shipment_track_activities || []).map((a) => ({
    date: a.date,
    activity: a.activity || a.status,
    location: a.location,
  }));

  return {
    awb,
    courier_name: shipment?.courier_name || "",
    current_status: shipment?.current_status || "Unknown",
    delivered: shipment?.current_status?.toLowerCase() === "delivered",
    delivered_date: shipment?.delivered_date || null,
    edd: shipment?.edd || null,
    track_url: td?.track_url || `https://shiprocket.co/tracking/${awb}`,
    shipment_track: activities,
  };
}
