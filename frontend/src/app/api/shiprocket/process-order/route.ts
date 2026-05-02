import { NextRequest, NextResponse } from "next/server";
import { createOrder, assignCheapestSurfaceCourier } from "@/lib/shiprocket";

// The backend URL is the proxy target used to hit the Express API internally
const BACKEND_API_URL = (
  process.env.BACKEND_API_URL || "https://laxmiedibleoils.onrender.com/api"
).replace(/\/+$/, "");

/**
 * Saves tracking info (AWB, URL, etc) back to the Express backend database.
 */
async function saveTrackingToBackend(orderId: string, trackingData: any) {
  const url = `${BACKEND_API_URL}/internal/orders/${encodeURIComponent(orderId)}/tracking`;
  const internalKey = process.env.INTERNAL_API_KEY || "laxmi-internal-secret-2026";

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": internalKey,
    },
    body: JSON.stringify(trackingData),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[Process Order] Failed to save tracking to backend", await response.text());
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    if (!orderData || !orderData.order_id) {
      return NextResponse.json({ success: false, error: "Missing order_id" }, { status: 400 });
    }

    const orderId = orderData.order_id;
    console.log(`[Process Order] Processing order: ${orderId}`);

    // Skip COD orders if required (though the plan is PREPAID ONLY anyway)
    const isCod = orderData.payment_method === "cod" || orderData.payment_method === "COD";

    // 1. Map Frontend order structure to Shiprocket payload
    const payload = {
      order_id: orderId,
      order_date: orderData.created_at || new Date().toISOString(),
      pickup_location: "Primary",
      // Force Prepaid as per requirements
      payment_method: isCod ? "COD" : "Prepaid",
      sub_total: orderData.total || 0,
      
      // Default dimensions for standard shipping
      length: 10,
      breadth: 10,
      height: 10,
      // Calculate weight safely
      weight: orderData.items?.reduce((sum: number, item: any) => sum + (item.qty * 1), 0) || 1,

      customer: {
        name: orderData.address?.name || "Customer",
        email: orderData.email || orderData.address?.email || "customer@example.com",
        phone: orderData.address?.phone || "0000000000",
      },

      address: {
        address: orderData.address?.address || "Address",
        city: orderData.address?.city || "City",
        state: orderData.address?.state || "State",
        pincode: orderData.address?.pincode || "110001",
        country: "India",
      },

      items: (orderData.items || []).map((item: any) => ({
        name: item.name,
        sku: item.product_id || "SKU-UNKNOWN",
        units: item.qty,
        selling_price: item.price,
      })),
    };

    // 2. Call Shiprocket Create Order
    console.log(`[Process Order] Creating Shiprocket shipment for ${orderId}`);
    const srCreate = await createOrder(payload);

    const shipmentId = srCreate.shipment_id;
    let awb = srCreate.awb_code;
    let courierName = srCreate.courier_name;

    // 3. Auto-assign courier if it wasn't assigned in the creation step
    if (!awb || !courierName) {
      console.log(`[Process Order] Assigning cheapest surface courier for shipment ${shipmentId}`);
      try {
        const srAssign = await assignCheapestSurfaceCourier(shipmentId);
        awb = srAssign.awb;
        courierName = srAssign.courier_name;
      } catch (assignError: any) {
        console.error("[Process Order] Failed to assign courier", assignError);
        // Even if assignment fails, the order was created. We can retry later.
        return NextResponse.json({
          success: true,
          partial_success: true,
          shipment_id: shipmentId,
          error: "Order created but courier assignment failed: " + assignError.message,
        });
      }
    }

    // 4. Save Tracking Data back to the Backend DB
    console.log(`[Process Order] Saving AWB ${awb} to backend DB for ${orderId}`);
    const trackingData = {
      provider: "shiprocket",
      trackingId: awb,
      trackingUrl: `https://shiprocket.co/tracking/${awb}`,
      courier: courierName,
      status: "created",
      shipmentId: shipmentId,
    };

    const saved = await saveTrackingToBackend(orderId, trackingData);

    return NextResponse.json({
      success: true,
      order_id: orderId,
      shipment_id: shipmentId,
      awb,
      courier_name: courierName,
      backend_updated: saved,
    });
  } catch (error: any) {
    console.error("[Process Order] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
