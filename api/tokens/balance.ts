export const config = { runtime: 'edge' };

/**
 * GET /api/tokens/balance?userId=<id>
 * Returns the user's current token balance.
 * Stub: returns a mock balance.
 */
export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId') || 'guest';

  // Stub: everyone starts with 50 tokens
  return Response.json({
    userId,
    balance: 50,
    lifetimeEarned: 50,
    lifetimeSpent: 0,
  });
}
