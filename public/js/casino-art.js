/* Casino Art Backgrounds: maps each game to the actual artwork stored in /public/assets/art. */
(function(){
  'use strict';
  var ART_MAP = {
    'slots':     '/public/assets/art/b3239591-8c30-4dae-b261-7c42ab8022f1.png',
    'roulette':  '/public/assets/art/cd1f1eae-f7ce-4c72-85b1-457d8bf4f3c1.png',
    'blackjack': '/public/assets/art/d8541cfb-406f-46c1-8ec3-39af3b570035.png',
    'dice':      '/public/assets/art/e6c0d2d7-f4e2-40bb-b34c-13b84d7b7fe1.png',
    'highlow':   '/public/assets/art/f7ce0ef5-b1c5-4ea5-8488-d5bb36035de3.png',
    'kinkwheel': '/public/assets/art/file_00000000b6c081fdaa791db34c771c9e.png'
  };
  var path = window.location.pathname;
  var key = null;
  for (var k in ART_MAP) { if (path.indexOf(k) !== -1) { key = k; break; } }
  if (!key) return;
  var bg = document.createElement('div');
  bg.style.cssText = 'position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none';
  bg.innerHTML = '<img src="' + ART_MAP[key] + '" alt="" style="width:100%;height:100%;object-fit:cover;opacity:.12;animation:casinoBgPan 30s ease-in-out infinite alternate">';
  var style = document.createElement('style');
  style.textContent = '@keyframes casinoBgPan{from{transform:scale(1)}to{transform:scale(1.06) translate(-1%,-1%)}}';
  document.head.appendChild(style);
  document.body.insertBefore(bg, document.body.firstChild);
  var app = document.querySelector('.app');
  if (app) app.style.position = 'relative';
})();
