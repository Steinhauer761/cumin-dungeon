export const config = { runtime: 'edge' };

/**
 * POST /api/tokens/redeem
 * Body: { "userId": "...", "giftId": "velvet-key", "recipientId": "performer_123" }
 * Redeems tokens for a gift. Returns error if insufficient balance.
 */

const GIFTS: Record<string, { name: string; cost: number }> = {
  'rose': { name: 'Rose', cost: 50 },
  'dungeon-key': { name: 'Dungeon Key', cost: 150 },
  'black-rose': { name: 'Black Rose', cost: 300 },
  'velvet-key': { name: 'Velvet Key', cost: 500 },
  'crown': { name: 'Crown', cost: 1000 },
  'after-dark-pass': { name: 'After Dark Pass', cost: 2500 },
  'throne': { name: 'Throne', cost: 5000 },
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    // Return gift catalog
    return Response.json({ gifts: Object.entries(GIFTS).map(([id, g]) => ({ id, ...g })) });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { userId?: string; giftId?: string; recipientId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.giftId) {
    return Response.json({ error: 'userId and giftId required' }, { status: 400 });
  }

  const gift = GIFTS[body.giftId];
  if (!gift) {
    return Response.json({ error: 'Unknown gift' }, { status: 404 });
  }

  // Stub: assume balance is 50 (in production, check DB)
  const balance = 50;
  if (balance < gift.cost) {
    return Response.json({
      error: 'Insufficient tokens',
      required: gift.cost,
      balance,
      shortBy: gift.cost - balance,
    }, { status: 402 });
  }

  return Response.json({
    redeemed: true,
    gift: gift.name,
    cost: gift.cost,
    recipientId: body.recipientId || null,
    newBalance: balance - gift.cost,
    timestamp: new Date().toISOString(),
  }, { status: 201 });
}
