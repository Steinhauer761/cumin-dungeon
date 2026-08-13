export const config = { runtime: 'edge' };

/**
 * POST /api/rooms/:roomId/sessions/:sessionId/join
 * Creates a short-lived room-session authorization.
 * Stub: always approves and returns a mock token.
 *
 * In production this checks:
 * - Authenticated session
 * - Membership status
 * - Age verification
 * - Room visibility permissions
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const roomId = segments[3]; // /api/rooms/[roomId]/join

  // Stub: generate a mock session token
  const authorization = {
    token: crypto.randomUUID(),
    roomId,
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    permissions: ['view', 'chat', 'send_gift'],
  };

  return Response.json(authorization, { status: 201 });
}
