import { NextRequest, NextResponse } from "next/server";

// ─── Shiprocket Webhook Status Mapping ──────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  "6": "shipped",      // In Transit
  "7": "delivered",    // Delivered
  "8": "cancelled",    // RTO Initiated
  "9": "cancelled",    // RTO Delivered (returned to origin)
};

// Backend API base URL — same as the proxy target, but called server-side.
const BACKEND_API_URL = (
  process.env.BACKEND_API_URL || "https://laxmiedibleoils.onrender.com/api"
).replace(/\/+$/, "");

// ─── Helpers ────────────────────────────────────────────────────────────────────

function log(msg: string, data?: unknown) {
  console.log(`[Shipping Webhook] ${msg}`, data ?? "");
}

/**
 * Call the existing backend API to update an order's status.
 * Uses Option A: internal HTTP call to the Express backend.
 */
async function updateOrderStatusInBackend(orderId: string, status: string) {
  const url = `${BACKEND_API_URL}/admin/orders/${encodeURIComponent(orderId)}/status`;

  log("Updating order status via backend", { orderId, status, url });

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    log("Backend update failed", { status: response.status, body: text });
    return false;
  }

  log("Backend update succeeded", { orderId, status });
  return true;
}

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    log("Received webhook", {
      current_status_id: body?.current_status_id,
      current_status: body?.current_status,
      awb: body?.awb,
      order_id: body?.order_id,
    });

    const statusId = String(body?.current_status_id || "");
    const orderId = body?.order_id;

    // Map the Shiprocket status ID to our internal status
    const mappedStatus = STATUS_MAP[statusId];

    if (!mappedStatus) {
      log("Ignoring unhandled status", { statusId, current_status: body?.current_status });
      return NextResponse.json({ success: true, message: "Status ignored" });
    }

    if (!orderId) {
      log("No order_id in webhook payload");
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 },
      );
    }

    // Update the order in the database via the backend API
    const updated = await updateOrderStatusInBackend(String(orderId), mappedStatus);

    if (!updated) {
      log("Failed to update order, will retry on next webhook");
      // Still return 200 to avoid infinite retries for transient issues
      return NextResponse.json({
        success: false,
        message: "Order update failed but acknowledged",
      });
    }

    log("Webhook processed successfully", { orderId, mappedStatus });

    return NextResponse.json({
      success: true,
      order_id: orderId,
      status: mappedStatus,
    });
  } catch (error) {
    console.error("[Shipping Webhook] Error:", error);

    // Always return 200 to prevent infinite webhook retries
    return NextResponse.json({
      success: false,
      error: "Webhook processing failed",
    });
  }
}
