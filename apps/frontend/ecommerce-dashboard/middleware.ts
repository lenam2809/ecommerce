import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface AuthProfile {
    userId: string;
    email: string;
}

const LOGIN_PATH = '/login';
const DEFAULT_AUTHENTICATED_PATH = '/dashboard';
const PROTECTED_PATH_PREFIXES = [
    '/about',
    '/account',
    '/account-locks',
    '/admin',
    '/brands',
    '/bulk-management',
    '/categories',
    '/configs',
    '/contact',
    '/dashboard',
    '/help',
    '/inventory',
    '/logs',
    '/notifications',
    '/orders',
    '/permissions',
    '/products',
    '/reports',
    '/returns',
    '/roles',
    '/settings',
    '/user-activities',
    '/users',
];

function matchesPath(pathname: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function buildUnauthorizedRedirect(request: NextRequest, pathname: string): NextResponse {
    const url = new URL(LOGIN_PATH, request.url);
    const returnUrl = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set('reason', 'unauthorized');
    url.searchParams.set('returnUrl', returnUrl);
    return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLoginPath = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
    const isProtectedPath = matchesPath(pathname, PROTECTED_PATH_PREFIXES);

    if (!isProtectedPath && !isLoginPath) {
        return NextResponse.next();
    }

    let profilePromise: Promise<Response> | null = null;
    const fetchProfile = () => {
        if (!profilePromise) {
            const profileUrl = new URL('/api/auth/me/profile', request.url);
            const headers = new Headers();

            const cookieHeader = request.headers.get('cookie');
            if (cookieHeader) {
                headers.set('cookie', cookieHeader);
            }

            const authorization = request.headers.get('authorization');
            if (authorization) {
                headers.set('authorization', authorization);
            }

            const userAgent = request.headers.get('user-agent');
            if (userAgent) {
                headers.set('user-agent', userAgent);
            }

            profilePromise = fetch(profileUrl, {
                method: 'GET',
                headers,
                cache: 'no-store',
                redirect: 'manual',
            });
        }

        return profilePromise;
    };

    const profileResponse = await fetchProfile().catch(() => null);

    if (!profileResponse || profileResponse.status === 401 || profileResponse.status === 403) {
        return isProtectedPath ? buildUnauthorizedRedirect(request, pathname) : NextResponse.next();
    }

    if (!profileResponse.ok) {
        return isProtectedPath ? buildUnauthorizedRedirect(request, pathname) : NextResponse.next();
    }

    let profile: AuthProfile | null = null;
    try {
        profile = (await profileResponse.json()) as AuthProfile;
    } catch {
        profile = null;
    }

    const isAuthenticated = Boolean(profile?.userId);

    if (isProtectedPath && !isAuthenticated) {
        return buildUnauthorizedRedirect(request, pathname);
    }

    if (isLoginPath && isAuthenticated) {
        return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_PATH, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/about/:path*',
        '/account/:path*',
        '/account-locks/:path*',
        '/admin/:path*',
        '/brands/:path*',
        '/bulk-management/:path*',
        '/categories/:path*',
        '/configs/:path*',
        '/contact/:path*',
        '/dashboard/:path*',
        '/help/:path*',
        '/inventory/:path*',
        '/logs/:path*',
        '/notifications/:path*',
        '/orders/:path*',
        '/permissions/:path*',
        '/products/:path*',
        '/reports/:path*',
        '/returns/:path*',
        '/roles/:path*',
        '/settings/:path*',
        '/user-activities/:path*',
        '/users/:path*',
        '/login',
    ],
};
