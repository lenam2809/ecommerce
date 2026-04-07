import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface AuthProfile {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
}

const LOGIN_PATH = '/login';
const ADMIN_PATH_PREFIXES = ['/admin', '/dashboard'];

function matchesPath(pathname: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function buildUnauthorizedRedirect(request: NextRequest, pathname: string): NextResponse {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set('reason', 'unauthorized');
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isLoginPath = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);
    const isAdminPath = matchesPath(pathname, ADMIN_PATH_PREFIXES);

    if (!isAdminPath && !isLoginPath) {
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
        return isAdminPath ? buildUnauthorizedRedirect(request, pathname) : NextResponse.next();
    }

    if (!profileResponse.ok) {
        return isAdminPath ? buildUnauthorizedRedirect(request, pathname) : NextResponse.next();
    }

    let profile: AuthProfile | null = null;
    try {
        profile = (await profileResponse.json()) as AuthProfile;
    } catch {
        profile = null;
    }

    const roles = profile?.roles ?? [];
    const hasAdminAccess = roles.includes('Admin') || roles.includes('Manager');

    if (isAdminPath && !hasAdminAccess) {
        return buildUnauthorizedRedirect(request, pathname);
    }

    if (isLoginPath && hasAdminAccess) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
};
