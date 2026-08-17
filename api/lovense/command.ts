export const config = { runtime: 'edge' };

import { requireUser } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';
declare const process: { env: Record<string, string | undefined> };

/** Authenticated performer-only Lovense command endpoint. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error:'Method not allowed' }, { status:405 });
  const auth = await requireUser(req); if (auth instanceof Response) return auth;
  const token = process.env.LOVENSE_DEV_TOKEN; if (!token) return Response.json({ error:'Lovense not configured' }, { status:503 });

  let body: { command?:string; action?:string; name?:string; timeSec?:number; toy?:string; rule?:string; strength?:string };
  try { body = await req.json(); } catch { return Response.json({ error:'Invalid JSON' }, { status:400 }); }
  if (!['Function','Pattern','Preset'].includes(body.command || '')) return Response.json({ error:'Invalid command' }, { status:400 });
  if (body.timeSec !== undefined && (!Number.isFinite(body.timeSec) || body.timeSec < 0 || body.timeSec > 120)) return Response.json({ error:'Invalid duration' }, { status:400 });

  const { data: rows } = await supabaseAdmin.from('performer_profiles').select('lovense_uid', `user_id=eq.${auth.userId}&limit=1`);
  const uid = Array.isArray(rows) && rows[0]?.lovense_uid;
  if (!uid) return Response.json({ error:'No connected Lovense account' }, { status:404 });

  const payload: Record<string,unknown> = { token, uid, command:body.command, apiVer:1 };
  for (const key of ['action','name','timeSec','toy','rule','strength'] as const) if (body[key] !== undefined) payload[key] = body[key];
  const response = await fetch('https://api.lovense.com/api/lan/v2/command', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
  const data = await response.json();
  return Response.json(data, { status:response.ok ? 200 : 502 });
}
