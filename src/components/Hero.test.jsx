import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Hero from './Hero';

describe('Hero', () => {
  it('states the budget in cigarettes', () => {
    render(<Hero pm25={285} budget={12.9} demo place="New Delhi, IN" loading={false} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/You smoked/);
    expect(screen.getByText('cigarettes')).toBeInTheDocument();
    expect(screen.getByText('today.')).toBeInTheDocument();
  });

  it('shows the place, the reading and the demo badge', () => {
    render(<Hero pm25={285} budget={12.9} demo place="New Delhi, IN" loading={false} />);
    expect(screen.getByText('New Delhi, IN · 285 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('demo data')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
  });

  it('describes the day while the reading loads', () => {
    render(<Hero pm25={285} budget={12.9} demo={false} place="Your location" loading />);
    expect(screen.getByText('Measuring the air')).toBeInTheDocument();
    expect(screen.queryByText('demo data')).not.toBeInTheDocument();
    expect(screen.getByText('5 activities')).toBeInTheDocument();
    expect(screen.getByText('4 can be swapped')).toBeInTheDocument();
  });
});
