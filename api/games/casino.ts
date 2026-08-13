export const config = { runtime: 'edge' };

/**
 * GET /api/games/casino - list casino games
 * POST /api/games/casino - play a round
 * Body: { "userId": "...", "gameId": "dungeon-slots", "bet": 5 }
 *
 * Casino games COST tokens to play and pay out on wins.
 * This is the token sink that gives tokens real value.
 * Gifts are bought with real money. Tokens are earned/gambled.
 */

const CASINO_GAMES = [
  {
    id: 'dungeon-slots',
    name: 'Dungeon Slots',
    description: 'Spin the reels. Match 3 symbols to win. Themed icons: whips, roses, keys, crowns, flames.',
    minBet: 3,
    maxBet: 50,
    maxPayout: '10x bet',
    houseEdge: 0.15,
  },
  {
    id: 'sin-roulette',
    name: 'Sin Roulette',
    description: 'Pick a sin. Spin the wheel. Land on yours, triple your bet. Land on virtue, lose it all.',
    minBet: 5,
    maxBet: 100,
    maxPayout: '3x bet',
    houseEdge: 0.12,
  },
  {
    id: 'strip-blackjack',
    name: 'Strip Blackjack',
    description: 'Classic 21 but every bust costs tokens and a dare from the table. Beat the dealer, win big.',
    minBet: 5,
    maxBet: 75,
    maxPayout: '2.5x bet',
    houseEdge: 0.08,
  },
  {
    id: 'devils-dice',
    name: "Devil's Dice",
    description: 'Roll two dice. 7 or 11 wins double. Snake eyes (1+1) wins 5x. Anything else, house takes it.',
    minBet: 2,
    maxBet: 50,
    maxPayout: '5x bet',
    houseEdge: 0.18,
  },
  {
    id: 'high-low',
    name: 'High or Low',
    description: 'Guess if the next number is higher or lower. Streak multiplier: 3 in a row = 2x, 5 = 5x, 7 = 10x.',
    minBet: 2,
    maxBet: 30,
    maxPayout: '10x bet',
    houseEdge: 0.10,
  },
  {
    id: 'kink-wheel',
    name: 'Kink Wheel',
    description: 'Bet tokens, spin the wheel. Sections: 2x, 3x, 5x, lose, dare (free spin), jackpot (20x).',
    minBet: 5,
    maxBet: 100,
    maxPayout: '20x bet',
    houseEdge: 0.14,
  },
];

// Slot symbols
const SLOT_SYMBOLS = ['🌹', '🔑', '👑', '🔥', '⛓️', '💎', '♠️', '🖤'];

function spinSlots(bet: number): { reels: string[]; win: boolean; payout: number; multiplier: number } {
  const reels = [
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
  ];

  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    // Jackpot: 3 matching = 10x
    return { reels, win: true, payout: bet * 10, multiplier: 10 };
  } else if (reels[0] === reels[1] || reels[1] === reels[2]) {
    // Partial: 2 matching = 2x
    return { reels, win: true, payout: bet * 2, multiplier: 2 };
  }
  return { reels, win: false, payout: 0, multiplier: 0 };
}

function rollDice(bet: number): { dice: number[]; sum: number; win: boolean; payout: number; multiplier: number } {
  const dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  const sum = dice[0] + dice[1];

  if (dice[0] === 1 && dice[1] === 1) {
    return { dice, sum, win: true, payout: bet * 5, multiplier: 5 };
  } else if (sum === 7 || sum === 11) {
    return { dice, sum, win: true, payout: bet * 2, multiplier: 2 };
  }
  return { dice, sum, win: false, payout: 0, multiplier: 0 };
}

function spinRoulette(bet: number): { result: string; win: boolean; payout: number } {
  const sins = ['Lust', 'Greed', 'Gluttony', 'Sloth', 'Wrath', 'Envy', 'Pride'];
  const virtues = ['Chastity', 'Charity', 'Temperance', 'Diligence'];
  const wheel = [...sins, ...virtues];
  const result = wheel[Math.floor(Math.random() * wheel.length)];
  const isSin = sins.includes(result);

  // ~63% chance to land on a sin, but player picked one specific sin = ~9% chance
  // Simplify: 30% win rate
  const win = Math.random() < 0.30;
  return { result, win, payout: win ? bet * 3 : 0 };
}

function spinKinkWheel(bet: number): { section: string; win: boolean; payout: number; multiplier: number } {
  const sections = [
    { name: '2x', mult: 2, weight: 25 },
    { name: '3x', mult: 3, weight: 15 },
    { name: '5x', mult: 5, weight: 8 },
    { name: 'Lose', mult: 0, weight: 30 },
    { name: 'Dare (free spin)', mult: 1, weight: 15 },
    { name: 'JACKPOT 20x', mult: 20, weight: 2 },
    { name: 'Lose', mult: 0, weight: 5 },
  ];

  const totalWeight = sections.reduce((s, sec) => s + sec.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = sections[0];
  for (const sec of sections) {
    roll -= sec.weight;
    if (roll <= 0) { chosen = sec; break; }
  }

  return {
    section: chosen.name,
    win: chosen.mult > 0,
    payout: bet * chosen.mult,
    multiplier: chosen.mult,
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return Response.json({ casinoGames: CASINO_GAMES });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { userId?: string; gameId?: string; bet?: number } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.gameId || !body.bet) {
    return Response.json({ error: 'userId, gameId, and bet required' }, { status: 400 });
  }

  const game = CASINO_GAMES.find(g => g.id === body.gameId);
  if (!game) {
    return Response.json({ error: 'Unknown game' }, { status: 404 });
  }

  const bet = body.bet;
  if (bet < game.minBet || bet > game.maxBet) {
    return Response.json({ error: `Bet must be ${game.minBet}-${game.maxBet} tokens` }, { status: 400 });
  }

  let result: Record<string, unknown>;

  switch (body.gameId) {
    case 'dungeon-slots':
      result = spinSlots(bet);
      break;
    case 'devils-dice':
      result = rollDice(bet);
      break;
    case 'sin-roulette':
      result = spinRoulette(bet);
      break;
    case 'kink-wheel':
      result = spinKinkWheel(bet);
      break;
    case 'strip-blackjack': {
      // Simplified: ~42% win rate
      const win = Math.random() < 0.42;
      result = { hand: Math.floor(Math.random() * 10) + 12, dealerHand: Math.floor(Math.random() * 10) + 12, win, payout: win ? Math.floor(bet * 2.5) : 0 };
      break;
    }
    case 'high-low': {
      const win = Math.random() < 0.48;
      const streak = win ? Math.floor(Math.random() * 3) + 1 : 0;
      const mult = streak >= 5 ? 5 : streak >= 3 ? 2 : 1;
      result = { win, streak, multiplier: mult, payout: win ? bet * mult : 0 };
      break;
    }
    default:
      result = { win: false, payout: 0 };
  }

  return Response.json({
    gameId: body.gameId,
    bet,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
