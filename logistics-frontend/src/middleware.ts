import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — server-side auth guard + security.
 *
 * Since Sanctum uses Bearer tokens stored in localStorage (client-only),
 * the middleware checks for a duplicated cookie `auth_token` set by the
 * client after login. If the cookie is missing the user is redirected.
 *
 * Cookie security:
 *  - SameSite=Lax (CSRF protection)
 *  - Secure flag in production (HTTPS only)
 *  - Path=/ (available site-wide)
 *  - Max-Age=86400 (24 hours)
 *
 * The client must set the cookie via the helper in lib/cookies.ts
 */

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/api',
  '/favicon',
  '/images',
  '/icons',
  '/manifest.json',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public static assets and Next.js internals
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Skip public pages (exact match)
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token cookie
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to visit login/register, redirect to dashboard
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files.
     * This is the recommended Next.js middleware matcher.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
