/**
 * CumIN Dungeon - Lovense Integration Module
 * Handles tip-to-toy communication for performer rooms.
 *
 * Usage (performer broadcast page):
 *   <script src="/public/js/lovense.js"></script>
 *   <script>
 *     DungeonLovense.initPerformer({ mToken: 'xxx' });
 *   </script>
 *
 * Usage (viewer/tipper page):
 *   <script src="/public/js/lovense.js"></script>
 *   <script>
 *     DungeonLovense.initViewer({ platform: 'CumIN Dungeon', modelKey: 'xxx', tipperKey: 'xxx' });
 *   </script>
 */

window.DungeonLovense = (function () {
  'use strict';

  let _mToken = null;
  let _lovenseReady = false;
  let _messageListeners = [];

  // ─── Performer Side ───────────────────────────────────────────

  /**
   * Initialize Lovense on the performer's broadcast page.
   * Dynamically loads the Cam Kit model.js and sets up event handling.
   * @param {{ mToken: string }} opts
   */
  function initPerformer(opts) {
    if (!opts || !opts.mToken) {
      console.error('[DungeonLovense] mToken required for performer init');
      return;
    }
    _mToken = opts.mToken;

    // Load Lovense Cam Kit v2 model script
    const script = document.createElement('script');
    script.src = 'https://api.lovense.com/api/cam/model/v2/model.js?mToken=' + _mToken;
    script.onload = function () {
      _lovenseReady = true;
      console.info('[DungeonLovense] Cam Kit loaded for performer');

      // Listen for Lovense events
      if (window.lovense && window.lovense.addMessageListener) {
        window.lovense.addMessageListener(function (data) {
          _handleModelEvent(data);
        });
      }
    };
    script.onerror = function () {
      console.error('[DungeonLovense] Failed to load Cam Kit script');
    };
    document.head.appendChild(script);
  }

  /**
   * Call when a tip is received in the room.
   * Triggers toy response per performer's Lovense settings.
   * @param {string} tipperName - display name of the tipper
   * @param {number} amount - token amount tipped
   */
  function receiveTip(tipperName, amount) {
    if (!_lovenseReady || !window.lovense) {
      console.warn('[DungeonLovense] Not ready, queuing tip or using server fallback');
      _serverFallbackTip(tipperName, amount);
      return;
    }
    window.lovense.receiveTip(tipperName, amount);
  }

  /**
   * Server-side fallback: POST to our command endpoint
   * Used when performer doesn't have Cam Kit loaded locally.
   */
  async function _serverFallbackTip(tipperName, amount) {
    try {
      // Calculate vibration strength from tip amount (1-20 scale)
      const strength = Math.min(20, Math.max(1, Math.floor(amount / 5)));
      const duration = Math.min(30, Math.max(3, Math.floor(amount / 2)));

      await fetch('/api/lovense/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: _performerUid,
          command: 'Function',
          action: 'Vibrate:' + strength,
          timeSec: duration,
        }),
      });
    } catch (err) {
      console.error('[DungeonLovense] Server fallback failed:', err);
    }
  }

  /**
   * Get toy connection status.
   * @returns {Array|null}
   */
  function getToys() {
    if (!_lovenseReady || !window.lovense) return null;
    return window.lovense.getToys();
  }

  /**
   * Get performer's current Lovense settings (tip levels, specials).
   * @returns {Object|null}
   */
  function getSettings() {
    if (!_lovenseReady || !window.lovense) return null;
    return window.lovense.getSettings();
  }

  // ─── Viewer / Tipper Side ─────────────────────────────────────

  /**
   * Initialize the Display Panel on the viewer's page.
   * Shows tip menu and Give Control panel.
   * @param {{ platform: string, modelKey: string, tipperKey: string }} opts
   */
  function initViewer(opts) {
    if (!opts || !opts.platform || !opts.modelKey || !opts.tipperKey) {
      console.error('[DungeonLovense] platform, modelKey, tipperKey required for viewer init');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.lovense.com/api/cam/tipper/v2/tipper.js';
    script.onload = function () {
      if (window.Lovense && window.Lovense.init) {
        window.Lovense.init(opts.platform, opts.modelKey, opts.tipperKey);
        console.info('[DungeonLovense] Display panel initialized for viewer');
      }
    };
    document.head.appendChild(script);
  }

  /**
   * Forward model status data to the viewer's Display Panel.
   * Called when Ably delivers a forwarded Lovense callback.
   * @param {*} data - the forwarded data from Lovense callback
   */
  function receiveModelStatus(data) {
    if (window.Lovense && window.Lovense.recieveData) {
      window.Lovense.recieveData(data);
    }
  }

  /**
   * Destroy Display Panel when viewer leaves the room.
   */
  function destroyViewer() {
    if (window.Lovense && window.Lovense.destroy) {
      window.Lovense.destroy();
    }
  }

  // ─── Internal ─────────────────────────────────────────────────

  let _performerUid = null;

  function setPerformerUid(uid) {
    _performerUid = uid;
  }

  function _handleModelEvent(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'message':
        // Post Lovense status messages to room chat
        if (window.DungeonChat && window.DungeonChat.sendSystem) {
          window.DungeonChat.sendSystem(data.detail);
        }
        break;
      case 'toy':
        // Update UI with toy connection status
        _dispatchEvent('toyStatus', data.detail);
        break;
      case 'settings':
        _dispatchEvent('settingsUpdate', data.detail);
        break;
      case 'tipQueueStatus':
        _dispatchEvent('tipQueue', data.detail);
        break;
    }

    // Notify all registered listeners
    _messageListeners.forEach(function (fn) { fn(data); });
  }

  function _dispatchEvent(name, detail) {
    document.dispatchEvent(new CustomEvent('lovense:' + name, { detail: detail }));
  }

  /**
   * Register a callback for all Lovense events.
   * @param {Function} fn
   */
  function onMessage(fn) {
    if (typeof fn === 'function') _messageListeners.push(fn);
  }

  // ─── Public API ───────────────────────────────────────────────

  return {
    initPerformer: initPerformer,
    initViewer: initViewer,
    receiveTip: receiveTip,
    receiveModelStatus: receiveModelStatus,
    destroyViewer: destroyViewer,
    getToys: getToys,
    getSettings: getSettings,
    setPerformerUid: setPerformerUid,
    onMessage: onMessage,
  };
})();
