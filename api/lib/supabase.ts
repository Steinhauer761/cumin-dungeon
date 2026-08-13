/**
 * Supabase client for Edge Functions.
 * Import this in any API route to query the database.
 *
 * Usage:
 *   import { supabase } from '../lib/supabase';
 *   const { data } = await supabase.from('rooms').select('*');
 */

declare const process: { env: Record<string, string | undefined> };

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

/**
 * Lightweight Supabase REST client for Edge Runtime.
 * We don't use the full SDK to avoid Node.js dependencies.
 * This uses Supabase's PostgREST API directly.
 */
export const supabase = {
  from(table: string) {
    const baseUrl = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers: Record<string, string> = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    return {
      async select(columns = '*', filters = '') {
        const url = `${baseUrl}?select=${columns}${filters ? '&' + filters : ''}`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async update(values: Record<string, unknown>, filter: string) {
        const url = `${baseUrl}?${filter}`;
        const res = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(values),
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async delete(filter: string) {
        const url = `${baseUrl}?${filter}`;
        const res = await fetch(url, { method: 'DELETE', headers });
        const data = res.status === 204 ? null : await res.json();
        return { data, error: res.ok ? null : data };
      },
    };
  },
};
