/**
 * CumIN Dungeon - Global Chat Panel
 * Self-contained: auto-injects DOM, connects to Ably via DungeonChat.
 * Include after chat.js and Ably SDK on any page.
 *
 * Usage: <script src="/public/js/chat-panel.js"></script>
 * Auto-detects room from URL or defaults to 'lobby'.
 */
(function(){
'use strict';

// Detect room from URL
function detectRoom(){
  var path = window.location.pathname;
  var params = new URLSearchParams(window.location.search);
  if(params.get('id')) return params.get('id');
  if(path.indexOf('hall') !== -1) return 'grand-hall';
  if(path.indexOf('casino') !== -1) return 'casino-lounge';
  if(path.indexOf('room') !== -1) return 'velvet-room';
  return 'lobby';
}

// Client ID
function getClientId(){
  var isAdmin = !!localStorage.getItem('admin_key');
  var isGhost = localStorage.getItem('ghost_mode') === 'true' && isAdmin;
  if(isGhost) return localStorage.getItem('ghost_alias') || 'Elias';
  var stored = sessionStorage.getItem('chat_client_id');
  if(stored) return stored;
  var id = 'Guest_' + Math.random().toString(36).slice(2,7);
  sessionStorage.setItem('chat_client_id', id);
  return id;
}

var roomId = detectRoom();
var clientId = getClientId();
var isOpen = false;
var unread = 0;
var connected = false;

// Inject styles
var style = document.createElement('style');
style.textContent = `
  #cp-toggle{position:fixed;bottom:20px;right:20px;z-index:9990;width:48px;height:48px;border-radius:50%;border:2px solid rgba(213,154,75,.4);background:linear-gradient(135deg,#141010,#0c0908);color:#f5c77e;font-size:1.1rem;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 20px rgba(0,0,0,.5);transition:transform .15s,box-shadow .15s}
  #cp-toggle:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(213,154,75,.25)}
  #cp-toggle.has-unread{animation:cpPulse 2s infinite}
  @keyframes cpPulse{0%,100%{box-shadow:0 4px 20px rgba(0,0,0,.5)}50%{box-shadow:0 4px 24px rgba(213,154,75,.4)}}
  #cp-badge{position:absolute;top:-2px;right:-2px;min-width:16px;height:16px;border-radius:8px;background:#c0392b;color:#fff;font-size:.5rem;font-weight:800;display:none;place-items:center;padding:0 4px}
  #cp-badge.show{display:grid}
  #cp-panel{position:fixed;top:0;right:0;bottom:0;width:320px;z-index:9995;background:#0c0908;border-left:1px solid rgba(190,137,77,.12);transform:translateX(100%);transition:transform .3s cubic-bezier(.22,1,.36,1);display:flex;flex-direction:column}
  #cp-panel.open{transform:translateX(0)}
  #cp-overlay{position:fixed;inset:0;z-index:9993;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .3s}
  #cp-overlay.open{opacity:1;pointer-events:auto}
  .cp-header{padding:14px 16px;border-bottom:1px solid rgba(190,137,77,.12);display:flex;justify-content:space-between;align-items:center}
  .cp-header h3{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:.95rem;color:#f5c77e}
  .cp-header .cp-room{font-size:.5rem;color:#7a6e64;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-top:2px}
  .cp-close{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.05);border:none;color:#7a6e64;font-size:.8rem;cursor:pointer;display:grid;place-items:center}
  .cp-close:hover{color:#f5eee4;background:rgba(255,255,255,.1)}
  .cp-presence{padding:6px 16px;font-size:.55rem;color:#7a6e64;border-bottom:1px solid rgba(190,137,77,.06)}
  .cp-messages{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:6px}
  .cp-msg{display:flex;gap:8px;align-items:start}
  .cp-msg .cp-avatar{width:22px;height:22px;border-radius:50%;background:rgba(213,154,75,.1);display:grid;place-items:center;font-size:.5rem;font-weight:800;color:#d59a4b;flex-shrink:0}
  .cp-msg p{font-size:.7rem;color:#b8ada3;line-height:1.3}
  .cp-msg strong{color:#f5eee4}
  .cp-msg.system p{color:#7a6e64;font-style:italic;font-size:.6rem}
  .cp-input-row{display:flex;gap:8px;padding:10px 16px;border-top:1px solid rgba(190,137,77,.12)}
  .cp-input-row input{flex:1;padding:9px 12px;border:1px solid rgba(190,137,77,.12);border-radius:8px;background:#050304;color:#f5eee4;font-size:.72rem;font-family:'Inter',system-ui,sans-serif}
  .cp-input-row input::placeholder{color:#7a6e64}
  .cp-input-row button{padding:9px 14px;border-radius:8px;background:#d59a4b;color:#050304;font-weight:800;font-size:.65rem;border:none;cursor:pointer}
  .cp-input-row button:active{transform:scale(.95)}
  @media(max-width:768px){
    #cp-panel{width:100%;top:auto;bottom:0;height:55vh;border-left:none;border-top:1px solid rgba(190,137,77,.12);border-radius:16px 16px 0 0;transform:translateY(100%)}
    #cp-panel.open{transform:translateY(0)}
    #cp-toggle{bottom:16px;right:16px}
  }
`;
document.head.appendChild(style);

// Inject DOM
function injectDOM(){
  // Toggle button
  var toggle = document.createElement('button');
  toggle.id = 'cp-toggle';
  toggle.innerHTML = '<span>\u{1F4AC}</span><span id="cp-badge"></span>';
  toggle.onclick = togglePanel;
  document.body.appendChild(toggle);

  // Overlay
  var overlay = document.createElement('div');
  overlay.id = 'cp-overlay';
  overlay.onclick = closePanel;
  document.body.appendChild(overlay);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'cp-panel';
  panel.innerHTML = `
    <div class="cp-header">
      <div><h3>Chat</h3><div class="cp-room" id="cp-room-name">${roomId.replace(/-/g,' ')}</div></div>
      <button class="cp-close" onclick="document.getElementById('cp-overlay').click()">&times;</button>
    </div>
    <div class="cp-presence" id="cp-presence">Connecting...</div>
    <div class="cp-messages" id="cp-messages"></div>
    <form class="cp-input-row" id="cp-form">
      <input id="cp-input" maxlength="200" placeholder="Say something..." autocomplete="off">
      <button type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(panel);

  // Form submit
  document.getElementById('cp-form').addEventListener('submit', function(e){
    e.preventDefault();
    sendMessage();
  });
}

function togglePanel(){
  if(isOpen) closePanel();
  else openPanel();
}

function openPanel(){
  isOpen = true;
  unread = 0;
  updateBadge();
  document.getElementById('cp-panel').classList.add('open');
  document.getElementById('cp-overlay').classList.add('open');
  document.getElementById('cp-toggle').classList.remove('has-unread');
  document.getElementById('cp-input').focus();
  if(!connected) connectChat();
}

function closePanel(){
  isOpen = false;
  document.getElementById('cp-panel').classList.remove('open');
  document.getElementById('cp-overlay').classList.remove('open');
}

function updateBadge(){
  var badge = document.getElementById('cp-badge');
  if(unread > 0){
    badge.textContent = unread > 9 ? '9+' : unread;
    badge.classList.add('show');
    document.getElementById('cp-toggle').classList.add('has-unread');
  } else {
    badge.classList.remove('show');
  }
}

function addMessage(sender, text, isSystem){
  var container = document.getElementById('cp-messages');
  var msg = document.createElement('div');
  msg.className = 'cp-msg' + (isSystem ? ' system' : '');
  if(isSystem){
    msg.innerHTML = '<p>' + escapeHtml(text) + '</p>';
  } else {
    var initial = (sender || '?')[0].toUpperCase();
    msg.innerHTML = '<span class="cp-avatar">' + initial + '</span><p><strong>' + escapeHtml(sender) + ':</strong> ' + escapeHtml(text) + '</p>';
  }
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  // Unread if panel closed
  if(!isOpen && !isSystem){
    unread++;
    updateBadge();
  }
}

function sendMessage(){
  var input = document.getElementById('cp-input');
  var text = input.value.trim();
  if(!text) return;

  if(window.DungeonChat && window.DungeonChat.channel){
    window.DungeonChat.channel.publish('message', {
      clientId: clientId,
      text: text,
      ts: Date.now()
    });
  } else {
    // Offline fallback: just show locally
    addMessage(clientId, text);
  }
  input.value = '';
}

function connectChat(){
  if(!window.Ably || !window.DungeonChat){
    document.getElementById('cp-presence').textContent = 'Chat offline (Ably not loaded)';
    addMessage(null, 'Chat is in offline mode. Messages are local only.', true);
    connected = true;
    return;
  }

  // Override DungeonChat's renderMessage to pipe into our panel
  var msgContainer = document.getElementById('cp-messages');

  window.DungeonChat.init(roomId, clientId, {
    appendChild: function(el){
      // Extract data from the rendered element
      var strong = el.querySelector('strong');
      var p = el.querySelector('p');
      if(strong && p){
        var sender = strong.textContent.replace(':','');
        var fullText = p.textContent;
        var text = fullText.replace(sender + ': ', '');
        addMessage(sender, text);
      }
    }
  }, {
    set textContent(val){
      document.getElementById('cp-presence').textContent = val;
    }
  }).then(function(){
    connected = true;
    document.getElementById('cp-presence').textContent = 'Connected to ' + roomId.replace(/-/g,' ');
    addMessage(null, 'Connected to chat.', true);
  }).catch(function(err){
    document.getElementById('cp-presence').textContent = 'Connection failed';
    addMessage(null, 'Could not connect to chat. Messages are local only.', true);
    connected = true;
  });
}

function escapeHtml(str){
  if(!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Keyboard shortcut: T to toggle
document.addEventListener('keydown', function(e){
  if(e.key === 't' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
    e.preventDefault();
    togglePanel();
  }
  if(e.key === 'Escape' && isOpen){
    closePanel();
  }
});

// Init
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', injectDOM);
} else {
  injectDOM();
}

})();
