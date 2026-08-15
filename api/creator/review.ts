import { isAdmin } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  if (!isAdmin(req)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { applicationId?: string; decision?: string; reason?: string } = {};
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const applicationId = body.applicationId?.trim();
  const decision = body.decision;
  const reason = body.reason?.trim() || null;
  if (!applicationId || applicationId.length > 100) return Response.json({ error: 'applicationId required' }, { status: 400 });
  if (decision !== 'approved' && decision !== 'rejected') return Response.json({ error: 'decision must be approved or rejected' }, { status: 400 });
  if (reason && reason.length > 1000) return Response.json({ error: 'reason must be 1000 characters or fewer' }, { status: 400 });

  // The old endpoint claimed to review an application but never persisted it.
  // Fail closed until the creator-application table is connected.
  return Response.json({
    error: 'Creator application review is unavailable until application persistence is connected to the database.',
    applicationId,
    decision,
  }, { status: 503 });
}
