export const config = { runtime: 'edge' };

import { supabase } from '../lib/supabase';

declare const process: { env: Record<string, string | undefined> };

/**
 * POST /api/billing/webhook
 * CCBill posts here on subscription events (NewSaleSuccess, RenewalSuccess, Cancellation, etc.)
 *
 * Set this URL in your CCBill admin:
 *   https://cumindungeon.com/api/billing/webhook
 *
 * Env vars:
 *   CCBILL_SALT - for digest verification
 *   SENDGRID_API_KEY - for sending welcome emails (or use any SMTP relay)
 *   SITE_URL - base URL (https://cumindungeon.com)
 */

const PLANS: Record<string, { name: string; amount: string; cycle: string }> = {
  // Map your CCBill subaccount/form IDs to plan names
  // Update these with your actual CCBill form period IDs
  'member_monthly': { name: 'Member', amount: '$14.99', cycle: 'month' },
  'member_annual': { name: 'Member (Annual)', amount: '$134.99', cycle: 'year' },
  'vip_monthly': { name: 'VIP Member', amount: '$29.99', cycle: 'month' },
  'vip_annual': { name: 'VIP Member (Annual)', amount: '$269.99', cycle: 'year' },
};

function getPlanFromForm(formName: string, recurringPeriod: string): { name: string; amount: string; cycle: string } {
  // Match based on CCBill form/pricing data
  if (recurringPeriod === '365' || recurringPeriod === '360') {
    if (formName.includes('vip')) return PLANS.vip_annual;
    return PLANS.member_annual;
  }
  if (formName.includes('vip')) return PLANS.vip_monthly;
  return PLANS.member_monthly;
}

function calculateRenewalDate(cycle: string): string {
  const now = new Date();
  if (cycle === 'year') {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function sendWelcomeEmail(email: string, plan: { name: string; amount: string; cycle: string }): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Billing] SENDGRID_API_KEY not set, skipping welcome email');
    return;
  }

  const siteUrl = process.env.SITE_URL || 'https://cumindungeon.com';
  const renewalDate = calculateRenewalDate(plan.cycle);

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background-color:#0a0604;font-family:'Georgia','Times New Roman',serif;">
<div style="display:none;font-size:1px;color:#0a0604;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your membership is active. The castle awaits.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0604;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#110d0a;border-radius:12px;overflow:hidden;">
  <tr><td style="height:3px;background:linear-gradient(90deg,#8b6914,#d59a4b,#f5c77e,#d59a4b,#8b6914);"></td></tr>
  <tr><td style="padding:40px 40px 24px;text-align:center;">
    <p style="margin:0;font-family:'Georgia',serif;font-size:13px;letter-spacing:0.15em;color:#d59a4b;text-transform:uppercase;">Welcome to</p>
    <h1 style="margin:8px 0 0;font-family:'Georgia',serif;font-size:32px;font-weight:normal;font-style:italic;color:#f5eee4;line-height:1.2;">CumIN Dungeon</h1>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#2a2218;"></div></td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;color:#c4b8aa;">Your membership is confirmed. You now have full access to the venue: live rooms, social games, the casino floor, and everything inside.</p>
    <p style="margin:0 0 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;color:#c4b8aa;">Here's what to do first:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td width="36" valign="top" style="padding-bottom:20px;"><div style="width:32px;height:32px;border-radius:50%;background-color:#1e1812;border:1px solid #3d3222;text-align:center;line-height:32px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:700;color:#d59a4b;">1</div></td><td style="padding:4px 0 20px 12px;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#a6998b;"><strong style="color:#f5eee4;">Enter the Grand Hall.</strong> See who's live, chat with members, explore the rooms.</td></tr>
      <tr><td width="36" valign="top" style="padding-bottom:20px;"><div style="width:32px;height:32px;border-radius:50%;background-color:#1e1812;border:1px solid #3d3222;text-align:center;line-height:32px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:700;color:#d59a4b;">2</div></td><td style="padding:4px 0 20px 12px;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#a6998b;"><strong style="color:#f5eee4;">Pick a room.</strong> Each one has its own vibe. Find your favourite performer or discover someone new.</td></tr>
      <tr><td width="36" valign="top" style="padding-bottom:20px;"><div style="width:32px;height:32px;border-radius:50%;background-color:#1e1812;border:1px solid #3d3222;text-align:center;line-height:32px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:700;color:#d59a4b;">3</div></td><td style="padding:4px 0 20px 12px;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#a6998b;"><strong style="color:#f5eee4;">Send a gift or tip.</strong> Performers feel your tokens in real-time. The bigger the tip, the bigger the reaction.</td></tr>
      <tr><td width="36" valign="top"><div style="width:32px;height:32px;border-radius:50%;background-color:#1e1812;border:1px solid #3d3222;text-align:center;line-height:32px;font-family:-apple-system,sans-serif;font-size:13px;font-weight:700;color:#d59a4b;">4</div></td><td style="padding:4px 0 0 12px;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#a6998b;"><strong style="color:#f5eee4;">Hit the casino.</strong> Spin tokens on slots, roulette, blackjack, and more.</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:8px 40px 40px;text-align:center;"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="border-radius:8px;background:linear-gradient(135deg,#d59a4b,#b8802e);"><a href="${siteUrl}/hall.html" target="_blank" style="display:inline-block;padding:16px 40px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:700;color:#0a0604;text-decoration:none;">Enter the Dungeon</a></td></tr></table></td></tr>
  <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#2a2218;"></div></td></tr>
  <tr><td style="padding:28px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="font-family:-apple-system,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b5f53;padding-bottom:12px;">Your Membership</td></tr>
      <tr><td style="padding-bottom:6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family:-apple-system,sans-serif;font-size:13px;color:#a6998b;">Plan</td><td align="right" style="font-family:-apple-system,sans-serif;font-size:13px;color:#f5eee4;font-weight:600;">${plan.name}</td></tr></table></td></tr>
      <tr><td style="padding-bottom:6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family:-apple-system,sans-serif;font-size:13px;color:#a6998b;">Billing</td><td align="right" style="font-family:-apple-system,sans-serif;font-size:13px;color:#f5eee4;font-weight:600;">${plan.amount}/${plan.cycle}</td></tr></table></td></tr>
      <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family:-apple-system,sans-serif;font-size:13px;color:#a6998b;">Next renewal</td><td align="right" style="font-family:-apple-system,sans-serif;font-size:13px;color:#f5eee4;font-weight:600;">${renewalDate}</td></tr></table></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#2a2218;"></div></td></tr>
  <tr><td style="padding:24px 40px 32px;text-align:center;">
    <p style="margin:0 0 8px;font-family:-apple-system,sans-serif;font-size:11px;color:#6b5f53;line-height:1.6;">This email confirms your subscription via CCBill. Your statement will show <strong style="color:#a6998b;">CCBill.com*CumINDungeon</strong>.</p>
    <p style="margin:0 0 12px;font-family:-apple-system,sans-serif;font-size:11px;color:#6b5f53;line-height:1.6;">To manage your subscription, visit your <a href="https://support.ccbill.com" style="color:#d59a4b;text-decoration:underline;">CCBill account</a>.</p>
    <p style="margin:0;font-family:-apple-system,sans-serif;font-size:10px;color:#4a4038;">CumIN Dungeon &middot; cumindungeon.com</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'welcome@cumindungeon.com', name: 'CumIN Dungeon' },
        subject: 'Welcome to the Dungeon \u2727',
        content: [{ type: 'text/html', value: htmlBody }],
      }),
    });
    console.info('[Billing] Welcome email sent to', email);
  } catch (err) {
    console.error('[Billing] Email send failed:', err);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // CCBill posts form-encoded data
  const contentType = req.headers.get('content-type') || '';
  let params: Record<string, string> = {};

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const urlParams = new URLSearchParams(text);
    urlParams.forEach((value, key) => { params[key] = value; });
  } else if (contentType.includes('application/json')) {
    params = await req.json() as Record<string, string>;
  } else {
    return Response.json({ error: 'Unsupported content type' }, { status: 400 });
  }

  const eventType = params.eventType || params.EventType || '';
  const email = params.email || params.customer_email || params.Email || '';
  const subscriptionId = params.subscription_id || params.subscriptionId || params.Subscription_ID || '';
  const formName = (params.formName || params.FormName || '').toLowerCase();
  const recurringPeriod = params.recurringPeriod || params.RecurringPeriod || '30';

  console.info('[CCBill Webhook]', { eventType, email, subscriptionId });

  // Handle new sale
  if (eventType === 'NewSaleSuccess' || eventType === 'newSaleSuccess' || !eventType) {
    if (!email) {
      console.warn('[CCBill] No email in webhook payload');
      return Response.json({ received: true, warning: 'no email' });
    }

    const plan = getPlanFromForm(formName, recurringPeriod);

    // Create/update member in Supabase
    await supabase.from('members').insert({
      email,
      subscription_id: subscriptionId,
      plan: plan.name,
      status: 'active',
      created_at: new Date().toISOString(),
    });

    // Send welcome email
    await sendWelcomeEmail(email, plan);

    return Response.json({ received: true, action: 'welcome_sent' });
  }

  // Handle renewal
  if (eventType === 'RenewalSuccess' || eventType === 'renewalSuccess') {
    if (subscriptionId) {
      await supabase.from('members').update(
        { status: 'active', renewed_at: new Date().toISOString() },
        `subscription_id=eq.${subscriptionId}`
      );
    }
    return Response.json({ received: true, action: 'renewal_recorded' });
  }

  // Handle cancellation
  if (eventType === 'Cancellation' || eventType === 'cancellation') {
    if (subscriptionId) {
      await supabase.from('members').update(
        { status: 'cancelled', cancelled_at: new Date().toISOString() },
        `subscription_id=eq.${subscriptionId}`
      );
    }
    return Response.json({ received: true, action: 'cancellation_recorded' });
  }

  // Handle chargeback
  if (eventType === 'Chargeback' || eventType === 'chargeback') {
    if (subscriptionId) {
      await supabase.from('members').update(
        { status: 'suspended', chargeback_at: new Date().toISOString() },
        `subscription_id=eq.${subscriptionId}`
      );
    }
    console.warn('[CCBill] CHARGEBACK:', { email, subscriptionId });
    return Response.json({ received: true, action: 'chargeback_flagged' });
  }

  return Response.json({ received: true, action: 'unhandled_event', eventType });
}
