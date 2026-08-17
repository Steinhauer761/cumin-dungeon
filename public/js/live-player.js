/**
 * CumIN Dungeon - Live Stream Player
 * HLS video player for room pages. Polls for active streams and plays them.
 *
 * Usage:
 *   <div id="live-player"></div>
 *   <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
 *   <script src="/js/live-player.js"></script>
 *   <script>DungeonPlayer.init('velvet-room', document.getElementById('live-player'));</script>
 */

window.DungeonPlayer = (function () {
  'use strict';

  let _roomId = null;
  let _container = null;
  let _video = null;
  let _hls = null;
  let _pollInterval = null;
  let _isPlaying = false;

  /**
   * Initialize the live player for a room.
   * @param {string} roomId
   * @param {HTMLElement} container - element to mount the video player in
   */
  function init(roomId, container) {
    _roomId = roomId;
    _container = container;

    // Create video element
    _video = document.createElement('video');
    _video.id = 'dungeon-live-video';
    _video.autoplay = true;
    _video.muted = true; // muted autoplay allowed by browsers
    _video.playsInline = true;
    _video.controls = false;
    _video.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;z-index:1;background:#000;display:none;';
    _container.appendChild(_video);

    // Unmute button (overlay)
    const unmuteBtn = document.createElement('button');
    unmuteBtn.id = 'unmute-btn';
    unmuteBtn.textContent = '\uD83D\uDD07 Tap to unmute';
    unmuteBtn.style.cssText = 'position:absolute;bottom:80px;left:50%;transform:translateX(-50%);z-index:15;padding:10px 20px;border-radius:100px;background:rgba(0,0,0,0.8);border:1px solid rgba(213,154,75,0.4);color:#f5c77e;font-size:0.7rem;font-weight:700;cursor:pointer;display:none;';
    unmuteBtn.addEventListener('click', function () {
      _video.muted = false;
      unmuteBtn.style.display = 'none';
    });
    _container.appendChild(unmuteBtn);

    // Start polling for stream
    _pollForStream();
    _pollInterval = setInterval(_pollForStream, 5000); // check every 5s
  }

  async function _pollForStream() {
    if (!_roomId) return;

    try {
      const resp = await fetch('/api/stream/playback?roomId=' + encodeURIComponent(_roomId));
      const data = await resp.json();

      if (data.live && data.playbackUrl) {
        if (!_isPlaying) {
          _startPlayback(data.playbackUrl);
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

  function _startPlayback(url) {
    _isPlaying = true;
    _video.style.display = 'block';

    // Hide the placeholder
    const placeholder = _container.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Show unmute button
    const unmuteBtn = document.getElementById('unmute-btn');
    if (unmuteBtn) unmuteBtn.style.display = 'block';

    // Update live badge
    const liveBadge = document.querySelector('.live-badge');
    if (liveBadge) liveBadge.style.display = 'flex';

    if (window.Hls && Hls.isSupported()) {
      _hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      _hls.loadSource(url);
      _hls.attachMedia(_video);
      _hls.on(Hls.Events.MANIFEST_PARSED, function () {
        _video.play().catch(function () {});
      });
      _hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          console.error('[DungeonPlayer] Fatal HLS error:', data);
          _stopPlayback();
        }
      });
    } else if (_video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      _video.src = url;
      _video.addEventListener('loadedmetadata', function () {
        _video.play().catch(function () {});
      });
    } else {
      console.error('[DungeonPlayer] HLS not supported in this browser');
    }

    // Dispatch event so other scripts can react
    document.dispatchEvent(new CustomEvent('stream:started', { detail: { roomId: _roomId } }));
  }

  function _stopPlayback() {
    _isPlaying = false;
    _video.style.display = 'none';

    const placeholder = _container.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = '';

    const unmuteBtn = document.getElementById('unmute-btn');
    if (unmuteBtn) unmuteBtn.style.display = 'none';

    if (_hls) {
      _hls.destroy();
      _hls = null;
    }

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
