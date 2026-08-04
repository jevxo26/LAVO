import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const commissionSetting = await prisma.systemSetting.findUnique({ where: { settingKey: "VENDOR_COMMISSION_RATE" } });
    const payoutSetting = await prisma.systemSetting.findUnique({ where: { settingKey: "MIN_PAYOUT_THRESHOLD" } });

    return NextResponse.json({
      success: true,
      data: {
        vendorCommissionRate: commissionSetting ? parseFloat(commissionSetting.settingValue) : 15,
        minPayoutThreshold: payoutSetting ? parseFloat(payoutSetting.settingValue) : 1000,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateServerReq(req, ["SUPER_ADMIN"]);
  if (auth.response) return auth.response;

  try {
    const { vendorCommissionRate, minPayoutThreshold } = await req.json();

    await prisma.systemSetting.upsert({
      where: { settingKey: "VENDOR_COMMISSION_RATE" },
      create: { settingKey: "VENDOR_COMMISSION_RATE", settingValue: String(vendorCommissionRate ?? 15), category: "FINANCE" },
      update: { settingValue: String(vendorCommissionRate ?? 15) },
    });

    await prisma.systemSetting.upsert({
      where: { settingKey: "MIN_PAYOUT_THRESHOLD" },
      create: { settingKey: "MIN_PAYOUT_THRESHOLD", settingValue: String(minPayoutThreshold ?? 1000), category: "FINANCE" },
      update: { settingValue: String(minPayoutThreshold ?? 1000) },
    });

    return NextResponse.json({
      success: true,
      message: "Financial Rules updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
