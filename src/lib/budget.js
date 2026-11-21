/**
 * SAANS — cigarette-equivalence maths as pure functions.
 *
 * Nothing here touches the DOM, React or the network, so every result is
 * directly testable. The formula is:
 *
 *   cigarettes = (PM2.5 × breathing rate × hours × exposure) ÷ (22 × 0.6 × 24)
 *
 * with exposure 1 outdoors, 0.6 indoors (infiltration), or a swap's own factor.
 *
 * @typedef {import('./air').Activity} Activity
 * @typedef {{
 *   key: string,
 *   factor: number,
 *   applies: (row: Activity, swapped: boolean) => boolean,
 * }} Hack
 */

import {
  CIGARETTE_DAILY_DOSE,
  CIGARETTE_PM25_UG_M3,
  INFILTRATION_FACTOR,
} from '../constants/impact';

/**
 * The daily budget in cigarette-equivalents.
 * @param {number} pm25 current PM2.5 in µg/m³
 * @returns {number} cigarettes (never below 0.1 so the UI never shows zero)
 */
export function cigaretteBudget(pm25) {
  return Math.max(0.1, pm25 / CIGARETTE_PM25_UG_M3);
}

/**
 * Price a dose of air.
 * @param {number} pm25 current PM2.5 in µg/m³
 * @param {{ rate: number, hours: number, exposure?: number }} dose
 * @returns {number} cigarettes for that dose
 */
export function activityCigarettes(pm25, { rate, hours, exposure = 1 }) {
  return (pm25 * rate * hours * exposure) / CIGARETTE_DAILY_DOSE;
}

/**
 * Exposure factor for an activity, before any indoor fixes.
 * @param {Activity} row
 * @param {boolean} useSwap
 * @returns {number} 1 outdoors, the infiltration factor indoors, or the swap's own factor
 */
export function exposureFactor(row, useSwap) {
  if (useSwap && row.swap) return row.swap.exposure;
  return row.indoor ? INFILTRATION_FACTOR : 1;
}

/**
 * Price one ledger row, applying every active indoor fix that touches it.
 * @param {Activity} row
 * @param {number} pm25
 * @param {{ useSwap?: boolean, hacks?: Hack[], activeHacks?: Record<string, boolean> }} [options]
 * @returns {number} cigarettes for this row
 */
export function rowCigarettes(row, pm25, { useSwap = false, hacks = [], activeHacks = {} } = {}) {
  const rate = useSwap && row.swap ? row.swap.rate : row.rate;
  const priced = activityCigarettes(pm25, {
    rate,
    hours: row.hours,
    exposure: exposureFactor(row, useSwap),
  });

  return hacks.reduce(
    (value, hack) =>
      activeHacks[hack.key] && hack.applies(row, useSwap) ? value * hack.factor : value,
    priced
  );
}

/**
 * Sum a cigarette total across rows.
 * @param {Array<{ base: number, now: number }>} rows
 * @param {'base' | 'now'} field
 * @returns {number}
 */
export function sumCigarettes(rows, field) {
  return rows.reduce((sum, row) => sum + row[field], 0);
}
