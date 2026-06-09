import { NextResponse, NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("dmg_access_token")?.value;

    const path = request.nextUrl.pathname
    const isPublicPath = path === '/' || path === '/auth/sign-in' || path === '/auth/sign-up'

    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/home', request.nextUrl))
    }

    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.nextUrl))
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/home',
        '/update-avatar',
        '/auth/:path*',
    ],
}