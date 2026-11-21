import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MathAct from './MathAct';
import { demoSeries } from '../lib/air';

// Recharts measures with real layout; the chart module has its own responsibility.
vi.mock('./charts/PmChart', () => ({ default: () => null }));

const PROPS = {
  pm25: 285,
  budget: 12.9,
  series: demoSeries(),
  demo: true,
  loading: false,
};

describe('MathAct', () => {
  it('shows the three-step conversion', () => {
    render(<MathAct {...PROPS} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /13 cigarettes\. Not one of them lit\./
    );
    expect(screen.getByText('PM2.5 right now')).toBeInTheDocument();
    expect(screen.getByText('One cigarette ≈')).toBeInTheDocument();
    expect(screen.getByText('So today’s air is worth')).toBeInTheDocument();
  });

  it('spells out the arithmetic with the live reading', () => {
    render(<MathAct {...PROPS} />);
    expect(screen.getByText('cigs/day')).toBeInTheDocument();
    expect(screen.getByText('PM2.5 ÷ 22')).toBeInTheDocument();
    expect(screen.getByText('285 ÷ 22')).toBeInTheDocument();
    expect(screen.getAllByText('12.9').length).toBeGreaterThan(0);
  });

  it('labels the series as demo or live', () => {
    const { rerender } = render(<MathAct {...PROPS} />);
    expect(screen.getByText(/Demo series · 285 µg\/m³ baseline/)).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();

    rerender(<MathAct {...PROPS} demo={false} />);
    expect(screen.getByText('Open-Meteo · this location')).toBeInTheDocument();
    expect(screen.getByText('live')).toBeInTheDocument();
  });
});
