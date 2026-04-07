import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN_PATH = '/login';
const PROTECTED_PATH_PREFIXES = ['/account', '/orders', '/checkout'];

function matchesPath(pathname: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function buildLoginRedirect(request: NextRequest, pathname: string): NextResponse {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set('from', pathname);
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
    const isAuthenticated = !!profileResponse && profileResponse.ok;

    if (isProtectedPath && !isAuthenticated) {
        return buildLoginRedirect(request, pathname);
    }

    if (isLoginPath && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*', '/orders/:path*', '/checkout', '/login'],
};
