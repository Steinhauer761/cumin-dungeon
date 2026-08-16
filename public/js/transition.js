/**
 * DungeonTransition — Fullscreen video transitions between pages
 * Usage: DungeonTransition.go('/hall.html') or DungeonTransition.go('/room.html?id=velvet-room')
 * Falls back to instant navigation if video not found or errors.
 */
const DungeonTransition = (() => {
  /* Video map: from-page -> to-page -> video file */
  const TRANSITION_MAP = {
    'gate-to-lobby':   '/public/media/transitions/gate-to-lobby.mp4',
    'lobby-to-hall':   '/public/media/transitions/lobby-to-hall.mp4',
    'hall-to-room':    '/public/media/transitions/hall-to-room.mp4',
    'hall-to-casino':  '/public/media/transitions/hall-to-casino.mp4',
    'room-to-vip':     '/public/media/transitions/room-to-vip.mp4',
    'lobby-to-room':   '/public/media/transitions/lobby-to-room.mp4',
    'vip-to-room':     '/public/media/transitions/vip-to-room.mp4',
    'hall-to-lobby':   '/public/media/transitions/hall-to-lobby.mp4',
    'room-to-hall':    '/public/media/transitions/room-to-hall.mp4'
  };

  /* Detect current page context */
  function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('castle-lobby')) return 'lobby';
    if (path.includes('hall')) return 'hall';
    if (path.includes('private-show')) return 'vip';
    if (path.includes('room')) return 'room';
    if (path === '/' || path.includes('index')) return 'gate';
    return 'unknown';
  }

  /* Detect destination context */
  function getDestPage(url) {
    if (url.includes('castle-lobby')) return 'lobby';
    if (url.includes('hall')) return 'hall';
    if (url.includes('private-show')) return 'vip';
    if (url.includes('room')) return 'room';
    if (url === '/' || url.includes('index')) return 'gate';
    if (url.includes('games/')) return 'casino';
    return 'unknown';
  }

  /* Find the right transition video */
  function findVideo(from, to) {
    const key = from + '-to-' + to;
    return TRANSITION_MAP[key] || null;
  }

  /* Create the overlay element (once) */
  let overlay = null;
  function getOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'dungeon-transition';
    overlay.innerHTML = `
      <style>
        #dungeon-transition {
          position: fixed; inset: 0; z-index: 99999;
          background: #070403;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.4s ease;
        }
        #dungeon-transition.active { opacity: 1; pointer-events: all; }
        #dungeon-transition.fade-out { opacity: 0; }
        #dungeon-transition video {
          width: 100%; height: 100%; object-fit: cover;
          position: absolute; inset: 0;
        }
      </style>
      <video id="dt-video" muted playsinline preload="auto"></video>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  /* Main transition function */
  function go(destUrl) {
    const from = getCurrentPage();
    const to = getDestPage(destUrl);
    const videoSrc = findVideo(from, to);

    /* No video for this route: just navigate */
    if (!videoSrc) {
      window.location.href = destUrl;
      return;
    }

    const el = getOverlay();
    const video = el.querySelector('#dt-video');

    /* Reset state */
    el.classList.remove('fade-out');
    video.src = videoSrc;
    video.currentTime = 0;

    /* Fade in the overlay */
    requestAnimationFrame(() => {
      el.classList.add('active');
    });

    /* When video is ready, play it */
    video.oncanplay = () => {
      video.play().catch(() => {
        /* Autoplay blocked: just navigate */
        window.location.href = destUrl;
      });
    };

    /* When video ends, fade out then navigate */
    video.onended = () => {
      el.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = destUrl;
      }, 400); /* match the CSS transition duration */
    };

    /* Error fallback: just navigate */
    video.onerror = () => {
      window.location.href = destUrl;
    };

    /* Safety timeout: if video takes too long, just go (8 seconds max) */
    setTimeout(() => {
      if (!video.ended) {
        el.classList.add('fade-out');
        setTimeout(() => { window.location.href = destUrl; }, 300);
      }
    }, 8000);
  }

  return { go, getCurrentPage, getDestPage, TRANSITION_MAP };
})();
