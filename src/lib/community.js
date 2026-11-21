/**
 * Minimal community data for SAANS. The 24 "neighbour" households are mock
 * contributions that seed the block bar at roughly 40% of the weekly goal.
 * The signed-in visitor is household #25 and contributes their live savings.
 */
export const BLOCK = {
  name: 'Block C, Sector 45',
  households: 25,
  goal: 200,
};

const RAW = [
  2.4, 4.1, 1.8, 3.3, 2.9, 5.2, 1.2, 3.8, 2.1, 4.6, 3.0, 2.6,
  1.9, 4.9, 2.2, 3.5, 1.4, 5.0, 2.8, 3.1, 1.7, 4.3, 2.0, 3.6,
];

const SCALE = 80 / RAW.reduce((sum, value) => sum + value, 0);

export const MOCK_HOUSEHOLDS = RAW.map((value, i) => ({
  id: `C-${101 + i}`,
  cigs: Number((value * SCALE).toFixed(1)),
}));

export const MOCK_TOTAL = MOCK_HOUSEHOLDS.reduce((sum, house) => sum + house.cigs, 0);

/** Two claims the app explicitly debunks, with the reason. */
export const MYTHS = [
  {
    emoji: '🪴',
    claim: 'Balcony plants purify the air.',
    verdict:
      'No measurable PM2.5 effect. A balcony of areca palms moves less air than one open window, and PM2.5 is far too fine to stick to a leaf.',
  },
  {
    emoji: '😷',
    claim: 'Cloth masks work.',
    verdict:
      'They don’t — not against PM2.5. Only a fitted N95/KN95 filters the fine fraction. Cloth is a droplet barrier, not a smog barrier.',
  },
];

/**
 * How full the block's weekly bar is, clamped to 0–100.
 * @param {number} total cigarettes bought back by the block
 * @param {number} [goal] weekly target
 * @returns {number} whole percent
 */
export function goalPercent(total, goal = BLOCK.goal) {
  if (!Number.isFinite(total) || goal <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((total / goal) * 100)));
}
