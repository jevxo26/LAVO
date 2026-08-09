import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  const userId = auth.user!.id;

  try {
    // Find the branch this employee belongs to
    const branchEmployee = await prisma.branchEmployee.findFirst({
      where: { employeeId: userId },
      select: { branchId: true },
    });

    // Check if user is linked to a Vendor
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    const vendorRecord = await prisma.vendor.findFirst({
      where: {
        OR: [
          { email: userRecord?.email ?? "" },
          { phone: userRecord?.phone ?? "" },
        ],
      },
      select: { id: true },
    });

    const branchId = branchEmployee?.branchId;
    const vendorId = vendorRecord?.id;

    const orders = await (prisma.order.findMany as any)({
      where: {
        ...(vendorId ? { vendorId } : branchId ? { branchId } : {}),
        orderStatus: {
          in: ["PICKUP", "PROCESSING", "WASHING", "DRYING", "IRONING", "FOLDING", "CONFIRMED"],
        },
      },
      include: {
        customer: {
          include: {
            user: { select: { fullName: true, phone: true } },
            addresses: {
              select: {
                id: true,
                receiverName: true,
                receiverPhone: true,
                fullAddress: true,
              },
            },
          },
        },
        items: {
          include: {
            garmentType: true,
            garmentItems: { include: { qrCodeRecord: true } },
          },
        },
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order: any) => {
      const totalGarments = order.items.reduce(
        (sum: number, item: any) => sum + item.garmentItems.length,
        0
      );
      const qrGenerated = order.items.reduce(
        (sum: number, item: any) =>
          sum + item.garmentItems.filter((g: any) => g.qrCodeRecord).length,
        0
      );
      const addr =
        order.customer?.addresses?.find(
          (a: any) => a.id === order.pickupAddressId
        ) || order.customer?.addresses?.[0];

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        customerName:
          addr?.receiverName || order.customer?.user?.fullName || "N/A",
        customerPhone:
          addr?.receiverPhone || order.customer?.user?.phone || "N/A",
        customerAddress: addr?.fullAddress || "N/A",
        branch: order.branch?.branchName || "N/A",
        totalGarments,
        qrGenerated,
        allQrDone: totalGarments > 0 && qrGenerated === totalGarments,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
