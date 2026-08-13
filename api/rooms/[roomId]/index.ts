export const config = { runtime: 'edge' };

/**
 * GET /api/rooms/:roomId
 * Returns room metadata and current session status.
 */

const ROOMS: Record<string, { name: string; description: string; status: string; categories: string[]; viewers: number; performer: { stageName: string } | null }> = {
  'velvet-room': { name: 'Velvet Room', description: 'Open lounge with verified host', status: 'live', categories: ['women'], viewers: 184, performer: { stageName: 'Velvet' } },
  'tangled-throne': { name: 'Tangled Throne', description: 'Couples room, get twisted together', status: 'live', categories: ['couples'], viewers: 92, performer: { stageName: 'Throne Hosts' } },
  'black-silk': { name: 'Black Silk', description: 'Black dick and pussy, smooth and raw', status: 'live', categories: ['men', 'women'], viewers: 131, performer: null },
  'devils-playground': { name: "Devil's Playground", description: 'Fetish and kink, no limits', status: 'open', categories: ['fetish'], viewers: 47, performer: { stageName: 'Mistress Kay' } },
  'back-room': { name: 'Back Room', description: 'Gay social and live', status: 'live', categories: ['gay', 'bi'], viewers: 68, performer: null },
  'the-dungeon': { name: 'The Dungeon', description: 'Private VIP experience', status: 'live', categories: ['vip'], viewers: 23, performer: { stageName: 'DarkLord' } },
  'haleys-halo': { name: "Haley's Halo", description: 'She looks innocent but she is not', status: 'live', categories: ['women', 'vip'], viewers: 156, performer: { stageName: 'Haley' } },
  'trans-kinks': { name: 'Trans Kinks', description: 'Trans performers and open play', status: 'live', categories: ['trans'], viewers: 74, performer: null },
};

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const roomId = segments[segments.length - 1];

  const room = ROOMS[roomId];
  if (!room) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }

  return Response.json({
    id: roomId,
    ...room,
    session: room.status === 'live' ? { active: true, startedAt: new Date(Date.now() - 3600000).toISOString() } : null,
  });
}
