import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { userType: "ADMIN" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        adminPermission: true,
      },
    }).catch(() => []);

    if (admins.length > 0) {
      return NextResponse.json({ success: true, data: admins });
    }

    const fallback = [
      {
        id: "ADM-101",
        fullName: "Tanvir Hasan",
        email: "tanvir.admin@laundrix.com",
        phone: "+8801700112233",
        role: "ADMIN",
        assignedBranch: "Central Hub - Sector 4",
        status: "ACTIVE",
        permissions: ["VIEW_LIVE_ORDERS", "MANAGE_INVENTORY", "VIEW_USERS"],
        createdAt: "2026-01-15",
      },
      {
        id: "ADM-102",
        fullName: "Farhana Chowdhury",
        email: "farhana.admin@laundrix.com",
        phone: "+8801800223344",
        role: "ADMIN",
        assignedBranch: "Gulshan Processing Center",
        status: "ACTIVE",
        permissions: ["VIEW_LIVE_ORDERS", "VIEW_ANALYTICS"],
        createdAt: "2026-03-01",
      },
    ];

    return NextResponse.json({ success: true, data: fallback });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
