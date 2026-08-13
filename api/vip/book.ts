export const config = { runtime: 'edge' };

/**
 * POST /api/vip/book
 * Body: { "guestId": "...", "performerId": "...", "durationMinutes": 15 }
 *
 * Books a VIP private session.
 * Returns booking confirmation with estimated cost.
 * Performer keeps 75%, platform takes 25%.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { guestId?: string; performerId?: string; durationMinutes?: number; scheduledAt?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.guestId || !body.performerId || !body.durationMinutes) {
    return Response.json({ error: 'guestId, performerId, and durationMinutes required' }, { status: 400 });
  }

  if (body.durationMinutes < 5 || body.durationMinutes > 120) {
    return Response.json({ error: 'Duration must be 5-120 minutes' }, { status: 400 });
  }

  // Stub: assume $5/min rate
  const ratePerMinute = 5;
  const totalCost = ratePerMinute * body.durationMinutes;
  const platformCut = Math.round(totalCost * 0.25 * 100) / 100;
  const performerPayout = Math.round(totalCost * 0.75 * 100) / 100;

  const booking = {
    id: crypto.randomUUID(),
    guestId: body.guestId,
    performerId: body.performerId,
    durationMinutes: body.durationMinutes,
    scheduledAt: body.scheduledAt || new Date(Date.now() + 300000).toISOString(), // 5 min from now if not specified
    status: 'confirmed',
    pricing: {
      ratePerMinute,
      currency: 'CAD',
      totalCost,
      platformCut,
      performerPayout,
    },
    createdAt: new Date().toISOString(),
  };

  console.info('VIP booking created', { bookingId: booking.id, performerId: body.performerId });

  return Response.json(booking, { status: 201 });
}
