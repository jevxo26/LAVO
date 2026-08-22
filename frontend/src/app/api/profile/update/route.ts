import { NextRequest, NextResponse } from "next/server";
import { authenticateServerReq } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user!.id },
      include: {
        profile: true,
        notificationSettings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const nidNumber = user.profile?.nationality || "";
    const alternatePhone = user.profile?.occupation || "";

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
        alternatePhone,
        role: user.userType,
        profileImage: user.profileImage || "",
        nidNumber,
        isNidLocked: Boolean(nidNumber && nidNumber.trim() !== ""),
        notificationSettings: user.notificationSettings || {
          pushNotification: true,
          emailNotification: true,
          smsNotification: true,
          marketingNotification: false,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateServerReq(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    const { fullName, alternatePhone, profileImage, nidNumber } = body;

    const currentUser = await prisma.user.findUnique({
      where: { id: auth.user!.id },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const existingNid = currentUser.profile?.nationality || "";
    let finalNid = existingNid;
    if (!existingNid && nidNumber && typeof nidNumber === "string" && nidNumber.trim() !== "") {
      finalNid = nidNumber.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.user!.id },
      data: {
        fullName: fullName ?? currentUser.fullName,
        profileImage: profileImage ?? currentUser.profileImage,
      },
    });

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: auth.user!.id },
      create: {
        userId: auth.user!.id,
        nationality: finalNid || null,
        occupation: alternatePhone || null,
        profilePhoto: profileImage || null,
      },
      update: {
        nationality: finalNid || null,
        occupation: alternatePhone ?? currentUser.profile?.occupation,
        profilePhoto: profileImage ?? currentUser.profile?.profilePhoto,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        alternatePhone: updatedProfile.occupation || "",
        role: updatedUser.userType,
        profileImage: updatedUser.profileImage || "",
        nidNumber: updatedProfile.nationality || "",
        isNidLocked: Boolean(updatedProfile.nationality && updatedProfile.nationality.trim() !== ""),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
