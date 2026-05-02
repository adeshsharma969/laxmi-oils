import { NextRequest, NextResponse } from "next/server";
import { trackByAwb, ShiprocketError } from "@/lib/shiprocket";

// ─── GET Handler ────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ awb: string }> },
) {
  try {
    const { awb } = await params;

    if (!awb || awb.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "AWB number is required" },
        { status: 400 },
      );
    }

    const tracking = await trackByAwb(awb.trim());

    return NextResponse.json({
      success: true,
      ...tracking,
    });
  } catch (error) {
    console.error("[API] track error:", error);

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
