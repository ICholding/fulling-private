/**
 * GET /api/health
 * Simple health check endpoint
 * Returns 200 OK if app is running
 */
export async function GET() {
  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
