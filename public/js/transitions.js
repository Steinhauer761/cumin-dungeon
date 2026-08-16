/* Dungeon Transitions: fullscreen video overlay between pages */
(function(){
  'use strict';

  // Room-specific transition videos (using actual uploaded filenames)
  var ROOM_VIDEOS = {
    'velvet-room':       '/assets/art/Velvet Room~2.mp4',
    'tangled-throne':    '/assets/art/Tangled Throne.mp4',
    'pink-silk':         '/assets/art/Pink Silk.mp4',
    'devils-playground': '/assets/art/05-devils-playground~2.mp4',
    'back-room':         '/assets/art/06-back-room~2.mp4',
    'the-dungeon':       '/assets/art/07-the-dungeon-vip~2.mp4',
    'haleys-halo':       "/assets/art/Haley's Halo.mp4",
    'trans-kinks':       '/assets/art/09-trans-kinks~2.mp4'
  };

  // Named transitions
  var NAMED = {
    'lobby-hall':  '/assets/art/Hallway Transition 1-3-3.mp4',
    'hall-casino': '/assets/art/hall-casino-sequence.mp4',
    'hall-lobby':  '/assets/art/Hallway Transition 2-3-2.mp4'
  };

  var GENERIC = '/assets/art/Hallway Transition 3-3-1.mp4';

  // Build overlay
  var overlay = document.createElement('div');
  overlay.id = 'dt-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#070403;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .4s ease-out';

  var video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0';
  overlay.appendChild(video);

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
    var src = GENERIC;
    // Room-specific video
    if (roomId && ROOM_VIDEOS[roomId]) {
      src = ROOM_VIDEOS[roomId];
    }
    // Named transition (lobby->hall, hall->casino, etc)
    else if (NAMED[from + '-' + to]) {
      src = NAMED[from + '-' + to];
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

  // Auto-attach to data-from/data-to links
  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('[data-from][data-to]');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href') || link.dataset.href;
      var roomId = null;
      if (href && href.indexOf('room') !== -1) {
        var match = href.match(/[?&]id=([^&]+)/);
        if (match) roomId = decodeURIComponent(match[1]);
      }
      if (href) DungeonTransition(href, link.dataset.from, link.dataset.to, roomId);
    });
  });
})();
