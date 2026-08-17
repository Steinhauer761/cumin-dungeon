declare const process: { env: Record<string, string | undefined> };

export interface AuthUser { userId: string; email: string | null }

/** Validate a Supabase access token and return the authenticated user. */
export async function requireUser(req: Request): Promise<AuthUser | Response> {
  const authorization = req.headers.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return Response.json({ error: 'Authentication required' }, { status: 401 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${match[1]}` },
    });
    if (!response.ok) return Response.json({ error: 'Invalid or expired session' }, { status: 401 });
    const user = await response.json() as { id?: string; email?: string };
    if (!user.id) return Response.json({ error: 'Invalid session' }, { status: 401 });
    return { userId: user.id, email: user.email || null };
  } catch (error) {
    console.error('Supabase auth validation failed', error);
    return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}

/** Require a paid, active membership. */
export async function requireActiveMember(req: Request): Promise<AuthUser | Response> {
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  if (!auth.email) return Response.json({ error: 'Membership email missing' }, { status: 403 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ error: 'Membership service unavailable' }, { status: 503 });

  const filters = `email=eq.${encodeURIComponent(auth.email)}&status=eq.active&select=id&limit=1`;
  const response = await fetch(`${url}/rest/v1/members?${filters}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return Response.json({ error: 'Membership check failed' }, { status: 503 });
  const rows = await response.json() as unknown[];
  if (!rows.length) return Response.json({ error: 'Active membership required' }, { status: 403 });
  return auth;
}

export function isAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret && req.headers.get('authorization') === `Bearer ${secret}`);
}
