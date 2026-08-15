/* CumIN Dungeon God Mode + No-Limit Bets shared config */
(function(){
  'use strict';
  const GOD = !!localStorage.getItem('admin_key');
  const BETS = [100, 500, 1000, 5000, 10000, 50000, 100000];
  const START_BALANCE = GOD ? 1000000 : 1000000;
  
  function fmtBet(n) {
    if (n >= 1000000) return (n/1000000) + 'M';
    if (n >= 1000) return (n/1000) + 'K';
    return n;
  }
  
  function godRefill(balance) {
    if (GOD && balance < BETS[0]) return START_BALANCE;
    return balance;
  }

  // Inject background art on all game pages
  if (location.pathname.includes('/games/')) {
    const style = document.createElement('style');
    style.textContent = `
      body::before{content:'';position:fixed;inset:0;background:url('/public/media/casino-reveal.svg') center/cover no-repeat;opacity:.06;pointer-events:none;z-index:0}
      body::after{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% 30%,transparent 20%,rgba(5,3,4,.92) 70%);pointer-events:none;z-index:0}
      .app,.game-container{position:relative;z-index:1}
    `;
    document.head.appendChild(style);
  }

  window.CUMIN_CASINO = { GOD, BETS, START_BALANCE, fmtBet, godRefill };
})();
