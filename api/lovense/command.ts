export const config = { runtime: 'edge' };

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/lovense/command
 * Server-side toy control via Lovense Server API.
 * Use when a tip comes in to trigger vibrations without LAN access.
 *
 * Body: {
 *   uid: string,          // performer's Lovense uid
 *   command: string,      // "Function" | "Pattern" | "Preset"
 *   action?: string,      // e.g. "Vibrate:16"
 *   name?: string,        // preset name (pulse, wave, fireworks, earthquake)
 *   timeSec: number,
 *   toy?: string,         // optional toy ID
 *   loopRunningSec?: number,
 *   loopPauseSec?: number,
 *   rule?: string,        // pattern rule
 *   strength?: string,    // pattern strengths
 * }
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const token = process.env.LOVENSE_DEV_TOKEN;
  if (!token) {
    console.error('LOVENSE_DEV_TOKEN not configured');
    return Response.json({ error: 'Lovense not configured' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { uid, command, action, name, timeSec, toy, loopRunningSec, loopPauseSec, rule, strength } = body as {
    uid?: string;
    command?: string;
    action?: string;
    name?: string;
    timeSec?: number;
    toy?: string;
    loopRunningSec?: number;
    loopPauseSec?: number;
    rule?: string;
    strength?: string;
  };

  if (!uid || !command) {
    return Response.json({ error: 'uid and command are required' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    token,
    uid,
    command,
    apiVer: 1,
  };

  if (action) payload.action = action;
  if (name) payload.name = name;
  if (timeSec !== undefined) payload.timeSec = timeSec;
  if (toy) payload.toy = toy;
  if (loopRunningSec !== undefined) payload.loopRunningSec = loopRunningSec;
  if (loopPauseSec !== undefined) payload.loopPauseSec = loopPauseSec;
  if (rule) payload.rule = rule;
  if (strength) payload.strength = strength;

  const resp = await fetch('https://api.lovense.com/api/lan/v2/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();
  return Response.json(data);
}
