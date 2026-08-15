import { requireUser } from '../../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  const roomIndex = segments.indexOf('rooms');
  const roomId = roomIndex >= 0 ? segments[roomIndex + 1] : null;
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  return Response.json({ ok: true, userId: auth.userId, roomId, leftAt: new Date().toISOString() });
}
