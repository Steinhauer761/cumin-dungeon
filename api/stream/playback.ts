export const config = { runtime: 'edge' };

import { supabase } from '../lib/supabase';

/**
 * GET /api/stream/playback?roomId=velvet-room
 * Returns the HLS playback URL for a room's active stream.
 * Viewers call this to get the video URL.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 });

  // Look up active stream for this room
  const { data: stream, error } = await supabase
    .from('performer_streams')
    .select('mux_playback_id, status, performer_id')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (error || !stream) {
    return Response.json({ live: false, playbackUrl: null });
  }

  return Response.json({
    live: true,
    playbackUrl: `https://stream.mux.com/${stream.mux_playback_id}.m3u8`,
    thumbnailUrl: `https://image.mux.com/${stream.mux_playback_id}/thumbnail.jpg?time=0`,
    performerId: stream.performer_id,
  });
}
