export const config = { runtime: 'edge' };

import { requirePerformer } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase';
const ROOMS=new Set(['velvet-room','tangled-throne','pink-silk','devils-playground','back-room','haleys-halo','trans-kinks']);

export default async function handler(req:Request):Promise<Response>{
  if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
  const auth=await requirePerformer(req);if(auth instanceof Response)return auth;
  let body:{roomId?:string};try{body=await req.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  if(!body.roomId||!ROOMS.has(body.roomId))return Response.json({error:'Invalid roomId'},{status:400});
  const result=await supabaseAdmin.from('performer_streams').select('mux_stream_key,mux_playback_id,mux_stream_id,status',`performer_id=eq.${auth.userId}&limit=1`);
  if(result.error)return Response.json({error:'Unable to read stream'},{status:500});
  const existing=Array.isArray(result.data)&&result.data.length?result.data[0]:null;
  if(existing?.mux_stream_key){await supabaseAdmin.from('performer_streams').update({room_id:body.roomId},`performer_id=eq.${auth.userId}`);return Response.json({rtmpUrl:'rtmps://global-live.mux.com:443/app',streamKey:existing.mux_stream_key,playbackId:existing.mux_playback_id,status:existing.status})}
  const response=await fetch(new URL('/api/stream/create',req.url),{method:'POST',headers:{'Content-Type':'application/json',Authorization:req.headers.get('Authorization')||''},body:JSON.stringify({roomId:body.roomId})});
  return Response.json(await response.json(),{status:response.status});
}
