/** Lightweight Supabase REST client for Vercel Edge API routes. */
declare const process: { env: Record<string, string | undefined> };

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function makeHeaders(useServiceRole: boolean): Record<string, string> {
  const key = useServiceRole ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

function createClient(useServiceRole: boolean) {
  const headers = () => makeHeaders(useServiceRole);

  return {
    from(table: string) {
      const baseUrl = `${SUPABASE_URL}/rest/v1/${table}`;
      return {
        async select(columns = '*', filters = '') {
          const res = await fetch(
            `${baseUrl}?select=${columns}${filters ? '&' + filters : ''}`,
            { headers: headers() }
          );
          const data = await res.json();
          return { data, error: res.ok ? null : data };
        },
        async insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
          const res = await fetch(baseUrl, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(rows),
          });
          const data = await res.json();
          return { data, error: res.ok ? null : data };
        },
        async update(values: Record<string, unknown>, filter: string) {
          const res = await fetch(`${baseUrl}?${filter}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify(values),
          });
          const data = await res.json();
          return { data, error: res.ok ? null : data };
        },
        async delete(filter: string) {
          const res = await fetch(`${baseUrl}?${filter}`, {
            method: 'DELETE',
            headers: headers(),
          });
          const data = res.status === 204 ? null : await res.json();
          return { data, error: res.ok ? null : data };
        },
      };
    },
    async rpc(functionName: string, args: Record<string, unknown>) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(args),
      });
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
  };
}

/**
 * Default client using ANON key (respects RLS).
 * Use for user-facing requests where auth matters.
 */
export const supabase = createClient(false);

/**
 * Admin client using SERVICE_ROLE key (bypasses RLS).
 * Use for webhooks, background jobs, and server-to-server operations
 * where there's no user JWT (CCBill, Mux, Lovense callbacks).
 */
export const supabaseAdmin = createClient(true);
