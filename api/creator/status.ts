import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  // The previous endpoint returned a fabricated application status for any
  // email address. Do not expose or invent creator verification state until
  // applications are persisted in the database.
  return Response.json({
    error: 'Creator application status is unavailable until application persistence is connected.',
    userId: auth.userId,
  }, { status: 503 });
}
