/**
 * CumIN Dungeon - Ably Realtime Chat
 * Drop this script into any room page.
 * Requires: <script src="https://cdn.ably.com/lib/ably.min-1.js"></script> loaded first.
 */

const DungeonChat = {
  ably: null,
  channel: null,
  clientId: null,
  roomId: null,

  /**
   * Initialize chat for a room.
   * @param {string} roomId - The room slug (e.g. 'velvet-room')
   * @param {string} clientId - The user's display name or ID
   * @param {HTMLElement} chatList - Container to append messages
   * @param {HTMLElement} viewerCount - Element to show presence count
   */
  async init(roomId, clientId, chatList, viewerCount) {
    this.roomId = roomId;
    this.clientId = clientId;
    this.chatList = chatList;
    this.viewerCount = viewerCount;

    // Ghost mode: don't join presence if admin is ghosting
    this.isGhost = localStorage.getItem('ghost_mode') === 'true' && localStorage.getItem('admin_key');

    // Auth via our token endpoint
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
      console.log('[DungeonChat] Connected to Ably');
    });

    // Subscribe to room channel
    this.channel = this.ably.channels.get(`room:${roomId}`);

    this.channel.subscribe('message', (msg) => {
      this.renderMessage(msg.data);
    });

    // Presence (who's watching) - skip if ghost mode
    if (!this.isGhost) {
      this.channel.presence.subscribe('enter', () => this.updatePresence());
      this.channel.presence.subscribe('leave', () => this.updatePresence());
      await this.channel.presence.enter({ name: clientId });
    }
    this.updatePresence();
  },

  async send(text) {
    if (!text.trim() || !this.channel) return;
    this.channel.publish('message', {
      clientId: this.clientId,
      text: text.trim(),
      ts: Date.now(),
      isAdmin: !!localStorage.getItem('admin_key'),
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
