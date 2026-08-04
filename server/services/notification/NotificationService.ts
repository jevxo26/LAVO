import { PrismaClient } from "@prisma/client";
import { getMessaging, isFirebaseInitialized } from "./firebaseAdmin";
import { MulticastMessage } from "firebase-admin/messaging";

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Registers or appends a new FCM device token for a user.
   */
  static async registerUserToken(userId: string, token: string): Promise<boolean> {
    if (!userId || !token) return false;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmTokens: true },
      });

      if (!user) return false;

      const existingTokens = user.fcmTokens || [];
      if (!existingTokens.includes(token)) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            fcmTokens: [...existingTokens, token],
          },
        });
      }

      // Also upsert UserDevice for device analytics
      await prisma.userDevice.upsert({
        where: { id: `${userId}-${token.substring(0, 16)}` },
        create: {
          id: `${userId}-${token.substring(0, 16)}`,
          userId,
          deviceId: token.substring(0, 32),
          pushToken: token,
          lastActive: new Date(),
        },
        update: {
          pushToken: token,
          lastActive: new Date(),
        },
      }).catch(() => null);

      return true;
    } catch (err) {
      console.error("[NotificationService.registerUserToken] Error:", err);
      return false;
    }
  }

  /**
   * Sends an FCM multicast message to specific device tokens.
   */
  static async sendToTokens(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ successCount: number; failureCount: number }> {
    const validTokens = Array.from(new Set(tokens.filter(Boolean)));
    if (!validTokens.length) return { successCount: 0, failureCount: 0 };

    if (!isFirebaseInitialized) {
      console.log(`[NotificationService.sendToTokens] (Dry-Run) Title: "${title}", Body: "${body}", Tokens: ${validTokens.length}`);
      return { successCount: validTokens.length, failureCount: 0 };
    }

    try {
      const message: MulticastMessage = {
        tokens: validTokens,
        notification: { title, body },
        data: data || {},
      };

      const response = await getMessaging().sendEachForMulticast(message);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (err) {
      console.error("[NotificationService.sendToTokens] Error sending FCM message:", err);
      return { successCount: 0, failureCount: validTokens.length };
    }
  }

  /**
   * Sends targeted push notifications to all registered device tokens of a user.
   */
  static async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ successCount: number; failureCount: number }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmTokens: true },
      });

      if (!user || !user.fcmTokens?.length) {
        return { successCount: 0, failureCount: 0 };
      }

      return await this.sendToTokens(user.fcmTokens, title, body, data);
    } catch (err) {
      console.error("[NotificationService.sendToUser] Error:", err);
      return { successCount: 0, failureCount: 0 };
    }
  }

  /**
   * Sends targeted push notifications to all active users matching specified role(s).
   */
  static async sendToRoles(
    roles: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ successCount: number; failureCount: number }> {
    try {
      const users = await prisma.user.findMany({
        where: {
          userType: { in: roles },
          status: "ACTIVE",
        },
        select: { fcmTokens: true },
      });

      const allTokens = users.flatMap((u) => u.fcmTokens || []).filter(Boolean);
      return await this.sendToTokens(allTokens, title, body, data);
    } catch (err) {
      console.error("[NotificationService.sendToRoles] Error:", err);
      return { successCount: 0, failureCount: 0 };
    }
  }
}
