import { NextRequest, NextResponse } from "next/server";

const TOKEN_KEY = "laundrix_token";

const ROLE_ROUTES: { prefix: string; allowed: string[] }[] = [
  { prefix: "/dashboard/users",    allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/branches", allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/vendors",  allowed: ["SUPER_ADMIN", "ADMIN", "VENDOR"] },
  { prefix: "/dashboard/services", allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/finance",  allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/support",  allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/settings", allowed: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/dashboard/logistics",allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/branch",   allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER"] },
  { prefix: "/dashboard/delivery-agent", allowed: ["SUPER_ADMIN", "ADMIN", "DELIVERY_AGENT"] },
  { prefix: "/dashboard/employee",       allowed: ["SUPER_ADMIN", "ADMIN", "BRANCH_MANAGER", "EMPLOYEE"] },
  { prefix: "/dashboard/book",     allowed: ["CUSTOMER"] },
  { prefix: "/dashboard/my-orders",allowed: ["CUSTOMER"] },
  { prefix: "/dashboard/track-orders", allowed: ["CUSTOMER"] },
  { prefix: "/dashboard/wishlist", allowed: ["CUSTOMER"] },
  { prefix: "/dashboard/wallet",   allowed: ["CUSTOMER"] },
  { prefix: "/dashboard/help-desk",allowed: ["CUSTOMER"] },
];

const GUEST_ONLY = ['/login', '/register'];

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
    dashUrl.pathname = '/dashboard';
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

    const role = rawRole.toUpperCase().replace(' ', '_');

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("expired", "1");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(TOKEN_KEY);
      return response;
    }

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
