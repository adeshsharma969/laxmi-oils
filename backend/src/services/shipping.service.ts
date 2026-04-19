import axios from "axios";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { nowIso } from "../utils/time.js";

function fallbackTracking(orderId: string) {
  return {
    provider: "manual",
    trackingId: `LXTRACK-${orderId.replace(/[^A-Z0-9]/gi, "")}`,
    trackingUrl: `https://laxmioils.in/track/${encodeURIComponent(orderId)}`,
    status: "packed",
  };
}

async function createShiprocketShipment(order: any) {
  if (!env.shiprocketEmail || !env.shiprocketPassword) return null;

  const auth = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
    email: env.shiprocketEmail,
    password: env.shiprocketPassword,
  });

  const token = auth.data?.token;
  if (!token) return null;

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      order_id: order.orderId,
      order_date: order.createdAt,
      pickup_location: "Primary",
      billing_customer_name: order.address.name,
      billing_address: order.address.address,
      billing_city: order.address.city,
      billing_pincode: order.address.pincode,
      billing_state: "",
      billing_country: "India",
      billing_email: order.address.email,
      billing_phone: order.address.phone,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.productId || item.name,
        units: item.qty,
        selling_price: item.price,
      })),
      payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const shipmentId = response.data?.shipment_id || response.data?.order_id;
  const awb = response.data?.awb_code || response.data?.awb;

  return {
    provider: "shiprocket",
    trackingId: awb || String(shipmentId || order.orderId),
    trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : `https://shiprocket.co/tracking/${order.orderId}`,
    status: "created",
    raw: response.data,
  };
}

export async function ensureTracking(orderId: string) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new AppError(404, "Order not found");
  const existingTracking = order.tracking as any;
  if (existingTracking?.trackingUrl) return existingTracking;

  const tracking = (await createShiprocketShipment(order).catch(() => null)) || fallbackTracking(order.orderId);
  const updated = await prisma.order.update({
    where: { orderId },
    data: {
      shipmentId: tracking.trackingId,
      tracking,
      updatedAt: nowIso(),
    },
  });

  return updated.tracking;
}

export async function getTracking(orderId: string) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new AppError(404, "Order not found");
  return order.tracking || fallbackTracking(order.orderId);
}
