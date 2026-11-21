import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CloseAct from './CloseAct';
import { computeLedger } from '../lib/air';

describe('CloseAct', () => {
  it('compares the morning budget with the day so far', () => {
    render(<CloseAct ledger={computeLedger(285, { jog: true }, {})} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Saans.');
    expect(screen.getByText('This morning')).toBeInTheDocument();
    expect(screen.getByText('Your day now')).toBeInTheDocument();
    expect(screen.getByText(/bought back/)).toBeInTheDocument();
  });

  it('says nothing was swapped when the ledger is untouched', () => {
    render(<CloseAct ledger={computeLedger(285, {}, {})} />);
    expect(screen.getByText('no swaps yet')).toBeInTheDocument();
  });

  it('credits the data sources and the disclaimer', () => {
    render(<CloseAct ledger={computeLedger(285, {}, {})} />);
    expect(screen.getByText('Air · Open-Meteo')).toBeInTheDocument();
    expect(screen.getByText(/not a medical device/)).toBeInTheDocument();
  });
});
