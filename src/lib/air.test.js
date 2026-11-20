import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVITIES,
  CIG_DENOM,
  DEFAULT_LOCATION,
  computeLedger,
  demoSeries,
  fetchLiveAir,
  formatCigs,
  hackSavings,
  locate,
  pmBand,
} from './air.js';

const PM = 120;
const rowOf = (key, options) => computeLedger(PM, {}, options).rows.find((row) => row.key === key);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ledger pricing', () => {
  it('prices one row per activity in a fixed order', () => {
    const { rows } = computeLedger(PM);
    expect(rows.map((row) => row.key)).toEqual(ACTIVITIES.map((activity) => activity.key));
    expect(rows).toHaveLength(5);
  });

  it('derives the daily budget from the 22 µg/m³ equivalence', () => {
    expect(computeLedger(PM).budget).toBeCloseTo(PM / 22, 10);
    expect(computeLedger(0).budget).toBe(0.1);
  });

  it('applies the 0.6 indoor infiltration factor', () => {
    const expected = (PM * 0.6 * 9 * 0.6) / CIG_DENOM;
    expect(rowOf('wfh').now).toBeCloseTo(expected, 12);
    expect(rowOf('jog').now).toBeCloseTo((PM * 3 * 0.5) / CIG_DENOM, 12);
  });

  it('prices a swap with its own rate and exposure', () => {
    const ledger = computeLedger(PM, { cook: true });
    const cook = ledger.rows.find((row) => row.key === 'cook');
    expect(cook.swapped).toBe(true);
    expect(cook.now).toBeCloseTo((PM * 0.9 * 1 * 0.24) / CIG_DENOM, 12);
    expect(cook.now).toBeLessThan(cook.base);
  });

  it('reports the same swap saving whether or not it is applied', () => {
    const off = computeLedger(PM);
    const on = computeLedger(PM, { jog: true });
    const offRow = off.rows.find((row) => row.key === 'jog');
    const onRow = on.rows.find((row) => row.key === 'jog');
    expect(onRow.swapSaving).toBeCloseTo(offRow.swapSaving, 12);
    expect(onRow.now).toBeCloseTo(offRow.now - offRow.swapSaving, 12);
  });

  it('multiplies hacks onto the affected rows only', () => {
    const plain = computeLedger(PM, {}, { corsi: true });
    expect(plain.rows.find((row) => row.key === 'wfh').now).toBeCloseTo(
      rowOf('wfh').now * 0.27,
      12
    );
    expect(plain.rows.find((row) => row.key === 'jog').now).toBeCloseTo(rowOf('jog').now, 12);
  });

  it('never double counts a swap and a hack on the same row', () => {
    const ledger = computeLedger(PM, { jog: true }, { corsi: true });
    expect(ledger.savings).toBeCloseTo(ledger.baseTotal - ledger.nowTotal, 12);
    expect(ledger.savings).toBeLessThanOrEqual(ledger.baseTotal);
  });

  it('keeps the ledger, budget and net consistent', () => {
    const ledger = computeLedger(PM, { jog: true, cook: true }, { exhaust: true });
    expect(ledger.nowTotal).toBeCloseTo(
      ledger.rows.reduce((sum, row) => sum + row.now, 0),
      12
    );
    expect(ledger.net).toBeCloseTo(Math.max(0, ledger.budget - ledger.savings), 12);
    expect(ledger.background).toBeCloseTo(Math.max(0, ledger.budget - ledger.baseTotal), 12);
  });
});

describe('hackSavings', () => {
  it('matches the delta between the hack on and off', () => {
    for (const hack of ['corsi', 'vent', 'n95', 'exhaust']) {
      const direct = Math.abs(
        computeLedger(PM, {}, { [hack]: true }).savings -
          computeLedger(PM, {}, { [hack]: false }).savings
      );
      expect(hackSavings(PM, {}, {}, hack)).toBeCloseTo(direct, 12);
    }
  });

  it('only prices the N95 on outdoor rows that have not been swapped', () => {
    expect(hackSavings(PM, {}, {}, 'n95')).toBeGreaterThan(0);
    expect(hackSavings(PM, { jog: true, commute: true, park: true }, {}, 'n95')).toBe(0);
  });

  it('prices the kitchen exhaust only for unprotected cooking', () => {
    expect(hackSavings(PM, {}, {}, 'exhaust')).toBeGreaterThan(0);
    expect(hackSavings(PM, { cook: true }, {}, 'exhaust')).toBe(0);
  });
});

describe('formatting and bands', () => {
  it('formats cigarettes with a fixed precision', () => {
    expect(formatCigs(1.234)).toBe('1.2');
    expect(formatCigs(1.25, 2)).toBe('1.25');
    expect(formatCigs(Number.NaN)).toBe('0.0');
  });

  it('bands PM2.5 at the documented cut-offs', () => {
    expect(pmBand(10).label).toBe('Low');
    expect(pmBand(30).label).toBe('Low');
    expect(pmBand(31).label).toBe('Rising');
    expect(pmBand(120).label).toBe('Unhealthy');
    expect(pmBand(121).label).toBe('Severe');
  });

});

describe('demoSeries', () => {
  it('returns 24 hourly points above the demo floor', () => {
    const series = demoSeries();
    expect(series).toHaveLength(24);
    expect(series.every((point) => point.pm25 >= 60 && /^\d{2}:00$/.test(point.label))).toBe(true);
  });
});

describe('fetchLiveAir', () => {
  const times = Array.from(
    { length: 30 },
    (_, i) => `2026-11-20T${String(i % 24).padStart(2, '0')}:00`
  );
  const values = Array.from({ length: 30 }, (_, i) => 40 + i);

  it('parses, trims and rounds the Open-Meteo payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          current: { pm2_5: 81.34, us_aqi: 154 },
          hourly: { time: times, pm2_5: values },
        }),
      }))
    );

    const air = await fetchLiveAir(28.6, 77.2);
    expect(air.pm25).toBe(81.3);
    expect(air.usAqi).toBe(154);
    expect(air.series).toHaveLength(24);
    expect(air.series.at(-1).pm25).toBe(values.at(-1));
  });

  it('falls back to the demo series when the hourly block is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ current: { pm2_5: 55 }, hourly: { time: [], pm2_5: [] } }),
      }))
    );

    const air = await fetchLiveAir(0, 0);
    expect(air.usAqi).toBeNull();
    expect(air.series).toHaveLength(24);
  });

  it('throws on a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    await expect(fetchLiveAir(0, 0)).rejects.toThrow('Open-Meteo 503');
  });
});

describe('locate', () => {
  const setGeolocation = (value) =>
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value });

  it('falls back to New Delhi without a geolocation API', async () => {
    setGeolocation(undefined);
    await expect(locate()).resolves.toEqual(DEFAULT_LOCATION);
  });

  it('uses the device coordinates when granted', async () => {
    setGeolocation({
      getCurrentPosition: (success) =>
        success({ coords: { latitude: 19.07, longitude: 72.87 } }),
    });
    await expect(locate()).resolves.toEqual({
      lat: 19.07,
      lon: 72.87,
      label: 'Your location',
    });
  });

  it('falls back when permission is denied', async () => {
    setGeolocation({ getCurrentPosition: (_success, failure) => failure(new Error('denied')) });
    await expect(locate()).resolves.toEqual(DEFAULT_LOCATION);
  });
});
