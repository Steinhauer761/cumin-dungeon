import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const isOptOut = url.pathname.endsWith('opt-out');

  let body: { performerId?: string; ratePerMinute?: number; currency?: string; bio?: string } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.performerId || body.performerId !== auth.userId) return Response.json({ error: 'You can only change your own VIP listing' }, { status: 403 });

  if (isOptOut) return Response.json({ performerId: auth.userId, vipStatus: 'opted-out' });

  if (!Number.isFinite(body.ratePerMinute) || (body.ratePerMinute as number) < 1 || (body.ratePerMinute as number) > 1000) return Response.json({ error: 'ratePerMinute must be 1-1000' }, { status: 400 });
  const bio = body.bio?.trim() || null;
  if (bio && bio.length > 2000) return Response.json({ error: 'bio must be 2000 characters or fewer' }, { status: 400 });

  return Response.json({
    performerId: auth.userId,
    vipStatus: 'pending_database_sync',
    rate: { perMinute: body.ratePerMinute, currency: body.currency || 'CAD' },
    bio,
    message: 'VIP listing details validated. Database persistence is required before activation.',
  }, { status: 202 });
}
