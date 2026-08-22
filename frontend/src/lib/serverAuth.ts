import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  userType: string;
  profileImage: string | null;
}

export async function authenticateServerReq(
  req: NextRequest,
  allowedRoles?: string[]
): Promise<{ user?: AuthenticatedUser; response?: NextResponse }> {
  try {
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      token = req.cookies.get("laundrix_token")?.value || null;
    }

    if (!token) {
      return {
        response: NextResponse.json(
          { success: false, message: "Authentication token missing" },
          { status: 401 }
        ),
      };
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      return {
        response: NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        ),
      };
    }

    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) {
      return {
        response: NextResponse.json(
          { success: false, message: "Malformed token payload" },
          { status: 401 }
        ),
      };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userType: true,
        profileImage: true,
      },
    });

    if (!dbUser) {
      return {
        response: NextResponse.json(
          { success: false, message: "User account not found" },
          { status: 404 }
        ),
      };
    }

    const normalizedRole = dbUser.userType.toUpperCase().replace(/\s+/g, "_");
    if (allowedRoles && allowedRoles.length > 0) {
      const isAllowed = allowedRoles.some(
        (r) => r.toUpperCase() === normalizedRole
      );
      if (!isAllowed) {
        return {
          response: NextResponse.json(
            { success: false, message: "Forbidden: Insufficient privileges" },
            { status: 403 }
          ),
        };
      }
    }

    return { user: { ...dbUser, userType: normalizedRole } };
  } catch (err: any) {
    return {
      response: NextResponse.json(
        { success: false, message: err.message || "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}
