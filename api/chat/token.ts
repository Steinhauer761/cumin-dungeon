export const config = { runtime: 'edge' };

import { requireUser } from '../lib/auth';

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/chat/token
 * Body: { "roomId": "velvet-room" }
 *
 * Returns a short-lived Ably token scoped to that room's channel.
 * Now requires authentication. Uses the authenticated userId as clientId
 * to prevent impersonation.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Require authentication
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const ablyKey = process.env.ABLY_API_KEY;
  if (!ablyKey) {
    console.error('ABLY_API_KEY is not configured');
    return Response.json({ error: 'Chat is not configured' }, { status: 500 });
  }

  let body: { roomId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { roomId } = body;
  if (!roomId) {
    return Response.json({ error: 'roomId is required' }, { status: 400 });
  }

  // Sanitize roomId (alphanumeric + hyphens only)
  if (!/^[a-z0-9-]+$/.test(roomId) || roomId.length > 60) {
    return Response.json({ error: 'Invalid roomId' }, { status: 400 });
  }

  // Use authenticated userId as clientId (prevents impersonation)
  const clientId = auth.userId;

  const [keyName, keySecret] = ablyKey.split(':');
  const capability = JSON.stringify({ [`room:${roomId}`]: ['publish', 'subscribe', 'presence'] });

  const tokenRequestPayload = {
    keyName,
    ttl: 3600000, // 1 hour
    capability,
    clientId,
    timestamp: Date.now(),
  };

  // Create HMAC for token request
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signMessage = [
    tokenRequestPayload.keyName,
    tokenRequestPayload.ttl,
    tokenRequestPayload.capability,
    tokenRequestPayload.clientId,
    tokenRequestPayload.timestamp,
    '', // nonce (empty)
  ].join('\n');

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signMessage));
  const mac = btoa(String.fromCharCode(...new Uint8Array(signature)));

  const tokenRequest = {
    ...tokenRequestPayload,
    mac,
  };

  return Response.json(tokenRequest);
}
