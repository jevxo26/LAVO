"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const firebaseAdmin_1 = require("./firebaseAdmin");
const prisma = new client_1.PrismaClient();
class NotificationService {
    /**
     * Registers or appends a new FCM device token for a user.
     */
    static async registerUserToken(userId, token) {
        if (!userId || !token)
            return false;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true },
            });
            if (!user)
                return false;
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
        }
        catch (err) {
            console.error("[NotificationService.registerUserToken] Error:", err);
            return false;
        }
    }
    /**
     * Sends an FCM multicast message to specific device tokens.
     */
    static async sendToTokens(tokens, title, body, data) {
        const validTokens = Array.from(new Set(tokens.filter(Boolean)));
        if (!validTokens.length)
            return { successCount: 0, failureCount: 0 };
        if (!firebaseAdmin_1.isFirebaseInitialized) {
            console.log(`[NotificationService.sendToTokens] (Dry-Run) Title: "${title}", Body: "${body}", Tokens: ${validTokens.length}`);
            return { successCount: validTokens.length, failureCount: 0 };
        }
        try {
            const message = {
                tokens: validTokens,
                notification: { title, body },
                data: data || {},
            };
            const response = await (0, firebaseAdmin_1.getMessaging)().sendEachForMulticast(message);
            return {
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (err) {
            console.error("[NotificationService.sendToTokens] Error sending FCM message:", err);
            return { successCount: 0, failureCount: validTokens.length };
        }
    }
    /**
     * Sends targeted push notifications to all registered device tokens of a user.
     */
    static async sendToUser(userId, title, body, data) {
        var _a;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmTokens: true },
            });
            if (!user || !((_a = user.fcmTokens) === null || _a === void 0 ? void 0 : _a.length)) {
                return { successCount: 0, failureCount: 0 };
            }
            return await this.sendToTokens(user.fcmTokens, title, body, data);
        }
        catch (err) {
            console.error("[NotificationService.sendToUser] Error:", err);
            return { successCount: 0, failureCount: 0 };
        }
    }
    /**
     * Sends targeted push notifications to all active users matching specified role(s).
     */
    static async sendToRoles(roles, title, body, data) {
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
        }
        catch (err) {
            console.error("[NotificationService.sendToRoles] Error:", err);
            return { successCount: 0, failureCount: 0 };
        }
    }
}
exports.NotificationService = NotificationService;
