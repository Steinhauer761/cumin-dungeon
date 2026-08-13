/**
 * CumIN Dungeon - Ably Realtime Chat
 * Requires: <script src="https://cdn.ably.com/lib/ably.min-1.js"></script> loaded first.
 */

const DungeonChat = {
  ably: null,
  channel: null,
  clientId: null,
  roomId: null,

  async init(roomId, clientId, chatList, viewerCount) {
    this.roomId = roomId;
    this.chatList = chatList;
    this.viewerCount = viewerCount;

    // Ghost mode: admin chats as alias, doesn't appear in presence
    const isAdmin = !!localStorage.getItem('admin_key');
    this.isGhost = localStorage.getItem('ghost_mode') === 'true' && isAdmin;
    const ghostAlias = localStorage.getItem('ghost_alias') || 'Elias';

    // Use ghost alias if in ghost mode, otherwise use provided clientId
    this.clientId = this.isGhost ? ghostAlias : clientId;

    this.ably = new Ably.Realtime({
      authCallback: async (tokenParams, callback) => {
        try {
          const res = await fetch('/api/chat/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: this.roomId, clientId: this.clientId }),
          });
          const tokenRequest = await res.json();
          if (res.ok) {
            callback(null, tokenRequest);
          } else {
            callback(tokenRequest.error || 'Token auth failed', null);
          }
        } catch (err) {
          callback(err.message, null);
        }
      },
    });

    this.ably.connection.on('connected', () => {
      console.log('[DungeonChat] Connected to Ably' + (this.isGhost ? ' (ghost mode as ' + this.clientId + ')' : ''));
    });

    this.channel = this.ably.channels.get(`room:${roomId}`);

    this.channel.subscribe('message', (msg) => {
      this.renderMessage(msg.data);
    });

    // Presence: ghost mode = don't join presence (invisible)
    if (!this.isGhost) {
      this.channel.presence.subscribe('enter', () => this.updatePresence());
      this.channel.presence.subscribe('leave', () => this.updatePresence());
      await this.channel.presence.enter({ name: this.clientId });
    }
    this.updatePresence();
  },

  async send(text) {
    if (!text.trim() || !this.channel) return;
    this.channel.publish('message', {
      clientId: this.clientId, // Shows as "Elias" in ghost mode
      text: text.trim(),
      ts: Date.now(),
    });
  },

  renderMessage(data) {
    if (!this.chatList) return;
    const row = document.createElement('div');
    row.className = 'chat-msg';
    const initial = (data.clientId || '?')[0].toUpperCase();
    row.innerHTML = `<span class="chat-avatar">${initial}</span><p><strong>${this.escapeHtml(data.clientId)}:</strong> ${this.escapeHtml(data.text)}</p>`;
    this.chatList.appendChild(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async updatePresence() {
    if (!this.channel || !this.viewerCount) return;
    try {
      const members = await this.channel.presence.get();
      this.viewerCount.textContent = `\u25cf ${members.length} watching`;
    } catch (e) {}
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  disconnect() {
    if (this.channel && !this.isGhost) this.channel.presence.leave();
    if (this.ably) this.ably.close();
  },
};

window.DungeonChat = DungeonChat;
