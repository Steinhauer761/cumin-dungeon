export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';

declare const process: { env: Record<string, string | undefined> };

/**
 * POST /api/lovense/callback
 * Lovense Connect app posts toy connection data here.
 * Uses supabaseAdmin to bypass RLS (no user JWT in Lovense callbacks).
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

    // Store Lovense UID on performer profile
    await supabaseAdmin.from('performer_profiles').update(
      { lovense_uid: uid },
      `user_id=eq.${uid}`
    );
  }

  // Display Panel forwarding callback
  if (payload.from && payload.to && payload.data) {
    const to = payload.to as { type: string; target: string };
    console.info('Lovense display panel callback', {
      toType: to.type,
      target: to.target,
    });
    // TODO: Forward to viewers via Ably
  }

  return Response.json({ ok: true });
}
