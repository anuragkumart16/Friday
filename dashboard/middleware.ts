import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for the presence of the access token or refresh token
    const hasToken = request.cookies.has('accessToken') || request.cookies.has('refreshToken');

    // If the user goes to the login page but already has a token, redirect to the dashboard
    if (request.nextUrl.pathname === '/login') {
        if (hasToken) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Only run middleware on the login route for now
    matcher: ['/login'],
};
