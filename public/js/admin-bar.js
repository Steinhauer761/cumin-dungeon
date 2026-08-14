/**
 * Admin Bar - appears on every page when admin is logged in.
 * Ghost mode: Jay is invisible to all users by default, chats as "Elias".
 * All navigation links in one place.
 */
(function() {
  // Load the public immersive venue layer for everyone, then optionally render admin controls.
  const immersive = document.createElement('script');
  immersive.src = '/public/js/immersive-experience.js';
  immersive.defer = false;
  document.head.appendChild(immersive);

  const ADMIN_KEY = localStorage.getItem('admin_key');
  if (!ADMIN_KEY) return;

  // Ghost mode default: ON
  if (localStorage.getItem('ghost_mode') === null) {
    localStorage.setItem('ghost_mode', 'true');
  }

  const GHOST_ALIAS = 'Elias';
  localStorage.setItem('ghost_alias', GHOST_ALIAS);
  const isGhost = localStorage.getItem('ghost_mode') === 'true';

  const bar = document.createElement('div');
  bar.id = 'admin-bar';
  bar.innerHTML = `
    <style>
      #admin-bar { position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(10,6,4,.95);backdrop-filter:blur(10px);border-top:1px solid rgba(213,154,75,.3);padding:8px 16px;display:flex;align-items:center;gap:12px;font-family:Inter,system-ui,sans-serif;font-size:.68rem }
      #admin-bar .admin-label { color:#e63946;font-weight:800;font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;margin-right:8px }
      #admin-bar a,#admin-bar button { color:#a6998b;text-decoration:none;padding:5px 10px;border-radius:6px;border:1px solid rgba(190,137,77,.18);background:transparent;font-size:.65rem;font-weight:600;cursor:pointer;transition:all .15s }
      #admin-bar a:hover,#admin-bar button:hover { color:#f5c77e;border-color:#d59a4b }
      #admin-bar .ghost-btn { margin-left:auto;border-color:${isGhost?'#4ade80':'#e63946'};color:${isGhost?'#4ade80':'#e63946'} }
      #admin-bar .ghost-status { font-size:.58rem;color:${isGhost?'#4ade80':'#e63946'};margin-left:4px }
      #admin-bar .alias-label { font-size:.58rem;color:#d59a4b;margin-left:4px }
    </style>
    <span class="admin-label">ADMIN</span>
    <a href="/admin.html">Dashboard</a><a href="/">Venue</a><a href="/hall.html">Grand Hall</a>
    <a href="/room.html?id=velvet-room">Room</a><a href="/performer.html">Performer</a>
    <a href="/private-show.html?performer=Velvet&rate=5&admin=true">Spy</a>
    <button class="ghost-btn" id="ghost-toggle">${isGhost?'👻 Ghost: ON':'👁 Visible'}</button>
    <span class="ghost-status">${isGhost?'Invisible':'Visible to users'}</span>
    ${isGhost?'<span class="alias-label">Chatting as: Elias</span>':''}
  `;
  document.body.appendChild(bar);
  document.getElementById('ghost-toggle').addEventListener('click',()=>{
    const current=localStorage.getItem('ghost_mode')==='true';
    localStorage.setItem('ghost_mode',String(!current));
    window.location.reload();
  });
  document.body.style.paddingBottom='48px';
})();
