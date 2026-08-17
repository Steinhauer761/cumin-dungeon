export const config = { runtime: 'edge' };

import { requireUser } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';

/**
 * POST /api/stream/go-live
 * Performer calls this to get their existing stream credentials.
 * Uses supabaseAdmin for reliable reads/writes.
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

  const { data: rows } = await supabaseAdmin
    .from('performer_streams')
    .select('mux_stream_key,mux_playback_id,mux_stream_id,status', `performer_id=eq.${auth.userId}`);

  const existing = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (existing && existing.mux_stream_key) {
    await supabaseAdmin.from('performer_streams').update(
      { room_id: roomId },
      `performer_id=eq.${auth.userId}`
    );

    return Response.json({
      rtmpUrl: 'rtmps://global-live.mux.com:443/app',
      streamKey: existing.mux_stream_key,
      playbackId: existing.mux_playback_id,
      status: existing.status,
    });
  }

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
