(function () {
  'use strict';

  const ROOM_SPRITE = '/public/assets/art/cumin-room-sprite.webp';
  const ROOM_SPRITE_POSITIONS = {
    'grand hall': '0% 0%',
    'cumin dungeon': '33.333% 0%',
    'vip chamber': '66.666% 0%',
    'velvet room': '100% 0%',
    'tangled throne': '0% 50%',
    'pink silk': '33.333% 50%',
    "devil's playground": '66.666% 50%',
    'devils playground': '66.666% 50%',
    'back room': '100% 50%',
    'the dungeon': '0% 100%',
    "haley's halo": '33.333% 100%',
    'haleys halo': '33.333% 100%',
    'trans kinks': '66.666% 100%'
  };

  function normalizePublicPath(src) {
    if (!src || typeof src !== 'string') return src;
    return src;
  }

  function fallbackFor(el) {
    if (!el || el.dataset.cdFallback === 'true') return;
    el.dataset.cdFallback = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'cd-media-fallback';
    wrapper.setAttribute('aria-label', 'CumIN Dungeon artwork unavailable');
    wrapper.style.aspectRatio = el.videoWidth && el.videoHeight ? `${el.videoWidth}/${el.videoHeight}` : '16 / 9';

    el.replaceWith(wrapper);
  }

  function roomSpriteForImage(el) {
    if (!el || el.tagName !== 'IMG') return false;
    const card = el.closest('.entrance');
    if (!card) return false;

    const key = (el.alt || '').trim().toLowerCase();
    const position = ROOM_SPRITE_POSITIONS[key];
    if (!position) return false;

    const replacement = document.createElement('div');
    replacement.className = 'entrance-img cd-room-sprite';
    replacement.setAttribute('role', 'img');
    replacement.setAttribute('aria-label', el.alt || 'CumIN Dungeon room artwork');
    replacement.style.backgroundImage = `url("${ROOM_SPRITE}")`;
    replacement.style.backgroundPosition = position;
    replacement.style.backgroundSize = '400% 300%';
    replacement.style.backgroundRepeat = 'no-repeat';

    el.replaceWith(replacement);
    return true;
  }

  function wire(el) {
    if (!el || el.dataset.cdMediaWired === 'true') return;
    el.dataset.cdMediaWired = 'true';

    if (roomSpriteForImage(el)) return;

    const src = el.getAttribute('src');
    const normalized = normalizePublicPath(src);
    if (normalized && normalized !== src) el.setAttribute('src', normalized);

    if (el.tagName === 'IMG') {
      el.addEventListener('error', () => fallbackFor(el), { once: true });
      if (el.complete && el.naturalWidth === 0) fallbackFor(el);
    } else if (el.tagName === 'VIDEO') {
      el.addEventListener('error', () => fallbackFor(el), { once: true });
      el.addEventListener('stalled', () => {
        if (el.readyState === 0) fallbackFor(el);
      }, { once: true });
    }
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && (root.matches('img') || root.matches('video'))) wire(root);
    root.querySelectorAll('img, video').forEach(wire);
  }

  function loadTheme() {
    if (document.querySelector('link[data-cd-theme]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/public/css/cumin-dungeon-theme.css';
    link.dataset.cdTheme = 'true';
    document.head.appendChild(link);
  }

  function init() {
    loadTheme();
    scan(document);
    new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType === 1) scan(node);
      }));
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.CumINMedia = { normalizePublicPath, fallbackFor, scan, roomSpriteForImage };
})();
