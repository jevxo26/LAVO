import bcrypt    from "bcrypt";
import prisma     from "../vendor/prisma";

export class ProfileService {

  // ── Get profile ────────────────────────────────────────────────────────────
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where:   { id: userId },
      include: { profile: true, notificationSettings: true },
    });
    if (!user) throw new Error("User not found");

    const nidNumber      = user.profile?.nationality  || "";
    const alternatePhone = user.profile?.occupation   || "";

    return {
      id:             user.id,
      fullName:       user.fullName,
      email:          user.email,
      phone:          user.phone         || "",
      alternatePhone,
      role:           user.userType,
      profileImage:   user.profileImage  || "",
      nidNumber,
      isNidLocked:    Boolean(nidNumber && nidNumber.trim() !== ""),
    };
  }

  // ── Update profile ─────────────────────────────────────────────────────────
  static async updateProfile(userId: string, body: {
    fullName?: string;
    alternatePhone?: string;
    profileImage?: string;
    nidNumber?: string;
  }) {
    const current = await prisma.user.findUnique({
      where:   { id: userId },
      include: { profile: true },
    });
    if (!current) throw new Error("User not found");

    // NID is one-time — once set it cannot be changed
    const existingNid = current.profile?.nationality || "";
    let finalNid = existingNid;
    if (!existingNid && body.nidNumber && body.nidNumber.trim()) {
      finalNid = body.nidNumber.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data:  {
        fullName:     body.fullName    ?? current.fullName,
        profileImage: body.profileImage ?? current.profileImage,
      },
    });

    await prisma.userProfile.upsert({
      where:  { userId },
      create: {
        userId,
        nationality:  finalNid              || null,
        occupation:   body.alternatePhone   || null,
        profilePhoto: body.profileImage     || null,
      },
      update: {
        nationality:  finalNid,
        occupation:   body.alternatePhone   ?? current.profile?.occupation,
        profilePhoto: body.profileImage     ?? current.profile?.profilePhoto,
      },
    });

    return {
      fullName:     updatedUser.fullName,
      email:        updatedUser.email,
      phone:        updatedUser.phone        || "",
      profileImage: updatedUser.profileImage || "",
      nidNumber:    finalNid,
      isNidLocked:  Boolean(finalNid),
    };
  }

  // ── Change password ────────────────────────────────────────────────────────
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (newPassword.length < 6) throw new Error("New password must be at least 6 characters long");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) throw new Error("User not found or no password set");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  // ── Get preferences ────────────────────────────────────────────────────────
  static async getPreferences(userId: string) {
    const settings = await prisma.userNotificationSetting.findUnique({
      where: { userId },
    });
    return settings || {
      emailNotification:    true,
      pushNotification:     true,
      smsNotification:      true,
      marketingNotification: false,
    };
  }

  // ── Save preferences ───────────────────────────────────────────────────────
  static async savePreferences(userId: string, body: {
    emailNotification?: boolean;
    pushNotification?: boolean;
    smsNotification?: boolean;
    marketingNotification?: boolean;
  }) {
    // Fetch current values so we never overwrite with undefined
    const current = await prisma.userNotificationSetting.findUnique({
      where: { userId },
    });

    return prisma.userNotificationSetting.upsert({
      where:  { userId },
      create: {
        userId,
        emailNotification:    body.emailNotification    ?? true,
        pushNotification:     body.pushNotification     ?? true,
        smsNotification:      body.smsNotification      ?? true,
        marketingNotification: body.marketingNotification ?? false,
      },
      update: {
        emailNotification:    body.emailNotification    ?? current?.emailNotification    ?? true,
        pushNotification:     body.pushNotification     ?? current?.pushNotification     ?? true,
        smsNotification:      body.smsNotification      ?? current?.smsNotification      ?? true,
        marketingNotification: body.marketingNotification ?? current?.marketingNotification ?? false,
      },
    });
  }
}
