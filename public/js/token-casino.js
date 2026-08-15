(() => {
  const app=document.getElementById('game-app'); if(!app)return;
  const game=app.dataset.game;
  const idKey='cumindungeon_guest_id';
  const userId=localStorage.getItem(idKey)||crypto.randomUUID(); localStorage.setItem(idKey,userId);
  const $=id=>document.getElementById(id);
  const balanceEl=$('balance');
  const resultEl=$('result');
  let balance=Number(balanceEl?.textContent||0), busy=false;
  const show=(text,kind)=>{if(resultEl)resultEl.innerHTML=`<div class="result ${kind||'gold'}">${String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}</div>`};
  const setBalance=v=>{balance=Number(v)||0;if(balanceEl)balanceEl.textContent=balance};
  async function load(){try{const r=await fetch(`/api/tokens/balance?userId=${encodeURIComponent(userId)}`);const j=await r.json();if(r.ok)setBalance(j.balance)}catch{show('BALANCE UNAVAILABLE','lose')}}
  function choice(){const active=app.querySelector('.choice.active');return active?.dataset.r||active?.dataset.d||active?.dataset.h||'red'}
  function animate(label){
    const stage=$('stage'); if(!stage)return;
    stage.classList.remove('round-flash'); void stage.offsetWidth; stage.classList.add('round-flash');
    if(game==='roulette' && $('wheel')) $('wheel').querySelector('.wheel-number').textContent=label.split(' ').pop();
    if(game==='blackjack' && $('total')) $('total').textContent=label;
    if(game==='highlow' && $('card')) $('card').textContent=label.split(' ')[0];
    if(game==='dice'){const parts=label.split(' = ')[0]?.split(' + '); if(parts?.length===2){const f=['⚀','⚁','⚂','⚃','⚄','⚅'];$('d1').textContent=f[Number(parts[0])-1]||'⚄';$('d2').textContent=f[Number(parts[1])-1]||'⚂'}}
  }
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('#game-app .action'); if(!btn||e.defaultPrevented||busy)return;
    e.preventDefault(); e.stopImmediatePropagation();
    const bet=Number($('bet')?.textContent||10); if(!Number.isInteger(bet)||bet<5||bet>100||balance<bet){show('NOT ENOUGH TOKENS','lose');return}
    busy=true;btn.disabled=true;show('DEALING…','gold');
    try{
      const r=await fetch('/api/casino/play',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,gameId:game,bet,choice:choice()})});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||'Game unavailable');
      setBalance(j.balance); animate(j.label||'');
      if(j.win) show(`WIN · ${j.label} · +${Math.max(0,j.payout-j.bet)} TOKENS`,'win'); else show(`LOSE · ${j.label||'NO WIN'}`,'lose');
      const round=$('round');if(round)round.textContent=Number(round.textContent||0)+1;
    }catch(err){show(err.message||'GAME UNAVAILABLE','lose')}
    finally{busy=false;btn.disabled=false}
  },true);
  load();
})();
