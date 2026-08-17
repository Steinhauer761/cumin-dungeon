/* Shared authenticated fetch helpers. Supabase access token is stored after login. */
(function(){
  function token(){ return localStorage.getItem('supabase_access_token') || localStorage.getItem('access_token') || ''; }
  window.DungeonAuth = {
    token,
    headers(extra){ const h = Object.assign({}, extra || {}); const t = token(); if (t) h.Authorization = `Bearer ${t}`; return h; },
    fetch(url, options){ const o = Object.assign({}, options || {}); o.headers = this.headers(o.headers); return fetch(url, o); },
    require(){ if (!token()) { location.href = '/entrance.html?next=' + encodeURIComponent(location.pathname + location.search); return false; } return true; }
  };
})();
