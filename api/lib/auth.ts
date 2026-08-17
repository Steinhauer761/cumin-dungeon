declare const process: { env: Record<string, string | undefined> };

export interface AuthUser { userId: string; email: string | null }

export async function requireUser(req: Request): Promise<AuthUser | Response> {
  const match = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  if (!match) return Response.json({ error: 'Authentication required' }, { status: 401 });
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return Response.json({ error: 'Authentication service unavailable' }, { status: 503 });
  try {
    const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey:key, Authorization:`Bearer ${match[1]}` } });
    if (!response.ok) return Response.json({ error:'Invalid or expired session' }, { status:401 });
    const user = await response.json() as { id?:string; email?:string };
    if (!user.id) return Response.json({ error:'Invalid session' }, { status:401 });
    return { userId:user.id, email:user.email || null };
  } catch (error) {
    console.error('Supabase auth validation failed', error);
    return Response.json({ error:'Authentication service unavailable' }, { status:503 });
  }
}

async function adminRows(table:string, filters:string): Promise<unknown[] | null> {
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return null;
  const response=await fetch(`${url}/rest/v1/${table}?${filters}`,{headers:{apikey:key,Authorization:`Bearer ${key}`}});
  return response.ok ? await response.json() as unknown[] : null;
}

export async function requireActiveMember(req:Request):Promise<AuthUser|Response>{
  const auth=await requireUser(req); if(auth instanceof Response)return auth;
  if(!auth.email)return Response.json({error:'Membership email missing'},{status:403});
  const rows=await adminRows('members',`email=eq.${encodeURIComponent(auth.email)}&status=eq.active&select=id&limit=1`);
  if(rows===null)return Response.json({error:'Membership service unavailable'},{status:503});
  if(!rows.length)return Response.json({error:'Active membership required'},{status:403});
  return auth;
}

export async function requirePerformer(req:Request):Promise<AuthUser|Response>{
  const auth=await requireUser(req); if(auth instanceof Response)return auth;
  const rows=await adminRows('performer_profiles',`user_id=eq.${encodeURIComponent(auth.userId)}&select=user_id&limit=1`);
  if(rows===null)return Response.json({error:'Performer service unavailable'},{status:503});
  if(!rows.length)return Response.json({error:'Approved performer account required'},{status:403});
  return auth;
}

export function isAdmin(req:Request):boolean{const secret=process.env.ADMIN_SECRET;return Boolean(secret&&req.headers.get('authorization')===`Bearer ${secret}`)}
