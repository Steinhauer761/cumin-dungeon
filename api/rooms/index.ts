export const config = { runtime: 'edge' };

/**
 * GET /api/rooms?category=<slug>
 * Returns rooms, optionally filtered by category.
 * Until we have a real DB, this serves mock data matching the schema.
 */

interface Room {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'members' | 'private';
  status: 'offline' | 'open' | 'live' | 'maintenance';
  categories: string[];
  viewers: number;
  performer: { stageName: string } | null;
}

const MOCK_ROOMS: Room[] = [
  {
    id: 'velvet-room',
    name: 'Velvet Room',
    description: 'Open lounge with verified host',
    visibility: 'members',
    status: 'live',
    categories: ['women', 'vip'],
    viewers: 184,
    performer: { stageName: 'Velvet' },
  },
  {
    id: 'the-chapel',
    name: 'The Chapel',
    description: 'Creator event for members',
    visibility: 'members',
    status: 'live',
    categories: ['couples', 'vip'],
    viewers: 92,
    performer: { stageName: 'Chapel Host' },
  },
  {
    id: 'black-silk',
    name: 'Black Silk',
    description: 'Social room with open chat',
    visibility: 'public',
    status: 'live',
    categories: ['women', 'bi'],
    viewers: 131,
    performer: null,
  },
  {
    id: 'crimson-lounge',
    name: 'Crimson Lounge',
    description: 'Themed fetish room',
    visibility: 'members',
    status: 'open',
    categories: ['fetish'],
    viewers: 47,
    performer: { stageName: 'Mistress Kay' },
  },
  {
    id: 'pride-hall',
    name: 'Pride Hall',
    description: 'Social space for the community',
    visibility: 'public',
    status: 'live',
    categories: ['gay', 'bi'],
    viewers: 68,
    performer: null,
  },
  {
    id: 'the-dungeon',
    name: 'The Dungeon',
    description: 'Private VIP experience',
    visibility: 'private',
    status: 'live',
    categories: ['vip', 'fetish'],
    viewers: 23,
    performer: { stageName: 'DarkLord' },
  },
];

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get('category');

  let rooms = MOCK_ROOMS;
  if (category) {
    rooms = rooms.filter((r) => r.categories.includes(category.toLowerCase()));
  }

  // Don't expose private rooms unless authenticated (stub: always hide private for now)
  rooms = rooms.filter((r) => r.visibility !== 'private');

  return Response.json({
    rooms: rooms.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      categories: r.categories,
      viewers: r.viewers,
      performer: r.performer,
    })),
  });
}
