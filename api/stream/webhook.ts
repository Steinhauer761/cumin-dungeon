export const config = { runtime: 'edge' };

import { supabase } from '../lib/supabase';

declare const process: { env: Record<string, string | undefined> };

/**
 * POST /api/stream/webhook
 * Mux sends webhooks here when stream status changes.
 *
 * Set this URL in Mux Dashboard -> Settings -> Webhooks:
 *   https://cumindungeon.com/api/stream/webhook
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try { payload = await req.json() as Record<string, unknown>; }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const type = payload.type as string;
  const data = (payload.data as Record<string, unknown>) || {};
  const streamId = data.id as string;

  console.info('[Mux Webhook]', type, streamId);

  if (type === 'video.live_stream.active') {
    // Performer started streaming
    await supabase.from('performer_streams').update(
      { status: 'active', started_at: new Date().toISOString() },
      `mux_stream_id=eq.${streamId}`
    );
  } else if (type === 'video.live_stream.idle' || type === 'video.live_stream.disabled') {
    // Performer stopped streaming
    await supabase.from('performer_streams').update(
      { status: 'idle', ended_at: new Date().toISOString() },
      `mux_stream_id=eq.${streamId}`
    );
  }

  return Response.json({ received: true });
}
