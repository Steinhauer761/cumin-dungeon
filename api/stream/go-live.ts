export const config = { runtime: 'edge' };

import { requireUser } from '../lib/auth';
import { supabase } from '../lib/supabase';

/**
 * POST /api/stream/go-live
 * Performer calls this to get their existing stream credentials.
 * If they don't have a stream yet, creates one via /api/stream/create.
 *
 * Body: { roomId: string }
 * Returns existing RTMP credentials or creates new ones.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { roomId?: string };
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { roomId } = body;
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  // Check if performer already has a stream
  const { data: existing } = await supabase
    .from('performer_streams')
    .select('mux_stream_key, mux_playback_id, mux_stream_id, status')
    .eq('performer_id', auth.userId)
    .single();

  if (existing && existing.mux_stream_key) {
    // Update room assignment
    await supabase
      .from('performer_streams')
      .update({ room_id: roomId })
      .eq('performer_id', auth.userId);

    return Response.json({
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      streamKey: existing.mux_stream_key,
      playbackId: existing.mux_playback_id,
      status: existing.status,
    });
  }

  // No existing stream, redirect to create
  const createResp = await fetch(new URL('/api/stream/create', req.url).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.get('Authorization') || '',
    },
    body: JSON.stringify({ roomId }),
  });

  const createData = await createResp.json();
  return Response.json(createData, { status: createResp.status });
}
