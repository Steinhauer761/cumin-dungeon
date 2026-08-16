import { supabase } from '../lib/supabase';
import { requireUser } from '../lib/auth';
export const config = { runtime: 'edge' };

type Body = { gameId?: string; bet?: number; choice?: string };
const rand = (n: number) => Math.floor(Math.random() * n);

// Entertainment-token games. Outcomes are independent and use transparent,
// fixed payout tables. Small wins are intentionally common; jackpots remain rare.
function outcome(game: string, choice: string) {
  if (game === 'roulette') {
    const n = rand(37);
    const red = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
    const win = (choice === 'red' && red) || (choice === 'black' && !red && n > 0) ||
      (choice === 'odd' && n % 2 === 1) || (choice === 'even' && n > 0 && n % 2 === 0) ||
      (choice === 'low' && n >= 1 && n <= 18) || (choice === 'high' && n >= 19 && n <= 36) ||
      (choice === 'dozen1' && n >= 1 && n <= 12) || (choice === 'dozen2' && n >= 13 && n <= 24) ||
      (choice === 'dozen3' && n >= 25 && n <= 36) || (choice === 'zero' && n === 0);
    const multiplier = ['dozen1','dozen2','dozen3'].includes(choice) ? 3 : choice === 'zero' ? 36 : 2;
    return { win, payoutMultiplier: win ? multiplier : 0, label: String(n) };
  }

  if (game === 'blackjack') {
    // Weighted totals approximate the natural distribution of two-card blackjack
    // without pretending that a random integer from 2-21 is a real deal.
    const totals = [12,13,14,15,16,17,18,19,20,21];
    const weights = [4,5,6,7,8,9,10,10,9,5];
    const drawTotal = () => { let x = Math.random() * weights.reduce((a,b)=>a+b,0); for (let i=0;i<weights.length;i++){ x -= weights[i]; if(x < 0) return totals[i]; } return 21; };
    const p = drawTotal(), d = drawTotal(), blackjack = p === 21 && d !== 21, push = p === d;
    const win = !push && (blackjack || p > d || d > 21);
    return { win, payoutMultiplier: push ? 1 : win ? (blackjack ? 2.5 : 2) : 0, label: `PLAYER ${p} · DEALER ${d}` };
  }

  if (game === 'dice') {
    const a = 1 + rand(6), b = 1 + rand(6), sum = a + b;
    const win = (choice === 'over' && sum > 7) || (choice === 'under' && sum < 7) || (choice === 'seven' && sum === 7) ||
      (choice === 'double' && a === b) || (choice === 'snake' && a === 1 && b === 1) || (choice === 'box' && a === 6 && b === 6);
    const m = ['snake','box'].includes(choice) ? 32 : choice === 'seven' ? 6 : choice === 'double' ? 5.5 : 2.25;
    return { win, payoutMultiplier: win ? m : 0, label: `${a} + ${b} = ${sum}` };
  }

  if (game === 'highlow') {
    const previous = 7, n = 1 + rand(13);
    const win = (choice === 'high' && n > previous) || (choice === 'low' && n < previous) || (choice === 'same' && n === previous);
    return { win, payoutMultiplier: win ? (choice === 'same' ? 10 : 2.05) : 0, label: `${n} vs ${previous}` };
  }

  if (game === 'kinkwheel') {
    const values = [0,1,1,1,1,1,1,2], v = values[rand(values.length)];
    return { win: v > 0, payoutMultiplier: v, label: v ? `${v}x` : 'LOSE' };
  }

  // Dungeon Slots: frequent small wins, with the larger symbols reserved for rare hits.
  const symbols = ['7','◆','★','♠','♥','♦','♣'];
  const weights = [3,9,10,21,22,19,16];
  const pick = () => { let x = Math.random() * 100; for (let i = 0; i < weights.length; i++) { x -= weights[i]; if (x < 0) return symbols[i]; } return '7'; };
  let best = 0, scatters = 0;
  for (let row = 0; row < 3; row++) {
    const line = Array.from({ length: 5 }, pick);
    scatters += line.filter(x => x === '★').length;
    const base = line.find(x => x !== '★');
    if (base && line.every(x => x === base || x === '★')) best = Math.max(best, ({'7':25,'◆':10,'★':8,'♠':6,'♥':5,'♦':4,'♣':4}[base] || 2));
  }
  if (scatters >= 3) best = Math.max(best, 12);
  return { win: best > 0, payoutMultiplier: best, label: best ? `${best}x PAYLINE` : 'NO WIN' };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const auth = await requireUser(req);
  if (auth instanceof Response) return auth;
  let body: Body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const gameId = body.gameId?.trim();
  const choice = body.choice?.trim() || 'red';
  const rawBet = body.bet;
  if (!gameId || gameId.length > 40 || !Number.isInteger(rawBet) || rawBet < 5 || rawBet > 100) {
    return Response.json({ error: 'gameId and integer bet 5-100 required' }, { status: 400 });
  }
  const bet = rawBet as number;
  const roundId = crypto.randomUUID();
  const o = outcome(gameId, choice);
  const payout = o.win ? Math.floor(bet * o.payoutMultiplier) : 0;
  const { data, error } = await supabase.rpc('play_token_game', {
    p_user_id: auth.userId, p_round_id: roundId, p_game_id: gameId, p_bet: bet, p_payout: payout
  });
  if (error) return Response.json({ error: 'Token transaction failed' }, { status: 500 });
  return Response.json({ roundId, gameId, bet, payout, balance: Number(data?.balance ?? 0), win: o.win, label: o.label, multiplier: o.payoutMultiplier });
}
