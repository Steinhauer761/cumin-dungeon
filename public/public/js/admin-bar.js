/* Compatibility loader for pages that still reference /public/js/admin-bar.js. */
(function () {
  'use strict';
  const s = document.createElement('script');
  s.src = '/js/admin-bar.js';
  s.dataset.cdAdminBar = 'true';
  document.head.appendChild(s);
})();
