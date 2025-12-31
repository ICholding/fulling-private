import { handlers } from '@/lib/auth'

/**
 * GET /api/auth/debug
 * Returns loaded providers (safe - no secrets)
 * Use to verify GitHub provider is registered
 */
export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const hasSecret = !!process.env.NEXTAUTH_SECRET
  const enableGithub = process.env.ENABLE_GITHUB_AUTH === 'true'
  const hasGithubId = !!process.env.GITHUB_CLIENT_ID
  const hasGithubSecret = !!process.env.GITHUB_CLIENT_SECRET

  return Response.json({
    status: 'ok',
    auth: {
      nextAuthUrl,
      hasSecret,
      enableGithub,
      github: {
        enabled: enableGithub,
        hasClientId: hasGithubId,
        hasClientSecret: hasGithubSecret,
      },
    },
    timestamp: new Date().toISOString(),
  })
}
