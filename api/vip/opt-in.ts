export const config = { runtime: 'edge' };

/**
 * POST /api/vip/opt-in
 * Body: { "performerId": "...", "ratePerMinute": 5, "currency": "CAD", "bio": "..." }
 *
 * Performer opts themselves into VIP private shows.
 * They set their own rate and can update it anytime.
 * No approval needed. If you're a verified performer, you can list yourself.
 *
 * POST /api/vip/opt-out
 * Body: { "performerId": "..." }
 * Removes themselves from VIP listing.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const isOptOut = url.pathname.endsWith('opt-out');

  let body: { performerId?: string; ratePerMinute?: number; currency?: string; bio?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.performerId) {
    return Response.json({ error: 'performerId required' }, { status: 400 });
  }

  if (isOptOut) {
    return Response.json({
      performerId: body.performerId,
      vipStatus: 'opted-out',
      message: 'Removed from VIP listings.',
    });
  }

  // Opt in
  if (!body.ratePerMinute || body.ratePerMinute < 1) {
    return Response.json({ error: 'ratePerMinute required (min $1/min)' }, { status: 400 });
  }

  return Response.json({
    performerId: body.performerId,
    vipStatus: 'active',
    rate: {
      perMinute: body.ratePerMinute,
      currency: body.currency || 'CAD',
    },
    bio: body.bio || null,
    message: 'You are now listed in VIP. Guests can book you anytime you are set to available.',
    splits: {
      performerKeeps: '75%',
      platformTakes: '25%',
    },
  }, { status: 201 });
}
