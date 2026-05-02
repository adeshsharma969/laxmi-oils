import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, ShiprocketError } from "@/lib/shiprocket";

// ─── Input Validation ───────────────────────────────────────────────────────────

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "Item SKU is required"),
  units: z.number().int().min(1, "Units must be at least 1"),
  selling_price: z.number().min(0, "Selling price must be non-negative"),
  hsn: z.string().optional(),
});

const createOrderSchema = z.object({
  order_id: z.string().min(1, "Order ID is required"),
  order_date: z.string().min(1, "Order date is required"),
  pickup_location: z.string().optional(),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
  }),
  address: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required").max(6),
    country: z.string().optional(),
  }),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  sub_total: z.number().min(0, "Subtotal must be non-negative"),
  weight: z.number().min(0.1, "Weight must be at least 0.1 kg"),
  dimensions: z
    .object({
      length: z.number().min(1),
      breadth: z.number().min(1),
      height: z.number().min(1),
    })
    .optional(),
});

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = await createOrder(parsed.data);

    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      shipment_id: data.shipment_id,
      status: data.status,
    });
  } catch (error) {
    console.error("[API] create-order error:", error);

    if (error instanceof ShiprocketError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
