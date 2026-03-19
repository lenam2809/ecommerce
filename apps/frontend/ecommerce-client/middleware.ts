// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths are protected and which are public
const protectedPaths = ['/dashboard', '/profile', '/settings'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current path is protected
    const isProtectedPath = protectedPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // Check if the current path is an auth path (login/register)
    const isAuthPath = authPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // Đọc token từ cookie (HttpOnly cookie access_token)
    const token = request.cookies.get('access_token')?.value;

    // If the path is protected and there's no token, redirect to login
    if (isProtectedPath && !token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    // If the user is already logged in and tries to access login/register page,
    // redirect them to home page
    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};