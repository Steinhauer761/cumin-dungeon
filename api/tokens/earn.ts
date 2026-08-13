export const config = { runtime: 'edge' };

/**
 * POST /api/tokens/earn
 * Body: { "userId": "...", "source": "game", "gameId": "dare-roulette", "amount": 5 }
 * Awards tokens for completing a game or activity.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { userId?: string; source?: string; gameId?: string; amount?: number } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.source || !body.amount || body.amount <= 0) {
    return Response.json({ error: 'userId, source, and positive amount required' }, { status: 400 });
  }

  // Cap per-earn at 25 tokens to prevent abuse
  const earned = Math.min(body.amount, 25);

  return Response.json({
    userId: body.userId,
    earned,
    source: body.source,
    gameId: body.gameId || null,
    newBalance: 50 + earned, // stub: base 50 + earned
    timestamp: new Date().toISOString(),
  }, { status: 201 });
}
