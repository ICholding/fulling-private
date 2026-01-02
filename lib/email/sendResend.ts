/**
 * Resend Email Helper with Structured Logging
 *
 * Provides a single interface for sending emails via Resend.
 * All sends are logged with structured JSON for easy tracking.
 *
 * Never logs full email addresses; masks user part.
 * Logs request ID for correlation with Resend dashboard.
 */

import { logger as baseLogger } from '@/lib/logger'

const logger = baseLogger.child({ module: 'lib/email' })

/**
 * Mask email address for safe logging
 * @param email - Full email address
 * @returns Masked email (user@[domain])
 */
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '[invalid]'
  }
  const [user, domain] = email.split('@')
  return `${user.substring(0, 1)}***@${domain}`
}

interface SendEmailOptions {
  to: string
  subject: string
  template?: string
  html?: string
  text?: string
  from?: string
  headers?: Record<string, string>
}

interface SendResult {
  ok: boolean
  resendId?: string
  error?: {
    status: number
    name: string
    message: string
  }
}

/**
 * Send email via Resend with structured logging
 *
 * @param options - Email options
 * @returns Promise<SendResult>
 */
export async function sendResendEmail(options: SendEmailOptions): Promise<SendResult> {
  const { to, subject, template, html, text, from } = options
  const requestId = `email-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const maskedTo = maskEmail(to)

  // Log attempt
  logger.info(
    {
      event: 'EMAIL_SEND_ATTEMPT',
      requestId,
      to: maskedTo,
      subject,
      template,
      from: from || process.env.RESEND_ADDRESS || 'noreply@resend.com',
    },
    'Email send attempt'
  )

  console.log(
    JSON.stringify({
      level: 'info',
      event: 'EMAIL_SEND_ATTEMPT',
      requestId,
      timestamp: new Date().toISOString(),
      to: maskedTo,
      subject,
      template,
    })
  )

  // Check if Resend is configured
  if (!process.env.RESEND_SYSTEM_EVENTS_KEY) {
    logger.warn(
      {
        event: 'EMAIL_SEND_SKIPPED',
        requestId,
        reason: 'RESEND_SYSTEM_EVENTS_KEY not set',
      },
      'Resend not configured'
    )

    console.log(
      JSON.stringify({
        level: 'warn',
        event: 'EMAIL_SEND_SKIPPED',
        requestId,
        timestamp: new Date().toISOString(),
        reason: 'RESEND_SYSTEM_EVENTS_KEY not configured',
      })
    )

    return {
      ok: false,
      error: { status: 501, name: 'NotConfigured', message: 'Resend is not configured' },
    }
  }

  try {
    // Dynamically import Resend (optional dependency)
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_SYSTEM_EVENTS_KEY)

    const response = await resend.emails.send({
      from: from || process.env.RESEND_ADDRESS || 'noreply@resend.com',
      to,
      subject,
      html: html || `<p>${text}</p>`,
    })

    if (response.error) {
      // Log failure
      logger.error(
        {
          event: 'EMAIL_SEND_FAIL',
          requestId,
          to: maskedTo,
          status: 400,
          name: response.error.name || 'UnknownError',
          message: response.error.message,
        },
        'Email send failed'
      )

      console.error(
        JSON.stringify({
          level: 'error',
          event: 'EMAIL_SEND_FAIL',
          requestId,
          timestamp: new Date().toISOString(),
          to: maskedTo,
          status: 400,
          name: response.error.name || 'UnknownError',
          message: response.error.message,
        })
      )

      return {
        ok: false,
        error: {
          status: 400,
          name: response.error.name || 'UnknownError',
          message: response.error.message,
        },
      }
    }

    // Log success
    const resendId = response.data?.id
    logger.info(
      {
        event: 'EMAIL_SEND_OK',
        requestId,
        resendId,
        to: maskedTo,
      },
      'Email sent successfully'
    )

    console.log(
      JSON.stringify({
        level: 'info',
        event: 'EMAIL_SEND_OK',
        requestId,
        resendId,
        timestamp: new Date().toISOString(),
        to: maskedTo,
      })
    )

    return { ok: true, resendId }
  } catch (error) {
    // Log unhandled error
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(
      {
        event: 'EMAIL_SEND_FAIL',
        requestId,
        to: maskedTo,
        status: 500,
        name: error instanceof Error ? error.constructor.name : 'UnhandledError',
        message: errorMessage,
      },
      'Email send exception'
    )

    console.error(
      JSON.stringify({
        level: 'error',
        event: 'EMAIL_SEND_FAIL',
        requestId,
        timestamp: new Date().toISOString(),
        to: maskedTo,
        status: 500,
        name: error instanceof Error ? error.constructor.name : 'UnhandledError',
        message: errorMessage,
      })
    )

    return {
      ok: false,
      error: {
        status: 500,
        name: error instanceof Error ? error.constructor.name : 'UnhandledError',
        message: errorMessage,
      },
    }
  }
}

/**
 * Test email configuration
 * Attempts to validate Resend setup without sending actual mail
 */
export async function testResendConfig(): Promise<{ ok: boolean; message: string }> {
  if (!process.env.RESEND_SYSTEM_EVENTS_KEY) {
    return {
      ok: false,
      message: 'RESEND_SYSTEM_EVENTS_KEY is not set',
    }
  }

  if (!process.env.RESEND_ADDRESS) {
    return {
      ok: false,
      message: 'RESEND_ADDRESS is not set',
    }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_SYSTEM_EVENTS_KEY)

    // Try to list domains (simple API test, doesn't send mail)
    await resend.domains.list()

    return {
      ok: true,
      message: 'Resend configuration is valid',
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unknown error testing Resend',
    }
  }
}
