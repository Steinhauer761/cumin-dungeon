(function () {
  'use strict';

  const ROOM_KEYS = {
    'grand hall':'grand-hall', 'cumin dungeon':'cumin-dungeon', 'vip chamber':'vip-chamber',
    'velvet room':'velvet-room', 'tangled throne':'tangled-throne', 'pink silk':'pink-silk',
    "devil's playground":'devils-playground', 'devils playground':'devils-playground',
    'back room':'back-room', 'the dungeon':'the-dungeon', "haley's halo":'haleys-halo',
    'haleys halo':'haleys-halo', 'trans kinks':'trans-kinks'
  };

  const ROOM_ART = {
    'grand-hall': '/public/assets/art/6700.png',
    'velvet-room': '/public/assets/art/6690.png',
    'tangled-throne': '/public/assets/art/6694.png',
    'pink-silk': '/public/assets/art/6691.png',
    'devils-playground': '/public/assets/art/6695.png',
    'back-room': '/public/assets/art/6696.png',
    'the-dungeon': '/public/assets/art/6693.png',
    'haleys-halo': '/public/assets/art/6699.png',
    'trans-kinks': '/public/assets/art/6698.png'
  };

  function normalizePublicPath(src) {
    if (!src || typeof src !== 'string') return src;
    try {
      const url = new URL(src, location.href);
      // Fix ClickUp CDN URLs to local PNGs
      if (url.hostname.includes('clickup.com')) {
        const match = Object.entries(ROOM_KEYS).find(([label]) => src.toLowerCase().includes(label.replace(/[^a-z0-9]+/g, '')));
        if (match) return ROOM_ART[match[1]] || '/public/assets/art/6700.png';
        return '/public/assets/art/6700.png';
      }
      // Fix broken /api/assets/ paths
      if (url.pathname.startsWith('/api/assets/')) {
        const id = url.pathname.replace('/api/assets/', '');
        return ROOM_ART[id] || '/public/assets/art/6700.png';
      }
      // Fix old /public/assets/rooms/ SVG paths
      if (url.pathname.startsWith('/public/assets/rooms/')) {
        const file = url.pathname.replace('/public/assets/rooms/', '').replace('.svg', '');
        const idMap = {
          'grand-hall': 'grand-hall', 'velvet-room': 'velvet-room',
          'room-03': 'tangled-throne', 'room-04': 'pink-silk',
          'room-05': 'devils-playground', 'room-06': 'back-room',
          'room-07': 'the-dungeon', 'room-08': 'haleys-halo', 'room-09': 'trans-kinks'
        };
        const mapped = idMap[file];
        if (mapped && ROOM_ART[mapped]) return ROOM_ART[mapped];
      }
    } catch (_) {}
    return src;
  }

  function fallbackFor(el) {
    if (!el || el.dataset.cdFallback === 'true') return;
    el.dataset.cdFallback = 'true';
    el.classList.add('cd-media-fallback');
    el.style.background = 'radial-gradient(circle at 50% 40%, rgba(213,154,75,0.08), rgba(5,3,4,0.95))';
    el.style.objectFit = 'cover';
  }

  function wire(el) {
    if (!el || el.dataset.cdMediaWired === 'true') return;
    el.dataset.cdMediaWired = 'true';
    const src = el.getAttribute('src');
    const alt = (el.getAttribute('alt') || '').trim().toLowerCase();
    const roomKey = ROOM_KEYS[alt];
    const normalized = roomKey ? (ROOM_ART[roomKey] || '/public/assets/art/6700.png') : normalizePublicPath(src);
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
