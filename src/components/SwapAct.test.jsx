import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SwapAct from './SwapAct';
import { computeLedger } from '../lib/air';

function setup(swaps = {}) {
  const ledger = computeLedger(285, swaps, {});
  const onToggleSwap = vi.fn(() => 0.7);
  render(<SwapAct ledger={ledger} onToggleSwap={onToggleSwap} />);
  return { ledger, onToggleSwap };
}

describe('SwapAct', () => {
  it('renders one card per swappable activity', () => {
    setup();
    expect(screen.getAllByRole('button', { name: 'Apply swap' })).toHaveLength(4);
    expect(screen.getByText('Swap sunrise jog → indoor HIIT')).toBeInTheDocument();
    expect(screen.getByText('Cook with exhaust + lid')).toBeInTheDocument();
  });

  it('passes the row key to the parent when applied', () => {
    const { onToggleSwap } = setup();
    fireEvent.click(screen.getAllByRole('button', { name: 'Apply swap' })[1]);
    expect(onToggleSwap).toHaveBeenCalledWith('commute');
  });

  it('shows an applied swap as undoable', () => {
    setup({ commute: true });
    const undo = screen.getByRole('button', { name: 'Undo' });
    expect(undo).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('applied')).toBeInTheDocument();
  });

  it('lists applied savings in the live receipt', () => {
    setup({ commute: true });
    expect(screen.getByText('Applied today')).toBeInTheDocument();
    expect(screen.getByText(/Metro cabin/)).toBeInTheDocument();
  });

  it('says nothing is saved while no swap is applied', () => {
    setup();
    expect(screen.getByText('Nothing saved yet')).toBeInTheDocument();
    expect(screen.getByText(/No swaps yet/)).toBeInTheDocument();
  });
});
