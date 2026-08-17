/**
 * CumIN Dungeon - Live Stream Player (Mux Player Web Component)
 * Polls for active streams and mounts <mux-player> when live.
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/@mux/mux-player@latest"></script>
 *   <script src="/js/live-player.js"></script>
 *   <script>DungeonPlayer.init('velvet-room', document.getElementById('video-area'));</script>
 */

window.DungeonPlayer = (function () {
  'use strict';

  let _roomId = null;
  let _container = null;
  let _player = null;
  let _pollInterval = null;
  let _isPlaying = false;

  /**
   * Initialize the live player for a room.
   * @param {string} roomId
   * @param {HTMLElement} container
   */
  function init(roomId, container) {
    _roomId = roomId;
    _container = container;

    // Start polling for stream
    _pollForStream();
    _pollInterval = setInterval(_pollForStream, 5000);
  }

  async function _pollForStream() {
    if (!_roomId) return;

    try {
      const resp = await fetch('/api/stream/playback?roomId=' + encodeURIComponent(_roomId));
      const data = await resp.json();

      if (data.live && data.playbackUrl) {
        if (!_isPlaying) {
          _startPlayback(data.playbackUrl.replace('https://stream.mux.com/', '').replace('.m3u8', ''));
        }
      } else {
        if (_isPlaying) {
          _stopPlayback();
        }
      }
    } catch (err) {
      console.warn('[DungeonPlayer] Poll failed:', err);
    }
  }

  function _startPlayback(playbackId) {
    _isPlaying = true;

    // Hide placeholder
    const placeholder = _container.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Hide room background art
    const roomBg = _container.querySelector('.room-bg');
    if (roomBg) roomBg.style.display = 'none';

    // Show live badge
    const liveBadge = document.querySelector('.live-badge');
    if (liveBadge) liveBadge.style.display = 'flex';

    // Create Mux Player element
    _player = document.createElement('mux-player');
    _player.setAttribute('playback-id', playbackId);
    _player.setAttribute('stream-type', 'live');
    _player.setAttribute('autoplay', '');
    _player.setAttribute('muted', '');
    _player.setAttribute('accent-color', '#d59a4b');
    _player.setAttribute('metadata-video-title', document.getElementById('room-title')?.textContent || 'Live');
    _player.setAttribute('metadata-viewer-user-id', window._guestId || 'anonymous');
    _player.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;--controls-backdrop-color:rgba(0,0,0,0.4);';

    _container.appendChild(_player);

    // Dispatch event
    document.dispatchEvent(new CustomEvent('stream:started', { detail: { roomId: _roomId } }));
  }

  function _stopPlayback() {
    _isPlaying = false;

    if (_player) {
      _player.remove();
      _player = null;
    }

    // Restore placeholder and background
    const placeholder = _container.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = '';

    const roomBg = _container.querySelector('.room-bg');
    if (roomBg) roomBg.style.display = '';

    // Hide live badge
    const liveBadge = document.querySelector('.live-badge');
    if (liveBadge) liveBadge.style.display = 'none';

    document.dispatchEvent(new CustomEvent('stream:ended', { detail: { roomId: _roomId } }));
  }

  function destroy() {
    if (_pollInterval) clearInterval(_pollInterval);
    _stopPlayback();
  }

  return {
    init: init,
    destroy: destroy,
  };
})();
