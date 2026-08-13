export const config = { runtime: 'edge' };

/**
 * GET /api/games
 * Returns available Grand Hall games.
 */

const GAMES = [
  {
    id: 'dare-roulette',
    name: 'Dare Roulette',
    description: 'Spin the wheel, get a dare. Complete it for tokens. Skip costs tokens.',
    tokenReward: { min: 3, max: 15 },
    skipCost: 5,
    type: 'solo',
    category: 'dare',
  },
  {
    id: 'truth-or-strip',
    name: 'Truth or Strip',
    description: 'Answer honestly or lose a layer. Other players vote if your answer counts.',
    tokenReward: { min: 5, max: 10 },
    skipCost: 3,
    type: 'multiplayer',
    category: 'social',
  },
  {
    id: 'hot-seat',
    name: 'Hot Seat',
    description: 'One person in the spotlight. The hall asks questions. Survive 5 rounds, win big.',
    tokenReward: { min: 10, max: 25 },
    skipCost: 0,
    type: 'spotlight',
    category: 'social',
  },
  {
    id: 'fantasy-match',
    name: 'Fantasy Match',
    description: 'Describe your fantasy anonymously. Get matched with someone who likes it.',
    tokenReward: { min: 5, max: 8 },
    skipCost: 2,
    type: 'matching',
    category: 'connection',
  },
  {
    id: 'kings-cup-dungeon',
    name: "King's Cup: Dungeon Edition",
    description: 'Draw a card, follow the rule. Classic drinking game but make it filthy.',
    tokenReward: { min: 2, max: 8 },
    skipCost: 3,
    type: 'multiplayer',
    category: 'party',
  },
  {
    id: 'confession-booth',
    name: 'Confession Booth',
    description: 'Share a secret anonymously. The hall votes: hot or not. Hot confessions earn tokens.',
    tokenReward: { min: 3, max: 12 },
    skipCost: 0,
    type: 'anonymous',
    category: 'social',
  },
  {
    id: 'strip-trivia',
    name: 'Strip Trivia',
    description: 'Get it wrong, lose a layer. Get it right, earn tokens. Topics are adults-only.',
    tokenReward: { min: 5, max: 15 },
    skipCost: 5,
    type: 'multiplayer',
    category: 'trivia',
  },
  {
    id: 'heat-ladder',
    name: 'Heat Ladder',
    description: 'Escalating challenges. Each rung gets spicier. Bail anytime but keep what you earned.',
    tokenReward: { min: 2, max: 25 },
    skipCost: 0,
    type: 'solo',
    category: 'dare',
  },
];

export default function handler(req: Request): Response {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return Response.json({ games: GAMES });
}
