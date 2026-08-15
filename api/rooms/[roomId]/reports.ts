import { requireUser } from '../../lib/auth';

export const config = { runtime: 'edge' };

/** POST /api/rooms/:roomId/reports */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { reason?: string; targetUserId?: string; details?: string } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const reason = body.reason?.trim();
  const details = body.details?.trim() || null;
  if (!reason || reason.length > 120) return Response.json({ error: 'reason is required and must be 120 characters or fewer' }, { status: 400 });
  if (details && details.length > 2000) return Response.json({ error: 'details must be 2000 characters or fewer' }, { status: 400 });

  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  const roomIndex = segments.indexOf('rooms');
  const roomId = roomIndex >= 0 ? segments[roomIndex + 1] : null;
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  // Persisting moderation reports belongs in the moderation table; until that
  // table is present, do not claim a report was saved. Return a safe receipt.
  return Response.json({
    received: true,
    reporterId: auth.userId,
    roomId,
    reason,
    targetUserId: body.targetUserId || null,
    details,
    status: 'received',
    createdAt: new Date().toISOString(),
  }, { status: 202 });
}
