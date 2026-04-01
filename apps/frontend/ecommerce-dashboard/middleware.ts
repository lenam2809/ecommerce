import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const authPaths = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthPath = authPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    const token = request.cookies.get('access_token')?.value;

    // Every non-auth path in the dashboard requires a token
    if (!isAuthPath && !token) {
        const url = new URL('/login', request.url);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    // Already logged in — redirect away from login
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
