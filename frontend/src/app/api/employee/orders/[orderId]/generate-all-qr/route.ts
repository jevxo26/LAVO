import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

// POST /api/employee/orders/[orderId]/generate-all-qr
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const { orderId } = await params;

  try {
    // Ensure garment items exist first
    let items = await prisma.garmentItem.findMany({
      where: { orderItem: { orderId } },
      include: { qrCodeRecord: true },
    });

    if (items.length === 0) {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        include: { garmentType: true },
      });

      const createPromises = [];
      for (const oi of orderItems) {
        for (let i = 0; i < oi.quantity; i++) {
          createPromises.push(
            prisma.garmentItem.create({
              data: {
                orderItemId: oi.id,
                garmentCode: `G-${Date.now().toString().slice(-4)}-${Math.random()
                  .toString(36)
                  .substring(2, 6)
                  .toUpperCase()}`,
                garmentName: (oi.garmentType as any)?.name || "Garment Item",
              },
            })
          );
        }
      }

      if (createPromises.length > 0) {
        await Promise.all(createPromises);
        items = await prisma.garmentItem.findMany({
          where: { orderItem: { orderId } },
          include: { qrCodeRecord: true },
        });
      }
    }

    const created: any[] = [];
    for (const item of items) {
      if (!item.qrCodeRecord) {
        const qrCode = `LAVO-${item.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
        const record = await prisma.garmentQRCode.create({
          data: { garmentItemId: item.id, qrCode, status: "ACTIVE" },
        });
        created.push(record);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} QR code(s) generated`,
      data: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate QR codes" },
      { status: 500 }
    );
  }
}
