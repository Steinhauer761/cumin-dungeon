import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { performerId?: string; available?: boolean } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.performerId || typeof body.available !== 'boolean') return Response.json({ error: 'performerId and available required' }, { status: 400 });
  if (body.performerId !== auth.userId) return Response.json({ error: 'You can only change your own availability' }, { status: 403 });

  return Response.json({ performerId: auth.userId, available: body.available, updatedAt: new Date().toISOString() });
}
