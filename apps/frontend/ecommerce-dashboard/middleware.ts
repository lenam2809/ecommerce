// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which paths are protected and which are public
const protectedPaths = ['/dashboard', '/profile', '/settings'];
const authPaths = ['/login'];

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

    // Role checking should be done API-side or in Server Components/Page logic
    // We just check for token presence here to avoid redirect loops validation

    // If the user is already logged in and tries to access login/register page,
    // redirect them to dashboard
    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
};