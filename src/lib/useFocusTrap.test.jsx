import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function Dialog({ open, onEscape }) {
  const ref = useRef(null);
  useFocusTrap(ref, open, { onEscape, delay: 0 });
  return (
    <div ref={ref} tabIndex={-1} data-testid="dialog">
      <button type="button">First</button>
      <button type="button">Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus into the dialog when it opens', async () => {
    render(<Dialog open onEscape={vi.fn()} />);
    await waitFor(() => expect(screen.getByTestId('dialog')).toHaveFocus());
  });

  it('closes on Escape', () => {
    const onEscape = vi.fn();
    render(<Dialog open onEscape={onEscape} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last control back to the first', async () => {
    render(<Dialog open onEscape={vi.fn()} />);
    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('wraps Shift+Tab from the first control to the last', () => {
    render(<Dialog open onEscape={vi.fn()} />);
    const first = screen.getByRole('button', { name: 'First' });
    first.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('restores focus to the trigger on close', async () => {
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <Dialog open onEscape={vi.fn()} />
      </>
    );
    await waitFor(() => expect(screen.getByTestId('dialog')).toHaveFocus());

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();
    rerender(
      <>
        <button type="button">Trigger</button>
        <Dialog open={false} onEscape={vi.fn()} />
      </>
    );
    expect(trigger).toHaveFocus();
  });
});
