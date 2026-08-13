export const config = { runtime: 'edge' };

/**
 * GET /api/tokens/packages
 * Returns available token purchase packages.
 * All venue spending uses tokens. Real money only touches this endpoint.
 */

const PACKAGES = [
  { id: 'starter', name: 'Starter', price: 5.00, currency: 'CAD', tokens: 100, bonus: 0 },
  { id: 'popular', name: 'Popular', price: 10.00, currency: 'CAD', tokens: 220, bonus: 10 },
  { id: 'hot', name: 'Hot', price: 25.00, currency: 'CAD', tokens: 575, bonus: 15 },
  { id: 'vip-pack', name: 'VIP', price: 50.00, currency: 'CAD', tokens: 1200, bonus: 20 },
  { id: 'whale', name: 'Whale', price: 100.00, currency: 'CAD', tokens: 2600, bonus: 30 },
];

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  return Response.json({ packages: PACKAGES });
}
