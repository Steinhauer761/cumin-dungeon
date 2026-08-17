export const config = { runtime: 'edge' };

import { supabaseAdmin } from '../lib/supabase';
import { requirePerformer } from '../lib/auth';
declare const process: { env: Record<string, string | undefined> };

const ROOMS = new Set(['velvet-room','tangled-throne','pink-silk','devils-playground','back-room','haleys-halo','trans-kinks']);

export default async function handler(req:Request):Promise<Response>{
  if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
  const auth=await requirePerformer(req); if(auth instanceof Response)return auth;
  const tokenId=process.env.MUX_TOKEN_ID, tokenSecret=process.env.MUX_TOKEN_SECRET;
  if(!tokenId||!tokenSecret)return Response.json({error:'Streaming not configured'},{status:503});
  let body:{roomId?:string};try{body=await req.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  if(!body.roomId||!ROOMS.has(body.roomId))return Response.json({error:'Invalid roomId'},{status:400});

  const mux=await fetch('https://api.mux.com/video/v1/live-streams',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Basic '+btoa(`${tokenId}:${tokenSecret}`)},body:JSON.stringify({playback_policies:['public'],new_asset_settings:{playback_policies:['public']},latency_mode:'low',max_continuous_duration:43200})});
  if(!mux.ok){console.error('Mux create failed',mux.status,await mux.text());return Response.json({error:'Failed to create stream'},{status:502})}
  const data=await mux.json();const stream=data.data;
  await supabaseAdmin.from('performer_streams').delete(`performer_id=eq.${auth.userId}`);
  const write=await supabaseAdmin.from('performer_streams').insert({performer_id:auth.userId,room_id:body.roomId,mux_stream_id:stream.id,mux_stream_key:stream.stream_key,mux_playback_id:stream.playback_ids?.[0]?.id||null,status:'idle',created_at:new Date().toISOString()});
  if(write.error)return Response.json({error:'Failed to save stream'},{status:500});
  return Response.json({rtmpUrl:'rtmps://global-live.mux.com:443/app',streamKey:stream.stream_key,playbackId:stream.playback_ids?.[0]?.id||null,streamId:stream.id,status:stream.status},{status:201});
}
