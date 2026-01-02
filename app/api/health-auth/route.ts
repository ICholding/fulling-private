/**
 * Health check endpoint for authentication configuration
 *
 * GET /api/health-auth
 *
 * Returns detailed auth configuration status without exposing secrets
 * Supports both single-user and multi-user mode detection
 */

import { NextRequest, NextResponse } from 'next/server'

import { getSingleUserHealthSummary } from '@/lib/auth-single-user'
import { getAuthHealthSummary, validateAuthEnv } from '@/lib/env-auth'

export async function GET(_request: NextRequest) {
  try {
    const validation = validateAuthEnv()
    const health = getAuthHealthSummary(validation)

    // In single-user mode, also include single-user specific health info
    const singleUserHealth = validation.mode === 'single_user' ? getSingleUserHealthSummary() : null

    if (validation.isValid) {
      return NextResponse.json({
        status: 'healthy',
        ...health,
        ...(singleUserHealth && { singleUser: singleUserHealth }),
      })
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          ...health,
          ...(singleUserHealth && { singleUser: singleUserHealth }),
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
