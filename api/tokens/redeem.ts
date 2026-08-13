export const config = { runtime: 'edge' };

/**
 * GET /api/tokens/redeem - gift catalog (12 gifts)
 * POST /api/tokens/redeem - send a gift or custom tip
 * Body: { "userId": "...", "type": "gift" | "tip", "giftId": "...", "amount": 50, "recipientId": "..." }
 */

const GIFTS = [
  { id: 'whisper', name: 'Whisper', emoji: '\ud83d\udcac', cost: 5 },
  { id: 'wink', name: 'Wink', emoji: '\ud83d\ude09', cost: 10 },
  { id: 'rose', name: 'Rose', emoji: '\ud83c\udf39', cost: 25 },
  { id: 'flame', name: 'Flame', emoji: '\ud83d\udd25', cost: 50 },
  { id: 'silk', name: 'Silk', emoji: '\ud83e\uddf5', cost: 75 },
  { id: 'dungeon-key', name: 'Dungeon Key', emoji: '\ud83d\udd11', cost: 100 },
  { id: 'black-rose', name: 'Black Rose', emoji: '\ud83e\udeb7', cost: 150 },
  { id: 'velvet-kiss', name: 'Velvet Kiss', emoji: '\ud83d\udc8b', cost: 200 },
  { id: 'crown', name: 'Crown', emoji: '\ud83d\udc51', cost: 300 },
  { id: 'throne', name: 'Throne', emoji: '\ud83e\ude91', cost: 400 },
  { id: 'dark-heart', name: 'Dark Heart', emoji: '\ud83d\udda4', cost: 600 },
  { id: 'dragons-blessing', name: "Dragon's Blessing", emoji: '\ud83d\udc09', cost: 1000 },
];

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return Response.json({ gifts: GIFTS });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { userId?: string; type?: string; giftId?: string; amount?: number; recipientId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.type || !body.recipientId) {
    return Response.json({ error: 'userId, type, and recipientId required' }, { status: 400 });
  }

  // Custom tip
  if (body.type === 'tip') {
    if (!body.amount || body.amount < 1) {
      return Response.json({ error: 'Tip amount must be at least 1 token' }, { status: 400 });
    }
    return Response.json({
      sent: true,
      type: 'tip',
      amount: body.amount,
      recipientId: body.recipientId,
      message: `Tipped ${body.amount} tokens`,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }

  // Gift
  if (body.type === 'gift') {
    if (!body.giftId) {
      return Response.json({ error: 'giftId required for gift type' }, { status: 400 });
    }
    const gift = GIFTS.find(g => g.id === body.giftId);
    if (!gift) {
      return Response.json({ error: 'Unknown gift' }, { status: 404 });
    }
    return Response.json({
      sent: true,
      type: 'gift',
      gift: gift.name,
      emoji: gift.emoji,
      cost: gift.cost,
      recipientId: body.recipientId,
      message: `Sent ${gift.emoji} ${gift.name} (${gift.cost} tokens)`,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  }

  return Response.json({ error: 'type must be gift or tip' }, { status: 400 });
}
