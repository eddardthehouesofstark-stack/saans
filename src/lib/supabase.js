import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../supabaseConfig';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let clientPromise = null;

/**
 * Loaded dynamically so the Supabase SDK stays out of the hero's critical path.
 * Returns null when the config file has no keys.
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

const SESSION_KEY = 'saans.session_id';

export function sessionId() {
  if (typeof window === 'undefined') return 'server';
  let id = null;
  try {
    id = window.localStorage.getItem(SESSION_KEY);
  } catch {
    /* storage may be blocked */
  }
  if (!id) {
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

export async function logSwap(swapKey, cigarettesSaved) {
  const client = await getClient();
  if (!client) return false;
  const value = Math.max(0, Number(cigarettesSaved) || 0);
  try {
    const { error } = await client.from('swaps').insert({
      session_id: sessionId(),
      swap_key: swapKey,
      cigarettes_saved: Number(value.toFixed(3)),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function removeSwap(swapKey) {
  const client = await getClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('swaps')
      .delete()
      .eq('session_id', sessionId())
      .eq('swap_key', swapKey);
    return !error;
  } catch {
    return false;
  }
}

export function weekStart() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function weekSwapTotal() {
  const client = await getClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('swaps')
      .select('cigarettes_saved')
      .gte('created_at', weekStart().toISOString());
    if (error) return null;
    return (data ?? []).reduce((sum, row) => sum + (Number(row.cigarettes_saved) || 0), 0);
  } catch {
    return null;
  }
}
