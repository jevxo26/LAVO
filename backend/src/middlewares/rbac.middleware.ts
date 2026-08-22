import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";

const prisma = new PrismaClient();

export type PermissionKey =
  | "canManageCustomerOps"
  | "canManageBranchOps"
  | "canManageVendorOps"
  | "canManageAgentOps"
  | "canManageEmployeeOps"
  | "canManageFinance";

/**
 * Restrict to specific user types/roles. SUPER_ADMIN bypasses unconditionally.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: Unauthenticated user" });
      return;
    }

    const userType = (req.user.userType || req.user.role || "").toUpperCase();

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
 * Require Super Admin Middleware
 * Strictly blocks anyone except SUPER_ADMIN role/userType.
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized: Unauthenticated user" });
    return;
  }

  const role = (req.user.userType || req.user.role || "").toUpperCase();

  if (role !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden: Super Admin privileges are strictly required for this administrative action.",
    });
    return;
  }

  next();
};

/**
 * Check Dynamic Permission Middleware
 * If SUPER_ADMIN, immediately bypasses and allows access.
 * If ADMIN, checks DB (AdminPermission) to verify if the required boolean flag is enabled.
 */
export const checkPermission = (requiredPermission: PermissionKey) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized: Unauthenticated user" });
      return;
    }

    const role = (req.user.userType || req.user.role || "").toUpperCase();

    // SUPER_ADMIN unconditionally bypasses dynamic permission checks
    if (role === "SUPER_ADMIN") {
      return next();
    }

    if (role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Insufficient administrative privileges" });
      return;
    }

    try {
      const userId = req.user.id || req.user.userId;
      const adminPerm = await prisma.adminPermission.findUnique({
        where: { userId },
      });

      if (!adminPerm || !adminPerm[requiredPermission]) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Missing required dynamic permission flag [${requiredPermission}]`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error evaluating permission boundaries" });
    }
  };
};
