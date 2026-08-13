export const config = { runtime: 'edge' };

/**
 * POST /api/rooms/:roomId/reports
 * Creates a report for moderation review.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { reason?: string; targetUserId?: string; details?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.reason) {
    return Response.json({ error: 'reason is required' }, { status: 400 });
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const roomId = segments[3];

  const report = {
    id: crypto.randomUUID(),
    roomId,
    reason: body.reason,
    targetUserId: body.targetUserId || null,
    details: body.details || null,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  console.info('Moderation report created', report);

  return Response.json(report, { status: 201 });
}
