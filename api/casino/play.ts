import { supabase } from '../lib/supabase';
export const config = { runtime: 'edge' };

type Body = { userId?: string; gameId?: string; bet?: number; choice?: string };
const rand = (n:number) => Math.floor(Math.random()*n);

function outcome(game:string, choice:string) {
  if (game === 'roulette') {
    const n=rand(37), red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
    const win=(choice==='red'&&red)||(choice==='black'&&!red&&n>0)||(choice==='odd'&&n%2===1)||(choice==='even'&&n>0&&n%2===0)||(choice==='low'&&n>=1&&n<=18)||(choice==='high'&&n>=19&&n<=36)||(choice==='dozen1'&&n>=1&&n<=12)||(choice==='dozen2'&&n>=13&&n<=24)||(choice==='dozen3'&&n>=25&&n<=36)||(choice==='zero'&&n===0);
    const multiplier=['dozen1','dozen2','dozen3'].includes(choice)?3:choice==='zero'?36:2;
    return {win,payoutMultiplier:win?multiplier:0,label:String(n)};
  }
  if (game === 'blackjack') {
    const p=2+rand(20), d=2+rand(20), blackjack=p===21 && d!==21;
    const win=blackjack || (p<=21 && (d>21 || p>d));
    const push=p===d;
    return {win:win&&!push,payoutMultiplier:push?1:win?(blackjack?2.5:2):0,label:`PLAYER ${p} · DEALER ${d}`};
  }
  if (game === 'dice') {
    const a=1+rand(6),b=1+rand(6),sum=a+b;
    const win=(choice==='over'&&sum>7)||(choice==='under'&&sum<7)||(choice==='seven'&&sum===7)||(choice==='double'&&a===b)||(choice==='snake'&&a===1&&b===1)||(choice==='box'&&a===6&&b===6);
    const m=['snake','box'].includes(choice)?25:choice==='seven'||choice==='double'?5:1.9;
    return {win,payoutMultiplier:win?m:0,label:`${a} + ${b} = ${sum}`};
  }
  if (game === 'highlow') {
    const previous=7, n=1+rand(13);
    const win=(choice==='high'&&n>previous)||(choice==='low'&&n<previous)||(choice==='same'&&n===previous);
    return {win,payoutMultiplier:win?(choice==='same'?8:1.85):0,label:`${n} vs ${previous}`};
  }
  if (game === 'kinkwheel') {
    const values=[2,3,5,8,12,20,50,0], v=values[rand(values.length)];
    return {win:v>0,payoutMultiplier:v,label:v?`${v}x`:'LOSE'};
  }
  // slots: weighted three-line model, server-side result
  const symbols=['7','◆','★','♠','♥','♦','♣'];
  const weights=[4,10,8,24,22,18,14];
  const pick=()=>{let x=Math.random()*100;for(let i=0;i<weights.length;i++){x-=weights[i];if(x<0)return symbols[i]}return '7'};
  let best=0, scatters=0;
  for(let row=0;row<3;row++){
    const line=Array.from({length:5},pick); scatters+=line.filter(x=>x==='★').length;
    const base=line.find(x=>x!=='★');
    if(base&&line.every(x=>x===base||x==='★')) best=Math.max(best,({'7':25,'◆':12,'★':10,'♠':7,'♥':7,'♦':5,'♣':5}[base]||2));
  }
  if(scatters>=3) best=Math.max(best,15);
  return {win:best>0,payoutMultiplier:best,label:best?`${best}x PAYLINE`:'NO WIN'};
}

export default async function handler(req:Request):Promise<Response>{
  if(req.method!=='POST') return Response.json({error:'Method not allowed'},{status:405});
  let body:Body; try{body=await req.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  const {userId,gameId,bet,choice='red'}=body;
  if(!userId||!gameId||!Number.isInteger(bet)||bet<5||bet>100) return Response.json({error:'userId, gameId and integer bet 5-100 required'},{status:400});
  const roundId=crypto.randomUUID();
  const o=outcome(gameId,choice);
  const payout=o.win?Math.floor(bet*o.payoutMultiplier):0;
  const {data,error}=await supabase.rpc('play_token_game',{p_user_id:userId,p_round_id:roundId,p_game_id:gameId,p_bet:bet,p_payout:payout});
  if(error) return Response.json({error:'Token transaction failed',detail:error},{status:500});
  return Response.json({roundId,gameId,bet,payout,balance:Number(data?.balance??0),win:o.win,label:o.label,multiplier:o.payoutMultiplier});
}
