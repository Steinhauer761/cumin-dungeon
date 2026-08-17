export const config = { runtime: 'edge' };

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * POST /api/lovense/token
 * Generates a unique mToken for a performer.
 * Call once per performer, store the mToken in their Supabase profile.
 *
 * Body: { modelId: string, modelName: string }
 * Returns: { result, code, data: { mId, mToken } }
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  const dToken = process.env.LOVENSE_DEV_TOKEN;
  if (!dToken) {
    console.error('LOVENSE_DEV_TOKEN not configured');
    return Response.json({ error: 'Lovense not configured' }, { status: 500 });
  }

  let body: { modelId?: string; modelName?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { modelId, modelName } = body;
  if (!modelId || !modelName) {
    return Response.json(
      { error: 'modelId and modelName are required' },
      { status: 400 }
    );
  }

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
