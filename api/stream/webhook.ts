export const config = { runtime: 'edge' };

import { supabase } from '../lib/supabase';

declare const process: { env: Record<string, string | undefined> };

/**
 * POST /api/stream/webhook
 * Mux sends webhooks here when stream status changes.
 * Updates performer_streams.status so room.html knows when to show video.
 *
 * Set this URL in Mux Dashboard -> Settings -> Webhooks:
 *   https://cumindungeon.com/api/stream/webhook
 *
 * Env var: MUX_WEBHOOK_SECRET (for signature verification)
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // TODO: Verify Mux webhook signature with MUX_WEBHOOK_SECRET
  // For now, accept all (add verification before going to production)

  let payload: Record<string, unknown>;
  try { payload = await req.json() as Record<string, unknown>; }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const type = payload.type as string;
  const data = (payload.data as Record<string, unknown>) || {};

  console.info('[Mux Webhook]', type, data.id);

  // Handle stream status changes
  if (type === 'video.live_stream.active') {
    // Performer started streaming
    await supabase
      .from('performer_streams')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('mux_stream_id', data.id);

  } else if (type === 'video.live_stream.idle' || type === 'video.live_stream.disabled') {
    // Performer stopped streaming
    await supabase
      .from('performer_streams')
      .update({ status: 'idle', ended_at: new Date().toISOString() })
      .eq('mux_stream_id', data.id);
  }

  return Response.json({ received: true });
}
