/* Dungeon Transitions: fullscreen video overlay between pages */
(function(){
  'use strict';

  // Map: key is 'from-to', value is video path
  // Rename your 9 videos to match these keys and drop in /public/assets/video/
  const VIDEOS = {
    'lobby-hall':   '/public/assets/video/lobby-to-hall.mp4',
    'lobby-room':   '/public/assets/video/lobby-to-room.mp4',
    'hall-room':    '/public/assets/video/hall-to-room.mp4',
    'hall-casino':  '/public/assets/video/hall-to-casino.mp4',
    'room-hall':    '/public/assets/video/room-to-hall.mp4',
    'room-vip':     '/public/assets/video/room-to-vip.mp4',
    'casino-hall':  '/public/assets/video/casino-to-hall.mp4',
    'hall-lobby':   '/public/assets/video/hall-to-lobby.mp4',
    'generic':      '/public/assets/video/generic.mp4'
  };

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.id = 'dt-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#070403;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .4s ease-out';

  const video = document.createElement('video');
  video.id = 'dt-video';
  video.muted = true;
  video.playsInline = true;
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0';
  overlay.appendChild(video);

  // Subtle vignette over video
  const vig = document.createElement('div');
  vig.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(7,4,3,.6) 100%);pointer-events:none';
  overlay.appendChild(vig);

  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(overlay);
  });

  function fadeIn() {
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';
  }

  function navigate(href) {
    window.location.href = href;
  }

  /**
   * Trigger a transition.
   * @param {string} href - Destination URL
   * @param {string} from - Current page key (lobby|hall|room|casino)
   * @param {string} to - Destination page key
   */
  window.DungeonTransition = function(href, from, to) {
    const key = from + '-' + to;
    const src = VIDEOS[key] || VIDEOS['generic'];

    video.src = src;
    video.currentTime = 0;
    fadeIn();

    video.play().then(function() {
      // Video is playing, navigate when it ends
      video.onended = function() { navigate(href); };
      // Safety net: if video takes too long, redirect anyway
      setTimeout(function() { navigate(href); }, 6000);
    }).catch(function() {
      // Video failed to load (not uploaded yet), do a simple fade
      setTimeout(function() { navigate(href); }, 500);
    });
  };

  // Utility: auto-attach transitions to links with data-transition attributes
  // Usage: <a href="/hall.html" data-from="lobby" data-to="hall">Enter Hall</a>
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('[data-from][data-to]');
      if (!link) return;
      e.preventDefault();
      const href = link.getAttribute('href') || link.dataset.href;
      if (href) DungeonTransition(href, link.dataset.from, link.dataset.to);
    });
  });
})();
