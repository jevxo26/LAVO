import { NextRequest, NextResponse } from 'next/server';

const TOKEN_KEY = 'laundrix_token';

// Routes that require authentication
const PROTECTED = ['/dashboard'];
// Routes only for guests (redirect to dashboard if already logged in)
const GUEST_ONLY = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read token — Next.js middleware runs on Edge, so we check cookies only.
  // The actual token is stored in localStorage (client-side), but we also
  // set a `laundrix_token` cookie on login for middleware access.
  const token = req.cookies.get(TOKEN_KEY)?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && token) {
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
