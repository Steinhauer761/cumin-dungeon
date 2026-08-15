(() => {
  const app = document.getElementById('game-app');
  if (!app) return;
  const game = app.dataset.game;
  const BETS = [5, 10, 25, 50, 100];
  let balance = 500;
  let bet = 10;
  let busy = false;
  let session = 0;

  const titles = {
    slots: ['Dungeon Slots', 'Velvet Reels', 'Five reels, wilds, scatters and free spins.'],
    roulette: ['Sin Roulette', 'The Velvet Wheel', 'European roulette with straight and outside bets.'],
    blackjack: ['Strip Blackjack', 'The Black Table', 'Six-deck blackjack with hit, stand and double.'],
    dice: ["Devil's Dice", 'The House of Chance', 'Choose the risk. Two dice decide the payoff.'],
    highlow: ['High or Low', 'The Temptation Deck', 'Build a streak, then decide when to walk away.'],
    kinkwheel: ['Kink Wheel', 'After Dark', 'A premium multiplier wheel with escalating risk.']
  };

  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c])); }
  function ui() { return { stage: document.getElementById('stage'), bal: document.getElementById('balance'), bet: document.getElementById('bet'), session: document.getElementById('session') }; }
  function setBalance(v) { balance = Math.max(0, Math.floor(v)); ui().bal.textContent = balance; }
  function addSession() { session += 1; ui().session.textContent = session; }
  function msg(el, text, kind='gold') { el.innerHTML = `<div class="result ${kind}">${esc(text)}</div>`; }
  function spend(amount = bet) { if (busy || amount < 1 || balance < amount) return false; setBalance(balance - amount); return true; }
  function controls() { return `<div class="controls"><button class="btn" id="minus">−</button><span class="gold" id="betValue">${bet}</span><button class="btn" id="plus">+</button><button class="btn" id="max">MAX</button></div>`; }
  function bindBet() {
    const sync = () => { ui().bet.textContent = bet; document.getElementById('betValue').textContent = bet; };
    document.getElementById('minus').onclick = () => { const i = Math.max(0, BETS.indexOf(bet) - 1); bet = BETS[i]; sync(); };
    document.getElementById('plus').onclick = () => { const i = Math.min(BETS.length - 1, Math.max(0, BETS.indexOf(bet) + 1)); bet = BETS[i]; sync(); };
    document.getElementById('max').onclick = () => { bet = Math.min(BETS[BETS.length - 1], balance); if (bet === 0) bet = BETS[0]; sync(); };
  }
  function shell() {
    const t = titles[game] || ['Casino Game', 'After Dark', 'Token play'];
    app.innerHTML = `<div class="game-shell"><div class="game-top"><div class="brand">CUM IN DUNGEON · CASINO</div><a class="back" href="/hall.html">← Grand Hall</a></div><section class="hero"><div class="eyebrow">VIP AFTER DARK · TOKEN PLAY</div><div class="title">${esc(t[0])}</div><div class="subtitle">${esc(t[1])} · ${esc(t[2])}</div><div class="stats"><div class="stat"><span>Balance</span><strong id="balance">${balance}</strong></div><div class="stat"><span>Current Bet</span><strong id="bet">${bet}</strong></div><div class="stat"><span>Session</span><strong id="session">0</strong></div></div></section><section class="stage" id="stage"></section><div class="notice">Prototype token economy only. No cash wagering or real-money prizes.</div></div>`;
  }

  function slots() {
    const s = ui().stage;
    s.innerHTML = `<div class="game-art"><div class="game-art-mark">Velvet Reels</div></div><div class="panel" style="margin-top:12px"><div class="label">Five reels · three rows · wild + scatter</div><div class="slot-grid" id="slots"></div><div class="controls"><button class="btn" id="auto">AUTO 5</button><button class="btn primary" id="spin">SPIN</button><button class="btn danger" id="stop">STOP</button></div><div id="sr" class="result"></div></div>${controls()}<div class="panel" style="margin-top:10px"><div class="label">Paytable</div><p class="subtitle">👑 50x · 💎 25x · 🔥 15x · 🌹 10x · 🔑 8x · ⛓️ 5x · 3+ ⭐ scatters award 5 free spins.</p></div>`;
    bindBet();
    const grid = document.getElementById('slots'), out = document.getElementById('sr');
    const symbols = ['🌹','🔑','⛓️','🔥','💎','👑','⭐'];
    const weights = [25,20,18,15,12,7,3];
    const pays = {'👑':50,'💎':25,'🔥':15,'🌹':10,'🔑':8,'⛓️':5,'⭐':75};
    let freeSpins = 0, stopRequested = false;
    const pick = () => { let n = Math.random() * weights.reduce((a,b)=>a+b,0); for(let i=0;i<weights.length;i++){ n -= weights[i]; if(n < 0) return symbols[i]; } return symbols[0]; };
    const draw = vals => { grid.innerHTML = vals.map(x=>`<div class="slot-cell">${x}</div>`).join(''); };
    draw(Array.from({length:15}, pick));
    async function spin() {
      if (busy || (!freeSpins && !spend())) return;
      busy = true; stopRequested = false;
      if (freeSpins > 0) freeSpins--;
      for (let i=0;i<14 && !stopRequested;i++) { draw(Array.from({length:15}, pick)); await new Promise(r=>setTimeout(r,45)); }
      const reels = Array.from({length:15}, pick); draw(reels);
      let payout = 0;
      for(let row=0;row<3;row++){
        const line = reels.slice(row*5,row*5+5), base = line.find(x=>x!=='⭐') || '⭐';
        if(line.every(x=>x===base || x==='⭐')) payout += bet * (pays[base] || 2);
      }
      const scatters = reels.filter(x=>x==='⭐').length;
      if (scatters >= 3) { freeSpins += 5; msg(out, `Scatter bonus · ${freeSpins} free spins queued`, 'gold'); }
      if (payout > 0) msg(out, `BIG WIN · +${Math.floor(payout)} tokens`, 'win');
      else if (scatters < 3) msg(out, 'No line hit · the house keeps the bet', 'lose');
      if (payout > 0) setBalance(balance + Math.floor(payout));
      addSession(); busy = false;
    }
    document.getElementById('spin').onclick = spin;
    document.getElementById('auto').onclick = async () => { if (busy) return; for(let i=0;i<5;i++){ if(balance < bet && freeSpins === 0) break; await spin(); await new Promise(r=>setTimeout(r,250)); } };
    document.getElementById('stop').onclick = () => { stopRequested = true; };
  }

  function roulette() {
    const s = ui().stage;
    s.innerHTML = `<div class="game-art"><div class="game-art-mark">The Velvet Wheel</div></div><div class="pointer"></div><div class="wheel" id="wheel"></div><div class="panel" style="margin-top:12px"><div class="label">Choose wager</div><div class="choice-grid" id="bets"><button class="choice active" data-b="red">RED · 1:1</button><button class="choice" data-b="black">BLACK · 1:1</button><button class="choice" data-b="odd">ODD · 1:1</button><button class="choice" data-b="even">EVEN · 1:1</button><button class="choice" data-b="low">1–18 · 1:1</button><button class="choice" data-b="high">19–36 · 1:1</button><button class="choice" data-b="zero">ZERO · 35:1</button><button class="choice" data-b="dozen">DOZEN · 2:1</button></div></div>${controls()}<button class="btn primary" id="spin">SPIN THE WHEEL</button><div id="rr" class="result"></div>`;
    bindBet();
    const out = document.getElementById('rr'), wheel = document.getElementById('wheel');
    let pick = 'red', rotation = 0;
    document.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-b]').forEach(x=>x.classList.remove('active'));b.classList.add('active');pick=b.dataset.b;});
    document.getElementById('spin').onclick = () => {
      if (!spend()) return; busy = true;
      const n = Math.floor(Math.random()*37), reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const red = reds.includes(n);
      const win = (pick==='red'&&red)||(pick==='black'&&!red&&n!==0)||(pick==='odd'&&n%2===1)||(pick==='even'&&n>0&&n%2===0)||(pick==='low'&&n>=1&&n<=18)||(pick==='high'&&n>=19)||(pick==='zero'&&n===0)||(pick==='dozen'&&n>=1&&n<=12);
      const multiplier = pick==='zero' ? 35 : pick==='dozen' ? 2 : 1;
      rotation += 1440 + Math.random()*720;
      wheel.style.transform = `rotate(${rotation}deg)`;
      setTimeout(()=>{ if(win){ const payout = bet * (multiplier + 1); setBalance(balance + payout); msg(out, `Ball ${n} · WIN +${payout-bet} tokens`, 'win'); } else msg(out, `Ball ${n} · No luck`, 'lose'); addSession(); busy=false; }, 4600);
    };
  }

  function blackjack() {
    const s = ui().stage;
    s.innerHTML = `<div class="game-art"><div class="game-art-mark">The Black Table</div></div><div class="panel"><div class="label">Dealer</div><div class="cards" id="dealer"></div></div><div class="panel" style="margin-top:8px"><div class="label">Player</div><div class="cards" id="player"></div><div class="gold" id="total"></div></div>${controls()}<div class="controls"><button class="btn primary" id="deal">DEAL</button><button class="btn" id="hit" disabled>HIT</button><button class="btn" id="stand" disabled>STAND</button><button class="btn" id="double" disabled>DOUBLE</button></div><div id="br" class="result"></div>`;
    bindBet();
    const dealerEl=document.getElementById('dealer'), playerEl=document.getElementById('player'), totalEl=document.getElementById('total'), out=document.getElementById('br');
    const suits=['♠','♥','♦','♣'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'], values={A:11,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:10,Q:10,K:10};
    let deck=[], player=[], dealer=[], active=false, handBet=0;
    function makeDeck(){deck=[];for(let d=0;d<6;d++)suits.forEach(s=>ranks.forEach(r=>deck.push({r,s})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}}
    function draw(){if(deck.length<30)makeDeck();return deck.pop();}
    function total(hand){let t=0, aces=0;hand.forEach(c=>{t+=values[c.r];if(c.r==='A')aces++;});while(t>21&&aces){t-=10;aces--;}return t;}
    function render(reveal=false){const card=(c,hidden)=>`<div class="card ${'♥♦'.includes(c.s)?'red':''} ${hidden?'hidden':''}">${hidden?'?':c.r+c.s}</div>`;dealerEl.innerHTML=dealer.map((c,i)=>card(c,!reveal&&i===1)).join('');playerEl.innerHTML=player.map(c=>card(c,false)).join('');totalEl.textContent=`Player ${total(player)}`;}
    function finish(){if(!active)return;active=false;while(total(dealer)<17)dealer.push(draw());render(true);const p=total(player),d=total(dealer);let payout=0,kind='lose',text='Dealer wins';if(p>21){}else if(d>21||p>d){payout=player.length===2&&p===21?Math.floor(handBet*2.5):handBet*2;setBalance(balance+payout);text=`You win · +${payout-handBet} tokens`;kind='win';}else if(p===d){setBalance(balance+handBet);text='Push · bet returned';kind='gold';}msg(out,text,kind);document.getElementById('hit').disabled=document.getElementById('stand').disabled=document.getElementById('double').disabled=true;addSession();}
    document.getElementById('deal').onclick=()=>{if(active||!spend())return;handBet=bet;makeDeck();player=[draw(),draw()];dealer=[draw(),draw()];active=true;render();document.getElementById('hit').disabled=false;document.getElementById('stand').disabled=false;document.getElementById('double').disabled=balance<handBet;if(total(player)===21)finish();};
    document.getElementById('hit').onclick=()=>{if(!active)return;player.push(draw());render();if(total(player)>=21)finish();};
    document.getElementById('stand').onclick=finish;
    document.getElementById('double').onclick=()=>{if(!active||balance<handBet)return;setBalance(balance-handBet);handBet*=2;player.push(draw());render();finish();};
  }

  function dice() {
    const s=ui().stage;
    s.innerHTML=`<div class="game-art"><div class="game-art-mark">The House of Chance</div></div><div class="dice"><div class="die" id="d1">⚀</div><div class="die" id="d2">⚀</div></div><div class="choice-grid" id="db"><button class="choice active" data-d="over">OVER 7 · 1.9x</button><button class="choice" data-d="under">UNDER 7 · 1.9x</button><button class="choice" data-d="seven">EXACT 7 · 5x</button><button class="choice" data-d="double">DOUBLES · 5x</button><button class="choice" data-d="snake">SNAKE EYES · 25x</button><button class="choice" data-d="box">BOXCARS · 25x</button></div>${controls()}<button class="btn primary" id="roll">ROLL</button><div id="dr" class="result"></div>`;
    bindBet();
    const d1=document.getElementById('d1'),d2=document.getElementById('d2'),out=document.getElementById('dr'),faces=['⚀','⚁','⚂','⚃','⚄','⚅'];
    let pick='over'; document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-d]').forEach(x=>x.classList.remove('active'));b.classList.add('active');pick=b.dataset.d;});
    document.getElementById('roll').onclick=async()=>{if(!spend())return;busy=true;for(let i=0;i<8;i++){d1.textContent=faces[Math.floor(Math.random()*6)];d2.textContent=faces[Math.floor(Math.random()*6)];await new Promise(r=>setTimeout(r,70));}const a=Math.floor(Math.random()*6)+1,b=Math.floor(Math.random()*6)+1,sum=a+b;d1.textContent=faces[a-1];d2.textContent=faces[b-1];const win=(pick==='over'&&sum>7)||(pick==='under'&&sum<7)||(pick==='seven'&&sum===7)||(pick==='double'&&a===b)||(pick==='snake'&&a===1&&b===1)||(pick==='box'&&a===6&&b===6);const mult={over:1.9,under:1.9,seven:5,double:5,snake:25,box:25}[pick];if(win){const payout=Math.floor(bet*mult);setBalance(balance+payout);msg(out,`${a}+${b}=${sum} · +${payout} tokens`,'win');}else msg(out,`${a}+${b}=${sum} · no hit`,'lose');addSession();busy=false;};
  }

  function highlow() {
    const s=ui().stage;
    s.innerHTML=`<div class="game-art"><div class="game-art-mark">The Temptation Deck</div></div><div class="cards"><div class="card" id="hc">?</div></div><div class="stats"><div class="stat"><span>Streak</span><strong id="streak">0</strong></div><div class="stat"><span>Cashout</span><strong id="cash">0</strong></div><div class="stat"><span>Deck</span><strong id="deckn">52</strong></div></div>${controls()}<div class="controls"><button class="btn primary" id="start">START</button><button class="btn" id="hi" disabled>HIGHER</button><button class="btn" id="lo" disabled>LOWER</button><button class="btn" id="cashout" disabled>CASH OUT</button></div><div id="hr" class="result"></div>`;
    bindBet();
    const cardEl=document.getElementById('hc'),streakEl=document.getElementById('streak'),cashEl=document.getElementById('cash'),deckEl=document.getElementById('deckn'),out=document.getElementById('hr');
    let deck=[],current=0,streak=0,multiplier=1,active=false;
    function newDeck(){deck=[];for(let v=1;v<=13;v++)for(let s=0;s<4;s++)deck.push(v);for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}}
    function draw(){if(!deck.length)newDeck();return deck.pop();}
    function show(v){const names=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];cardEl.textContent=names[v];deckEl.textContent=deck.length;}
    function resetButtons(on){document.getElementById('hi').disabled=!on;document.getElementById('lo').disabled=!on;document.getElementById('cashout').disabled=!on;document.getElementById('start').disabled=on;}
    function cashout(){if(!active)return;const payout=Math.floor(bet*multiplier);setBalance(balance+payout);msg(out,`Cashed out · +${payout-bet} tokens`,'win');active=false;resetButtons(false);addSession();}
    document.getElementById('start').onclick=()=>{if(active||!spend())return;newDeck();current=draw();streak=0;multiplier=1;active=true;show(current);streakEl.textContent='0';cashEl.textContent=bet;resetButtons(true);msg(out,'Higher or lower?','gold');};
    function guess(direction){if(!active)return;const next=draw(),correct=(direction==='higher'&&next>current)||(direction==='lower'&&next<current);show(next);if(next===current){msg(out,'Tie · choose again','gold');current=next;return;}if(!correct){active=false;resetButtons(false);cashEl.textContent='0';msg(out,`Wrong guess · streak ended at ${streak}`,'lose');addSession();return;}current=next;streak++;multiplier=1+streak*0.5;streakEl.textContent=streak;cashEl.textContent=Math.floor(bet*multiplier);msg(out,`Correct · ${multiplier.toFixed(1)}x available`,'win');}
    document.getElementById('hi').onclick=()=>guess('higher'); document.getElementById('lo').onclick=()=>guess('lower'); document.getElementById('cashout').onclick=cashout;
  }

  function kinkwheel() {
    const s=ui().stage;
    s.innerHTML=`<div class="game-art"><div class="game-art-mark">After Dark</div></div><div class="pointer"></div><div class="wheel" id="kw"></div><div class="panel" style="margin-top:12px"><div class="label">Risk ladder</div><div class="choice-grid"><button class="choice active">2x</button><button class="choice">Lose</button><button class="choice">3x</button><button class="choice">1.5x</button><button class="choice">Lose</button><button class="choice">5x</button><button class="choice">1.5x</button><button class="choice">Lose</button><button class="choice">2x</button><button class="choice">10x</button><button class="choice">Lose</button><button class="choice">1.5x</button></div></div>${controls()}<button class="btn primary" id="spin">SPIN THE WHEEL</button><div id="kr" class="result"></div>`;
    bindBet();
    const out=document.getElementById('kr'),wheel=document.getElementById('kw');
    const segments=[2,0,3,1.5,0,5,1.5,0,2,10,0,1.5]; let rotation=0;
    document.getElementById('spin').onclick=()=>{if(!spend())return;busy=true;const i=Math.floor(Math.random()*segments.length),mult=segments[i];rotation+=1800+Math.random()*720;wheel.style.transform=`rotate(${rotation}deg)`;setTimeout(()=>{if(mult){const payout=Math.floor(bet*mult);setBalance(balance+payout);msg(out,`${mult}x · +${payout} tokens`,'win');}else msg(out,'The wheel landed on a loss','lose');addSession();busy=false;},4600);};
  }

  shell();
  ({slots,roulette,blackjack,dice,highlow,kinkwheel}[game] || slots)();
})();