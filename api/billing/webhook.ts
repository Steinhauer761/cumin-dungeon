export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';
declare const process: { env: Record<string, string | undefined> };

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0;
}
function planFor(form: string, period: string) {
  const vip = form.toLowerCase().includes('vip'); const annual = period === '360' || period === '365';
  return { name: vip ? (annual ? 'VIP Member (Annual)' : 'VIP Member') : (annual ? 'Member (Annual)' : 'Member'), amount: vip ? (annual ? '$269.99' : '$29.99') : (annual ? '$134.99' : '$14.99'), cycle: annual ? 'year' : 'month' };
}
async function sendWelcome(email: string, plan: {name:string;amount:string;cycle:string}) {
  const key = process.env.SENDGRID_API_KEY; if (!key) return;
  const site = process.env.SITE_URL || 'https://cumindungeon.com';
  const html = `<div style="background:#0a0604;color:#f5eee4;padding:40px;font-family:Arial,sans-serif"><h1 style="color:#d59a4b">Welcome to CumIN Dungeon</h1><p>Your ${plan.name} membership is active at ${plan.amount}/${plan.cycle}.</p><p><a href="${site}/hall.html" style="background:#d59a4b;color:#0a0604;padding:14px 24px;text-decoration:none">Enter the Dungeon</a></p><small>Billing is processed by CCBill. Manage billing at https://support.ccbill.com.</small></div>`;
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', { method:'POST', headers:{ Authorization:`Bearer ${key}`,'Content-Type':'application/json' }, body:JSON.stringify({ personalizations:[{to:[{email}]}], from:{email:'welcome@cumindungeon.com',name:'CumIN Dungeon'}, subject:'Welcome to CumIN Dungeon', content:[{type:'text/html',value:html}] }) });
  if (!res.ok) console.error('SendGrid failed', res.status, await res.text());
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error:'Method not allowed' }, { status:405 });
  const configured = process.env.CCBILL_WEBHOOK_SECRET;
  if (!configured) return Response.json({ error:'Webhook not configured' }, { status:503 });
  const supplied = new URL(req.url).searchParams.get('secret') || req.headers.get('x-ccbill-webhook-secret') || '';
  if (!safeEqual(supplied, configured)) return Response.json({ error:'Unauthorized' }, { status:401 });

  const type = req.headers.get('content-type') || ''; let params: Record<string,string> = {};
  if (type.includes('application/json')) params = await req.json();
  else if (type.includes('application/x-www-form-urlencoded')) new URLSearchParams(await req.text()).forEach((v,k)=>params[k]=v);
  else return Response.json({ error:'Unsupported content type' }, { status:400 });

  const event = params.eventType || params.EventType || '';
  const email = params.email || params.customer_email || params.Email || '';
  const subscriptionId = params.subscription_id || params.subscriptionId || params.Subscription_ID || '';
  if (!subscriptionId) return Response.json({ error:'subscription id required' }, { status:400 });

  if (event === 'NewSaleSuccess' || event === 'newSaleSuccess') {
    if (!email) return Response.json({ error:'email required' }, { status:400 });
    const plan = planFor(params.formName || params.FormName || '', params.recurringPeriod || params.RecurringPeriod || '30');
    await supabaseAdmin.from('members').delete(`subscription_id=eq.${encodeURIComponent(subscriptionId)}`);
    const result = await supabaseAdmin.from('members').insert({ email, subscription_id:subscriptionId, plan:plan.name, status:'active', created_at:new Date().toISOString() });
    if (result.error) return Response.json({ error:'Membership write failed' }, { status:500 });
    await sendWelcome(email, plan);
    return Response.json({ received:true, action:'welcome_sent' });
  }
  const status = event.toLowerCase().includes('chargeback') ? 'suspended' : event.toLowerCase().includes('cancel') ? 'cancelled' : event.toLowerCase().includes('renewal') ? 'active' : null;
  if (status) await supabaseAdmin.from('members').update({ status }, `subscription_id=eq.${encodeURIComponent(subscriptionId)}`);
  return Response.json({ received:true, action:status || 'ignored' });
}
