import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const settings = await prisma.userNotificationSetting.findUnique({
      where: { userId: auth.user!.id },
    });

    return NextResponse.json({
      success: true,
      data: settings || {
        emailNotification: true,
        pushNotification: true,
        smsNotification: true,
        marketingNotification: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const { emailNotification, pushNotification, smsNotification, marketingNotification } = body;

    const updated = await prisma.userNotificationSetting.upsert({
      where: { userId: auth.user!.id },
      create: {
        userId: auth.user!.id,
        emailNotification: emailNotification ?? true,
        pushNotification: pushNotification ?? true,
        smsNotification: smsNotification ?? true,
        marketingNotification: marketingNotification ?? false,
      },
      update: {
        emailNotification: emailNotification ?? true,
        pushNotification: pushNotification ?? true,
        smsNotification: smsNotification ?? true,
        marketingNotification: marketingNotification ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
