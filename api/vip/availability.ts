export const config = { runtime: 'edge' };

/**
 * POST /api/vip/availability
 * Body: { "performerId": "...", "available": true }
 *
 * Toggle availability on/off. When off, you stay listed but show as unavailable.
 * Performers control their own schedule completely.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { performerId?: string; available?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.performerId || typeof body.available !== 'boolean') {
    return Response.json({ error: 'performerId and available (boolean) required' }, { status: 400 });
  }

  return Response.json({
    performerId: body.performerId,
    available: body.available,
    updatedAt: new Date().toISOString(),
    message: body.available ? 'You are now accepting VIP bookings.' : 'VIP bookings paused. You are shown as unavailable.',
  });
}
