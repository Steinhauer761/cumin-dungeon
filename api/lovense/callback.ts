export const config = { runtime: 'edge' };

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/lovense/callback
 * Lovense Connect app posts toy connection data here after QR scan.
 * Also receives Display Panel model status forwarding callbacks.
 *
 * Set this URL in your Lovense Developer Dashboard:
 *   https://cumindungeon.com/api/lovense/callback?secret=YOUR_SECRET
 *
 * Env vars needed:
 *   LOVENSE_CALLBACK_SECRET - shared secret for verifying callbacks
 *   ABLY_API_KEY - for publishing toy status to performer channels
 */

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const configuredSecret = process.env.LOVENSE_CALLBACK_SECRET;
  if (!configuredSecret) {
    console.error('LOVENSE_CALLBACK_SECRET is not configured');
    return Response.json({ error: 'Callback not configured' }, { status: 500 });
  }

  // Verify secret from query param or header
  const requestUrl = new URL(req.url);
  const querySecret = requestUrl.searchParams.get('secret') ?? '';
  const headerSecret = req.headers.get('x-lovense-callback-secret') ?? '';
  const suppliedSecret = querySecret || headerSecret;

  if (!suppliedSecret || !safeEqual(suppliedSecret, configuredSecret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Connection callback from Lovense Connect (after QR scan)
  if (payload.uid && payload.toys) {
    const uid = payload.uid as string;
    const domain = payload.domain as string;
    const httpsPort = payload.httpsPort as number;
    const toys = payload.toys as Record<string, unknown>;

    console.info('Lovense toy connected', {
      uid,
      domain,
      httpsPort,
      toyCount: Object.keys(toys).length,
    });

    // TODO: Store connection info in Supabase for the performer
    // TODO: Publish toy status to Ably channel so room UI updates
    // Example: await ably.channels.get(`room:${uid}`).publish('toy-status', { toys });
  }

  // Display Panel forwarding callback (model status changes)
  if (payload.from && payload.to && payload.data) {
    const to = payload.to as { type: string; target: string };
    const data = payload.data as string;

    console.info('Lovense display panel callback', {
      toType: to.type,
      target: to.target,
    });

    // TODO: Forward data to appropriate viewers via Ably
    // If to.type === 'customersOfModel', broadcast to all viewers in model's room
    // If to.type === 'customer', send to specific viewer
  }

  return Response.json({ ok: true });
}
