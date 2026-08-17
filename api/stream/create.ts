export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';
import { requireUser } from '../lib/auth';

declare const process: { env: Record<string, string | undefined> };

/**
 * POST /api/stream/create
 * Creates a new Mux live stream for a performer.
 * Uses supabaseAdmin for DB writes (performer may not have service role).
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    return Response.json({ error: 'Streaming not configured' }, { status: 500 });
  }

  let body: { roomId?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { roomId } = body;
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  const muxResp = await fetch('https://api.mux.com/video/v1/live-streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${tokenId}:${tokenSecret}`),
    },
    body: JSON.stringify({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      reduced_latency: true,
      max_continuous_duration: 43200,
    }),
  });

  if (!muxResp.ok) {
    const err = await muxResp.text();
    console.error('[Mux] Create stream failed:', err);
    return Response.json({ error: 'Failed to create stream' }, { status: 502 });
  }

  const muxData = await muxResp.json();
  const stream = muxData.data;

  await supabaseAdmin.from('performer_streams').delete(`performer_id=eq.${auth.userId}`);

  await supabaseAdmin.from('performer_streams').insert({
    performer_id: auth.userId,
    room_id: roomId,
    mux_stream_id: stream.id,
    mux_stream_key: stream.stream_key,
    mux_playback_id: stream.playback_ids?.[0]?.id || null,
    status: 'idle',
    created_at: new Date().toISOString(),
  });

  return Response.json({
    rtmpUrl: `rtmps://global-live.mux.com:443/app`,
    streamKey: stream.stream_key,
    playbackId: stream.playback_ids?.[0]?.id || null,
    streamId: stream.id,
    status: stream.status,
  }, { status: 201 });
}
