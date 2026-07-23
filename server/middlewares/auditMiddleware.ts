import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "./authMiddleware";

const prisma = new PrismaClient();

/**
 * Audit Logger Middleware
 * Automatically captures POST, PUT, PATCH, DELETE operations by administrative users.
 */
export const auditLogger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const isWriteMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  
  if (!isWriteMethod || !req.user) {
    return next();
  }

  // Hook into response completion to record log upon success
  res.on("finish", async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const userId = req.user.id || req.user.userId || "SYSTEM";
        const pathSegments = req.originalUrl.split("/").filter(Boolean);
        const moduleName = pathSegments[1]?.toUpperCase() || "ADMIN";

        await prisma.auditLog.create({
          data: {
            module: moduleName,
            action: `${req.method} ${req.originalUrl}`,
            performedBy: req.user.email || userId,
            ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
            newValue: req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null,
          },
        });
      } catch (error) {
        console.error("Failed to persist audit log entry:", error);
      }
    }
  });

  next();
};
