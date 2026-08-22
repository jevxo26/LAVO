import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

// GET /api/employee/orders/[orderId]/qr-codes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const { orderId } = await params;

  try {
    let items = await prisma.garmentItem.findMany({
      where: { orderItem: { orderId } },
      include: {
        qrCodeRecord: true,
        orderItem: { include: { garmentType: true, service: true } },
      },
    });

    // Auto-create garment item records if they don't exist yet
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
          include: {
            qrCodeRecord: true,
            orderItem: { include: { garmentType: true, service: true } },
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch garments" },
      { status: 500 }
    );
  }
}
