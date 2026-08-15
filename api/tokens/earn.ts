import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { source?: string; gameId?: string; amount?: number };
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const source = body.source?.trim();
  const gameId = body.gameId?.trim();
  const rawAmount = body.amount;
  if (!source || source.length > 40 || (gameId && gameId.length > 60) || !Number.isInteger(rawAmount) || rawAmount < 1 || rawAmount > 25) {
    return Response.json({ error: 'source and integer amount 1-25 required' }, { status: 400 });
  }

  const amount = rawAmount as number;
  const result = await supabase.rpc('grant_tokens', {
    p_user_id: auth.userId,
    p_amount: amount,
    p_source: gameId ? `${source}:${gameId}` : source,
  });

  if (result.error) return Response.json({ error: 'Token operation failed' }, { status: 500 });
  return Response.json({ userId: auth.userId, earned: amount, source, gameId: gameId || null, balance: result.data?.balance ?? null }, { status: 201 });
}
