export const config = { runtime: 'edge' };

/**
 * GET /api/rooms?category=<slug>
 * Returns rooms, optionally filtered by category.
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
    categories: ['women'],
    viewers: 184,
    performer: { stageName: 'Velvet' },
  },
  {
    id: 'tangled-throne',
    name: 'Tangled Throne',
    description: 'Couples room, get twisted together',
    visibility: 'members',
    status: 'live',
    categories: ['couples'],
    viewers: 92,
    performer: { stageName: 'Throne Hosts' },
  },
  {
    id: 'pink-silk',
    name: 'Pink Silk',
    description: 'Young performers 18-21. Fresh, bold, just getting started.',
    visibility: 'members',
    status: 'live',
    categories: ['women', 'men'],
    viewers: 131,
    performer: null,
  },
  {
    id: 'devils-playground',
    name: "Devil's Playground",
    description: 'Fetish and kink, no limits',
    visibility: 'members',
    status: 'open',
    categories: ['fetish'],
    viewers: 47,
    performer: { stageName: 'Mistress Kay' },
  },
  {
    id: 'back-room',
    name: 'Back Room',
    description: 'Gay social and live',
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
    categories: ['vip'],
    viewers: 23,
    performer: { stageName: 'DarkLord' },
  },
  {
    id: 'haleys-halo',
    name: "Haley's Halo",
    description: 'She looks innocent but she is not',
    visibility: 'members',
    status: 'live',
    categories: ['women', 'vip'],
    viewers: 156,
    performer: { stageName: 'Haley' },
  },
  {
    id: 'trans-kinks',
    name: 'Trans Kinks',
    description: 'Trans performers and open play',
    visibility: 'public',
    status: 'live',
    categories: ['trans'],
    viewers: 74,
    performer: null,
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
