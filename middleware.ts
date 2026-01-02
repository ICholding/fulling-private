/**
 * Next.js Middleware
 *
 * Runs on every request to check auth route configuration.
 * Blocks auth routes if server is misconfigured.
 */

import { NextRequest, NextResponse } from 'next/server'

import { authRouteGuard } from '@/lib/auth-route-guard'

export function middleware(request: NextRequest) {
  // Guard auth routes
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
    // Skip static files, etc.
  ],
}
