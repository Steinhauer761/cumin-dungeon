export const config = { runtime: 'edge' };

/**
 * GET /api/vip/showcase?gender=<woman|man|trans>&available=true
 *
 * Returns performers who have opted into VIP private shows.
 * Any verified performer can list themselves. No curation, no earning a spot.
 * They set their own rate, their own schedule, their own availability.
 */

// In production this queries the DB for performers where vip_opted_in = true
const VIP_PERFORMERS = [
  { id: 'performer-1', stageName: 'Velvet', gender: 'woman', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Sensual and slow. Loves eye contact.', rating: 4.8, optedInAt: '2026-08-10' },
  { id: 'performer-2', stageName: 'Ember', gender: 'woman', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Fiery redhead. Bring your requests.', rating: 4.6, optedInAt: '2026-08-11' },
  { id: 'performer-3', stageName: 'Noir', gender: 'woman', rate: { perMinute: 6, currency: 'CAD' }, available: false, bio: 'Dark and mysterious. Worth the wait.', rating: 4.9, optedInAt: '2026-08-09' },
  { id: 'performer-4', stageName: 'Atlas', gender: 'man', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Built different. Confidence included.', rating: 4.7, optedInAt: '2026-08-12' },
  { id: 'performer-5', stageName: 'Dante', gender: 'man', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Smooth talker. Will make you forget your name.', rating: 4.5, optedInAt: '2026-08-10' },
  { id: 'performer-6', stageName: 'Phoenix', gender: 'man', rate: { perMinute: 3, currency: 'CAD' }, available: true, bio: 'New here. Eager to impress.', rating: 4.3, optedInAt: '2026-08-13' },
  { id: 'performer-7', stageName: 'Luna', gender: 'trans', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Elegant and electric. Your fantasy, realized.', rating: 4.8, optedInAt: '2026-08-11' },
  { id: 'performer-8', stageName: 'Siren', gender: 'trans', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Voice like honey, body like art.', rating: 4.6, optedInAt: '2026-08-12' },
];

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const gender = url.searchParams.get('gender');
  const availableOnly = url.searchParams.get('available') === 'true';

  let performers = VIP_PERFORMERS;

  if (gender) {
    performers = performers.filter(p => p.gender === gender);
  }
  if (availableOnly) {
    performers = performers.filter(p => p.available);
  }

  return Response.json({
    total: performers.length,
    performers: performers.map(p => ({
      id: p.id,
      stageName: p.stageName,
      gender: p.gender,
      rate: p.rate,
      available: p.available,
      bio: p.bio,
      rating: p.rating,
    })),
  });
}
