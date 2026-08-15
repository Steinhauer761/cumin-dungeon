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
  thumbnail?: string;
  previewVideo?: string;
}

const ROOM_MEDIA: Record<string, { thumbnail: string; previewVideo?: string }> = {
  'velvet-room': { thumbnail: '/public/assets/art/rooms/velvet-room.jpg', previewVideo: '/public/videos/rooms/velvet-room.mp4' },
  'tangled-throne': { thumbnail: '/public/assets/art/rooms/tangled-throne.jpg', previewVideo: '/public/videos/rooms/tangled-throne.mp4' },
  'pink-silk': { thumbnail: '/public/assets/art/rooms/pink-silk.jpg', previewVideo: '/public/videos/rooms/pink-silk.mp4' },
  'devils-playground': { thumbnail: '/public/assets/art/rooms/devils-playground.jpg', previewVideo: '/public/videos/rooms/devils-playground.mp4' },
  'back-room': { thumbnail: '/public/assets/art/rooms/back-room.jpg', previewVideo: '/public/videos/rooms/back-room.mp4' },
  'the-dungeon': { thumbnail: '/public/assets/art/rooms/the-dungeon.jpg', previewVideo: '/public/videos/rooms/the-dungeon.mp4' },
  'haleys-halo': { thumbnail: '/public/assets/art/rooms/haleys-halo.jpg', previewVideo: '/public/videos/rooms/haleys-halo.mp4' },
  'trans-kinks': { thumbnail: '/public/assets/art/rooms/trans-kinks.jpg', previewVideo: '/public/videos/rooms/trans-kinks.mp4' },
};

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
      thumbnail: ROOM_MEDIA[r.id]?.thumbnail || '',
      previewVideo: ROOM_MEDIA[r.id]?.previewVideo || '',
    })),
  });
}
