/**
 * SAANS — the physical constants behind every number in the app.
 *
 * Keeping them in one file makes the impact maths auditable, and lets each
 * value carry the citation that justifies it. Components must not hard-code
 * these numbers; import them from here.
 *
 * @see https://berkeleyearth.org/air-pollution-and-cigarette-equivalence/
 */

/** PM2.5 (µg/m³) sustained over 24 h that is equivalent to one cigarette. Berkeley Earth. */
export const CIGARETTE_PM25_UG_M3 = 22;

/** Fraction of outdoor PM2.5 that reaches indoor air with the windows shut. Xiang et al., 2021. */
export const INFILTRATION_FACTOR = 0.6;

/** Hours in the reference exposure window (one day). */
export const HOURS_PER_DAY = 24;

/** Denominator converting (µg/m³ × m³/h × h) into cigarettes: 22 × 0.6 × 24 = 316.8. */
export const CIGARETTE_DAILY_DOSE = CIGARETTE_PM25_UG_M3 * INFILTRATION_FACTOR * HOURS_PER_DAY;

/** Adult breathing rates in m³/h, from ICRP Publication 66 (Human Respiratory Tract Model). */
export const BREATHING_RATE_REST = 0.45;
export const BREATHING_RATE_LIGHT = 1.5;
export const BREATHING_RATE_HEAVY = 3.0;

/** Seated at a desk but moving around the flat, m³/h. */
export const BREATHING_RATE_INDOOR = 0.6;

/** Cooking in a kitchen, m³/h. */
export const BREATHING_RATE_COOKING = 0.9;

/** Indoor HIIT, m³/h — ICRP "heavy" less the outdoor effort. */
export const BREATHING_RATE_HIIT = 2.4;

/** Seated in a metro cabin, m³/h. */
export const BREATHING_RATE_METRO = 1.2;

/** Dose multiplier for a child aged 4–12 doing an adult's routine. ICRP Publication 66. */
export const CHILD_DOSE_MULTIPLIER = 1.8;

/** Age band that receives the child dose; outside it the weight is 1. */
export const CHILD_AGE_MIN = 4;
export const CHILD_AGE_MAX = 12;

/** Fallback PM2.5 (µg/m³) when geolocation or Open-Meteo is unavailable — New Delhi winter mean. */
export const DEFAULT_PM25_UG_M3 = 285;

/** Savings (cigarettes/day) at which the day is presented as cleared. */
export const SMOG_CLEAR_THRESHOLD = 3.0;

/** Savings below this read as "nothing changed" in copy and styling. */
export const SAVINGS_EPSILON = 0.05;

/** Savings that fill the atmosphere's progress ramp to 100%. */
export const CLEAR_SCALE = 6;

/** PM2.5 band boundaries in µg/m³, tightened for South Asian exposure. */
export const PM_BAND_THRESHOLDS = Object.freeze({ low: 30, rising: 60, unhealthy: 120 });
