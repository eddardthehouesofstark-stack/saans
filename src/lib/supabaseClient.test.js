import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), from: vi.fn() }));

vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));
vi.mock('../supabaseConfig', () => ({
  SUPABASE_URL: 'https://demo.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
}));

import { isSupabaseConfigured, logSwap, removeSwap, weekSwapTotal } from './supabase.js';

/** A thenable PostgREST builder, so awaited chains resolve to `result`. */
function chain(result) {
  const node = {
    eq: vi.fn(() => node),
    then: (onFulfilled) => Promise.resolve(result).then(onFulfilled),
  };
  return node;
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.createClient.mockReturnValue({ from: mocks.from });
});

describe('configured Supabase', () => {
  it('reports live mode once the anon keys exist', () => {
    expect(isSupabaseConfigured).toBe(true);
  });

  it('writes a validated, clamped swap row', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    mocks.from.mockReturnValue({ insert });

    await expect(logSwap('jog', 9)).resolves.toBe(true);
    expect(mocks.from).toHaveBeenCalledWith('swaps');
    expect(insert).toHaveBeenCalledWith({
      session_id: expect.any(String),
      swap_key: 'jog',
      cigarettes_saved: 5,
    });
  });

  it('refuses unknown swap keys without touching the network', async () => {
    await expect(logSwap('unknown', 1)).resolves.toBe(false);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('deletes the row for this session', async () => {
    mocks.from.mockReturnValue({ delete: () => chain({ error: null }) });
    await expect(removeSwap('commute')).resolves.toBe(true);
  });

  it('reports a failed write as false', async () => {
    mocks.from.mockReturnValue({ insert: async () => ({ error: { message: 'denied' } }) });
    await expect(logSwap('park', 0.4)).resolves.toBe(false);
  });

  it('survives a throwing client', async () => {
    mocks.from.mockReturnValue({
      insert: async () => {
        throw new Error('offline');
      },
    });
    await expect(logSwap('park', 0.4)).resolves.toBe(false);
  });

  it('sums the week of saved cigarettes', async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        gte: async () => ({
          data: [{ cigarettes_saved: 1.5 }, { cigarettes_saved: '2' }, {}],
          error: null,
        }),
      }),
    });
    await expect(weekSwapTotal()).resolves.toBe(3.5);
  });

  it('returns null when the weekly query fails', async () => {
    mocks.from.mockReturnValue({
      select: () => ({ gte: async () => ({ data: null, error: { message: 'nope' } }) }),
    });
    await expect(weekSwapTotal()).resolves.toBeNull();
  });
});
