import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLegacyKey, readSessionKey, writeSessionKey } from './sessionKey';

const KEY = 'saans.gemini_key';

describe('session key storage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('reads an empty string when no key is saved', () => {
    expect(readSessionKey()).toBe('');
  });

  it('round-trips a key through sessionStorage', () => {
    writeSessionKey('AIza-test');
    expect(window.sessionStorage.getItem(KEY)).toBe('AIza-test');
    expect(readSessionKey()).toBe('AIza-test');
  });

  it('removes the key when written an empty value', () => {
    writeSessionKey('AIza-test');
    writeSessionKey('');
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
    expect(readSessionKey()).toBe('');
  });

  it('never writes to localStorage, and clears any legacy copy', () => {
    window.localStorage.setItem(KEY, 'old-key');
    clearLegacyKey();
    expect(window.localStorage.getItem(KEY)).toBeNull();
    expect(window.localStorage.getItem(KEY)).not.toBe('AIza-test');
  });

  it('survives storage being blocked', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readSessionKey()).toBe('');
    expect(() => writeSessionKey('AIza')).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
