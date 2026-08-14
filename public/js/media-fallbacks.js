(function () {
  'use strict';

  const ROOM_KEYS = {
    'grand hall':'grand-hall', 'cumin dungeon':'cumin-dungeon', 'vip chamber':'vip-chamber',
    'velvet room':'velvet-room', 'tangled throne':'tangled-throne', 'pink silk':'pink-silk',
    "devil's playground":'devils-playground', 'devils playground':'devils-playground',
    'back room':'back-room', 'the dungeon':'the-dungeon', "haley's halo":'haleys-halo',
    'haleys halo':'haleys-halo', 'trans kinks':'trans-kinks'
  };

  function normalizePublicPath(src) {
    if (!src || typeof src !== 'string') return src;
    try {
      const url = new URL(src, location.href);
      if (url.hostname.includes('clickup.com')) {
        const file = decodeURIComponent(url.pathname.split('/').pop() || '').toLowerCase();
        const match = Object.entries(ROOM_KEYS).find(([label]) => src.toLowerCase().includes(label.replace(/[^a-z0-9]+/g, '')));
        if (match) return '/api/assets/' + match[1];
        if (file.endsWith('.png') && src.toLowerCase().includes('07b7448f')) return '/api/assets/grand-hall';
      }
    } catch (_) {}
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

  function wire(el) {
    if (!el || el.dataset.cdMediaWired === 'true') return;
    el.dataset.cdMediaWired = 'true';
    const src = el.getAttribute('src');
    const alt = (el.getAttribute('alt') || '').trim().toLowerCase();
    const roomKey = ROOM_KEYS[alt];
    const normalized = roomKey ? '/api/assets/' + roomKey : normalizePublicPath(src);
    if (normalized && normalized !== src) el.setAttribute('src', normalized);

    if (el.tagName === 'IMG') {
      el.addEventListener('error', () => fallbackFor(el), { once: true });
      if (el.complete && el.naturalWidth === 0) fallbackFor(el);
    } else if (el.tagName === 'VIDEO') {
      el.addEventListener('error', () => fallbackFor(el), { once: true });
      el.addEventListener('stalled', () => { if (el.readyState === 0) fallbackFor(el); }, { once: true });
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
    new MutationObserver(mutations => mutations.forEach(m => m.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node); })))
      .observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.CumINMedia = { normalizePublicPath, fallbackFor, scan };
})();
