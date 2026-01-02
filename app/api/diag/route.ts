/**
 * GET /api/diag
 * Diagnostics endpoint - exposes ONLY boolean flags, NEVER secrets
 * Safe to use in browser console to debug config issues
 */
export async function GET() {
  return Response.json({
    app: {
      name: 'Fulling',
      version: '0.4.1',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    auth: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    },
    providers: {
      password: {
        enabled: process.env.ENABLE_PASSWORD_AUTH !== 'false',
      },
      github: {
        enabled: process.env.ENABLE_GITHUB_AUTH === 'true',
        hasClientId: !!process.env.GITHUB_CLIENT_ID,
        hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      },
      sealos: {
        enabled: process.env.ENABLE_SEALOS_AUTH === 'true',
        hasSecret: !!process.env.SEALOS_JWT_SECRET,
      },
    },
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      type: 'PostgreSQL (Prisma)',
    },
    timestamp: new Date().toISOString(),
  })
}
