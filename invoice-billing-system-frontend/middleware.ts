import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value
    const { pathname } = request.nextUrl

    // 1. Allow public assets and API routes (optional, adjust based on needs)
    // We match everything EXCEPT these in the config, but double check here if needed
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') || // If you have Next.js API routes you might want to protect them differently or here
        pathname === '/favicon.ico' ||
        pathname === '/login' ||
        pathname === '/register'
    ) {
        // If user is already logged in and tries to visit login/register, redirect to dashboard
        if ((pathname === '/login' || pathname === '/register') && token && isTokenValid(token)) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // 2. Protected Routes (Everything else)
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Simple Expiration Check (Decode JWT)
    if (!isTokenValid(token)) {
        // Token is expired or invalid format
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('accessToken') // Clean up
        return response
    }

    // 4. Root URL Redirection (Authenticated)
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

// Helper to check expiration without verifying signature (backend does that)
function isTokenValid(token: string): boolean {
    try {
        const [, payloadBase64] = token.split('.');
        if (!payloadBase64) return false;

        const decodedPayload = JSON.parse(atob(payloadBase64));
        const exp = decodedPayload.exp;

        if (!exp) return true; // No expiration claim? Assume valid or let backend handle it.

        // exp is in seconds, Date.now() is in ms
        if (Date.now() >= exp * 1000) {
            return false;
        }
        return true;
    } catch (e) {
        return false; // Invalid format
    }
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
