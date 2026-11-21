import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

// The map needs real layout; its own module owns that behaviour.
vi.mock('./components/map/LocationMap', () => ({ default: () => null }));

vi.mock('./lib/supabase', () => ({
  isSupabaseConfigured: false,
  logSwap: vi.fn(async () => true),
  removeSwap: vi.fn(async () => true),
  weekSwapTotal: vi.fn(async () => null),
}));

const mocks = vi.hoisted(() => ({ fetchLiveAir: vi.fn() }));

vi.mock('./lib/air', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    locate: vi.fn(async () => actual.DEFAULT_LOCATION),
    fetchLiveAir: mocks.fetchLiveAir,
  };
});

describe('App', () => {
  it('renders every act and swaps the demo reading for the live one', async () => {
    mocks.fetchLiveAir.mockResolvedValue({
      pm25: 90,
      usAqi: 168,
      series: [
        { label: '09:00', pm25: 88 },
        { label: '10:00', pm25: 90 },
      ],
    });

    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/You smoked/);
    expect(screen.getByRole('main')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('PM2.5 90')).toBeInTheDocument());
    expect(screen.getAllByText('Unhealthy').length).toBeGreaterThan(0);
    // The hero now shows the live reading instead of the demo baseline.
    expect(screen.getByText('New Delhi, IN · 90 µg/m³')).toBeInTheDocument();
  }, 15000);

  it('applies and undoes a swap, updating the live receipt', async () => {
    mocks.fetchLiveAir.mockRejectedValue(new Error('offline'));

    render(<App />);
    await waitFor(() => expect(screen.getByText('PM2.5 285')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: 'Apply swap' })[0]);
    expect(await screen.findByText('Applied today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(screen.getByText(/No swaps yet/)).toBeInTheDocument());
  }, 15000);
});
