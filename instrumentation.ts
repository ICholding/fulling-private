/**
 * Next.js Instrumentation Hook
 *
 * This file is called once when the Next.js server starts.
 * Perfect for initializing event listeners and background jobs.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

/**
 * Register function runs once when the Next.js server starts
 * This is the entry point for all application initialization
 */
export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import Node.js-specific dependencies conditionally
    // This prevents bundling issues in edge runtime environments
    const { logger: baseLogger } = await import('@/lib/logger')
    const logger = baseLogger.child({ module: 'instrumentation' })

    logger.info('🚀 Application initialization started')

    try {
      // Import and initialize events and jobs
      const { initializeApp } = await import('@/lib/startup')
      await initializeApp()

      logger.info('✅ Application initialization completed')
    } catch (error) {
      logger.error(`❌ Application initialization failed: ${error}`)
      // Don't throw error to prevent app from crashing
      // Jobs will retry on next reconcile cycle
    }
  }
}