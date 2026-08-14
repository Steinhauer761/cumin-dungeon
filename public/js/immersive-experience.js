/* CumIN Dungeon immersive venue layer. Visual-only enhancement: no fake stream is created. */
(function () {
  const path = location.pathname;
  const isRoom = path.endsWith('/room.html');
  const isHall = path.endsWith('/hall.html');
  const isGame = path.includes('/games/') && /\.html$/.test(path);
  if (!isRoom && !isHall && !isGame) return;

  const css = document.createElement('style');
  css.textContent = `
    :root{--immersive-gold:#d8a04f;--immersive-hi:#f6d28e;--immersive-red:#8f1d28;--immersive-bg:#070504;--immersive-panel:#120c0a;--immersive-line:rgba(216,160,79,.22)}
    .venue-transition{position:fixed;inset:0;z-index:100000;background:#070504;display:grid;place-items:center;opacity:1;transition:opacity .45s ease;pointer-events:auto}
    .venue-transition.is-leaving{opacity:0;pointer-events:none}.venue-transition video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72}.venue-transition:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,5,4,.2),rgba(7,5,4,.9))}
    .transition-copy{position:relative;z-index:2;text-align:center;padding:24px}.transition-kicker{font:800 .58rem Inter,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:var(--immersive-gold)}.transition-title{font:italic 400 clamp(2.2rem,7vw,4.6rem) Georgia,serif;color:var(--immersive-hi);margin:8px 0}.transition-note{font:.7rem Inter,sans-serif;color:#a8998b}
    .room-studio{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;background:#050403}
    .room-studio img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.82) contrast(1.08) brightness(.62);transform:scale(1.03)}
    .room-studio:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,transparent 20%,rgba(0,0,0,.52) 100%),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))}
    .studio-frame{position:relative;z-index:2;width:min(860px,88%);aspect-ratio:16/9;border:1px solid rgba(246,210,142,.34);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 55px rgba(216,160,79,.08);background:rgba(0,0,0,.18);display:grid;place-items:center}
    .studio-status{position:absolute;top:14px;left:14px;display:flex;gap:8px;align-items:center;padding:6px 10px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(5,4,3,.72);font:800 .52rem Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase}.studio-status i{width:6px;height:6px;border-radius:50%;background:#e63946;box-shadow:0 0 10px #e63946}
    .studio-lockup{text-align:center;padding:24px}.studio-lockup strong{display:block;font:italic 600 clamp(1.5rem,4vw,2.6rem) Georgia,serif;color:var(--immersive-hi)}.studio-lockup span{display:block;margin-top:6px;font:600 .58rem Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#a8998b}
    .room-page .video-placeholder{display:none}
    .casino-enhanced .game-card{padding:0;overflow:hidden;border-radius:16px;background:linear-gradient(145deg,#1a100d,#0d0806);box-shadow:0 16px 42px rgba(0,0,0,.35)}
    .casino-enhanced .game-card:before{content:"";display:block;height:112px;background:radial-gradient(circle,rgba(216,160,79,.18),transparent 55%),linear-gradient(135deg,#26130f,#0a0705);border-bottom:1px solid var(--immersive-line)}
    .casino-enhanced .game-card:nth-child(2):before{background:radial-gradient(circle,rgba(143,29,40,.3),transparent 58%),linear-gradient(135deg,#28100f,#090605)}
    .casino-enhanced .game-card:nth-child(3):before{background:radial-gradient(circle,rgba(216,160,79,.2),transparent 55%),linear-gradient(135deg,#17101b,#080608)}
    .casino-enhanced .game-card h3,.casino-enhanced .game-card p,.casino-enhanced .game-card span{margin-left:16px;margin-right:16px}.casino-enhanced .game-card h3{margin-top:14px;color:var(--immersive-hi);font-size:1.25rem}.casino-enhanced .game-card p{margin-bottom:12px}.casino-enhanced .game-card .bet-range{display:inline-block;margin-bottom:16px}.casino-enhanced .game-card .max-win{display:inline-block;margin-bottom:16px}
    .casino-enhanced .tabs .tab.active{box-shadow:0 0 22px rgba(216,160,79,.18)}
    body.immersive-game{background:radial-gradient(circle at 50% 10%,rgba(216,160,79,.1),transparent 28%),radial-gradient(circle at 50% 100%,rgba(143,29,40,.12),transparent 35%),#070504!important}
    body.immersive-game .table{background:linear-gradient(145deg,#1a100d,#0c0806)!important;border-color:var(--immersive-gold)!important;box-shadow:0 24px 80px rgba(0,0,0,.58),0 0 35px rgba(216,160,79,.08)!important}
    body.immersive-game .table:before{border-color:rgba(246,210,142,.18)!important}
    body.immersive-game .card{box-shadow:0 6px 18px rgba(0,0,0,.42)}
    body.immersive-game .back-btn{background:rgba(7,5,4,.8);border-color:var(--immersive-line)}
    @media(max-width:899px){.studio-frame{width:94%;border-radius:12px}.room-studio img{object-position:center}.casino-enhanced .game-card:before{height:96px}}
  `;
  document.head.appendChild(css);

  function transitionVideoFor(href){
    if (href.includes('blackjack')) return 'https://t90141507879.p.clickup-attachments.com/t90141507879/5ecf89ac-fc48-4b38-ae5a-36b5aab68264/blackjack_transition.webm';
    if (href.includes('slots')) return 'https://t90141507879.p.clickup-attachments.com/t90141507879/6b27cec7-a5f1-47c5-9a09-05801488936a/slots_transition.mp4';
    return '';
  }

  function playTransition(href){
    const src=transitionVideoFor(href); if(!src) return false;
    const overlay=document.createElement('div'); overlay.className='venue-transition';
    overlay.innerHTML='<video autoplay muted playsinline></video><div class="transition-copy"><div class="transition-kicker">CumIN Dungeon</div><div class="transition-title">Entering the room</div><div class="transition-note">Preparing your experience…</div></div>';
    overlay.querySelector('video').src=src; document.body.appendChild(overlay);
    const leave=()=>{overlay.classList.add('is-leaving');setTimeout(()=>location.href=href,450)};
    overlay.querySelector('video').addEventListener('ended',leave,{once:true}); setTimeout(leave,5000); return true;
  }

  if(isHall){
    const casino=document.getElementById('casino-section');
    if(casino){
      const observer=new MutationObserver(()=>{if(document.getElementById('casino-grid')?.children.length){document.body.classList.add('casino-enhanced');observer.disconnect()}});
      observer.observe(casino,{subtree:true,childList:true});
    }
    document.addEventListener('click',e=>{const a=e.target.closest('#casino-grid a');if(!a)return;const href=a.href;if(playTransition(href))e.preventDefault()});
  }

  if(isGame){
    document.body.classList.add('immersive-game');
    const title=document.querySelector('h1')?.textContent||'Dungeon Game';
    document.title=title+' | CumIN Dungeon';
  }

  if(isRoom){
    const area=document.querySelector('.video-area');
    const titleEl=document.getElementById('room-title');
    if(area){
      const studio=document.createElement('div'); studio.className='room-studio';
      const img=document.createElement('img');
      const id=new URLSearchParams(location.search).get('id')||'velvet-room';
      img.src='/api/assets/'+encodeURIComponent(id); img.alt='Room atmosphere';
      const frame=document.createElement('div'); frame.className='studio-frame';
      frame.innerHTML='<div class="studio-status"><i></i> LIVE ROOM</div><div class="studio-lockup"><strong></strong><span>Private venue stream</span></div>';
      frame.querySelector('strong').textContent=titleEl?.textContent||'Live Room';
      studio.append(img,frame); area.prepend(studio);
      const roomObserver=new MutationObserver(()=>{const t=titleEl?.textContent;if(t&&t!=='Loading...')frame.querySelector('strong').textContent=t});
      if(titleEl)roomObserver.observe(titleEl,{childList:true,subtree:true,characterData:true});
    }
  }
})();
