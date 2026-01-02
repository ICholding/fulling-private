/**
 * Auth Route Guard - Prevents auth routes from running if config is invalid
 *
 * Used in middleware to check /api/auth/* routes.
 * If config is invalid, returns 500 with clear error message.
 */

import { NextRequest, NextResponse } from 'next/server'

import { isConfigValid } from '@/lib/config'

export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/auth/debug')
}

export function authRouteGuard(request: NextRequest): NextResponse | null {
  // Only guard auth routes (not debug routes)
  if (!isAuthRoute(request.nextUrl.pathname)) {
    return null
  }

  // Check if config is valid
  if (!isConfigValid()) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'AUTH_ROUTE_BLOCKED',
        path: request.nextUrl.pathname,
        reason: 'Configuration invalid',
        timestamp: new Date().toISOString(),
      })
    )

    return NextResponse.json(
      {
        error: 'Server misconfigured',
        message:
          'This server is not properly configured for authentication. Check configuration and redeploy.',
        details: 'See /api/health/config for more information',
      },
      { status: 500 }
    )
  }

  return null
}
