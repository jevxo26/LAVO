import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "laundrix_token";

const ROLE_ROUTES: { prefix: string; allowed: string[] }[] = [
  // =========================
  // Super Admin Exclusive Routes
  // =========================
  { prefix: "/dashboard/audit-logs",            allowed: ["SUPER_ADMIN"] },
  { prefix: "/dashboard/payout-approvals",       allowed: ["SUPER_ADMIN"] },
  { prefix: "/dashboard/website-cms",           allowed: ["SUPER_ADMIN"] },
  { prefix: "/dashboard/system-settings",       allowed: ["SUPER_ADMIN"] },
  { prefix: "/dashboard/role-management",       allowed: ["SUPER_ADMIN"] },

  // =========================
  // Admin & Super Admin Shared Routes
  // =========================
  { prefix: "/dashboard/overview",              allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/financial-analytics",   allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/customer-ops",          allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/branch-ops",            allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/vendor-ops",            allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/agent-ops",             allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/employee-ops",          allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/user-management",       allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/analytics",            allowed: ["SUPER_ADMIN", "ADMIN"] },

  // =========================
  // Vendor Specific Routes
  // =========================
  { prefix: "/dashboard/vendor-orders",         allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/vendor-services",       allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/vendor-capacity",       allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/vendor-employees",      allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/vendor-wallet",         allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/payouts",               allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/performance",           allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },

  // =========================
  // Branch Manager Routes
  // =========================
  { prefix: "/dashboard/branch-overview",       allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/branch-orders",         allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/branch-analytics",      allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/branch-delivery",       allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/branch-employees",      allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/inventory",             allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/partner-applications",  allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/partner-vendors",       allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },

  // =========================
  // Employee Routes
  // =========================
  { prefix: "/dashboard/intake-orders",         allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
  { prefix: "/dashboard/scanner",               allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },

  // =========================
  // Delivery Agent Routes
  // =========================
  { prefix: "/dashboard/pickups",               allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/deliveries",            allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/agent-routes",          allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/verification text",          allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/verification",          allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/history",               allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },

  // =========================
  // Customer Routes
  // =========================
  { prefix: "/dashboard/book-services",         allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/my-orders",             allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/track-orders",          allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/wishlist",              allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/wallet",                allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/my-reviews",            allowed: ["CUSTOMER", "SUPER_ADMIN"] },
  { prefix: "/dashboard/help-desk",             allowed: ["CUSTOMER", "SUPER_ADMIN"] },

  // =========================
  // Shared / Legacy Base Routes
  // =========================
  { prefix: "/dashboard/users",                 allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/branches",              allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/vendors",               allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/services",              allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/finance",               allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/support",               allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/profile",               allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR", "BRANCH_MANAGER", "EMPLOYEE", "DELIVERY_AGENT", "PICKUP_AGENT", "CUSTOMER"] },
  { prefix: "/dashboard/settings",              allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR", "BRANCH_MANAGER", "EMPLOYEE", "DELIVERY_AGENT", "PICKUP_AGENT", "CUSTOMER"] },
  { prefix: "/dashboard/logistics",             allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
];

const GUEST_ONLY = ["/login", "/register"];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isScanner = pathname.startsWith("/scanner");
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  if (!isDashboard && !isScanner && !isGuestOnly) {
    return NextResponse.next();
  }

  const token = req.cookies.get(TOKEN_KEY)?.value;
  const isPaymentReturn = req.nextUrl.searchParams.has("status");

  if (isGuestOnly && token) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  if ((isDashboard || isScanner) && !token && !isPaymentReturn) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    const fullRedirectPath = pathname + req.nextUrl.search;
    loginUrl.searchParams.set("redirect", fullRedirectPath);
    return NextResponse.redirect(loginUrl);
  }

  if (token && (isDashboard || isScanner)) {
    const payload = decodeJwtPayload(token);

    const rawRole = (payload?.userType || payload?.role || "") as string;

    if (!payload || !rawRole) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_KEY);
      return response;
    }

    const role = rawRole.toUpperCase().replace(/\s+/g, "_");

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("expired", "1");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_KEY);
      return response;
    }

    // Check path permissions ONLY if accessing a specific sub-route under /dashboard
    if (pathname !== "/dashboard" && pathname !== "/dashboard/") {
      for (const { prefix, allowed } of ROLE_ROUTES) {
        if (pathname.startsWith(prefix)) {
          if (!allowed.includes(role)) {
            const dashboardUrl = req.nextUrl.clone();
            dashboardUrl.pathname = "/dashboard";
            dashboardUrl.searchParams.set("unauthorized", "1");
            return NextResponse.redirect(dashboardUrl);
          }
          break;
        }
      }
    }

    if (isScanner) {
      const allowedForScanner = ["SUPER_ADMIN", "ADMIN", "EMPLOYEE", "BRANCH_MANAGER"];
      if (!allowedForScanner.includes(role)) {
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        dashboardUrl.searchParams.set("unauthorized", "1");
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/scanner/:path*", "/login", "/register"],
};
