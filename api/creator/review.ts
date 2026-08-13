export const config = { runtime: 'edge' };

/**
 * POST /api/creator/review
 * Body: { "applicationId": "...", "decision": "approved" | "rejected", "reason": "..." }
 *
 * Admin (Jay) reviews a performer application.
 * Approved = they can go live.
 * Rejected = they get a reason and can reapply.
 */

declare const process: { env: Record<string, string | undefined> };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Simple admin auth check (in production, use proper auth)
  const authHeader = req.headers.get('authorization');
  const adminKey = process.env.ADMIN_SECRET;
  if (adminKey && authHeader !== `Bearer ${adminKey}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { applicationId?: string; decision?: string; reason?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.applicationId || !body.decision) {
    return Response.json({ error: 'applicationId and decision required' }, { status: 400 });
  }

  if (body.decision !== 'approved' && body.decision !== 'rejected') {
    return Response.json({ error: 'decision must be approved or rejected' }, { status: 400 });
  }

  const review = {
    applicationId: body.applicationId,
    decision: body.decision,
    reason: body.reason || null,
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'admin',
  };

  console.info('Application reviewed', review);

  return Response.json({
    ...review,
    message: body.decision === 'approved'
      ? 'Performer approved. They can now go live.'
      : `Performer rejected. Reason: ${body.reason || 'Not specified'}`,
  });
}
