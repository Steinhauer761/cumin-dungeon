import type { VercelRequest, VercelResponse } from '@vercel/node';

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const configuredSecret = process.env.LOVENSE_CALLBACK_SECRET;
  if (!configuredSecret) {
    console.error('LOVENSE_CALLBACK_SECRET is not configured');
    return res.status(500).json({ error: 'Callback is not configured' });
  }

  const querySecret = typeof req.query.secret === 'string' ? req.query.secret : '';
  const headerSecret = typeof req.headers['x-lovense-callback-secret'] === 'string'
    ? req.headers['x-lovense-callback-secret']
    : '';
  const suppliedSecret = querySecret || headerSecret;

  if (!suppliedSecret || !safeEqual(suppliedSecret, configuredSecret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const uid = typeof payload.uid === 'string' ? payload.uid : null;
  const toyCount = payload.toys && typeof payload.toys === 'object'
    ? Object.keys(payload.toys).length
    : 0;

  console.info('Lovense callback received', { uid, toyCount });

  return res.status(200).json({ ok: true });
}
