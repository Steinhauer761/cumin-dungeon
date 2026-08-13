export const config = { runtime: 'edge' };

/**
 * POST /api/rooms/:roomId/sessions
 * Creates or schedules a room session for an authorized performer/moderator.
 * Stub: accepts and returns a mock session.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { startsAt?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine, means start now
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  // /api/rooms/[roomId]/sessions
  const roomId = segments[segments.length - 2];

  const session = {
    id: crypto.randomUUID(),
    roomId,
    status: body.startsAt ? 'scheduled' : 'live',
    startsAt: body.startsAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  return Response.json(session, { status: 201 });
}
