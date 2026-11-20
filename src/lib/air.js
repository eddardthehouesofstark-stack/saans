/**
 * SAANS — deterministic exposure maths.
 *
 * 1 cigarette/day equivalent = 22 µg/m³ PM2.5 over 24 h (Berkeley Earth).
 * Row price = (PM2.5 × breathing rate × hours) ÷ (22 × 0.6 × 24).
 * Indoor air is discounted by a 0.6 infiltration factor; swaps can set their
 * own infiltration/exposure factor (metro cabin, exhaust + lid, etc.).
 *
 * Every number the UI shows comes from this file. The LLM only narrates.
 */

const CIG_DENOM = 22 * 0.6 * 24; // 316.8
export const DEFAULT_PM25 = 285;
export const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.209, label: 'New Delhi, IN' };
export const CLEAR_THRESHOLD = 3;

export const ACTIVITIES = [
  {
    key: 'jog',
    emoji: '🌅',
    name: 'Sunrise jog',
    window: '6:30 am · 30 min',
    hours: 0.5,
    rate: 3.0,
    indoor: false,
    tag: 'Outdoor · 3.0 m³/h',
    swap: {
      title: 'Swap sunrise jog → indoor HIIT',
      short: 'Indoor HIIT',
      detail: 'Living room, windows shut, 30 minutes.',
      rate: 2.4,
      exposure: 0.6,
      tag: 'Indoor · filtered',
    },
  },
  {
    key: 'commute',
    emoji: '🛺',
    name: 'E-rickshaw commute',
    window: '8:15 am · 1 h',
    hours: 1,
    rate: 1.5,
    indoor: false,
    tag: 'Outdoor · 1.5 m³/h',
    swap: {
      title: 'Swap e-rickshaw → metro, filtered cabin',
      short: 'Metro cabin',
      detail: 'Blue line, one interchange, 1 hour door to door.',
      rate: 1.2,
      exposure: 0.6,
      tag: 'Indoor · filtered cabin',
    },
  },
  {
    key: 'wfh',
    emoji: '💻',
    name: 'Work from home',
    window: '9 am – 6 pm · 9 h',
    hours: 9,
    rate: 0.6,
    indoor: true,
    protected: true,
    tag: 'Indoor · protected',
    swap: null,
  },
  {
    key: 'park',
    emoji: '🎒',
    name: "Kids' park time",
    window: '5:30 pm · 30 min',
    hours: 0.5,
    rate: 1.5,
    indoor: false,
    tag: 'Outdoor · 1.5 m³/h',
    swap: {
      title: 'Move kids’ park time → indoor play',
      short: 'Indoor play',
      detail: 'Badminton in the corridor, or a board game with the windows shut.',
      rate: 1.5,
      exposure: 0.6,
      tag: 'Indoor · filtered',
    },
  },
  {
    key: 'cook',
    emoji: '🍳',
    name: 'Evening cooking',
    window: '7:30 pm · 1 h',
    hours: 1,
    rate: 0.9,
    indoor: true,
    tag: 'Indoor · unprotected',
    swap: {
      title: 'Cook with exhaust + lid',
      short: 'Exhaust + lid',
      detail: 'Run the chimney, keep lids on, crack one window after.',
      rate: 0.9,
      exposure: 0.24,
      tag: 'Indoor · ventilated',
    },
  },
];

export const HACKS = [
  {
    key: 'corsi',
    index: '01',
    title: 'Build a Corsi–Rosenthal box',
    meta: '~₹2,500 · four MERV-13 filters + box fan',
    claim: 'up to 73%',
    factor: 0.27,
    copy: 'The cheapest clean-air machine that actually works. Run it in whichever room you sit in longest.',
    source: 'CDC / NIOSH, 2023',
    applies: (row, swapped) => row.indoor || swapped,
  },
  {
    key: 'vent',
    index: '02',
    title: 'Ventilate 2–4 pm, not 7–10 am',
    meta: 'free · one window, one timer',
    claim: '~15%',
    factor: 0.85,
    copy: 'The boundary layer mixes down after sunrise and settles by mid-afternoon. Purge the flat when outdoor PM is at its daily low.',
    source: 'Infiltration studies · Xiang et al., 2021',
    applies: (row, swapped) => row.indoor || swapped,
  },
  {
    key: 'n95',
    index: '03',
    title: 'N95 outdoors, fitted',
    meta: '~₹40 each · pinch the nose wire',
    claim: '70–76%',
    factor: 0.27,
    copy: 'A fitted N95, not a cloth mask. The seal around your nose is the whole product. Wear it for the walk, take it off indoors.',
    source: 'Kodros et al., 2021',
    applies: (row, swapped) => !row.indoor && !swapped,
  },
  {
    key: 'exhaust',
    index: '04',
    title: 'Kitchen exhaust, every time',
    meta: 'free · switch it on before the pan heats',
    claim: '~58%',
    factor: 0.42,
    copy: 'Cooking is the one source you control completely. Exhaust on, lid on, and leave the fan running five minutes after.',
    source: 'Li et al., 2016 — indoor combustion ≈ 75% of personal PM2.5',
    applies: (row, swapped) => row.key === 'cook' && !swapped,
  },
];

function cigaretteBudget(pm25) {
  return Math.max(0.1, pm25 / 22);
}

/** Price of one ledger row. `useSwap` picks the swapped rate and exposure. */
function rowPrice(row, pm25, useSwap, hacks = {}) {
  const rate = useSwap ? row.swap.rate : row.rate;
  const exposure = useSwap ? row.swap.exposure : row.indoor ? 0.6 : 1;
  let value = (pm25 * rate * row.hours * exposure) / CIG_DENOM;

  for (const hack of HACKS) {
    if (hacks[hack.key] && hack.applies(row, useSwap)) {
      value *= hack.factor;
    }
  }
  return value;
}

export function computeLedger(pm25, swaps = {}, hacks = {}) {
  const rows = ACTIVITIES.map((row) => {
    const swapped = Boolean(swaps[row.key]) && Boolean(row.swap);
    const base = rowPrice(row, pm25, false);
    // The row without its swap but with the current hacks, so `swapSaving`
    // answers "what does this swap save?" in both states.
    const unswapped = rowPrice(row, pm25, false, hacks);
    const swappedNow = row.swap ? rowPrice(row, pm25, true, hacks) : unswapped;
    const now = swapped ? swappedNow : unswapped;
    return {
      ...row,
      swapped,
      base,
      now,
      saved: Math.max(0, base - now),
      swapSaving: unswapped - swappedNow,
    };
  });

  const baseTotal = rows.reduce((sum, row) => sum + row.base, 0);
  const nowTotal = rows.reduce((sum, row) => sum + row.now, 0);
  const savings = Math.max(0, baseTotal - nowTotal);
  const budget = cigaretteBudget(pm25);
  const net = Math.max(0, budget - savings);

  return {
    rows,
    baseTotal,
    nowTotal,
    savings,
    budget,
    net,
    background: Math.max(0, budget - baseTotal),
  };
}

/** What toggling one hack changes about today's savings, in cigarettes. */
export function hackSavings(pm25, swaps, hacks, key) {
  const on = computeLedger(pm25, swaps, { ...hacks, [key]: true }).savings;
  const off = computeLedger(pm25, swaps, { ...hacks, [key]: false }).savings;
  return Math.abs(on - off);
}

export function pmBand(pm25) {
  if (pm25 <= 30) return { label: 'Low', color: '#2dd4a7' };
  if (pm25 <= 60) return { label: 'Rising', color: '#e8a33d' };
  if (pm25 <= 120) return { label: 'Unhealthy', color: '#f87171' };
  return { label: 'Severe', color: '#f87171' };
}

export function formatCigs(value, digits = 1) {
  if (!Number.isFinite(value)) return '0.0';
  return value.toFixed(digits);
}

export function demoSeries() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() - (23 - i) * 3600 * 1000);
    const wobble = Math.sin(i / 2.4) * 38 + Math.cos(i / 1.3) * 18;
    return {
      label: `${String(t.getHours()).padStart(2, '0')}:00`,
      pm25: Math.max(60, Math.round(DEFAULT_PM25 + wobble)),
    };
  });
}

export function locate({ timeout = 7000 } = {}) {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: 'Your location',
        }),
      () => resolve(DEFAULT_LOCATION),
      { timeout, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false }
    );
  });
}

export async function fetchLiveAir(lat, lon) {
  const url =
    'https://air-quality-api.open-meteo.com/v1/air-quality' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=pm2_5,us_aqi&hourly=pm2_5&past_days=1&forecast_days=1&timezone=auto';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = await res.json();

  const times = data?.hourly?.time ?? [];
  const values = data?.hourly?.pm2_5 ?? [];
  const points = values
    .map((value, i) => ({ label: (times[i] ?? '').slice(11, 16), pm25: value }))
    .filter((p) => Number.isFinite(p.pm25) && p.label);

  const series = points.slice(-24);
  const current = Number(data?.current?.pm2_5);
  const last = series.length ? series[series.length - 1].pm25 : DEFAULT_PM25;
  const pm25 = Number.isFinite(current) ? current : last;

  if (!Number.isFinite(pm25)) throw new Error('No PM2.5 in response');

  return {
    pm25: Math.round(pm25 * 10) / 10,
    usAqi: Number.isFinite(Number(data?.current?.us_aqi)) ? Number(data.current.us_aqi) : null,
    series: series.length ? series : demoSeries(),
  };
}
