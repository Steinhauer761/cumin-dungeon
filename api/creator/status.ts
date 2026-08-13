export const config = { runtime: 'edge' };

/**
 * GET /api/creator/status?email=performer@email.com
 * Performer checks their application status.
 */
export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'email parameter required' }, { status: 400 });
  }

  // Stub: return pending status
  return Response.json({
    email,
    status: 'pending',
    message: 'Your application is being reviewed. You will be notified when approved.',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  });
}
