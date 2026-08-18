/**
 * Shared Token Balance Manager
 * All casino games use this for persistent balance across sessions.
 * Balance is stored in localStorage and synced across games.
 * No auto-reset. Admin reset button only.
 */
var TokenBank = (function() {
  var STORAGE_KEY = 'cumin_token_balance';
  var DEFAULT_BALANCE = 1000000;

  function get() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null && !isNaN(parseInt(stored))) {
      return parseInt(stored);
    }
    // First time ever: set default
    set(DEFAULT_BALANCE);
    return DEFAULT_BALANCE;
  }

  function set(amount) {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(amount))));
  }

  function add(amount) {
    var current = get();
    set(current + amount);
    return get();
  }

  function subtract(amount) {
    var current = get();
    if (current < amount) return false;
    set(current - amount);
    return true;
  }

  function reset() {
    set(DEFAULT_BALANCE);
    return DEFAULT_BALANCE;
  }

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return n.toLocaleString();
    return '' + n;
  }

  return {
    get: get,
    set: set,
    add: add,
    subtract: subtract,
    reset: reset,
    fmt: fmt,
    DEFAULT: DEFAULT_BALANCE
  };
})();
