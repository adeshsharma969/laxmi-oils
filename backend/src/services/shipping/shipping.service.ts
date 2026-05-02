import { prisma } from "../../prisma/client.js";
import { AppError } from "../../utils/http.js";
import { nowIso } from "../../utils/time.js";
import { assignAwb, createAdhocOrder, getServiceability } from "./shiprocket.client.js";

type ShipmentInput = {
  address?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

export function hasExistingShipment(order: { shipmentStatus?: string | null; shipmentId?: string | null }) {
  return order.shipmentStatus !== "not_created" || Boolean(order.shipmentId);
}

function buildPayload(order: any, address: any) {
  return {
    order_id: order.orderId,
    order_date: order.createdAt || nowIso(),
    pickup_location: "Primary",
    billing_customer_name: address.name || "Customer",
    billing_last_name: "",
    billing_address: address.address || "Address",
    billing_city: address.city || "City",
    billing_pincode: address.pincode || "000000",
    billing_state: address.state || "State",
    billing_country: "India",
    billing_email: address.email || order.email,
    billing_phone: address.phone || "0000000000",
    shipping_is_billing: true,
    payment_method: "Prepaid",
    order_items: (order.items || []).map((item: any) => ({
      name: item.name,
      sku: item.productId || item.product_id || item.name,
      units: item.qty || 1,
      selling_price: item.price || 0,
    })),
    sub_total: order.total || 0,
    length: 10,
    breadth: 10,
    height: 10,
    weight: Math.max(
      1,
      (order.items || []).reduce((acc: number, item: any) => acc + Number(item.qty || 1), 0),
    ),
  };
}

function pickCheapestSurface(couriers: any[]) {
  const surface = couriers.filter((c) => String(c.courier_type || "").toLowerCase() === "surface");
  const pool = surface.length ? surface : couriers;
  return [...pool].sort((a, b) => Number(a.freight_charge || a.rate || 0) - Number(b.freight_charge || b.rate || 0))[0];
}

async function assignCourierWithRetry(shipmentId: number, maxAttempts = 2) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const serviceability = await getServiceability(shipmentId);
      const couriers = serviceability?.data?.available_courier_companies || [];
      const selected = pickCheapestSurface(couriers);
      if (!selected) throw new AppError(404, "No courier available");
      const assigned = await assignAwb(shipmentId, Number(selected.courier_company_id));
      const awb = assigned?.response?.data?.awb_code;
      const courierName = assigned?.response?.data?.courier_name || selected.courier_name;
      if (!awb) throw new AppError(502, "AWB code missing after assignment");
      return { awb, courierName };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export async function createShipmentForOrder(orderId: string, input: ShipmentInput = {}) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.paymentStatus !== "paid") throw new AppError(400, "Only paid orders can be shipped");
  if (!order.isVerified) throw new AppError(400, "Verify order before creating shipment");

  if (hasExistingShipment(order)) {
    return {
      ok: true,
      idempotent: true,
      shipment_id: order.shipmentId,
      awb_code: order.awbCode,
      courier_name: order.courierName,
      tracking_url: order.trackingUrl,
    };
  }

  const nextAddress = { ...(order.address as Record<string, any>), ...(input.address || {}) };
  const payload = buildPayload(order, nextAddress);
  const created = await createAdhocOrder(payload);
  const shipmentId = String(created?.shipment_id || "");
  if (!shipmentId) throw new AppError(502, "Shiprocket shipment id missing");

  let awb = created?.awb_code ? String(created.awb_code) : "";
  let courierName = created?.courier_name ? String(created.courier_name) : "";
  if (!awb || !courierName) {
    const assigned = await assignCourierWithRetry(Number(shipmentId));
    awb = assigned.awb;
    courierName = assigned.courierName;
  }

  const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  const tracking = {
    provider: "shiprocket",
    trackingId: awb,
    trackingUrl,
    courier: courierName,
    status: "created",
    shipmentId,
  };

  await prisma.order.update({
    where: { orderId },
    data: {
      address: nextAddress,
      shipmentId,
      awbCode: awb,
      courierName,
      trackingUrl,
      tracking,
      shipmentStatus: "created",
      orderStatus: "shipment_created",
      status: "packed",
      updatedAt: nowIso(),
    },
  });

  return {
    ok: true,
    idempotent: false,
    shipment_id: shipmentId,
    awb_code: awb,
    courier_name: courierName,
    tracking_url: trackingUrl,
  };
}
