/**
 * Auth Helper Functions
 *
 * Provides helpers for getting current user in all auth modes:
 * - disabled: Returns default owner user
 * - single_user: Returns real authenticated user or null
 * - multi_user: Returns real authenticated user or null
 */

import { Session } from 'next-auth'

import { env } from '@/lib/env'
import { logger as baseLogger } from '@/lib/logger'

const logger = baseLogger.child({ module: 'auth-helpers' })

export interface User {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Get default user for disabled auth mode
 */
export function getDefaultUser(): User {
  const email = env.SINGLE_USER_EMAIL || 'owner@local.dev'
  const name = env.ADMIN_USERNAME || 'Owner'

  return {
    id: 'default-user',
    name,
    email,
    role: 'owner',
  }
}

/**
 * Get current user based on AUTH_MODE
 * - If AUTH_MODE=disabled: Always returns default user
 * - Otherwise: Returns session user or null
 */
export function getCurrentUser(session: Session | null): User | null {
  const authMode = env.AUTH_MODE || 'single_user'

  // If auth is disabled, always return default user
  if (authMode === 'disabled') {
    logger.debug('AUTH_MODE=disabled: returning default user')
    return getDefaultUser()
  }

  // Otherwise, return session user if exists
  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id || 'unknown',
    name: session.user.name || 'Unknown',
    email: session.user.email || 'unknown@example.com',
    role: (session.user as any).role || 'user',
  }
}

/**
 * Check if auth is currently disabled
 */
export function isAuthDisabled(): boolean {
  return env.AUTH_MODE === 'disabled'
}

/**
 * Check if user is authenticated (or auth is disabled)
 */
export function isAuthenticated(session: Session | null): boolean {
  if (isAuthDisabled()) {
    return true
  }
  return !!session?.user
}
