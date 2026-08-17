export const config = { runtime: 'edge' };

import { supabase } from '../lib/supabase';

/**
 * GET /api/stream/playback?roomId=velvet-room
 * Returns the HLS playback URL for a room's active stream.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  // Look up active stream for this room
  const { data: rows } = await supabase
    .from('performer_streams')
    .select('mux_playback_id,status,performer_id', `room_id=eq.${roomId}&status=eq.active`);

  const stream = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (!stream) {
    return Response.json({ live: false, playbackUrl: null });
  }

  return Response.json({
    live: true,
    playbackUrl: `https://stream.mux.com/${stream.mux_playback_id}.m3u8`,
    thumbnailUrl: `https://image.mux.com/${stream.mux_playback_id}/thumbnail.jpg?time=0`,
    performerId: stream.performer_id,
  });
}
