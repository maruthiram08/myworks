import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/auth');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isProtectedRoute = nextUrl.pathname.startsWith('/learn') || nextUrl.pathname.startsWith('/dashboard');

  // Allow API auth routes
  if (isApiAuthRoute) {
    return;
  }

  // Redirect logged-in users from auth pages
  if (isLoggedIn && nextUrl.pathname.startsWith('/auth')) {
    return Response.redirect(new URL('/learn', nextUrl));
  }

  // Protect routes that require authentication
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth/signin', nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute && (!isLoggedIn || req.auth?.user?.role !== 'ADMIN')) {
    return Response.redirect(new URL('/', nextUrl));
  }

  return;
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
