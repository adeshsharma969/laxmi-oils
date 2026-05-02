import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await request.json().catch(() => null);
  return NextResponse.json(
    {
      success: false,
      error: "Automatic shipment route is disabled. Use admin create-shipment endpoint.",
    },
    { status: 410 },
  );
}
