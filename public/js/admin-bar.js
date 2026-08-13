/**
 * Admin Bar - appears on every page when admin is logged in.
 * Ghost mode: Jay is invisible to all users by default.
 * All navigation links in one place.
 */
(function() {
  const ADMIN_KEY = localStorage.getItem('admin_key');
  if (!ADMIN_KEY) return; // Not admin, don't show anything

  // Ghost mode default: ON
  if (localStorage.getItem('ghost_mode') === null) {
    localStorage.setItem('ghost_mode', 'true');
  }

  const isGhost = localStorage.getItem('ghost_mode') === 'true';

  const bar = document.createElement('div');
  bar.id = 'admin-bar';
  bar.innerHTML = `
    <style>
      #admin-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: rgba(10,6,4,0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(213,154,75,0.3);
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: Inter, system-ui, sans-serif;
        font-size: 0.68rem;
      }
      #admin-bar .admin-label {
        color: #e63946;
        font-weight: 800;
        font-size: 0.6rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-right: 8px;
      }
      #admin-bar a, #admin-bar button {
        color: #a6998b;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid rgba(190,137,77,0.18);
        background: transparent;
        font-size: 0.65rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }
      #admin-bar a:hover, #admin-bar button:hover {
        color: #f5c77e;
        border-color: #d59a4b;
      }
      #admin-bar .ghost-btn {
        margin-left: auto;
        border-color: ${isGhost ? '#4ade80' : '#e63946'};
        color: ${isGhost ? '#4ade80' : '#e63946'};
      }
      #admin-bar .ghost-status {
        font-size: 0.58rem;
        color: ${isGhost ? '#4ade80' : '#e63946'};
        margin-left: 4px;
      }
    </style>
    <span class="admin-label">ADMIN</span>
    <a href="/admin.html">Dashboard</a>
    <a href="/">Venue</a>
    <a href="/hall.html">Grand Hall</a>
    <a href="/room.html?id=velvet-room">Room View</a>
    <a href="/performer.html">Performer Dash</a>
    <a href="/private-show.html?performer=Velvet&rate=5&admin=true">Spy Private</a>
    <a href="/terms.html">Terms</a>
    <button class="ghost-btn" id="ghost-toggle">
      ${isGhost ? '👻 Ghost: ON' : '👁 Visible'}
    </button>
    <span class="ghost-status">${isGhost ? 'You are invisible' : 'Users can see you'}</span>
  `;

  document.body.appendChild(bar);

  // Ghost toggle
  document.getElementById('ghost-toggle').addEventListener('click', () => {
    const current = localStorage.getItem('ghost_mode') === 'true';
    localStorage.setItem('ghost_mode', String(!current));
    window.location.reload();
  });

  // Add body padding so content isn't hidden behind the bar
  document.body.style.paddingBottom = '48px';
})();
