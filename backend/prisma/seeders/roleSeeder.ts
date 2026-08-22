import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  { name: "SUPER_ADMIN", displayName: "Super Admin", roleType: "ADMIN" },
  { name: "ADMIN", displayName: "System Admin", roleType: "ADMIN" },
  { name: "BRANCH_MANAGER", displayName: "Branch Manager", roleType: "BRANCH" },
  { name: "VENDOR", displayName: "Vendor Owner", roleType: "VENDOR" },
  { name: "CUSTOMER_SUPPORT", displayName: "Customer Support", roleType: "SUPPORT" },
  { name: "FINANCE_MANAGER", displayName: "Finance Manager", roleType: "FINANCE" },
];

const MODULES = ["Order", "Customer", "Branch", "Vendor", "Payment", "QR Tracking", "Pickup", "Delivery", "Reports", "Analytics"];
const ACTIONS = ["Create", "Read", "Update", "Delete", "Approve", "Assign", "Export", "Cancel"];

export async function runRoleSeeder() {
  console.log("Seeding Roles and Permissions...");

  // 1. Seed Roles
  const dbRoles: Record<string, any> = {};
  for (const role of ROLES) {
    dbRoles[role.name] = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, roleType: role.roleType },
      create: { name: role.name, displayName: role.displayName, roleType: role.roleType },
    });
  }

  // 2. Seed Permissions
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const permissionName = `${action} ${module}`;
      const existing = await prisma.permission.findFirst({
        where: { module, action },
      });

      if (!existing) {
        await prisma.permission.create({
          data: {
            module,
            action,
            permissionName,
            description: `Allows to ${action.toLowerCase()} ${module.toLowerCase()} records`,
          },
        });
      }
    }
  }

  // 3. Link Super Admin & Admin to their roles
  const superAdmin = await prisma.user.findFirst({ where: { userType: "SUPER_ADMIN" } });
  if (superAdmin) {
    const role = dbRoles["SUPER_ADMIN"];
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: superAdmin.id, roleId: role.id } },
      update: {},
      create: { userId: superAdmin.id, roleId: role.id },
    });
  }

  const admin = await prisma.user.findFirst({ where: { userType: "ADMIN" } });
  if (admin) {
    const role = dbRoles["ADMIN"];
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: role.id } },
      update: {},
      create: { userId: admin.id, roleId: role.id },
    });
  }

  console.log("Roles and Permissions Seeding Completed!");
}
