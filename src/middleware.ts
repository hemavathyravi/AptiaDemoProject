// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Log incoming requests
    console.log('Request path:', request.nextUrl.pathname);

    // Continue with the request
    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}