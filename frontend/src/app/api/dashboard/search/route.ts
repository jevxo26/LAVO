import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const roleParam = searchParams.get("role")?.toUpperCase().replace(/\s+/g, "_") || "CUSTOMER";

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          orders: [],
          users: [],
          branches: [],
          services: [],
          tickets: [],
        },
      });
    }

    const isManagement = ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"].includes(roleParam);
    const isStaff = isManagement || ["EMPLOYEE", "AGENT", "DELIVERY_AGENT", "VENDOR"].includes(roleParam);

    // Run parallel DB queries with safe error handling
    const [ordersResult, usersResult, branchesResult, servicesResult, ticketsResult] =
      await Promise.allSettled([
        // 1. Orders
        prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { orderStatus: { contains: query, mode: "insensitive" } },
              { customer: { user: { fullName: { contains: query, mode: "insensitive" } } } },
              { customer: { user: { phone: { contains: query, mode: "insensitive" } } } },
            ],
          },
          take: 6,
          include: {
            customer: {
              include: {
                user: { select: { fullName: true, phone: true } },
              },
            },
            branch: { select: { branchName: true } },
          },
          orderBy: { createdAt: "desc" },
        }),

        // 2. Users (Only for Management)
        isManagement
          ? prisma.user.findMany({
              where: {
                OR: [
                  { fullName: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                  { phone: { contains: query, mode: "insensitive" } },
                  { userType: { contains: query, mode: "insensitive" } },
                ],
              },
              take: 5,
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userType: true,
                status: true,
              },
            })
          : Promise.resolve([]),

        // 3. Branches
        prisma.branch.findMany({
          where: {
            OR: [
              { branchName: { contains: query, mode: "insensitive" } },
              { branchCode: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { address: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: {
            id: true,
            branchName: true,
            branchCode: true,
            city: true,
            address: true,
            status: true,
          },
        }),

        // 4. Services
        prisma.service.findMany({
          where: {
            OR: [
              { serviceName: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: {
            id: true,
            serviceName: true,
            basePrice: true,
            status: true,
          },
        }),

        // 5. Support Tickets
        isStaff || roleParam === "CUSTOMER"
          ? prisma.ticket.findMany({
              where: {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                  { priority: { contains: query, mode: "insensitive" } },
                  { status: { contains: query, mode: "insensitive" } },
                ],
              },
              take: 5,
              select: {
                id: true,
                title: true,
                priority: true,
                status: true,
              },
              orderBy: { createdAt: "desc" },
            })
          : Promise.resolve([]),
      ]);

    // Format & map results to frontend friendly structure
    const rawOrders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
    const rawUsers = usersResult.status === "fulfilled" ? usersResult.value : [];
    const rawBranches = branchesResult.status === "fulfilled" ? branchesResult.value : [];
    const rawServices = servicesResult.status === "fulfilled" ? servicesResult.value : [];
    const rawTickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];

    const orders = rawOrders.map((o: any) => ({
      id: o.id,
      title: o.orderNumber,
      subtitle: `${o.orderStatus} • ${o.customer?.user?.fullName || "Customer"} • ৳${o.grandTotal || 0}`,
      type: "order",
      url:
        roleParam === "CUSTOMER"
          ? "/dashboard/my-orders"
          : roleParam === "BRANCH_MANAGER"
          ? "/dashboard/branch-orders"
          : roleParam === "AGENT"
          ? "/dashboard/deliveries"
          : "/dashboard/customer-ops/live-orders",
      badge: o.orderStatus,
    }));

    const users = rawUsers.map((u: any) => {
      const uRole = (u.userType || "CUSTOMER").toLowerCase().replace(/\s+/g, "-");
      let url = "/dashboard/user-management/customers";
      if (uRole.includes("agent")) url = "/dashboard/user-management/agents";
      else if (uRole.includes("branch")) url = "/dashboard/user-management/branch-managers";
      else if (uRole.includes("employee")) url = "/dashboard/user-management/employees";
      else if (uRole.includes("vendor")) url = "/dashboard/user-management/vendors";
      else if (roleParam === "SUPER_ADMIN") url = "/dashboard/users";

      return {
        id: u.id,
        title: u.fullName,
        subtitle: `${u.userType} • ${u.email || u.phone || ""}`,
        type: "user",
        url,
        badge: u.userType,
      };
    });

    const branches = rawBranches.map((b: any) => ({
      id: b.id,
      title: b.branchName,
      subtitle: `${b.city} • ${b.address || ""}`,
      type: "branch",
      url: roleParam === "BRANCH_MANAGER" ? "/dashboard/branch-overview" : "/dashboard/branches",
      badge: b.branchCode || "Branch",
    }));

    const services = rawServices.map((s: any) => ({
      id: s.id,
      title: s.serviceName,
      subtitle: `Starting from ৳${s.basePrice || 0}`,
      type: "service",
      url: roleParam === "SUPER_ADMIN" ? "/dashboard/services" : "/services",
      badge: "Service",
    }));

    const tickets = rawTickets.map((t: any) => ({
      id: t.id,
      title: t.title,
      subtitle: `${t.priority} priority • ${t.status}`,
      type: "ticket",
      url: roleParam === "CUSTOMER" ? `/dashboard/help-desk` : `/dashboard/support/${t.id}`,
      badge: t.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders,
        users,
        branches,
        services,
        tickets,
      },
    });
  } catch (error) {
    console.error("Dashboard Global Search Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform global search",
        data: { orders: [], users: [], branches: [], services: [], tickets: [] },
      },
      { status: 500 }
    );
  }
}
