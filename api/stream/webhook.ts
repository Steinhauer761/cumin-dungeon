export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';
declare const process: { env: Record<string, string | undefined> };

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0;
}
async function verifyMux(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(',').map(x => x.trim().split('=')));
  const timestamp = Number(parts.t); const signature = parts.v1 || '';
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${raw}`));
  return safeEqual(toHex(digest), signature);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Webhook not configured' }, { status: 503 });
  const raw = await req.text();
  if (!(await verifyMux(raw, req.headers.get('mux-signature') || '', secret))) return Response.json({ error: 'Invalid signature' }, { status: 401 });

  let payload: { type?: string; data?: { id?: string } };
  try { payload = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const streamId = payload.data?.id || '';
  if (!streamId) return Response.json({ error: 'Missing stream id' }, { status: 400 });

  if (payload.type === 'video.live_stream.active') {
    await supabaseAdmin.from('performer_streams').update({ status: 'active', started_at: new Date().toISOString() }, `mux_stream_id=eq.${streamId}`);
  } else if (payload.type === 'video.live_stream.idle' || payload.type === 'video.live_stream.disabled') {
    await supabaseAdmin.from('performer_streams').update({ status: 'idle', ended_at: new Date().toISOString() }, `mux_stream_id=eq.${streamId}`);
  }
  return Response.json({ received: true });
}
