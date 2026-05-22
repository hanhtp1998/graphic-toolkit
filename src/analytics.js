// Analytics module — façade pattern.
// Calling code only uses track() and never imports a vendor SDK directly.
// To add Mixpanel: implement the three functions below using mixpanel-browser,
// keeping all call sites in main.js unchanged.

const IS_DEV = import.meta.env.DEV;

let _anonymousId = null;
let _sessionId = null;

export function initAnalytics() {
  _anonymousId = _getOrCreateId('pf_anonymous_id');
  _sessionId = crypto.randomUUID();

  track('session_start', {
    referrer: document.referrer || 'direct',
    device_type: _getDeviceType(),
  });
}

export function track(eventName, properties = {}) {
  const payload = {
    ...properties,
    anonymous_id: _anonymousId,
    session_id: _sessionId,
    app_version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
    timestamp: new Date().toISOString(),
  };

  if (IS_DEV) {
    console.log('[Analytics]', eventName, payload);
    return;
  }

  // Production: Vercel Analytics handles page views automatically.
  // Add Mixpanel call here when ready:
  // mixpanel.track(eventName, payload);
}

// ── Pixel Forge event helpers ─────────────────────────────────────────────────

export function trackEffectSelected(effectType, previousEffectType) {
  track('effect_selected', { effect_type: effectType, previous_effect_type: previousEffectType });
}

export function trackExportCompleted({ effectType, gridSize, fileCount, sizeCount, durationMs }) {
  track('export_completed', {
    effect_type: effectType,
    grid_size: gridSize,
    file_count: fileCount,
    size_count: sizeCount,
    total_svgs: fileCount * sizeCount,
    duration_ms: durationMs,
    format: 'zip',
  });
}

export function trackExportFailed(errorMessage) {
  track('export_failed', { format: 'zip', error_message: errorMessage });
}

// ── Private helpers ───────────────────────────────────────────────────────────

function _getOrCreateId(storageKey) {
  let id = localStorage.getItem(storageKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(storageKey, id);
  }
  return id;
}

function _getDeviceType() {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}
