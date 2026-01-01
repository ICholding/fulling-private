/**
 * Health check endpoint for authentication configuration
 *
 * GET /api/health-auth
 *
 * Returns detailed auth configuration status without exposing secrets
 */

import { NextRequest, NextResponse } from 'next/server'

import { getAuthHealthSummary, validateAuthEnv } from '@/lib/env-auth'

export async function GET(request: NextRequest) {
  try {
    const validation = validateAuthEnv()
    const health = getAuthHealthSummary(validation)

    if (validation.isValid) {
      return NextResponse.json({
        status: 'healthy',
        ...health,
      })
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          ...health,
          error: 'Auth configuration is incomplete or invalid',
        },
        { status: 503 } // Service Unavailable
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
