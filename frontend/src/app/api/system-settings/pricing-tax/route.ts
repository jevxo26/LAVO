import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const baseFeeSetting = await prisma.systemSetting.findUnique({ where: { settingKey: "BASE_DELIVERY_FEE" } });
    const expressMultSetting = await prisma.systemSetting.findUnique({ where: { settingKey: "EXPRESS_MULTIPLIER" } });
    const taxSetting = await prisma.systemSetting.findUnique({ where: { settingKey: "GLOBAL_TAX_PERCENTAGE" } });

    return NextResponse.json({
      success: true,
      data: {
        baseDeliveryFee: baseFeeSetting ? parseFloat(baseFeeSetting.settingValue) : 50,
        expressMultiplier: expressMultSetting ? parseFloat(expressMultSetting.settingValue) : 1.5,
        globalTaxPercentage: taxSetting ? parseFloat(taxSetting.settingValue) : 15,
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
    const { baseDeliveryFee, expressMultiplier, globalTaxPercentage } = await req.json();

    await prisma.systemSetting.upsert({
      where: { settingKey: "BASE_DELIVERY_FEE" },
      create: { settingKey: "BASE_DELIVERY_FEE", settingValue: String(baseDeliveryFee ?? 50), category: "PRICING" },
      update: { settingValue: String(baseDeliveryFee ?? 50) },
    });

    await prisma.systemSetting.upsert({
      where: { settingKey: "EXPRESS_MULTIPLIER" },
      create: { settingKey: "EXPRESS_MULTIPLIER", settingValue: String(expressMultiplier ?? 1.5), category: "PRICING" },
      update: { settingValue: String(expressMultiplier ?? 1.5) },
    });

    await prisma.systemSetting.upsert({
      where: { settingKey: "GLOBAL_TAX_PERCENTAGE" },
      create: { settingKey: "GLOBAL_TAX_PERCENTAGE", settingValue: String(globalTaxPercentage ?? 15), category: "TAX" },
      update: { settingValue: String(globalTaxPercentage ?? 15) },
    });

    return NextResponse.json({
      success: true,
      message: "Pricing & Tax settings updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
