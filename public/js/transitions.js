/* Dungeon Transitions: fullscreen video overlay between pages */
(function(){
  'use strict';

  // Room-specific transition videos
  const ROOM_VIDEOS = {
    'velvet-room':    '/assets/art/02-velvet-room~2.mp4',
    'tangled-throne': '/assets/art/02-velvet-room~3.mp4',
    'pink-silk':      '/assets/art/02-velvet-room~4.mp4',
    'devils-playground': '/assets/art/05-devils-playground~2.mp4',
    'back-room':      '/assets/art/06-back-room~2.mp4',
    'the-dungeon':    '/assets/art/07-the-dungeon-vip~2.mp4',
    'haleys-halo':    '/assets/art/08-haleys-halo~2.mp4',
    'trans-kinks':    '/assets/art/09-trans-kinks~2.mp4'
  };

  // Generic fallback
  const GENERIC = '/assets/art/01-vip-chamber~2.mp4';

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

  window.DungeonTransition = function(href, from, to, roomId) {
    // Pick the best video: room-specific if entering a room, else generic
    var src = GENERIC;
    if (roomId && ROOM_VIDEOS[roomId]) {
      src = ROOM_VIDEOS[roomId];
    }

    video.src = src;
    video.currentTime = 0;
    fadeIn();

    video.play().then(function() {
      video.onended = function() { navigate(href); };
      setTimeout(function() { navigate(href); }, 6000);
    }).catch(function() {
      setTimeout(function() { navigate(href); }, 500);
    });
  };

  // Auto-attach to links with data-from/data-to attributes
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('[data-from][data-to]');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href') || link.dataset.href;
      // Extract room ID from href if going to a room
      var roomId = null;
      if (href && href.indexOf('room.html') !== -1) {
        var match = href.match(/[?&]id=([^&]+)/);
        if (match) roomId = decodeURIComponent(match[1]);
      }
      if (href) DungeonTransition(href, link.dataset.from, link.dataset.to, roomId);
    });
  });
})();
