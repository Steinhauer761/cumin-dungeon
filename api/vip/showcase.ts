export const config = { runtime: 'edge' };

/**
 * GET /api/vip/showcase
 * Returns tonight's featured VIP performers.
 * Equal balance: women, men, trans.
 */

const SHOWCASE = {
  date: new Date().toISOString().split('T')[0],
  featured: [
    { id: 'performer-1', stageName: 'Velvet', gender: 'woman', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Sensual and slow. Loves eye contact.', rating: 4.8 },
    { id: 'performer-2', stageName: 'Ember', gender: 'woman', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Fiery redhead. Bring your requests.', rating: 4.6 },
    { id: 'performer-3', stageName: 'Noir', gender: 'woman', rate: { perMinute: 6, currency: 'CAD' }, available: false, bio: 'Dark and mysterious. Worth the wait.', rating: 4.9 },
    { id: 'performer-4', stageName: 'Atlas', gender: 'man', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Built different. Confidence included.', rating: 4.7 },
    { id: 'performer-5', stageName: 'Dante', gender: 'man', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Smooth talker. Will make you forget your name.', rating: 4.5 },
    { id: 'performer-6', stageName: 'Phoenix', gender: 'man', rate: { perMinute: 3, currency: 'CAD' }, available: true, bio: 'New to the showcase. Eager to impress.', rating: 4.3 },
    { id: 'performer-7', stageName: 'Luna', gender: 'trans', rate: { perMinute: 5, currency: 'CAD' }, available: true, bio: 'Elegant and electric. Your fantasy, realized.', rating: 4.8 },
    { id: 'performer-8', stageName: 'Siren', gender: 'trans', rate: { perMinute: 4, currency: 'CAD' }, available: true, bio: 'Voice like honey, body like art.', rating: 4.6 },
  ],
};

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return Response.json(SHOWCASE);
}
