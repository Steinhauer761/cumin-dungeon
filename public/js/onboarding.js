/**
 * CumIN Dungeon - Player Onboarding Walkthrough
 * Self-contained: auto-injects animated step-by-step overlay on first visit.
 * Include on index.html after gate entry.
 *
 * Usage: <script src="/public/js/onboarding.js"></script>
 * Only shows once (stores flag in localStorage).
 */
(function(){
'use strict';

var STORAGE_KEY = 'cumin_onboarded';
if(localStorage.getItem(STORAGE_KEY)) return;

var STEPS = [
  {
    icon: '\ud83c\udff0',
    title: 'Welcome to the Dungeon',
    text: 'A premium adult social club. Browse rooms, meet performers, play casino games, and earn tokens.'
  },
  {
    icon: '\ud83d\udeaa',
    title: 'Choose a Room',
    text: 'Each room has its own vibe and performers. Velvet Room, Tangled Throne, Devil\'s Playground, and more. Pick a door.'
  },
  {
    icon: '\ud83d\udcac',
    title: 'Chat & Connect',
    text: 'Real-time chat in every room. Send gifts, tip performers, or just hang in the Grand Hall.'
  },
  {
    icon: '\ud83c\udfb0',
    title: 'Hit the Casino',
    text: 'Slots, poker, keno, blackjack, and more. Win tokens to spend on gifts and VIP access.'
  },
  {
    icon: '\ud83d\udc8e',
    title: 'Tokens & Gifts',
    text: 'Everything runs on tokens. Earn them in games, buy them later. Send gifts to your favorite performers.'
  },
  {
    icon: '\u2728',
    title: 'Go VIP',
    text: 'Private 1-on-1 shows with performers. You set the pace, they set the rate. Very Intimate Pleasure.'
  }
];

// Inject styles
var style = document.createElement('style');
style.textContent = `
  #ob-overlay{position:fixed;inset:0;z-index:99998;background:rgba(5,3,4,.94);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .4s ease;pointer-events:none}
  #ob-overlay.active{opacity:1;pointer-events:auto}
  #ob-card{width:min(400px,calc(100% - 40px));padding:40px 30px;border-radius:20px;background:linear-gradient(180deg,#141010,#0a0604);border:1px solid rgba(190,137,77,.2);box-shadow:0 30px 80px rgba(0,0,0,.7);text-align:center;transform:scale(.9) translateY(20px);transition:transform .4s cubic-bezier(.16,1,.3,1),opacity .4s;opacity:0}
  #ob-overlay.active #ob-card{transform:scale(1) translateY(0);opacity:1}
  #ob-icon{font-size:3rem;margin-bottom:16px;display:block;animation:obBounce 2s ease-in-out infinite}
  @keyframes obBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  #ob-title{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:700;font-size:1.4rem;color:#f5c77e;margin-bottom:10px}
  #ob-text{font-family:'Inter',system-ui,sans-serif;font-size:.78rem;color:#a6998b;line-height:1.6;max-width:320px;margin:0 auto 24px}
  #ob-dots{display:flex;gap:6px;justify-content:center;margin-bottom:20px}
  .ob-dot{width:8px;height:8px;border-radius:50%;background:rgba(190,137,77,.2);transition:all .3s}
  .ob-dot.active{background:#d59a4b;transform:scale(1.3)}
  #ob-btns{display:flex;gap:10px;justify-content:center}
  .ob-btn{padding:12px 24px;border-radius:10px;font-size:.7rem;font-weight:800;cursor:pointer;border:none;transition:all .12s}
  .ob-btn:active{transform:scale(.95)}
  .ob-btn.next{background:linear-gradient(135deg,#f5c77e,#a06b28);color:#1a0d07;box-shadow:0 4px 16px rgba(213,154,75,.3)}
  .ob-btn.skip{background:transparent;border:1px solid rgba(190,137,77,.2);color:#7a6e64}
  .ob-btn.skip:hover{border-color:#d59a4b;color:#f5eee4}
  #ob-progress{position:absolute;top:0;left:0;height:3px;background:linear-gradient(90deg,#d59a4b,#f5c77e);border-radius:0 0 0 20px;transition:width .4s ease}
`;
document.head.appendChild(style);

var currentStep = 0;

function inject(){
  var overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.innerHTML = `
    <div id="ob-card" style="position:relative;overflow:hidden">
      <div id="ob-progress" style="width:0%"></div>
      <span id="ob-icon"></span>
      <h2 id="ob-title"></h2>
      <p id="ob-text"></p>
      <div id="ob-dots"></div>
      <div id="ob-btns">
        <button class="ob-btn skip" id="ob-skip">Skip</button>
        <button class="ob-btn next" id="ob-next">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Build dots
  var dotsContainer = document.getElementById('ob-dots');
  STEPS.forEach(function(_, i){
    var dot = document.createElement('div');
    dot.className = 'ob-dot' + (i===0?' active':'');
    dotsContainer.appendChild(dot);
  });

  document.getElementById('ob-skip').addEventListener('click', finish);
  document.getElementById('ob-next').addEventListener('click', next);

  // Show after short delay
  setTimeout(function(){
    overlay.classList.add('active');
    renderStep();
  }, 800);
}

function renderStep(){
  var step = STEPS[currentStep];
  document.getElementById('ob-icon').textContent = step.icon;
  document.getElementById('ob-title').textContent = step.title;
  document.getElementById('ob-text').textContent = step.text;
  document.getElementById('ob-progress').style.width = ((currentStep+1)/STEPS.length*100)+'%';
  
  // Update dots
  document.querySelectorAll('.ob-dot').forEach(function(dot, i){
    dot.classList.toggle('active', i===currentStep);
  });

  // Last step changes button
  var nextBtn = document.getElementById('ob-next');
  if(currentStep === STEPS.length-1){
    nextBtn.textContent = 'Enter the Dungeon';
  } else {
    nextBtn.textContent = 'Next';
  }
}

function next(){
  if(currentStep < STEPS.length-1){
    currentStep++;
    // Animate card
    var card = document.getElementById('ob-card');
    card.style.transform = 'scale(.95) translateX(-10px)';
    card.style.opacity = '.5';
    setTimeout(function(){
      renderStep();
      card.style.transform = 'scale(1) translateX(0)';
      card.style.opacity = '1';
    }, 150);
  } else {
    finish();
  }
}

function finish(){
  localStorage.setItem(STORAGE_KEY, 'true');
  var overlay = document.getElementById('ob-overlay');
  overlay.classList.remove('active');
  setTimeout(function(){ overlay.remove(); }, 500);
}

// Trigger after venue is shown (after age gate)
function waitForVenue(){
  var venue = document.getElementById('venue');
  if(!venue) { setTimeout(inject, 1000); return; }
  
  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      if(venue.classList.contains('active')){
        observer.disconnect();
        setTimeout(inject, 600);
      }
    });
  });
  observer.observe(venue, {attributes:true, attributeFilter:['class']});
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', waitForVenue);
} else {
  waitForVenue();
}

})();
