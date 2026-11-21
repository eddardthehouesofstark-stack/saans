import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DayAct from './DayAct';
import { computeLedger } from '../lib/air';

// Leaflet needs a real layout engine; the map itself is covered by its own module.
vi.mock('./map/LocationMap', () => ({ default: () => null }));

function setup(overrides = {}) {
  const props = {
    ledger: computeLedger(285, {}, {}),
    pm25: 285,
    place: 'New Delhi, IN',
    coords: { lat: 28.6139, lon: 77.209 },
    demo: true,
    usAqi: null,
    ...overrides,
  };
  render(<DayAct {...props} />);
  return props;
}

describe('DayAct', () => {
  it('prices the five daily activities', () => {
    setup();
    expect(screen.getByText('Sunrise jog')).toBeInTheDocument();
    expect(screen.getByText('E-rickshaw commute')).toBeInTheDocument();
    expect(screen.getByText('Work from home')).toBeInTheDocument();
    expect(screen.getByText("Kids' park time")).toBeInTheDocument();
    expect(screen.getByText('Evening cooking')).toBeInTheDocument();
  });

  it('flags a demo reading and names the place', () => {
    setup();
    expect(screen.getByText('New Delhi, IN')).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();
  });

  it('shows the live PM2.5 band and US AQI when available', () => {
    setup({ pm25: 90, demo: false, usAqi: 168 });
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
    expect(screen.getByText('168')).toBeInTheDocument();
    expect(screen.getByText(/Live budget · 90/)).toBeInTheDocument();
  });

  it('accounts for background air outside the five rows', () => {
    setup();
    expect(screen.getByText(/background air/)).toBeInTheDocument();
    expect(screen.getByText('Net today')).toBeInTheDocument();
  });

  it('marks a swapped row and shows what it was', () => {
    setup({ ledger: computeLedger(285, { jog: true }, {}) });
    expect(screen.getByText('swapped')).toBeInTheDocument();
    expect(screen.getByText(/was /)).toBeInTheDocument();
  });
});
