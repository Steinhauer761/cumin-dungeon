import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { performerId?: string; fromRoom?: string; offeredMinutes?: number } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.performerId) return Response.json({ error: 'performerId required' }, { status: 400 });
  if (body.performerId === auth.userId) return Response.json({ error: 'Cannot request a private show from yourself' }, { status: 400 });

  const offeredMinutes = body.offeredMinutes ?? 15;
  if (!Number.isInteger(offeredMinutes) || offeredMinutes < 5 || offeredMinutes > 120) return Response.json({ error: 'offeredMinutes must be 5-120' }, { status: 400 });
  if (body.fromRoom && body.fromRoom.length > 80) return Response.json({ error: 'Invalid room' }, { status: 400 });

  return Response.json({
    id: crypto.randomUUID(),
    guestId: auth.userId,
    performerId: body.performerId,
    fromRoom: body.fromRoom || null,
    offeredMinutes,
    status: 'pending',
    expiresAt: new Date(Date.now() + 120000).toISOString(),
    createdAt: new Date().toISOString(),
  }, { status: 202 });
}
