import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Only protect /dashboard and its subroutes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    try {
      await auth.protect();

      // Get user info for JWT token
      const { userId } = await auth();
      if (userId) {
        // Create a custom header with user info for JWT-like functionality
        const response = NextResponse.next();
        response.headers.set('x-user-id', userId);
        response.headers.set('x-auth-timestamp', Date.now().toString());
        response.headers.set('x-auth-expires', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 1 day
        return response;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*', // Protect dashboard and all subroutes
    '/api/:path*',       // Protect API routes if needed
    '/trpc/:path*',      // Protect tRPC routes if needed
  ],
};
