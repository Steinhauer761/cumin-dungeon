/**
 * Admin Bar - appears on every page when admin is logged in.
 * Ghost mode: Jay is invisible to all users by default, chats as "Elias".
 * All navigation links in one place.
 * Reset balance button (admin only).
 */
(function() {
  var ADMIN_KEY = localStorage.getItem('admin_key');
  if (!ADMIN_KEY) return;

  // Ghost mode default: ON
  if (localStorage.getItem('ghost_mode') === null) {
    localStorage.setItem('ghost_mode', 'true');
  }

  var GHOST_ALIAS = 'Elias';
  localStorage.setItem('ghost_alias', GHOST_ALIAS);

  var isGhost = localStorage.getItem('ghost_mode') === 'true';

  var bar = document.createElement('div');
  bar.id = 'admin-bar';
  bar.innerHTML = '<style>' +
    '#admin-bar { position:fixed; bottom:0; left:0; right:0; z-index:9999; background:rgba(10,6,4,0.95); backdrop-filter:blur(10px); border-top:1px solid rgba(213,154,75,0.3); padding:8px 16px; display:flex; align-items:center; gap:10px; font-family:Inter,system-ui,sans-serif; font-size:0.68rem; flex-wrap:wrap; }' +
    '#admin-bar .admin-label { color:#e63946; font-weight:800; font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; margin-right:6px; }' +
    '#admin-bar a, #admin-bar button { color:#a6998b; text-decoration:none; padding:5px 10px; border-radius:6px; border:1px solid rgba(190,137,77,0.18); background:transparent; font-size:0.62rem; font-weight:600; cursor:pointer; transition:all 0.15s; }' +
    '#admin-bar a:hover, #admin-bar button:hover { color:#f5c77e; border-color:#d59a4b; }' +
    '#admin-bar .ghost-btn { margin-left:auto; border-color:' + (isGhost ? '#4ade80' : '#e63946') + '; color:' + (isGhost ? '#4ade80' : '#e63946') + '; }' +
    '#admin-bar .reset-btn { border-color:#d59a4b; color:#d59a4b; }' +
    '#admin-bar .reset-btn:hover { background:rgba(213,154,75,0.1); }' +
    '#admin-bar .ghost-status { font-size:0.55rem; color:' + (isGhost ? '#4ade80' : '#e63946') + '; }' +
    '#admin-bar .alias-label { font-size:0.55rem; color:#d59a4b; }' +
    '</style>' +
    '<span class="admin-label">ADMIN</span>' +
    '<a href="/admin.html">Dash</a>' +
    '<a href="/">Venue</a>' +
    '<a href="/casino.html">Casino</a>' +
    '<a href="/hall.html">Hall</a>' +
    '<a href="/room.html?id=velvet-room">Room</a>' +
    '<a href="/performer.html">Performer</a>' +
    '<button class="reset-btn" id="reset-balance">' + '\ud83d\udcb0 Reset 1M</button>' +
    '<button class="ghost-btn" id="ghost-toggle">' + (isGhost ? '\ud83d\udc7b Ghost' : '\ud83d\udc41 Visible') + '</button>' +
    '<span class="ghost-status">' + (isGhost ? 'Invisible' : 'Visible') + '</span>' +
    (isGhost ? '<span class="alias-label">as: Elias</span>' : '');

  document.body.appendChild(bar);

  document.getElementById('ghost-toggle').addEventListener('click', function() {
    var current = localStorage.getItem('ghost_mode') === 'true';
    localStorage.setItem('ghost_mode', String(!current));
    window.location.reload();
  });

  document.getElementById('reset-balance').addEventListener('click', function() {
    if (window.TokenBank) {
      var newBal = TokenBank.reset();
      // Update any visible balance element on the page
      var balEls = document.querySelectorAll('#balance, [data-balance]');
      balEls.forEach(function(el) { el.textContent = TokenBank.fmt(newBal); });
      this.textContent = '\u2705 Reset!';
      var btn = this;
      setTimeout(function() { btn.textContent = '\ud83d\udcb0 Reset 1M'; }, 1500);
    } else {
      localStorage.setItem('cumin_token_balance', '1000000');
      window.location.reload();
    }
  });

  document.body.style.paddingBottom = '48px';
})();
