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
    'grand-hall': '/public/assets/art/generated-image-daa4cd17-25fb-4a5c-80c9-6dc7a21a1780.png',
    'velvet-room': '/public/assets/art/generated-image-0acba5f7-62ef-43f1-aef4-e3e17c6c82cf.png',
    'tangled-throne': '/public/assets/art/generated-image-0d4ddd1e-d44c-4c7a-acad-c14ddec351f4.png',
    'pink-silk': '/public/assets/art/generated-image-e484a4e4-192c-4960-8d79-e8ccae2783fa.png',
    'devils-playground': '/public/assets/art/generated-image-62e002e9-1fa7-4490-a725-c4edc032f71a.png',
    'back-room': '/public/assets/art/generated-image-f7f30b3a-b34f-40fd-bcf2-b40e196925f0.png',
    'the-dungeon': '/public/assets/art/generated-image-b563c6cb-14b7-4bdb-988a-4c4e20f49718.png',
    'haleys-halo': '/public/assets/art/generated-image-0a9dc8ec-c558-4aad-8456-a26f0f66790f.png',
    'trans-kinks': '/public/assets/art/generated-image-4fca1285-728d-4f58-8202-7d6e1d8a5baf.png'
  };

  function normalizePublicPath(src) {
    if (!src || typeof src !== 'string') return src;
    try {
      const url = new URL(src, location.href);
      // Fix ClickUp CDN URLs to local PNGs
      if (url.hostname.includes('clickup.com')) {
        const match = Object.entries(ROOM_KEYS).find(([label]) => src.toLowerCase().includes(label.replace(/[^a-z0-9]+/g, '')));
        if (match) return ROOM_ART[match[1]] || '/public/assets/art/generated-image-daa4cd17-25fb-4a5c-80c9-6dc7a21a1780.png';
        return '/public/assets/art/generated-image-daa4cd17-25fb-4a5c-80c9-6dc7a21a1780.png';
      }
      // Fix broken /api/assets/ paths
      if (url.pathname.startsWith('/api/assets/')) {
        const id = url.pathname.replace('/api/assets/', '');
        return ROOM_ART[id] || '/public/assets/art/generated-image-daa4cd17-25fb-4a5c-80c9-6dc7a21a1780.png';
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
    const normalized = roomKey ? (ROOM_ART[roomKey] || '/public/assets/art/generated-image-daa4cd17-25fb-4a5c-80c9-6dc7a21a1780.png') : normalizePublicPath(src);
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
