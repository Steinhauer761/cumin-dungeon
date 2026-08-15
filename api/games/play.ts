export const config = { runtime: 'edge' };

const CHALLENGES: Record<string, string[]> = {
  'dare-roulette': ['Give your best villain entrance for 10 seconds.','Pick a room and explain why you would survive there.','Tell the hall your most ridiculous guilty pleasure.'],
  'truth-or-strip': ['What is one thing you would never admit on a first date?','What instantly makes someone more attractive to you?','What is your most embarrassing flirt attempt?'],
  'hot-seat': ['The hall gets one question. Answer honestly.','You are in the spotlight. Give the room one confession.','Survive the round: tell the truth or take the skip.'],
  'fantasy-match': ['Describe a fantasy in three words.','Name the vibe you would want for a perfect night.','Pick: candlelight, neon, velvet, or chaos.'],
  'kings-cup-dungeon': ['Draw the imaginary card and make the room laugh.','Choose another player for a harmless challenge.','Invent a rule for the next round.'],
  'confession-booth': ['Drop an anonymous confession.','Share a secret you can laugh about now.','Confess the weirdest thing you have ever searched for.'],
  'strip-trivia': ['Name three classic casino games in five seconds.','Name three things found in a dungeon.','Give the fastest answer you can: truth or dare?'],
  'heat-ladder': ['Climb one rung: give the room a bold compliment.','Choose your next level: playful, daring, or dramatic.','Raise the temperature with your best one-line challenge.'],
};
const REWARDS: Record<string, [number, number]> = {
  'dare-roulette':[3,15],'truth-or-strip':[5,10],'hot-seat':[10,25],'fantasy-match':[5,8],
  'kings-cup-dungeon':[2,8],'confession-booth':[3,12],'strip-trivia':[5,15],'heat-ladder':[2,25],
};
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({error:'Method not allowed'},{status:405});
  let body:{gameId?:string;action?:string};
  try{body=await req.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  const gameId=body.gameId?.trim(), action=body.action?.trim();
  if(!gameId||!action)return Response.json({error:'gameId and action required'},{status:400});
  const list=CHALLENGES[gameId];
  if(!list)return Response.json({error:'Game not found'},{status:404});
  if(action==='spin')return Response.json({gameId,challenge:list[Math.floor(Math.random()*list.length)],status:'ready'});
  if(action==='complete'){
    const [min,max]=REWARDS[gameId];
    const tokensEarned=min+Math.floor(Math.random()*(max-min+1));
    return Response.json({gameId,tokensEarned,status:'complete'});
  }
  return Response.json({error:'Unknown action'},{status:400});
}
