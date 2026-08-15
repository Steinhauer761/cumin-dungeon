import { supabase } from '../lib/supabase';
export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return Response.json({error:'Method not allowed'}, {status:405});
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return Response.json({error:'userId required'}, {status:400});
  const {data, error} = await supabase.rpc('get_token_balance', {p_user_id:userId});
  if (error) return Response.json({error:'Unable to read token balance', detail:error}, {status:500});
  return Response.json({userId, balance:Number(data ?? 0)});
}
