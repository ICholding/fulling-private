/**
 * Next.js Middleware
 *
 * Runs on every request to check auth route configuration.
 * Blocks auth routes if server is misconfigured.
 * Redirects auth pages when AUTH_MODE=disabled.
 */

import { NextRequest, NextResponse } from 'next/server'

import { authRouteGuard } from '@/lib/auth-route-guard'

export function middleware(request: NextRequest) {
  const authMode = process.env.AUTH_MODE || 'single_user'
  const pathname = request.nextUrl.pathname

  // If auth is disabled, redirect login/auth pages to home
  if (authMode === 'disabled') {
    // Redirect /login to /
    if (pathname === '/login' || pathname.startsWith('/login/')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Block /api/auth routes (except callback)
    if (pathname.startsWith('/api/auth/') && !pathname.includes('/callback')) {
      return NextResponse.json(
        { error: 'Authentication disabled', message: 'AUTH_MODE=disabled' },
        { status: 503 }
      )
    }
    
    // Allow all other routes
    return NextResponse.next()
  }

  // Guard auth routes (only when auth is enabled)
  const authGuardResponse = authRouteGuard(request)
  if (authGuardResponse) {
    return authGuardResponse
  }

  // Allow request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply middleware to auth routes
    '/api/auth/:path*',
    // Apply to login page
    '/login',
    // Skip static files, etc.
  ],
}
