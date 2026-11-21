import { describe, expect, it } from 'vitest';
import { BLOCK, goalPercent, MOCK_HOUSEHOLDS, MOCK_TOTAL, MYTHS } from './community.js';

describe('community seed', () => {
  it('seeds 24 neighbour households with stable ids', () => {
    expect(MOCK_HOUSEHOLDS).toHaveLength(24);
    expect(MOCK_HOUSEHOLDS[0].id).toBe('C-101');
    expect(MOCK_HOUSEHOLDS.at(-1).id).toBe('C-124');
  });

  it('totals roughly 40% of the weekly block goal', () => {
    expect(MOCK_TOTAL).toBeGreaterThan(79.5);
    expect(MOCK_TOTAL).toBeLessThanOrEqual(80.5);
    expect(MOCK_TOTAL / BLOCK.goal).toBeCloseTo(0.4, 2);
  });

  it('counts the visitor as the 25th household', () => {
    expect(BLOCK.households).toBe(25);
    expect(MOCK_HOUSEHOLDS.length + 1).toBe(BLOCK.households);
  });
});

describe('myths', () => {
  it('debunks both claims with a reason', () => {
    expect(MYTHS).toHaveLength(2);
    for (const myth of MYTHS) {
      expect(myth.claim.length).toBeGreaterThan(0);
      expect(myth.verdict.length).toBeGreaterThan(40);
    }
  });
});

describe('goalPercent', () => {
  it('rounds the share of the weekly goal', () => {
    expect(goalPercent(100)).toBe(50);
    expect(goalPercent(80)).toBe(40);
  });

  it('clamps to 0–100 and defaults to the block goal', () => {
    expect(goalPercent(-10)).toBe(0);
    expect(goalPercent(500)).toBe(100);
    expect(goalPercent(Number.NaN)).toBe(0);
    expect(goalPercent(20, 0)).toBe(0);
    expect(goalPercent(10, 20)).toBe(50);
  });
});
