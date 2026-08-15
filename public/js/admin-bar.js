/**
 * Shared CumIN Dungeon public visual/media layer + admin bar.
 */
(function() {
  // God mode flag for admin
  window.CUMIN_GOD = !!localStorage.getItem('admin_key');

  const scripts = [
    ['/public/js/media-fallbacks.js', 'data-cd-media'],
    ['/public/js/immersive-experience.js', 'data-cd-immersive'],
    ['/public/js/room-live-ui.js', 'data-cd-room-live']
  ];
  scripts.forEach(([src, marker]) => {
    if (document.querySelector(`script[${marker}]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.setAttribute(marker, 'true');
    document.head.appendChild(script);
  });

  const ASSET_BY_CLICKUP = {
    '07b7448f-853c-48e6-82e8-435de3962bb1': 'grand-hall',
    '88dc235b-b9f9-45e9-b104-1040db693e44': 'velvet-room',
    '8cd96905-8077-4696-90ac-1eb639996ada': 'room-03',
    'd38a9f14-ea11-428a-a1dc-d78e4ab0c4b1': 'room-04',
    'ddd616e1-7a9d-448d-ba9c-7e3e0b886c3b': 'room-05',
    '9df03371-3953-469b-91db-7a2393cbb1d1': 'room-06',
    'c073943a-ddcc-4150-a58c-46b4dc0c514b': 'room-07',
    '084dd23b-f9b6-4d18-aed9-0d8c16f74e51': 'room-08',
    '8a1e6dee-2e01-4a2d-91b7-f25a13941de6': 'room-09'
  };

  function normalizeArtwork(img) {
    if (!img || !img.src) return;
    const match = img.src.match(/clickup\.com\/([a-f0-9-]+)\.png/i);
    if (!match) return;
    const key = ASSET_BY_CLICKUP[match[1]];
    if (!key || img.dataset.cdProxied === 'true') return;
    img.dataset.cdProxied = 'true';
    img.src = `/public/assets/rooms/${key}.svg`;
    img.addEventListener('error', () => img.classList.add('media-fallback'), { once: true });
  }

  function normalizeAllArtwork() {
    document.querySelectorAll('img[src*="app-attachments-public.clickup.com"]').forEach(normalizeArtwork);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalizeAllArtwork, { once: true });
  else normalizeAllArtwork();
  new MutationObserver(normalizeAllArtwork).observe(document.documentElement, { childList: true, subtree: true });

  const casinoStyle = document.createElement('style');
  casinoStyle.textContent = `
    body:has(.hall-layout){background:#070504!important}
    .hall-layout{background:radial-gradient(circle at 50% 0%,rgba(216,160,79,.09),transparent 34%),linear-gradient(135deg,#070504 0%,#100907 48%,#070504 100%)}
    .hall-main{position:relative;overflow:hidden}
    .hall-main:before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(7,5,4,.72),rgba(7,5,4,.92)),url('/public/assets/rooms/grand-hall.svg') center/cover;opacity:.28;pointer-events:none}
    .hall-main>*{position:relative;z-index:1}
    .hall-header h1{font-size:clamp(2rem,4vw,3.4rem);text-shadow:0 8px 30px rgba(0,0,0,.65)}
    .token-bar{background:linear-gradient(135deg,rgba(216,160,79,.12),rgba(255,255,255,.018));box-shadow:0 18px 55px rgba(0,0,0,.42),inset 0 1px rgba(246,210,142,.08)}
    .casino-enhanced #casino-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    .casino-enhanced #casino-grid .game-card{min-height:275px;border-radius:20px;border-color:rgba(216,160,79,.2);background:linear-gradient(145deg,rgba(29,16,13,.96),rgba(9,6,5,.98));box-shadow:0 20px 55px rgba(0,0,0,.5)}
    .casino-enhanced #casino-grid .game-card:hover{transform:translateY(-7px) scale(1.01);box-shadow:0 28px 70px rgba(0,0,0,.62),0 0 38px rgba(216,160,79,.1)}
    body.immersive-game{background:radial-gradient(circle at 50% 0%,rgba(216,160,79,.14),transparent 30%),linear-gradient(145deg,#070504,#130907 55%,#070504)!important}
    @media(max-width:900px){.casino-enhanced #casino-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:600px){.casino-enhanced #casino-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(casinoStyle);

  function enhanceCasino() {
    const hall = document.querySelector('.hall-layout');
    const casino = document.getElementById('casino-section');
    if (hall && casino) document.body.classList.add('casino-enhanced');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhanceCasino, { once:true });
  else enhanceCasino();
  new MutationObserver(enhanceCasino).observe(document.documentElement,{childList:true,subtree:true});

  const ADMIN_KEY = localStorage.getItem('admin_key');
  if (!ADMIN_KEY) return;
  if (localStorage.getItem('ghost_mode') === null) localStorage.setItem('ghost_mode', 'true');
  const GHOST_ALIAS = 'Elias';
  localStorage.setItem('ghost_alias', GHOST_ALIAS);
  const isGhost = localStorage.getItem('ghost_mode') === 'true';
  const bar = document.createElement('div');
  bar.id = 'admin-bar';
  bar.innerHTML = `<style>#admin-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(10,6,4,.95);backdrop-filter:blur(10px);border-top:1px solid rgba(213,154,75,.3);padding:8px 16px;display:flex;align-items:center;gap:12px;font-family:Inter,system-ui,sans-serif;font-size:.68rem}#admin-bar .admin-label{color:#e63946;font-weight:800;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;margin-right:8px}#admin-bar a,#admin-bar button{color:#a6998b;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid rgba(190,137,77,.18);background:transparent;font-size:.65rem;font-weight:600;cursor:pointer}#admin-bar .ghost-btn{margin-left:auto;border-color:${isGhost?'#4ade80':'#e63946'};color:${isGhost?'#4ade80':'#e63946'}}</style><span class="admin-label">ADMIN</span><a href="/admin.html">Dashboard</a><a href="/">Venue</a><a href="/hall.html">Grand Hall</a><a href="/room.html?id=velvet-room">Room</a><a href="/performer.html">Performer</a><a href="/private-show.html?performer=Velvet&rate=5&admin=true">Spy</a><button class="ghost-btn" id="ghost-toggle">${isGhost?'\ud83d\udc7b Ghost: ON':'\ud83d\udc41 Visible'}</button>`;
  document.body.appendChild(bar);
  document.getElementById('ghost-toggle').addEventListener('click',()=>{localStorage.setItem('ghost_mode',String(localStorage.getItem('ghost_mode')!=='true'));window.location.reload();});
  document.body.style.paddingBottom='48px';
})();
