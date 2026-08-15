/** Lightweight Supabase REST client for Vercel Edge API routes. */
declare const process: { env: Record<string, string | undefined> };
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const headers = (): Record<string,string> => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

export const supabase = {
  from(table: string) {
    const baseUrl = `${SUPABASE_URL}/rest/v1/${table}`;
    return {
      async select(columns='*', filters='') {
        const res = await fetch(`${baseUrl}?select=${columns}${filters ? '&'+filters : ''}`, {headers: headers()});
        const data = await res.json();
        return {data, error: res.ok ? null : data};
      },
      async insert(rows: Record<string,unknown>|Record<string,unknown>[]) {
        const res = await fetch(baseUrl, {method:'POST', headers:headers(), body:JSON.stringify(rows)});
        const data = await res.json();
        return {data, error:res.ok ? null : data};
      },
      async update(values: Record<string,unknown>, filter: string) {
        const res = await fetch(`${baseUrl}?${filter}`, {method:'PATCH', headers:headers(), body:JSON.stringify(values)});
        const data = await res.json();
        return {data, error:res.ok ? null : data};
      },
      async delete(filter:string) {
        const res = await fetch(`${baseUrl}?${filter}`, {method:'DELETE', headers:headers()});
        const data = res.status===204 ? null : await res.json();
        return {data, error:res.ok ? null : data};
      },
    };
  },
  async rpc(functionName:string, args:Record<string,unknown>) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method:'POST', headers:headers(), body:JSON.stringify(args)
    });
    const data = await res.json();
    return {data, error:res.ok ? null : data};
  }
};
