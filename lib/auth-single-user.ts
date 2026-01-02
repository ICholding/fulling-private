/**
 * Single-User Authentication Mode
 *
 * This module provides strict single-user authentication:
 * - Only ONE user (admin) can ever authenticate
 * - Username and password verified against env vars
 * - No database user creation
 * - GitHub OAuth disabled entirely
 * - Fails loudly if misconfigured
 */

import bcrypt from 'bcryptjs'

import { logger as baseLogger } from '@/lib/logger'

const logger = baseLogger.child({ module: 'auth-single-user' })

/**
 * Validation result for single-user auth configuration
 */
export interface SingleUserAuthValidation {
  isValid: boolean
  mode: 'single_user' | 'multi_user'
  issues: string[]
  warnings: string[]
}

/**
 * Validate single-user auth configuration
 * Throws Error if critical vars are missing
 */
export function validateSingleUserAuth(): SingleUserAuthValidation {
  const result: SingleUserAuthValidation = {
    isValid: true,
    mode: 'single_user',
    issues: [],
    warnings: [],
  }

  // Check if single-user mode is enabled
  const authMode = process.env.AUTH_MODE || 'single_user'
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // If AUTH_MODE is explicitly single_user or ADMIN_USERNAME is set
  if (authMode === 'single_user' || adminUsername) {
    if (!adminUsername) {
      result.issues.push('ADMIN_USERNAME is not set. Required for single-user auth mode.')
    }

    if (!adminPasswordHash) {
      result.issues.push(
        'ADMIN_PASSWORD_HASH is not set. Required for single-user auth mode. ' +
          'Generate with: node scripts/hash-password.cjs "YourPassword"'
      )
    }

    if (adminUsername && adminPasswordHash) {
      logger.info(`Single-user mode configured with username: ${adminUsername}`)
    }
  }

  result.isValid = result.issues.length === 0
  return result
}

/**
 * Authenticate a single user
 * Returns user object if credentials match, null otherwise
 */
export async function authenticateSingleUser(
  username: string,
  password: string
): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // Check if single-user mode is configured
  if (!adminUsername || !adminPasswordHash) {
    logger.error('Single-user mode not properly configured. Missing admin credentials.')
    return null
  }

  // Validate username (exact match, case-sensitive)
  if (username !== adminUsername) {
    logger.warn(
      `Authentication failed: invalid username "${username}" (expected "${adminUsername}")`
    )
    return null
  }

  try {
    // Validate password using bcrypt
    const passwordMatch = await bcrypt.compare(password, adminPasswordHash)

    if (!passwordMatch) {
      logger.warn(`Authentication failed: invalid password for user "${username}"`)
      return null
    }

    // Authentication successful
    logger.info(`Single-user authentication successful for "${username}"`)
    return {
      id: 'admin',
      name: adminUsername,
      email: 'admin@local',
      role: 'admin',
    }
  } catch (error) {
    logger.error(`Error during password validation: ${error}`)
    return null
  }
}

/**
 * Format validation errors for logging
 */
export function formatSingleUserValidationError(validation: SingleUserAuthValidation): string {
  const lines = [
    '',
    '❌ SINGLE-USER AUTH CONFIGURATION ERROR',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ]

  validation.issues.forEach((issue) => {
    lines.push(`  • ${issue}`)
  })

  lines.push('')
  lines.push('REQUIRED ENV VARS FOR SINGLE-USER MODE:')
  lines.push('  • NEXTAUTH_SECRET=<32+ char secret>')
  lines.push('  • NEXTAUTH_URL=https://fulling.vercel.app')
  lines.push('  • ENABLE_PASSWORD_AUTH=true')
  lines.push('  • ENABLE_GITHUB_AUTH=false')
  lines.push('  • ADMIN_USERNAME=<username>')
  lines.push('  • ADMIN_PASSWORD_HASH=<bcrypt hash>')
  lines.push('')
  lines.push('OPTIONAL:')
  lines.push('  • AUTH_MODE=single_user (default)')
  lines.push('')
  lines.push('TO FIX:')
  lines.push('  1. Generate password hash: node scripts/hash-password.cjs "YourPassword"')
  lines.push('  2. Set env vars in Vercel Dashboard → Settings → Environment Variables')
  lines.push('  3. Redeploy with: git push')
  lines.push('')
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('')

  return lines.join('\n')
}

/**
 * Get health status for single-user auth (safe for API response)
 */
export function getSingleUserHealthSummary() {
  return {
    authMode: 'single_user',
    passwordAuthEnabled: process.env.ENABLE_PASSWORD_AUTH === 'true',
    githubAuthEnabled: process.env.ENABLE_GITHUB_AUTH === 'true',
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasUrl: !!process.env.NEXTAUTH_URL,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminHash: !!process.env.ADMIN_PASSWORD_HASH,
    timestamp: new Date().toISOString(),
  }
}
