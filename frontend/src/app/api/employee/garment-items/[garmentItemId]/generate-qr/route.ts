import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

// POST /api/employee/garment-items/[garmentItemId]/generate-qr
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ garmentItemId: string }> }
) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const { garmentItemId } = await params;

  try {
    const existing = await prisma.garmentQRCode.findUnique({
      where: { garmentItemId },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const qrCode = `LAVO-${garmentItemId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const record = await prisma.garmentQRCode.create({
      data: { garmentItemId, qrCode, status: "ACTIVE" },
    });

    return NextResponse.json(
      { success: true, message: "QR code generated", data: record },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
