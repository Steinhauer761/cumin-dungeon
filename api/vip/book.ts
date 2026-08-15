import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { performerId?: string; durationMinutes?: number; scheduledAt?: string } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.performerId) return Response.json({ error: 'performerId required' }, { status: 400 });
  const durationMinutes = body.durationMinutes;
  if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 120) return Response.json({ error: 'Duration must be 5-120 minutes' }, { status: 400 });

  if (body.scheduledAt) {
    const scheduled = new Date(body.scheduledAt);
    if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() < Date.now() - 60000) return Response.json({ error: 'scheduledAt must be a valid future time' }, { status: 400 });
  }

  // Pricing/availability must come from the verified performer record before a
  // real booking is confirmed. Do not fabricate a $5/min booking in the API.
  return Response.json({
    error: 'VIP booking is temporarily unavailable until performer pricing and availability are connected to the database.',
    performerId: body.performerId,
    requestedMinutes: durationMinutes,
  }, { status: 503 });
}
