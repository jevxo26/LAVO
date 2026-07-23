import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Role Restriction Middleware
 * Ensures user has an allowed role or userType. SUPER_ADMIN bypasses unconditionally.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: Unauthenticated user" });
      return;
    }

    const userType = (req.user.userType || req.user.role || "").toUpperCase();

    // SUPER_ADMIN unconditionally bypasses role restrictions
    if (userType === "SUPER_ADMIN") {
      return next();
    }

    if (!roles.map((r) => r.toUpperCase()).includes(userType)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have sufficient role level to access this endpoint.",
      });
      return;
    }

    next();
  };
};

/**
 * Granular Permission Requirement Middleware
 * If SUPER_ADMIN, immediately bypasses permission check.
 * If NORMAL ADMIN, strictly validates if user has permission assigned via Role or AdminPermission.
 */
export const requirePermission = (permissionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: Unauthenticated user" });
      return;
    }

    const userType = (req.user.userType || req.user.role || "").toUpperCase();

    // OMNIPOTENCE BYPASS: SUPER_ADMIN bypasses all permission checks
    if (userType === "SUPER_ADMIN") {
      return next();
    }

    try {
      const userId = req.user.id || req.user.userId;
      
      const user = (await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })) as any;

      if (!user) {
        res.status(403).json({ success: false, message: "User account not found." });
        return;
      }

      // Check permissions
      const userPermissions = (req.user.permissions as string[]) || [];
      const hasPerm = userPermissions.includes(permissionName);

      if (!hasPerm) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Missing required administrative permission [${permissionName}]`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Error evaluating permission boundaries" });
    }
  };
};
