import { NextResponse } from 'next/server';

export async function middleware(request) {
  const session = request.cookies.get('session');
  
  // Protect the /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // No session cookie found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect logged-in users away from the login page
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
