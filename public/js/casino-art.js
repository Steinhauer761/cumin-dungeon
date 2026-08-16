/* Casino Art Backgrounds: auto-injects art into casino game pages */
(function(){
  'use strict';
  var ART_MAP = {
    'slots':     '/public/assets/art/6733.png',
    'roulette':  '/public/assets/art/6734.png',
    'blackjack': '/public/assets/art/6735.png',
    'dice':      '/public/assets/art/6736.png',
    'highlow':   '/public/assets/art/6737.png',
    'kinkwheel': '/public/assets/art/6738.png'
  };

  // Detect which game page we're on
  var path = window.location.pathname;
  var key = null;
  for (var k in ART_MAP) {
    if (path.indexOf(k) !== -1) { key = k; break; }
  }
  if (!key) return;

  // Inject fullscreen background art behind the game
  var bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none';
  bg.innerHTML = '<img src="' + ART_MAP[key] + '" style="width:100%;height:100%;object-fit:cover;opacity:.12;animation:casinoBgPan 30s ease-in-out infinite alternate">';

  var style = document.createElement('style');
  style.textContent = '@keyframes casinoBgPan{from{transform:scale(1)}to{transform:scale(1.06) translate(-1%,-1%)}}';
  document.head.appendChild(style);

  document.body.insertBefore(bg, document.body.firstChild);

  // Make sure .app has relative positioning to sit above the background
  var app = document.querySelector('.app');
  if (app) app.style.position = 'relative';
})();
