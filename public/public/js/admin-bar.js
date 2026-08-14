/* Compatibility loader for pages that still reference /public/js/admin-bar.js. */
(function () {
  'use strict';
  const scripts = [
    ['/js/media-fallbacks.js', 'data-cd-media'],
    ['/js/immersive-experience.js', 'data-cd-immersive'],
    ['/js/room-live-ui.js', 'data-cd-room-live']
  ];
  scripts.forEach(([src, marker]) => {
    if (document.querySelector(`script[${marker}]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute(marker, 'true');
    document.head.appendChild(s);
  });

  const map = {
    '07b7448f-853c-48e6-82e8-435de3962bb1':'grand-hall',
    '88dc235b-b9f9-45e9-b104-1040db693e44':'velvet-room',
    '8cd96905-8077-4696-90ac-1eb639996ada':'tangled-throne',
    'd38a9f14-ea11-428a-a1dc-d78e4ab0c4b1':'pink-silk',
    'ddd616e1-7a9d-448d-ba9c-7e3e0b886c3b':'devils-playground',
    '9df03371-3953-469b-91db-7a2393cbb1d1':'back-room',
    'c073943a-ddcc-4150-a58c-46b4dc0c514b':'the-dungeon',
    '084dd23b-f9b6-4d18-aed9-0d8c16f74e51':'haleys-halo',
    '8a1e6dee-2e01-4a2d-91b7-f25a13941de6':'trans-kinks'
  };
  function rewrite() {
    document.querySelectorAll('img[src*="app-attachments-public.clickup.com"]').forEach(img => {
      if (img.dataset.cdProxied === 'true') return;
      const m = img.src.match(/clickup\.com\/([a-f0-9-]+)\.png/i);
      const key = m && map[m[1]];
      if (!key) return;
      img.dataset.cdProxied = 'true';
      img.src = '/api/assets/' + key;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rewrite, {once:true});
  else rewrite();
  new MutationObserver(rewrite).observe(document.documentElement, {childList:true, subtree:true});
})();
