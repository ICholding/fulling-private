/**
 * GET /api/health/config
 * Safe configuration diagnostics endpoint
 *
 * Returns masked information about environment configuration.
 * No secret values are exposed.
 *
 * Used by UI to show configuration status and guide user.
 * Used by monitoring to detect misconfiguration early.
 */

import { getConfigValidation } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const validation = getConfigValidation()

  return Response.json(
    {
      ok: validation.ok,
      message: validation.ok
        ? 'Configuration is valid'
        : `Configuration invalid: ${validation.missing.join(', ')} missing`,
      missing: validation.missing,
      warnings: validation.warnings,
      featureFlags: validation.featureFlags,
      masked: validation.masked,
      runtime: validation.runtime,
      timestamp: new Date().toISOString(),
    },
    {
      status: validation.ok ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  )
}
