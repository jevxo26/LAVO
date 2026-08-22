import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const flags = await prisma.featureFlag.findMany();

    const flagMap: Record<string, boolean> = {
      enableWalletSystem: true,
      enablePromoCodes: true,
      enableVendorMarketplace: true,
      enableLiveAgentTracking: true,
      enableSMSNotifications: true,
    };

    flags.forEach((f) => {
      if (f.featureName in flagMap) {
        flagMap[f.featureName] = f.isEnabled;
      }
    });

    return NextResponse.json({
      success: true,
      data: flagMap,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateServerReq(req, ["SUPER_ADMIN"]);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();

    for (const [featureName, isEnabled] of Object.entries(body)) {
      await prisma.featureFlag.upsert({
        where: { featureName },
        create: { featureName, isEnabled: Boolean(isEnabled), description: `${featureName} module toggle` },
        update: { isEnabled: Boolean(isEnabled) },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Feature Flags updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
