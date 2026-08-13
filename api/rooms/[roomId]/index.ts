export const config = { runtime: 'edge' };

/**
 * GET /api/rooms/:roomId
 * Returns room metadata and current session status.
 */

const ROOMS: Record<string, { name: string; description: string; status: string; categories: string[]; viewers: number; performer: { stageName: string } | null }> = {
  'velvet-room': { name: 'Velvet Room', description: 'Open lounge with verified host', status: 'live', categories: ['women', 'vip'], viewers: 184, performer: { stageName: 'Velvet' } },
  'the-chapel': { name: 'The Chapel', description: 'Creator event for members', status: 'live', categories: ['couples', 'vip'], viewers: 92, performer: { stageName: 'Chapel Host' } },
  'black-silk': { name: 'Black Silk', description: 'Social room with open chat', status: 'live', categories: ['women', 'bi'], viewers: 131, performer: null },
  'crimson-lounge': { name: 'Crimson Lounge', description: 'Themed fetish room', status: 'open', categories: ['fetish'], viewers: 47, performer: { stageName: 'Mistress Kay' } },
  'pride-hall': { name: 'Pride Hall', description: 'Social space for the community', status: 'live', categories: ['gay', 'bi'], viewers: 68, performer: null },
  'the-dungeon': { name: 'The Dungeon', description: 'Private VIP experience', status: 'live', categories: ['vip', 'fetish'], viewers: 23, performer: { stageName: 'DarkLord' } },
};

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  // /api/rooms/[roomId] -> roomId is the last segment
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
