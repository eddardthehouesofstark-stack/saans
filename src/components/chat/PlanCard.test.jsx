import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PlanCard from './PlanCard';

const PLAN = {
  actions: [
    { action: 'Take the metro at 8:15.', pm25_avoided: 85, cigarettes_saved: 0.7 },
    { action: 'Cook with the exhaust on.', pm25_avoided: 65, cigarettes_saved: 0.3 },
  ],
  net_budget: '11.3',
  source_note: 'Priced with 22 µg/m³ = 1 cigarette/day.',
};

describe('PlanCard', () => {
  it('renders every action with its priced saving', () => {
    render(<PlanCard plan={PLAN} />);
    expect(screen.getByText('Take the metro at 8:15.')).toBeInTheDocument();
    expect(screen.getByText('−0.7 🚬')).toBeInTheDocument();
    expect(screen.getByText('85 µg/m³ avoided')).toBeInTheDocument();
    expect(screen.getByText('Cook with the exhaust on.')).toBeInTheDocument();
  });

  it('shows the net budget and the source note', () => {
    render(<PlanCard plan={PLAN} />);
    expect(screen.getByText('11.3 🚬')).toBeInTheDocument();
    expect(screen.getByText(/22 µg\/m³ = 1 cigarette/)).toBeInTheDocument();
  });

  it('flags the fallback plan explicitly', () => {
    render(<PlanCard plan={PLAN} fallback />);
    expect(
      screen.getByText(/Example plan · Gemini unavailable or key missing/)
    ).toBeInTheDocument();
  });

  it('omits figures the model did not supply', () => {
    render(<PlanCard plan={{ actions: [{ action: 'Open a window at 2 pm.' }] }} />);
    expect(screen.getByText('Open a window at 2 pm.')).toBeInTheDocument();
    expect(screen.queryByText(/µg\/m³ avoided/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🚬/)).not.toBeInTheDocument();
  });
});
