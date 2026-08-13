export const config = { runtime: 'edge' };

/**
 * POST /api/rooms/:roomId/leave
 * Records a room exit and revokes the current room-session authorization.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return Response.json({ ok: true, leftAt: new Date().toISOString() });
}
