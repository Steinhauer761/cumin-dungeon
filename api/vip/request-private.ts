export const config = { runtime: 'edge' };

/**
 * POST /api/vip/request-private
 * Body: { "guestId": "...", "performerId": "...", "fromRoom": "velvet-room" }
 *
 * Sends a private show request to a performer currently live in a regular room.
 * Performer can accept or decline. If accepted, both are moved to a private VIP session.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { guestId?: string; performerId?: string; fromRoom?: string; offeredMinutes?: number } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.guestId || !body.performerId) {
    return Response.json({ error: 'guestId and performerId required' }, { status: 400 });
  }

  const request = {
    id: crypto.randomUUID(),
    guestId: body.guestId,
    performerId: body.performerId,
    fromRoom: body.fromRoom || null,
    offeredMinutes: body.offeredMinutes || 15,
    status: 'pending', // pending -> accepted | declined | expired
    expiresAt: new Date(Date.now() + 120000).toISOString(), // 2 min to respond
    createdAt: new Date().toISOString(),
  };

  return Response.json(request, { status: 201 });
}
