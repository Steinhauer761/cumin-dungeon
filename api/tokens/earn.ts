import { supabase } from '../lib/supabase';

export const config = { runtime: 'edge' };

/** POST /api/tokens/earn
 * Awards entertainment tokens through the server-side ledger.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  let body: { userId?: string; source?: string; gameId?: string; amount?: number };
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { userId, source, gameId, amount } = body;
  if (!userId || !source || !Number.isInteger(amount) || amount < 1 || amount > 25) {
    return Response.json({ error: 'userId, source and integer amount 1-25 required' }, { status: 400 });
  }

  const result = await supabase.rpc('grant_tokens', {
    p_user_id: userId,
    p_amount: amount,
    p_source: gameId ? `${source}:${gameId}` : source,
  });

  if (result.error) return Response.json({ error: 'Token operation failed' }, { status: 500 });
  return Response.json({ userId, earned: amount, source, gameId: gameId || null, balance: result.data?.balance ?? null }, { status: 201 });
}
