export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';
import { requireActiveMember } from '../lib/auth';

/** GET /api/stream/playback?roomId=velvet-room */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const auth = await requireActiveMember(req);
  if (auth instanceof Response) return auth;

  const roomId = new URL(req.url).searchParams.get('roomId') || '';
  if (!/^[a-z0-9-]{1,60}$/.test(roomId)) return Response.json({ error: 'Valid roomId required' }, { status: 400 });

  const { data: rows, error } = await supabaseAdmin.from('performer_streams')
    .select('mux_playback_id,status,performer_id', `room_id=eq.${roomId}&status=eq.active&limit=1`);
  if (error) return Response.json({ error: 'Unable to read stream' }, { status: 500 });
  const stream = Array.isArray(rows) && rows.length ? rows[0] : null;
  if (!stream?.mux_playback_id) return Response.json({ live: false, playbackId: null, performerId: null });

  return Response.json({ live: true, playbackId: stream.mux_playback_id, performerId: stream.performer_id });
}
