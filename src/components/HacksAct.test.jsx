import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HacksAct from './HacksAct';
import { computeLedger } from '../lib/air';

function setup(overrides = {}) {
  const props = {
    pm25: 285,
    swaps: {},
    hacks: {},
    ledger: computeLedger(285, {}, {}),
    onToggleHack: vi.fn(),
    ...overrides,
  };
  render(<HacksAct {...props} />);
  return props;
}

describe('HacksAct', () => {
  it('lists the four indoor fixes', () => {
    setup();
    expect(screen.getByText('Build a Corsi–Rosenthal box')).toBeInTheDocument();
    expect(screen.getByText('Ventilate 2–4 pm, not 7–10 am')).toBeInTheDocument();
    expect(screen.getByText('N95 outdoors, fitted')).toBeInTheDocument();
    expect(screen.getByText('Kitchen exhaust, every time')).toBeInTheDocument();
  });

  it('reports the hack key when applied', () => {
    const { onToggleHack } = setup();
    fireEvent.click(screen.getAllByRole('button', { name: 'Apply' })[0]);
    expect(onToggleHack).toHaveBeenCalledWith('corsi');
  });

  it('marks an applied hack as pressed', () => {
    setup({ hacks: { corsi: true } });
    expect(screen.getByRole('button', { name: 'Applied ✓' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('shows four family rows, two of them priced as children', () => {
    setup();
    const table = screen.getByRole('table', { name: 'Family budget by member' });
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    expect(screen.getAllByText('child · 1.8×')).toHaveLength(2);
    expect(screen.getAllByText('adult · 1.0×')).toHaveLength(2);
  });

  it('adds a family member', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: '+ Add a family member' }));
    expect(screen.getAllByLabelText('Family member name')).toHaveLength(5);
  });

  it('removes a family member once the exit animation finishes', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Kid 2' }));
    await waitFor(() =>
      expect(screen.getAllByLabelText('Family member name')).toHaveLength(3)
    );
  });

  it('reprices a child as an adult when their age changes', () => {
    setup();
    const ageInput = screen.getByLabelText('Kid 1 age');
    fireEvent.change(ageInput, { target: { value: '30' } });
    expect(screen.getAllByText('child · 1.8×')).toHaveLength(1);
    expect(screen.getAllByText('adult · 1.0×')).toHaveLength(3);
  });
});
