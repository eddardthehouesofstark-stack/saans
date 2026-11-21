/**
 * SAANS — deterministic exposure maths.
 *
 * 1 cigarette/day equivalent = 22 µg/m³ PM2.5 over 24 h (Berkeley Earth).
 * Row price = (PM2.5 × breathing rate × hours) ÷ (22 × 0.6 × 24).
 * Indoor air is discounted by a 0.6 infiltration factor; swaps can set their
 * own infiltration/exposure factor (metro cabin, exhaust + lid, etc.).
 *
 * Every number the UI shows comes from this file. The LLM only narrates.
 *
 * @typedef {{ lat: number, lon: number, label: string }} Location
 * @typedef {{ label: string, pm25: number }} SeriesPoint
 * @typedef {{ pm25: number, usAqi: number | null, series: SeriesPoint[] }} AirReading
 * @typedef {{
 *   key: string,
 *   emoji: string,
 *   name: string,
 *   window: string,
 *   hours: number,
 *   rate: number,
 *   indoor: boolean,
 *   protected?: boolean,
 *   tag: string,
 *   swap: { title: string, short: string, detail: string, rate: number, exposure: number, tag: string } | null,
 * }} Activity
 * @typedef {{
 *   key: string,
 *   name: string,
 *   emoji: string,
 *   swapped: boolean,
 *   base: number,
 *   now: number,
 *   saved: number,
 *   swapSaving: number,
 * }} LedgerRow
 * @typedef {{
 *   rows: LedgerRow[],
 *   baseTotal: number,
 *   nowTotal: number,
 *   savings: number,
 *   budget: number,
 *   net: number,
 *   background: number,
 * }} Ledger
 */

import { cigaretteBudget, rowCigarettes, sumCigarettes } from './budget';
import {
  BREATHING_RATE_COOKING,
  BREATHING_RATE_HEAVY,
  BREATHING_RATE_HIIT,
  BREATHING_RATE_INDOOR,
  BREATHING_RATE_LIGHT,
  BREATHING_RATE_METRO,
  CIGARETTE_DAILY_DOSE,
  CLEAR_SCALE,
  DEFAULT_PM25_UG_M3,
  PM_BAND_THRESHOLDS,
  SAVINGS_EPSILON,
  SMOG_CLEAR_THRESHOLD,
} from '../constants/impact';

/**
 * Compatibility aliases for the constants module. New code should import
 * `src/constants/impact.js` directly; these names are kept because existing
 * callers and tests use them when documenting the formula.
 */
export const CIG_DENOM = CIGARETTE_DAILY_DOSE;
export const DEFAULT_PM25 = DEFAULT_PM25_UG_M3;
export const CLEAR_THRESHOLD = SMOG_CLEAR_THRESHOLD;
export { CLEAR_SCALE, SAVINGS_EPSILON };

export const DEFAULT_LOCATION = { lat: 28.6139, lon: 77.209, label: 'New Delhi, IN' };

export const ACTIVITIES = [
  {
    key: 'jog',
    emoji: '🌅',
    name: 'Sunrise jog',
    window: '6:30 am · 30 min',
    hours: 0.5,
    rate: BREATHING_RATE_HEAVY,
    indoor: false,
    tag: 'Outdoor · 3.0 m³/h',
    swap: {
      title: 'Swap sunrise jog → indoor HIIT',
      short: 'Indoor HIIT',
      detail: 'Living room, windows shut, 30 minutes.',
      rate: BREATHING_RATE_HIIT,
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
    rate: BREATHING_RATE_LIGHT,
    indoor: false,
    tag: 'Outdoor · 1.5 m³/h',
    swap: {
      title: 'Swap e-rickshaw → metro, filtered cabin',
      short: 'Metro cabin',
      detail: 'Blue line, one interchange, 1 hour door to door.',
      rate: BREATHING_RATE_METRO,
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
    rate: BREATHING_RATE_INDOOR,
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
    rate: BREATHING_RATE_LIGHT,
    indoor: false,
    tag: 'Outdoor · 1.5 m³/h',
    swap: {
      title: 'Move kids’ park time → indoor play',
      short: 'Indoor play',
      detail: 'Badminton in the corridor, or a board game with the windows shut.',
      rate: BREATHING_RATE_LIGHT,
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
    rate: BREATHING_RATE_COOKING,
    indoor: true,
    tag: 'Indoor · unprotected',
    swap: {
      title: 'Cook with exhaust + lid',
      short: 'Exhaust + lid',
      detail: 'Run the chimney, keep lids on, crack one window after.',
      rate: BREATHING_RATE_COOKING,
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

/**
 * Price every activity twice (as-run and with its swap) and total the day.
 * @param {number} pm25
 * @param {Record<string, boolean>} [swaps]
 * @param {Record<string, boolean>} [hacks]
 * @returns {Ledger}
 */
export function computeLedger(pm25, swaps = {}, hacks = {}) {
  const rows = ACTIVITIES.map((row) => {
    const swapped = Boolean(swaps[row.key]) && Boolean(row.swap);
    const base = rowCigarettes(row, pm25);
    // The row without its swap but with the current hacks, so `swapSaving`
    // answers "what does this swap save?" in both states.
    const unswapped = rowCigarettes(row, pm25, { hacks: HACKS, activeHacks: hacks });
    const swappedNow = row.swap
      ? rowCigarettes(row, pm25, { useSwap: true, hacks: HACKS, activeHacks: hacks })
      : unswapped;
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

  const baseTotal = sumCigarettes(rows, 'base');
  const nowTotal = sumCigarettes(rows, 'now');
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

/**
 * What toggling one hack changes about today's savings, in cigarettes.
 * @param {number} pm25
 * @param {Record<string, boolean>} swaps
 * @param {Record<string, boolean>} hacks
 * @param {string} key
 * @returns {number} absolute cigarette delta
 */
export function hackSavings(pm25, swaps, hacks, key) {
  const on = computeLedger(pm25, swaps, { ...hacks, [key]: true }).savings;
  const off = computeLedger(pm25, swaps, { ...hacks, [key]: false }).savings;
  return Math.abs(on - off);
}

/**
 * Human band for a PM2.5 reading.
 * @param {number} pm25
 * @returns {{ label: string, color: string }}
 */
export function pmBand(pm25) {
  if (pm25 <= PM_BAND_THRESHOLDS.low) return { label: 'Low', color: '#2dd4a7' };
  if (pm25 <= PM_BAND_THRESHOLDS.rising) return { label: 'Rising', color: '#e8a33d' };
  if (pm25 <= PM_BAND_THRESHOLDS.unhealthy) return { label: 'Unhealthy', color: '#f87171' };
  return { label: 'Severe', color: '#f87171' };
}

/**
 * One fixed-decimal number, safe for non-finite input.
 * @param {number} value
 * @param {number} [digits]
 * @returns {string}
 */
export function formatCigs(value, digits = 1) {
  if (!Number.isFinite(value)) return '0.0';
  return value.toFixed(digits);
}

/**
 * A deterministic-looking 24-hour series for when there is no live reading.
 * @returns {SeriesPoint[]}
 */
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

/**
 * Ask for the visitor's coordinates, falling back to the default city.
 * @param {{ timeout?: number }} [options]
 * @returns {Promise<Location>}
 */
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

/**
 * Fetch the last 24 hours of PM2.5 from Open-Meteo.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<AirReading>} the reading, with a demo series if the API sends none
 * @throws {Error} on a non-OK response or a payload without PM2.5
 */
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
