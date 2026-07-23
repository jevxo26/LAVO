"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Audit Logger Middleware
 * Automatically captures POST, PUT, PATCH, DELETE operations by administrative users.
 */
const auditLogger = async (req, res, next) => {
    const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    if (!isWriteMethod || !req.user) {
        return next();
    }
    // Hook into response completion to record log upon success
    res.on("finish", async () => {
        var _a;
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const userId = req.user.id || req.user.userId || "SYSTEM";
                const pathSegments = req.originalUrl.split("/").filter(Boolean);
                const moduleName = ((_a = pathSegments[1]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "ADMIN";
                await prisma.auditLog.create({
                    data: {
                        module: moduleName,
                        action: `${req.method} ${req.originalUrl}`,
                        performedBy: req.user.email || userId,
                        ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1",
                        newValue: req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null,
                    },
                });
            }
            catch (error) {
                console.error("Failed to persist audit log entry:", error);
            }
        }
    });
    next();
};
exports.auditLogger = auditLogger;
