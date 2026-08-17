import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/auth';

export const config = { runtime: 'edge' };

declare const process: {
  env: Record<string, string | undefined>;
};

const GIFTS = [
  { id:'whisper',name:'Whisper',emoji:'💬',cost:5 }, { id:'wink',name:'Wink',emoji:'😉',cost:10 },
  { id:'rose',name:'Rose',emoji:'🌹',cost:25 }, { id:'flame',name:'Flame',emoji:'🔥',cost:50 },
  { id:'silk',name:'Silk',emoji:'🧵',cost:75 }, { id:'dungeon-key',name:'Dungeon Key',emoji:'🔑',cost:100 },
  { id:'black-rose',name:'Black Rose',emoji:'🥀',cost:150 }, { id:'velvet-kiss',name:'Velvet Kiss',emoji:'💋',cost:200 },
  { id:'crown',name:'Crown',emoji:'👑',cost:300 }, { id:'throne',name:'Throne',emoji:'🪑',cost:400 },
  { id:'dark-heart',name:'Dark Heart',emoji:'🖤',cost:600 }, { id:'dragons-blessing',name:"Dragon's Blessing",emoji:'🐉',cost:1000 },
];

/**
 * Trigger Lovense toy via server API after a successful tip.
 * Non-blocking: we fire-and-forget so tips aren't delayed by toy latency.
 */
async function triggerLovenseToy(recipientId: string, _tipperName: string, amount: number): Promise<void> {
  const token = process.env.LOVENSE_DEV_TOKEN;
  if (!token) return;

  // Look up performer's Lovense UID from Supabase
  const { data: rows } = await supabase
    .from('performer_profiles')
    .select('lovense_uid', `user_id=eq.${recipientId}`);

  const performer = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!performer?.lovense_uid) return;

  const strength = Math.min(20, Math.max(1, Math.ceil(amount / 5)));
  const duration = Math.min(30, Math.max(3, Math.ceil(amount / 3)));

  try {
    await fetch('https://api.lovense.com/api/lan/v2/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        uid: performer.lovense_uid,
        command: 'Function',
        action: `Vibrate:${strength}`,
        timeSec: duration,
        apiVer: 1,
      }),
    });
  } catch (err) {
    console.error('[Lovense] Command failed:', err);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') return Response.json({ gifts: GIFTS });
  if (req.method !== 'POST') return Response.json({ error:'Method not allowed' }, { status:405 });

  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;

  let body: { type?:string; giftId?:string; amount?:number; recipientId?:string; tipperName?:string };
  try { body = await req.json(); } catch { return Response.json({error:'Invalid JSON'}, {status:400}); }

  const { type, giftId, recipientId, tipperName } = body;
  const amount = body.amount;
  if (!recipientId || (type !== 'tip' && type !== 'gift')) return Response.json({error:'recipientId and valid type required'}, {status:400});
  if (auth.userId === recipientId) return Response.json({error:'Cannot send tokens to yourself'}, {status:400});

  let cost = amount || 0;
  let gift: typeof GIFTS[number] | undefined;
  if (type === 'gift') {
    if (!giftId) return Response.json({error:'giftId required'}, {status:400});
    gift = GIFTS.find(g => g.id === giftId);
    if (!gift) return Response.json({error:'Unknown gift'}, {status:404});
    cost = gift.cost;
  }

  if (!Number.isInteger(cost) || cost < 1 || cost > 10000) return Response.json({error:'Invalid token amount'}, {status:400});

  const result = await supabase.rpc('transfer_tokens', {
    p_sender_id:auth.userId,
    p_recipient_id:recipientId,
    p_amount:cost,
    p_source:type === 'gift' ? `gift:${gift!.id}` : 'tip',
  });

  if (result.error) {
    const message = typeof result.error === 'object' && result.error?.message ? result.error.message : 'Token transfer failed';
    return Response.json({error: message}, {status:400});
  }

  // Fire-and-forget: trigger Lovense toy vibration on successful tip/gift
  const displayName = tipperName || 'Anonymous';
  triggerLovenseToy(recipientId, displayName, cost).catch(() => {});

  return Response.json({sent:true,type,amount:cost,recipientId,gift:gift?.name || null,emoji:gift?.emoji || null,balance:result.data?.senderBalance ?? null}, {status:201});
}
