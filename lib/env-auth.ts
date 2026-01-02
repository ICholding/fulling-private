/**
 * Strict NextAuth Environment Variable Validation
 *
 * This module validates that all required auth environment variables are set
 * and have valid values before NextAuth is initialized.
 *
 * Supports two modes:
 * 1. SINGLE-USER MODE: Only ADMIN_USERNAME and ADMIN_PASSWORD_HASH required
 * 2. MULTI-USER MODE: Requires GitHub OAuth and database
 *
 * Required Variables (Single-User):
 * - NEXTAUTH_URL: The public URL of the application (e.g., https://fulling.vercel.app)
 * - NEXTAUTH_SECRET: A secret key for signing tokens (min 32 chars, generate with: openssl rand -base64 32)
 * - ENABLE_PASSWORD_AUTH: Set to "true"
 * - ENABLE_GITHUB_AUTH: Set to "false"
 * - ADMIN_USERNAME: Username for the single admin user
 * - ADMIN_PASSWORD_HASH: Bcrypt hash of admin password (generate with: node scripts/hash-password.cjs)
 *
 * Required Variables (Multi-User):
 * - NEXTAUTH_URL: The public URL of the application (e.g., https://fulling.vercel.app)
 * - NEXTAUTH_SECRET: A secret key for signing tokens (min 32 chars, generate with: openssl rand -base64 32)
 * - GITHUB_CLIENT_ID: GitHub OAuth app client ID
 * - GITHUB_CLIENT_SECRET: GitHub OAuth app client secret
 * - DATABASE_URL: PostgreSQL connection string (required for Prisma adapter)
 */

interface AuthEnvValidationResult {
  isValid: boolean
  mode: 'single_user' | 'multi_user'
  productionUrl: string
  runtimeUrl: string
  missing: {
    auth: string[]
    github: string[]
    database: string[]
    singleUser: string[]
  }
  issues: string[]
  warnings: string[]
}

/**
 * Validate all required auth environment variables
 * Throws an Error if critical variables are missing
 */
export function validateAuthEnv(): AuthEnvValidationResult {
  // Determine auth mode
  const authMode = process.env.AUTH_MODE || 'single_user'
  const isSingleUserMode = authMode === 'single_user' || !!process.env.ADMIN_USERNAME

  const result: AuthEnvValidationResult = {
    isValid: true,
    mode: isSingleUserMode ? 'single_user' : 'multi_user',
    productionUrl: 'https://fulling.vercel.app',
    runtimeUrl: process.env.NEXTAUTH_URL || '[NOT SET]',
    missing: {
      auth: [],
      github: [],
      database: [],
      singleUser: [],
    },
    issues: [],
    warnings: [],
  }

  // === CRITICAL: NextAuth Core (Required for all modes) ===
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
      // Check if it's the production domain in production (skip if localhost)
      const isLocalhost =
        process.env.NEXTAUTH_URL.includes('localhost') ||
        process.env.NEXTAUTH_URL.includes('127.0.0.1')
      if (process.env.NODE_ENV === 'production' && !isLocalhost) {
        if (!process.env.NEXTAUTH_URL.includes('fulling.vercel.app')) {
          result.issues.push(
            `NEXTAUTH_URL is "${process.env.NEXTAUTH_URL}" but should be "https://fulling.vercel.app" in production. ` +
              `This will cause authentication callbacks to fail.`
          )
        }
      }
    } catch (_error) {
      result.issues.push(`NEXTAUTH_URL is not a valid URL: ${process.env.NEXTAUTH_URL}`)
    }
  }

  // === MODE-SPECIFIC VALIDATION ===
  if (isSingleUserMode) {
    // SINGLE-USER MODE: Validate admin credentials
    if (!process.env.ADMIN_USERNAME) {
      result.missing.singleUser.push('ADMIN_USERNAME')
      result.issues.push(
        'ADMIN_USERNAME is not set. Required for single-user mode. Set this to your admin username.'
      )
    }

    if (!process.env.ADMIN_PASSWORD_HASH) {
      result.missing.singleUser.push('ADMIN_PASSWORD_HASH')
      result.issues.push(
        'ADMIN_PASSWORD_HASH is not set. Required for single-user mode. ' +
          'Generate with: node scripts/hash-password.cjs "YourPassword"'
      )
    }

    // Ensure password auth is enabled
    if (process.env.ENABLE_PASSWORD_AUTH !== 'true') {
      result.issues.push('ENABLE_PASSWORD_AUTH must be set to "true" for single-user mode.')
    }

    // GitHub auth should be disabled in single-user mode
    if (process.env.ENABLE_GITHUB_AUTH === 'true') {
      result.warnings.push(
        'ENABLE_GITHUB_AUTH is "true" but will be disabled in single-user mode. Set to "false" to remove this warning.'
      )
    }

    // Database is optional in single-user mode (for project management only)
    if (!process.env.DATABASE_URL) {
      result.warnings.push(
        'DATABASE_URL is not set. While optional for authentication in single-user mode, ' +
          'it is required for project management features.'
      )
    }
  } else {
    // MULTI-USER MODE: Validate GitHub OAuth and database
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

    // Database is required in multi-user mode
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
  }

  // === Determine overall validity ===
  result.isValid = result.issues.length === 0

  // === Warnings (non-blocking but important) ===
  if (process.env.NODE_ENV !== 'production' && process.env.NEXTAUTH_URL?.includes('localhost')) {
    result.warnings.push(
      'Running in development mode with localhost URL. Authentication will only work locally.'
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
    `❌ AUTH CONFIGURATION ERROR (${validation.mode.toUpperCase()} MODE)`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ]

  if (validation.missing.auth.length > 0) {
    lines.push(`Missing NextAuth Variables: ${validation.missing.auth.join(', ')}`)
  }
  if (validation.missing.singleUser.length > 0) {
    lines.push(`Missing Single-User Variables: ${validation.missing.singleUser.join(', ')}`)
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
  if (validation.mode === 'single_user') {
    lines.push('REQUIRED ENV VARS FOR SINGLE-USER MODE:')
    lines.push('  • NEXTAUTH_URL=https://fulling.vercel.app')
    lines.push('  • NEXTAUTH_SECRET=<32+ char secret>')
    lines.push('  • ENABLE_PASSWORD_AUTH=true')
    lines.push('  • ENABLE_GITHUB_AUTH=false')
    lines.push('  • ADMIN_USERNAME=<username>')
    lines.push('  • ADMIN_PASSWORD_HASH=<bcrypt hash>')
    lines.push('')
    lines.push('OPTIONAL:')
    lines.push('  • AUTH_MODE=single_user (default)')
    lines.push('  • DATABASE_URL=postgresql://<user:password@host/db> (for project management)')
  } else {
    lines.push('REQUIRED ENV VARS FOR MULTI-USER MODE:')
    lines.push('  • NEXTAUTH_URL=https://fulling.vercel.app')
    lines.push('  • NEXTAUTH_SECRET=<32+ char secret>')
    lines.push('  • GITHUB_CLIENT_ID=<from GitHub OAuth app>')
    lines.push('  • GITHUB_CLIENT_SECRET=<from GitHub OAuth app>')
    lines.push('  • DATABASE_URL=postgresql://<user:password@host/db>')
  }

  lines.push('')
  lines.push('TO FIX:')
  lines.push('  1. Go to Vercel Dashboard → Project Settings → Environment Variables')
  lines.push('  2. Add all missing variables for Production')
  if (validation.mode === 'single_user') {
    lines.push('  3. Generate password hash: node scripts/hash-password.cjs "YourPassword"')
    lines.push('  4. Set ADMIN_PASSWORD_HASH to the generated hash')
    lines.push('  5. Redeploy with: git push or click Redeploy in Vercel')
  } else {
    lines.push('  3. Redeploy with: git push or click Redeploy in Vercel')
  }
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
    mode: validation.mode,
    productionUrl: validation.productionUrl,
    runtimeUrl: validation.runtimeUrl,
    environment: process.env.NODE_ENV || 'unknown',
    missing: validation.missing,
    issues: validation.issues,
    warnings: validation.warnings,
    hasDatabase: !!process.env.DATABASE_URL,
    hasGitHub: !!process.env.GITHUB_CLIENT_ID && !!process.env.GITHUB_CLIENT_SECRET,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasAdminUsername: !!process.env.ADMIN_USERNAME,
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    passwordAuthEnabled: process.env.ENABLE_PASSWORD_AUTH === 'true',
    githubAuthEnabled: process.env.ENABLE_GITHUB_AUTH === 'true',
    timestamp: new Date().toISOString(),
  }
}
