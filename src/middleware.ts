import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Protects /admin/** (ADMIN only) and /account/**, /checkout (any authed user).
 * Unauthenticated users are redirected to /login by NextAuth's default handler.
 */
export default withAuth(
  function middleware(req) {
    const { token, nextUrl } = { token: req.nextauth.token, nextUrl: req.nextUrl };

    if (nextUrl.pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: { signIn: '/login' },
  },
);

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout'],
};
