import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assignCheapestSurfaceCourier, ShiprocketError } from "@/lib/shiprocket";

// ─── Input Validation ───────────────────────────────────────────────────────────

const assignCourierSchema = z.object({
  shipment_id: z.number().int().positive("Shipment ID must be a positive integer"),
});

// ─── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = assignCourierSchema.safeParse(body);

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

    const { shipment_id } = parsed.data;
    const result = await assignCheapestSurfaceCourier(shipment_id);

    return NextResponse.json({
      success: true,
      awb: result.awb,
      courier_name: result.courier_name,
      courier_id: result.courier_id,
      freight_charge: result.freight_charge,
    });
  } catch (error) {
    console.error("[API] assign-courier error:", error);

    if (error instanceof ShiprocketError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.details,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
