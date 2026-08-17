/* Dungeon Transitions: fullscreen video overlay between pages */
(function(){
  'use strict';

  var BASE = '/public/assets/art/';

  var ROOM_VIDEOS = {
    'velvet-room':       BASE + 'Velvet Room~2.mp4',
    'tangled-throne':    BASE + 'Tangled Throne.mp4',
    'pink-silk':         BASE + 'Pink Silk.mp4',
    'devils-playground': BASE + '05-devils-playground~2.mp4',
    'back-room':         BASE + '06-back-room~2.mp4',
    'the-dungeon':       BASE + '07-the-dungeon-vip~2.mp4',
    'haleys-halo':       BASE + "Haley's Halo.mp4",
    'trans-kinks':       BASE + '09-trans-kinks~2.mp4'
  };

  var NAMED = {
    'lobby-hall':  BASE + 'Hallway Transition 1-3-3.mp4',
    'hall-casino': BASE + 'hall-casino-sequence.mp4',
    'lobby-casino': BASE + 'hall-casino-sequence.mp4',
    'room-casino': BASE + 'hall-casino-sequence.mp4',
    'hall-lobby':  BASE + 'Hallway Transition 2-3-2.mp4'
  };

  var CASINO_TRANSITION = BASE + 'hall-casino-sequence.mp4';
  var GENERIC = BASE + 'Hallway Transition 3-3-1.mp4';

  var overlay = document.createElement('div');
  overlay.id = 'dt-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#070403;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .4s ease-out';

  var video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0';
  overlay.appendChild(video);

  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(overlay);
  });

  function navigate(href) { window.location.href = href; }

  window.DungeonTransition = function(href, from, to, roomId) {
    var src = GENERIC;

    // Casino entry always gets the dedicated casino transition, no matter where it starts.
    if (to === 'casino') src = CASINO_TRANSITION;
    else if (roomId && ROOM_VIDEOS[roomId]) src = ROOM_VIDEOS[roomId];
    else if (NAMED[from + '-' + to]) src = NAMED[from + '-' + to];

    video.src = src;
    video.currentTime = 0;
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';

    var fallback = setTimeout(function() { navigate(href); }, 6500);
    video.onended = function() { clearTimeout(fallback); navigate(href); };
    video.play().catch(function() {
      clearTimeout(fallback);
      setTimeout(function() { navigate(href); }, 350);
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('[data-from][data-to]');
      if (!link) return;
      var href = link.getAttribute('href') || link.dataset.href;
      if (!href) return;
      e.preventDefault();
      var roomId = null;
      if (href.indexOf('room') !== -1) {
        var match = href.match(/[?&]id=([^&]+)/);
        if (match) roomId = decodeURIComponent(match[1]);
      }
      DungeonTransition(href, link.dataset.from, link.dataset.to, roomId);
    });
  });
})();
