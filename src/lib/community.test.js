import { describe, expect, it } from 'vitest';
import { BLOCK, MOCK_HOUSEHOLDS, MOCK_TOTAL } from './community.js';

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
