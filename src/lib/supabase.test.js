import { describe, expect, it } from 'vitest';
import { isSupabaseConfigured, sessionId, weekSwapTotal, logSwap, removeSwap } from './supabase.js';

describe('unconfigured Supabase', () => {
  it('reports demo mode and resolves the write helpers without a client', async () => {
    expect(isSupabaseConfigured).toBe(false);
    await expect(logSwap('jog', 0.4)).resolves.toBe(false);
    await expect(removeSwap('jog')).resolves.toBe(false);
    await expect(weekSwapTotal()).resolves.toBeNull();
  });
});

describe('sessionId', () => {
  it('creates one id per browser and reuses it', () => {
    localStorage.clear();
    const first = sessionId();
    const second = sessionId();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(localStorage.getItem('saans.session_id')).toBe(first);
  });
});
