/**
 * SAANS — constructors for the air state held in `App`.
 *
 * Both the live and the demo path return the same shape, so `App` never
 * repeats the object literal and a missing reading cannot leave a field
 * undefined.
 *
 * @typedef {import('./air').Location} Location
 * @typedef {import('./air').AirReading} AirReading
 * @typedef {{
 *   pm25: number,
 *   series: import('./air').SeriesPoint[],
 *   demo: boolean,
 *   loading: boolean,
 *   place: string,
 *   coords: { lat: number, lon: number },
 *   usAqi: number | null,
 * }} AirState
 */

import { DEFAULT_LOCATION, DEFAULT_PM25, demoSeries } from './air';

/**
 * The seeded New Delhi reading, shown while loading or after a failed fetch.
 * @param {Location} [location]
 * @param {{ loading?: boolean }} [options]
 * @returns {AirState}
 */
export function demoReading(location = DEFAULT_LOCATION, { loading = false } = {}) {
  return {
    pm25: DEFAULT_PM25,
    series: demoSeries(),
    demo: true,
    loading,
    place: location.label,
    coords: { lat: location.lat, lon: location.lon },
    usAqi: null,
  };
}

/**
 * The reading resolved from Open-Meteo.
 * @param {AirReading} live
 * @param {Location} location
 * @returns {AirState}
 */
export function liveReading(live, location) {
  return {
    pm25: live.pm25,
    series: live.series,
    demo: false,
    loading: false,
    place: location.label,
    coords: { lat: location.lat, lon: location.lon },
    usAqi: live.usAqi,
  };
}
