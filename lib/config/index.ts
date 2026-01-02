/**
 * Runtime Environment Validation
 *
 * Validates all required environment variables at runtime.
 * Returns structured result with missing vars + feature flags.
 * Safe for logging - never includes secret values.
 */

export interface ValidationResult {
  ok: boolean
  missing: string[]
  warnings: string[]
  featureFlags: {
    passwordAuthEnabled: boolean
    githubAuthEnabled: boolean
    singleUserMode: boolean
    resendEnabled: boolean
  }
  masked: {
    nextauthUrlHost?: string
    hasNextauthSecret: boolean
    hasGithubClientId: boolean
    hasGithubClientSecret: boolean
  }
  runtime: string
  commit: string
}

/**
 * Validate environment variables
 */
function validateEnv(): ValidationResult {
  const missing: string[] = []
  const warnings: string[] = []
  const featureFlags: any = {}
  const masked: any = {}

  // === NEXTAUTH CORE (required for all modes) ===
  if (!process.env.NEXTAUTH_URL) {
    missing.push('NEXTAUTH_URL')
  } else {
    try {
      const url = new URL(process.env.NEXTAUTH_URL)
      masked.nextauthUrlHost = url.host
      if (
        process.env.NODE_ENV === 'production' &&
        !process.env.NEXTAUTH_URL.includes('vercel.app')
      ) {
        warnings.push('NEXTAUTH_URL does not match expected production domain')
      }
    } catch {
      missing.push('NEXTAUTH_URL (invalid URL format)')
    }
  }

  if (!process.env.NEXTAUTH_SECRET) {
    missing.push('NEXTAUTH_SECRET')
    masked.hasNextauthSecret = false
  } else {
    masked.hasNextauthSecret = true
    if (process.env.NEXTAUTH_SECRET.length < 32) {
      warnings.push(
        `NEXTAUTH_SECRET too short (${process.env.NEXTAUTH_SECRET.length} chars, min 32 required)`
      )
    }
  }

  // === DATABASE (required for any mode except single-user with hardcoded creds) ===
  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL not set (may work in single-user mode only)')
  } else {
    if (
      !process.env.DATABASE_URL.startsWith('postgres://') &&
      !process.env.DATABASE_URL.startsWith('postgresql://')
    ) {
      missing.push('DATABASE_URL (must be PostgreSQL)')
    }
  }

  // === FEATURE FLAGS ===
  featureFlags.passwordAuthEnabled = process.env.ENABLE_PASSWORD_AUTH === 'true'
  featureFlags.githubAuthEnabled = process.env.ENABLE_GITHUB_AUTH === 'true'
  featureFlags.singleUserMode = !!process.env.ADMIN_USERNAME

  // === SINGLE-USER MODE VALIDATION ===
  if (featureFlags.singleUserMode) {
    if (!process.env.ADMIN_USERNAME) {
      missing.push('ADMIN_USERNAME (single-user mode)')
    }
    if (!process.env.ADMIN_PASSWORD_HASH) {
      missing.push('ADMIN_PASSWORD_HASH (single-user mode)')
    }
  }

  // === GITHUB OAUTH (only required if enabled) ===
  if (featureFlags.githubAuthEnabled) {
    if (!process.env.GITHUB_CLIENT_ID) {
      missing.push('GITHUB_CLIENT_ID')
    } else {
      masked.hasGithubClientId = true
    }
    if (!process.env.GITHUB_CLIENT_SECRET) {
      missing.push('GITHUB_CLIENT_SECRET')
      masked.hasGithubClientSecret = false
    } else {
      masked.hasGithubClientSecret = true
    }
  } else {
    masked.hasGithubClientId = false
    masked.hasGithubClientSecret = false
  }

  // === RESEND EMAIL (only required if feature is enabled) ===
  featureFlags.resendEnabled = !!process.env.RESEND_SYSTEM_EVENTS_KEY
  if (featureFlags.resendEnabled) {
    if (!process.env.RESEND_ADDRESS) {
      warnings.push('RESEND_ADDRESS not set (email sending may fail)')
    }
    if (!process.env.APP_INGEST_EMAIL) {
      warnings.push('APP_INGEST_EMAIL not set (ingest logs may not work)')
    }
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
    featureFlags,
    masked,
    runtime: process.env.VERCEL
      ? 'vercel'
      : process.env.NODE_ENV === 'production'
        ? 'production'
        : 'development',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown',
  }
}

/**
 * Format validation result as JSON for structured logging
 */
function formatValidationLog(result: ValidationResult): string {
  return JSON.stringify({
    level: result.ok ? 'info' : 'error',
    event: result.ok ? 'CONFIG_VALID' : 'CONFIG_INVALID',
    timestamp: new Date().toISOString(),
    missing: result.missing,
    warnings: result.warnings,
    featureFlags: result.featureFlags,
    masked: result.masked,
    runtime: result.runtime,
    commit: result.commit,
  })
}

export function getConfigValidation(): ValidationResult {
  return validateEnv()
}

export function getConfigLog(): string {
  return formatValidationLog(validateEnv())
}

export function isConfigValid(): boolean {
  return validateEnv().ok
}
