/* CumIN Dungeon immersive venue layer. Visual-only enhancement; never fabricates a live feed. */
(function () {
  const path = location.pathname;
  const isRoom = path.endsWith('/room.html');
  const isHall = path.endsWith('/hall.html');
  const isGame = path.includes('/games/') && /\.html$/.test(path);
  if (!isRoom && !isHall && !isGame) return;

  /* Room art map */
  const ROOM_ART = {
    'velvet-room': '/public/assets/rooms/velvet-room.svg',
    'tangled-throne': '/public/assets/rooms/room-03.svg',
    'pink-silk': '/public/assets/rooms/room-04.svg',
    'devils-playground': '/public/assets/rooms/room-05.svg',
    'back-room': '/public/assets/rooms/room-06.svg',
    'the-dungeon': '/public/assets/rooms/room-07.svg',
    'haleys-halo': '/public/assets/rooms/room-08.svg',
    'trans-kinks': '/public/assets/rooms/room-09.svg'
  };

  const css = document.createElement('style');
  css.textContent = `:root{--immersive-gold:#d8a04f;--immersive-hi:#f6d28e;--immersive-red:#8f1d28;--immersive-line:rgba(216,160,79,.22)}
  .venue-transition{position:fixed;inset:0;z-index:100000;background:#070504;display:grid;place-items:center;opacity:1;transition:opacity .6s cubic-bezier(.22,1,.36,1);pointer-events:auto}.venue-transition.is-leaving{opacity:0;pointer-events:none}.venue-transition .trans-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.5;filter:saturate(.8) brightness(.5)}.venue-transition:after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 15%,rgba(7,5,4,.7) 100%),linear-gradient(180deg,rgba(7,5,4,.3),rgba(7,5,4,.9))}.transition-copy{position:relative;z-index:2;text-align:center;padding:24px;animation:fadeUp .8s cubic-bezier(.22,1,.36,1) forwards}.transition-kicker{font:800 .58rem Inter,sans-serif;letter-spacing:.25em;text-transform:uppercase;color:var(--immersive-gold)}.transition-title{font:italic 400 clamp(2.2rem,7vw,4.6rem) Georgia,serif;color:var(--immersive-hi);margin:8px 0}.transition-note{font:.7rem Inter,sans-serif;color:#a8998b}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .room-studio{position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;background:#050403}.room-studio img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.82) contrast(1.08) brightness(.62);transform:scale(1.03);transition:transform 8s cubic-bezier(.22,1,.36,1)}.room-studio:hover img{transform:scale(1.06)}.room-studio:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,transparent 20%,rgba(0,0,0,.52) 100%),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))}.studio-frame{position:relative;z-index:2;width:min(860px,88%);aspect-ratio:16/9;border:1px solid rgba(246,210,142,.34);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 55px rgba(216,160,79,.08);background:#050403}.studio-frame video{width:100%;height:100%;object-fit:cover;display:block;background:#050403}.studio-status{position:absolute;z-index:3;top:14px;left:14px;display:flex;gap:8px;align-items:center;padding:6px 10px;border:1px solid rgba(213,154,75,.34);border-radius:999px;background:rgba(5,4,3,.78);font:800 .52rem Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f5c77e}.studio-status i{width:6px;height:6px;border-radius:50%;background:#d59a4b;box-shadow:0 0 10px #d59a4b;animation:statusPulse 2s infinite}@keyframes statusPulse{0%,100%{opacity:1}50%{opacity:.4}}.studio-lockup{position:absolute;inset:0;z-index:2;display:grid;place-items:center;align-content:center;text-align:center;padding:24px;background:radial-gradient(circle at 50% 42%,rgba(255,0,127,.06),transparent 30%),linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.72));pointer-events:none}.studio-lockup strong{display:block;font:italic 600 clamp(1.5rem,4vw,2.6rem) Georgia,serif;color:var(--immersive-hi);text-shadow:0 0 20px rgba(255,0,127,.16)}.studio-lockup span{display:block;margin-top:6px;font:600 .58rem Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#a8998b}.studio-lockup p{max-width:420px;margin-top:10px;color:#9e9184;font:.66rem/1.5 Inter,sans-serif}.room-page .video-placeholder{display:none}
  .casino-enhanced .game-card{padding:0;overflow:hidden;border-radius:16px;background:linear-gradient(145deg,#1a100d,#0d0806);box-shadow:0 16px 42px rgba(0,0,0,.35)}.casino-enhanced .game-card:before{content:"";display:block;height:112px;background:radial-gradient(circle,rgba(216,160,79,.18),transparent 55%),linear-gradient(135deg,#26130f,#0a0705);border-bottom:1px solid var(--immersive-line)}.casino-enhanced .game-card:nth-child(2):before{background:radial-gradient(circle,rgba(143,29,40,.3),transparent 58%),linear-gradient(135deg,#28100f,#090605)}.casino-enhanced .game-card:nth-child(3):before{background:radial-gradient(circle,rgba(216,160,79,.2),transparent 55%),linear-gradient(135deg,#17101b,#080608)}.casino-enhanced .game-card h3,.casino-enhanced .game-card p,.casino-enhanced .game-card span{margin-left:16px;margin-right:16px}.casino-enhanced .game-card h3{margin-top:14px;color:var(--immersive-hi);font-size:1.25rem}.casino-enhanced .game-card p{margin-bottom:12px}.casino-enhanced .game-card .bet-range,.casino-enhanced .game-card .max-win{display:inline-block;margin-bottom:16px}.casino-enhanced .tabs .tab.active{box-shadow:0 0 22px rgba(216,160,79,.18)}body.immersive-game{background:radial-gradient(circle at 50% 10%,rgba(216,160,79,.1),transparent 28%),radial-gradient(circle at 50% 100%,rgba(143,29,40,.12),transparent 35%),#070504!important}body.immersive-game .table{background:linear-gradient(145deg,#1a100d,#0c0806)!important;border-color:var(--immersive-gold)!important;box-shadow:0 24px 80px rgba(0,0,0,.58),0 0 35px rgba(216,160,79,.08)!important}.immersive-game .card{box-shadow:0 6px 18px rgba(0,0,0,.42)}.immersive-game .back-btn{background:rgba(7,5,4,.8);border-color:var(--immersive-line)}@media(max-width:899px){.studio-frame{width:94%;border-radius:12px}.room-studio img{object-position:center}.casino-enhanced .game-card:before{height:96px}}`;
  document.head.appendChild(css);

  /* ── Transition system (CSS crossfade, no video dependency) ── */
  function getTransitionArt(href) {
    if (href.includes('/games/')) return '/public/media/casino-reveal.svg';
    if (href.includes('room.html')) {
      const id = new URL(href, location.origin).searchParams.get('id') || 'velvet-room';
      return ROOM_ART[id] || '/public/assets/rooms/room-03.svg';
    }
    if (href.includes('hall.html')) return '/public/media/grand-hall.svg';
    return '/public/media/castle-entrance.svg';
  }

  function getTransitionTitle(href) {
    if (href.includes('/games/slots')) return 'Velvet Reels';
    if (href.includes('/games/roulette')) return 'Sin Roulette';
    if (href.includes('/games/blackjack')) return 'Strip Blackjack';
    if (href.includes('/games/dice')) return "Devil's Dice";
    if (href.includes('/games/highlow')) return 'High or Low';
    if (href.includes('/games/kinkwheel')) return 'After Dark Wheel';
    if (href.includes('hall.html')) return 'The Grand Hall';
    if (href.includes('room.html')) return 'Entering the Room';
    return 'CumIN Dungeon';
  }

  function playTransition(href) {
    const art = getTransitionArt(href);
    const title = getTransitionTitle(href);
    const overlay = document.createElement('div');
    overlay.className = 'venue-transition';
    overlay.innerHTML = `<div class="trans-bg" style="background-image:url('${art}')"></div><div class="transition-copy"><div class="transition-kicker">CumIN Dungeon</div><div class="transition-title">${title}</div><div class="transition-note">Preparing your experience\u2026</div></div>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add('is-leaving');
      setTimeout(() => { location.href = href; }, 500);
    }, 1400);
    return true;
  }

  /* ── Grand Hall: casino card enhancement + transitions ── */
  if (isHall) {
    const casino = document.getElementById('casino-section') || document.getElementById('casino-grid');
    if (casino) {
      const observer = new MutationObserver(() => {
        const grid = document.getElementById('casino-grid');
        if (grid && grid.children.length) {
          document.body.classList.add('casino-enhanced');
          observer.disconnect();
        }
      });
      observer.observe(document.body, { subtree: true, childList: true });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('.game-card, .games-grid a, #casino-grid a');
      if (!a || !a.href) return;
      e.preventDefault();
      playTransition(a.href);
    });
  }

  /* ── Game pages ── */
  if (isGame) {
    document.body.classList.add('immersive-game');
    const title = document.querySelector('h1')?.textContent || 'Dungeon Game';
    document.title = title + ' | CumIN Dungeon';
  }

  /* ── Room pages: studio overlay with correct art path ── */
  if (isRoom) {
    const area = document.querySelector('.video-area');
    const titleEl = document.getElementById('room-title');
    if (area) {
      const studio = document.createElement('div');
      studio.className = 'room-studio';
      const img = document.createElement('img');
      const id = new URLSearchParams(location.search).get('id') || 'velvet-room';
      img.src = ROOM_ART[id] || '/public/assets/rooms/room-03.svg';
      img.alt = 'Room atmosphere';
      img.onerror = function() { this.src = '/public/assets/rooms/room-03.svg'; };
      const frame = document.createElement('div');
      frame.className = 'studio-frame';
      frame.innerHTML = '<video id="cumin-live-video" playsinline autoplay muted poster="' + (ROOM_ART[id] || '/public/assets/rooms/room-03.svg') + '"></video><div class="studio-status"><i></i> STREAM READY</div><div class="studio-lockup"><strong></strong><span>Awaiting verified performer connection</span><p>When a verified performer connects their webcam, the live feed appears here.</p></div>';
      frame.querySelector('strong').textContent = titleEl?.textContent || 'Live Room';
      studio.append(img, frame);
      area.prepend(studio);

      window.CumINLiveSurface = {
        video: frame.querySelector('#cumin-live-video'),
        attachStream(stream) {
          if (!stream) return false;
          this.video.srcObject = stream;
          this.video.muted = false;
          this.video.play().catch(() => {});
          frame.querySelector('.studio-lockup')?.remove();
          return true;
        },
        clearStream() {
          this.video.srcObject?.getTracks?.().forEach(t => t.stop());
          this.video.srcObject = null;
        }
      };

      const roomObserver = new MutationObserver(() => {
        const t = titleEl?.textContent;
        if (t && t !== 'Loading...') frame.querySelector('strong').textContent = t;
      });
      if (titleEl) roomObserver.observe(titleEl, { childList: true, subtree: true, characterData: true });
    }
  }
})();
