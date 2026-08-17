import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

/**
 * GET /api/tokens/balance
 * Returns the authenticated user's own token balance.
 * No longer accepts arbitrary userId parameter.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const { data, error } = await supabase.rpc('get_token_balance', { p_user_id: auth.userId });
  if (error) return Response.json({ error: 'Unable to read token balance' }, { status: 500 });

  return Response.json({ userId: auth.userId, balance: Number(data ?? 0) });
}
