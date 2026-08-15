import { isAdmin } from '../../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { startsAt?: string } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  const roomIndex = segments.indexOf('rooms');
  const roomId = roomIndex >= 0 ? segments[roomIndex + 1] : null;
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  let startsAt = new Date();
  if (body.startsAt) {
    startsAt = new Date(body.startsAt);
    if (Number.isNaN(startsAt.getTime())) return Response.json({ error: 'Invalid startsAt' }, { status: 400 });
  }

  return Response.json({
    error: 'Room session creation requires a persisted room/session table and is not enabled by the current schema.',
    roomId,
    requestedStartsAt: startsAt.toISOString(),
  }, { status: 503 });
}
