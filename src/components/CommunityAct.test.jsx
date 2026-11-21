import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommunityAct from './CommunityAct';
import { MOCK_TOTAL } from '../lib/community';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: false,
  weekSwapTotal: vi.fn(async () => null),
  logSwap: vi.fn(async () => true),
  removeSwap: vi.fn(async () => true),
}));

describe('CommunityAct', () => {
  it('names the block and its weekly goal', () => {
    render(<CommunityAct savings={0} />);
    expect(screen.getByText('Block C, Sector 45')).toBeInTheDocument();
    expect(screen.getByText(/cut 200 🚬 as a block/)).toBeInTheDocument();
    expect(screen.getByText('demo data')).toBeInTheDocument();
  });

  it('adds the visitor savings to the seeded households', () => {
    render(<CommunityAct savings={2.4} />);
    // 80 seeded + 2.4 saved = 82 of the 200-cigarette weekly goal.
    expect(screen.getByText(String(Math.round(MOCK_TOTAL + 2.4)))).toBeInTheDocument();
    expect(screen.getByText('41%')).toBeInTheDocument();
    expect(screen.getAllByText('2.4 🚬', { exact: false }).length).toBeGreaterThan(0);
  });

  it('renders one tile per household plus the visitor', () => {
    const { container } = render(<CommunityAct savings={0} />);
    const tiles = container.querySelectorAll('.grid-cols-5 > div');
    expect(tiles).toHaveLength(25);
    expect(screen.getByText('you')).toBeInTheDocument();
  });

  it('debunks both myths', () => {
    render(<CommunityAct savings={0} />);
    expect(screen.getByText('Balcony plants purify the air.')).toBeInTheDocument();
    expect(screen.getByText('Cloth masks work.')).toBeInTheDocument();
    expect(screen.getByText(/Only a fitted N95\/KN95/)).toBeInTheDocument();
  });
});
