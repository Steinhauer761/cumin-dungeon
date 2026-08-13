export const config = { runtime: 'edge' };

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/chat/token
 * Body: { "roomId": "velvet-room", "clientId": "user_abc" }
 *
 * Returns a short-lived Ably token scoped to that room's channel.
 * Requires ABLY_API_KEY env var set in Vercel.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const ablyKey = process.env.ABLY_API_KEY;
  if (!ablyKey) {
    console.error('ABLY_API_KEY is not configured');
    return Response.json({ error: 'Chat is not configured' }, { status: 500 });
  }

  let body: { roomId?: string; clientId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { roomId, clientId } = body;
  if (!roomId || !clientId) {
    return Response.json({ error: 'roomId and clientId are required' }, { status: 400 });
  }

  // Request a token from Ably's REST API
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
