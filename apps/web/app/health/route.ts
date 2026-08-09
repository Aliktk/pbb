// Web liveness probe (Vercel / uptime). Separate from the API's DB health check.
export function GET() {
  return Response.json({ ok: true, data: { status: 'ok', app: 'web' } });
}
