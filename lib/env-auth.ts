/**
 * Strict NextAuth Environment Variable Validation
 *
 * This module validates that all required auth environment variables are set
 * and have valid values before NextAuth is initialized.
 *
 * Required Variables:
 * - NEXTAUTH_URL: The public URL of the application (e.g., https://fulling.vercel.app)
 * - NEXTAUTH_SECRET: A secret key for signing tokens (min 32 chars, generate with: openssl rand -base64 32)
 * - GITHUB_CLIENT_ID: GitHub OAuth app client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth app client secret
 * - DATABASE_URL: PostgreSQL connection string (required for Prisma adapter)
 */

interface AuthEnvValidationResult {
  isValid: boolean
  productionUrl: string
  runtimeUrl: string
  missing: {
    auth: string[]
    github: string[]
    database: string[]
  }
  issues: string[]
  warnings: string[]
}

/**
 * Validate all required auth environment variables
 * Throws an Error if critical variables are missing
 */
export function validateAuthEnv(): AuthEnvValidationResult {
  const result: AuthEnvValidationResult = {
    isValid: true,
    productionUrl: 'https://fulling.vercel.app',
    runtimeUrl: process.env.NEXTAUTH_URL || '[NOT SET]',
    missing: {
      auth: [],
      github: [],
      database: [],
    },
    issues: [],
    warnings: [],
  }

  // === CRITICAL: NextAuth Core ===
  if (!process.env.NEXTAUTH_SECRET) {
    result.missing.auth.push('NEXTAUTH_SECRET')
    result.issues.push('NEXTAUTH_SECRET is not set. Generate with: openssl rand -base64 32')
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    result.issues.push(
      `NEXTAUTH_SECRET is too short (${process.env.NEXTAUTH_SECRET.length} chars). Minimum 32 chars required.`
    )
  }

  if (!process.env.NEXTAUTH_URL) {
    result.missing.auth.push('NEXTAUTH_URL')
    result.issues.push('NEXTAUTH_URL is not set. Set to: https://fulling.vercel.app')
  } else {
    // Validate NEXTAUTH_URL format
    try {
      const url = new URL(process.env.NEXTAUTH_URL)
      // Check if it's the production domain in production
      if (process.env.NODE_ENV === 'production') {
        if (!process.env.NEXTAUTH_URL.includes('fulling.vercel.app')) {
          result.issues.push(
            `NEXTAUTH_URL is "${process.env.NEXTAUTH_URL}" but should be "https://fulling.vercel.app" in production. ` +
              `This will cause GitHub OAuth callbacks to fail.`
          )
        }
      }
    } catch (e) {
      result.issues.push(`NEXTAUTH_URL is not a valid URL: ${process.env.NEXTAUTH_URL}`)
    }
  }

  // === GitHub OAuth ===
  if (!process.env.GITHUB_CLIENT_ID) {
    result.missing.github.push('GITHUB_CLIENT_ID')
  }
  if (!process.env.GITHUB_CLIENT_SECRET) {
    result.missing.github.push('GITHUB_CLIENT_SECRET')
  }

  if (result.missing.github.length > 0) {
    result.issues.push(
      `GitHub OAuth is not configured. Missing: ${result.missing.github.join(', ')}. ` +
        `Set these in Vercel: Settings → Environment Variables. ` +
        `Get values from: https://github.com/settings/developers → OAuth Apps`
    )
  }

  // === Database (Required for Prisma adapter) ===
  if (!process.env.DATABASE_URL) {
    result.missing.database.push('DATABASE_URL')
    result.issues.push(
      'DATABASE_URL is not set. Prisma adapter requires a PostgreSQL database. ' +
        'Use Neon (https://neon.tech), Railway, or Supabase. ' +
        'Format: postgresql://user:password@host:port/database'
    )
  } else {
    // Validate DATABASE_URL is PostgreSQL
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      result.issues.push(
        `DATABASE_URL is not PostgreSQL: ${process.env.DATABASE_URL.substring(0, 30)}... ` +
          `Only PostgreSQL is supported. SQLite cannot persist on Vercel.`
      )
    }
  }

  // === Determine overall validity ===
  result.isValid = result.issues.length === 0

  // === Warnings (non-blocking but important) ===
  if (process.env.NODE_ENV !== 'production' && process.env.NEXTAUTH_URL?.includes('localhost')) {
    result.warnings.push(
      'Running in development mode with localhost URL. GitHub OAuth will only work locally if GitHub app callback is set to localhost.'
    )
  }

  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_AUTH === 'true') {
    result.warnings.push('DEBUG_AUTH is enabled in production. Consider disabling for performance.')
  }

  return result
}

/**
 * Format validation results for error logging and health checks
 */
export function formatAuthValidationError(validation: AuthEnvValidationResult): string {
  const lines = [
    '',
    '❌ AUTH CONFIGURATION ERROR',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ]

  if (validation.missing.auth.length > 0) {
    lines.push(`Missing NextAuth Variables: ${validation.missing.auth.join(', ')}`)
  }
  if (validation.missing.github.length > 0) {
    lines.push(`Missing GitHub Variables: ${validation.missing.github.join(', ')}`)
  }
  if (validation.missing.database.length > 0) {
    lines.push(`Missing Database Variables: ${validation.missing.database.join(', ')}`)
  }

  lines.push('')
  lines.push('ISSUES:')
  validation.issues.forEach((issue) => {
    lines.push(`  • ${issue}`)
  })

  lines.push('')
  lines.push('REQUIRED ENV VARS FOR PRODUCTION:')
  lines.push('  • NEXTAUTH_URL=https://fulling.vercel.app')
  lines.push('  • NEXTAUTH_SECRET=<32+ char secret>')
  lines.push('  • GITHUB_CLIENT_ID=<from GitHub OAuth app>')
  lines.push('  • GITHUB_CLIENT_SECRET=<from GitHub OAuth app>')
  lines.push('  • DATABASE_URL=postgresql://<user:password@host/db>')
  lines.push('')
  lines.push('TO FIX:')
  lines.push('  1. Go to Vercel Dashboard → Project Settings → Environment Variables')
  lines.push('  2. Add all missing variables for Production')
  lines.push('  3. Redeploy with: git push or click Redeploy in Vercel')
  lines.push('  4. Check /api/health-auth endpoint to verify')
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')

  return lines.join('\n')
}

/**
 * Get a summary object safe for API responses (no secrets)
 */
export function getAuthHealthSummary(validation: AuthEnvValidationResult) {
  return {
    ok: validation.isValid,
    productionUrl: validation.productionUrl,
    runtimeUrl: validation.runtimeUrl,
    environment: process.env.NODE_ENV || 'unknown',
    missing: validation.missing,
    issues: validation.issues,
    warnings: validation.warnings,
    hasDatabase: !!process.env.DATABASE_URL,
    hasGitHub: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    timestamp: new Date().toISOString(),
  }
}
