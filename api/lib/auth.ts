declare const process: { env: Record<string, string | undefined> };

/** Validate a Supabase access token and return its user id. */
export async function requireUser(req: Request): Promise<{ userId: string } | Response> {
  const authorization = req.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    console.error('Supabase auth environment is not configured');
    return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${match[1]}`,
      },
    });

    if (!response.ok) {
      return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await response.json() as { id?: string };
    if (!user.id) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    return { userId: user.id };
  } catch (error) {
    console.error('Supabase auth validation failed', error);
    return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}

export function isAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  const authorization = req.headers.get('authorization') || '';
  return Boolean(secret && authorization === `Bearer ${secret}`);
}
