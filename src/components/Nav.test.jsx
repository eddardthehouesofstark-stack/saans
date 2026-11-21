import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Nav from './Nav';

describe('Nav', () => {
  it('links every act twice: desktop and mobile', () => {
    render(<Nav pm25={285} demo onAsk={vi.fn()} />);
    const labels = ['The math', 'Your day', 'Swaps', 'Indoor', 'Block C'];
    for (const label of labels) {
      expect(screen.getAllByRole('link', { name: label })).toHaveLength(2);
    }
  });

  it('names both navigation landmarks', () => {
    render(<Nav pm25={120} demo={false} onAsk={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Sections (mobile)' })).toBeInTheDocument();
  });

  it('shows the PM2.5 reading and a demo badge only when needed', () => {
    const { rerender } = render(<Nav pm25={285} demo onAsk={vi.fn()} />);
    expect(screen.getByText('PM2.5 285')).toBeInTheDocument();
    expect(screen.getByText('demo')).toBeInTheDocument();

    rerender(<Nav pm25={42} demo={false} onAsk={vi.fn()} />);
    expect(screen.getByText('PM2.5 42')).toBeInTheDocument();
    expect(screen.queryByText('demo')).not.toBeInTheDocument();
  });

  it('opens the co-pilot from the header button', () => {
    const onAsk = vi.fn();
    render(<Nav pm25={285} demo onAsk={onAsk} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ask Saans' }));
    expect(onAsk).toHaveBeenCalledTimes(1);
  });
});
