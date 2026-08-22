export interface UserPermissionContext {
  userType?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Client & Server Permission Evaluation Utility
 * @param user Current authenticated user context
 * @param module Target administrative module (e.g. FINANCE, OPERATIONS, SUPPORT, SETTINGS)
 * @param action Optional specific action (e.g. READ, WRITE, APPROVE, DELETE)
 */
export function hasPermission(
  user: UserPermissionContext | null | undefined,
  module: string,
  action?: string
): boolean {
  if (!user) return false;

  const userType = (user.userType || user.role || "").toUpperCase();

  // SUPER_ADMIN unconditionally possesses all permissions
  if (userType === "SUPER_ADMIN") {
    return true;
  }

  if (!user.permissions || user.permissions.length === 0) {
    return false;
  }

  const upperModule = module.toUpperCase();
  const upperAction = action ? action.toUpperCase() : null;

  if (upperAction) {
    const exactPermission = `${upperModule}:${upperAction}`;
    return user.permissions.includes(exactPermission);
  }

  // If no action specified, check if any permission exists for the module
  return user.permissions.some((p) => p.startsWith(`${upperModule}:`));
}
