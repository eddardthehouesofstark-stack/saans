import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../supabaseConfig';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Mirrors the CHECK constraints in supabase/schema.sql. */
const SWAP_KEYS = new Set(['jog', 'commute', 'park', 'cook']);
const MAX_CIGARETTES = 5;
const SESSION_PATTERN = /^[A-Za-z0-9-]{8,64}$/;
const SESSION_KEY = 'saans.session_id';

let clientPromise = null;

/**
 * Loaded dynamically so the Supabase SDK stays out of the hero's critical path.
 * Returns null when the config file has no keys.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient | null>}
 */
function getClient() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
      .catch(() => null);
  }
  return clientPromise;
}

export function sessionId() {
  if (typeof window === 'undefined') return 'server';
  let id = null;
  try {
    id = window.localStorage.getItem(SESSION_KEY);
  } catch {
    /* storage may be blocked */
  }
  if (!id || !SESSION_PATTERN.test(id)) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `saans-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      window.localStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

/**
 * Run one query, collapsing "not configured", network failures and PostgREST
 * errors into the same result so callers never repeat the try/catch.
 * @param {(client: import('@supabase/supabase-js').SupabaseClient) => Promise<{ data: unknown, error: unknown }>} build
 * @returns {Promise<{ ok: boolean, data: unknown }>}
 */
async function run(build) {
  const client = await getClient();
  if (!client) return { ok: false, data: null };
  try {
    const { data, error } = await build(client);
    return { ok: !error, data: data ?? null };
  } catch {
    return { ok: false, data: null };
  }
}

/** The shared demo table accepts anonymous writes, so validate before sending. */
function swapPayload(swapKey, cigarettesSaved) {
  const id = sessionId();
  if (!SWAP_KEYS.has(swapKey) || !SESSION_PATTERN.test(id)) return null;
  const value = Number(cigarettesSaved);
  if (!Number.isFinite(value) || value < 0) return null;
  return {
    session_id: id,
    swap_key: swapKey,
    cigarettes_saved: Math.min(MAX_CIGARETTES, value),
  };
}

export async function logSwap(swapKey, cigarettesSaved) {
  const payload = swapPayload(swapKey, cigarettesSaved);
  if (!payload) return false;
  const { ok } = await run((client) => client.from('swaps').insert(payload));
  return ok;
}

export async function removeSwap(swapKey) {
  if (!SWAP_KEYS.has(swapKey)) return false;
  const { ok } = await run((client) =>
    client.from('swaps').delete().eq('session_id', sessionId()).eq('swap_key', swapKey)
  );
  return ok;
}

export function weekStart() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** @returns {Promise<number | null>} cigarettes saved by every household this week */
export async function weekSwapTotal() {
  const { ok, data } = await run((client) =>
    client.from('swaps').select('cigarettes_saved').gte('created_at', weekStart().toISOString())
  );
  if (!ok || !Array.isArray(data)) return null;
  return data.reduce((sum, row) => sum + (Number(row.cigarettes_saved) || 0), 0);
}
