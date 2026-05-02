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



export async function getTracking(orderId: string) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new AppError(404, "Order not found");
  return order.tracking || fallbackTracking(order.orderId);
}
