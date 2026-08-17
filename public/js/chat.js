/** Authenticated Ably realtime chat. */
const DungeonChat = {
  ably:null, channel:null, clientId:null, roomId:null,
  async init(roomId, chatList, viewerCount) {
    this.roomId=roomId; this.chatList=chatList; this.viewerCount=viewerCount;
    if (!window.DungeonAuth?.token()) throw new Error('Sign in to use chat');
    this.ably=new Ably.Realtime({authCallback:async(_p,cb)=>{try{const res=await DungeonAuth.fetch('/api/chat/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomId})});const data=await res.json();res.ok?cb(null,data):cb(data.error||'Chat auth failed',null)}catch(e){cb(e,null)}}});
    this.ably.connection.on('connected',()=>console.info('[DungeonChat] connected'));
    this.channel=this.ably.channels.get(`room:${roomId}`);
    this.channel.subscribe('message',msg=>this.renderMessage(msg.data));
    this.channel.presence.subscribe(()=>this.updatePresence());
    await this.channel.presence.enter({}); this.updatePresence();
  },
  async send(text){if(text.trim()&&this.channel) await this.channel.publish('message',{text:text.trim(),ts:Date.now()})},
  renderMessage(data){if(!this.chatList)return;const row=document.createElement('div');row.className='chat-msg';const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='Member: ';p.append(strong,document.createTextNode(String(data.text||'')));row.appendChild(p);this.chatList.appendChild(row);row.scrollIntoView({block:'nearest'})},
  async updatePresence(){if(!this.viewerCount||!this.channel)return;try{const m=await this.channel.presence.get();this.viewerCount.textContent=`● ${m.length} watching`}catch{}},
  disconnect(){this.channel?.presence.leave();this.ably?.close()}
};
window.DungeonChat=DungeonChat;
