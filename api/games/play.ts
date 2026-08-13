export const config = { runtime: 'edge' };

/**
 * POST /api/games/play
 * Body: { "userId": "...", "gameId": "dare-roulette", "action": "spin" | "complete" | "skip" }
 * Handles game interactions. Returns the next prompt/challenge and token result.
 */

const DARES = [
  'Send your hottest selfie to the chat (face optional)',
  'Describe your wildest fantasy in under 30 words',
  'Tell the room your biggest turn-on',
  'Show something you are wearing right now',
  'Give a compliment to the last person who chatted',
  'Describe what you would do to your crush in 10 words',
  'Share your most embarrassing hookup story',
  'Rate the last 3 messages: hot, hotter, hottest',
  'Type your flirtiest pickup line',
  'Confess: what is the kinkiest thing on your bucket list',
];

const TRUTHS = [
  'What is the wildest place you have had sex?',
  'Have you ever been caught? Tell us.',
  'What is your guilty pleasure fantasy?',
  'Describe your ideal partner in bed.',
  'What turns you on that you have never told anyone?',
  'Would you rather watch or be watched?',
  'What is the longest you have gone without?',
  'Hottest thing someone has said to you?',
];

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: { userId?: string; gameId?: string; action?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId || !body.gameId || !body.action) {
    return Response.json({ error: 'userId, gameId, and action required' }, { status: 400 });
  }

  const { action, gameId } = body;

  if (action === 'spin' || action === 'next') {
    // Return a random challenge
    const pool = gameId.includes('dare') || gameId.includes('heat') ? DARES : TRUTHS;
    const challenge = pool[Math.floor(Math.random() * pool.length)];
    return Response.json({
      challenge,
      gameId,
      canSkip: true,
      skipCost: gameId.includes('heat') ? 0 : 5,
    });
  }

  if (action === 'complete') {
    // Award random tokens within game range
    const reward = Math.floor(Math.random() * 13) + 3; // 3-15
    return Response.json({
      result: 'completed',
      tokensEarned: reward,
      message: `Nice. +${reward} tokens.`,
    });
  }

  if (action === 'skip') {
    return Response.json({
      result: 'skipped',
      tokensSpent: 5,
      message: 'Skipped. -5 tokens.',
    });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
}
