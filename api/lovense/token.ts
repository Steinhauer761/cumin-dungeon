export const config = { runtime: 'edge' };

import { requireUser } from '../lib/auth';

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/lovense/token
 * Generates a unique mToken for the authenticated performer.
 * Now requires auth and uses the caller's own userId as modelId.
 * Prevents anyone from minting tokens for other performers.
 *
 * Body: { modelName: string }
 * Returns: { result, code, data: { mId, mToken } }
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  // Require authentication
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  const dToken = process.env.LOVENSE_DEV_TOKEN;
  if (!dToken) {
    console.error('LOVENSE_DEV_TOKEN not configured');
    return Response.json({ error: 'Lovense not configured' }, { status: 500 });
  }

  let body: { modelName?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { modelName } = body;
  if (!modelName || modelName.length > 50) {
    return Response.json(
      { error: 'modelName is required (max 50 chars)' },
      { status: 400 }
    );
  }

  // Use authenticated userId as modelId (can't mint for someone else)
  const modelId = auth.userId;

  const resp = await fetch('https://api.lovense.com/api/cam/model/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({
      dToken,
      mInfo: JSON.stringify({ mId: modelId, mName: modelName }),
    }),
  });

  const data = await resp.json();

  if (!data.result) {
    return Response.json(
      { error: data.message || 'Lovense API error', code: data.code },
      { status: 502 }
    );
  }

  return Response.json(data);
}
