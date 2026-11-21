/**
 * The Gemini key is a per-tab secret. It is written to `sessionStorage` only,
 * so it disappears when the tab closes and never touches `localStorage`,
 * cookies, the URL or any SAANS server.
 */
const STORAGE_KEY = 'saans.gemini_key';

/** @returns {string} the saved key for this tab, or an empty string. */
export function readSessionKey() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * Persist or clear the key for this tab.
 * @param {string} value
 */
export function writeSessionKey(value) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, value);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode or storage disabled: the key simply is not persisted */
  }
}

/** Older builds wrote the key to localStorage; remove any copy left behind. */
export function clearLegacyKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}
