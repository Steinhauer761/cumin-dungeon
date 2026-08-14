/* CumIN Dungeon room live-surface polish. Presentation only: never invents a live stream, viewer count, or performer status. */
(function () {
  'use strict';
  if (!location.pathname.endsWith('/room.html')) return;

  function init() {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('id') || 'velvet-room';
    const area = document.querySelector('.video-area');
    if (!area) return;

    const viewer = document.getElementById('viewer-count');
    if (viewer) viewer.textContent = 'Live connection pending';

    const liveBadge = document.querySelector('.live-badge');
    if (liveBadge) {
      liveBadge.textContent = 'LIVE READY';
      liveBadge.classList.add('cd-live-ready');
    }

    let placeholder = document.querySelector('.video-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'video-placeholder';
      area.prepend(placeholder);
    }

    placeholder.innerHTML = `
      <div class="cd-stream-shell">
        <video id="cumin-live-video" playsinline autoplay muted poster="/api/assets/${encodeURIComponent(roomId)}"></video>
        <div class="cd-stream-overlay">
          <div class="cd-stream-mark">CUM<span>IN</span> DUNGEON</div>
          <div class="cd-stream-state"><i></i><span>Waiting for live performer connection</span></div>
          <p>When a verified performer connects their webcam, the live feed appears here.</p>
        </div>
      </div>`;

    const video = document.getElementById('cumin-live-video');
    window.CumINLiveSurface = {
      video,
      attachStream(stream) {
        if (!stream) return false;
        video.srcObject = stream;
        video.muted = false;
        video.play().catch(() => {});
        placeholder.querySelector('.cd-stream-overlay')?.remove();
        return true;
      },
      clearStream() {
        video.srcObject?.getTracks?.().forEach(t => t.stop());
        video.srcObject = null;
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .cd-live-ready{background:rgba(10,6,4,.78)!important;border:1px solid rgba(213,154,75,.42);color:#f5c77e!important}
      .cd-live-ready::before{background:#d59a4b!important;box-shadow:0 0 8px #d59a4b!important}
      .cd-stream-shell{position:absolute;inset:0;display:grid;place-items:center;background:#050403;overflow:hidden}
      #cumin-live-video{width:100%;height:100%;object-fit:cover;display:block;background:#050403}
      .cd-stream-overlay{position:absolute;inset:0;display:grid;place-items:center;align-content:center;text-align:center;padding:28px;background:radial-gradient(circle at 50% 42%,rgba(255,0,127,.07),transparent 30%),linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.72));pointer-events:none}
      .cd-stream-mark{font:italic 600 clamp(1.7rem,5vw,3.2rem) Georgia,serif;color:#f5c77e;letter-spacing:.02em;text-shadow:0 0 20px rgba(255,0,127,.2)}
      .cd-stream-mark span{color:#d94b42}
      .cd-stream-state{display:flex;align-items:center;gap:8px;margin-top:12px;padding:7px 12px;border:1px solid rgba(213,154,75,.28);border-radius:999px;background:rgba(5,4,3,.72);font:700 .56rem Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#d8c9b8}
      .cd-stream-state i{width:6px;height:6px;border-radius:50%;background:#d59a4b;box-shadow:0 0 8px #d59a4b}
      .cd-stream-overlay p{max-width:420px;margin-top:10px;color:#9e9184;font:.66rem/1.5 Inter,system-ui,sans-serif}
    `;
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
