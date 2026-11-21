import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Chat from './Chat';

const mocks = vi.hoisted(() => ({ requestPlan: vi.fn() }));

vi.mock('../lib/gemini', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requestPlan: mocks.requestPlan };
});

const KEY_STORAGE = 'saans.gemini_key';

function setup(open = true) {
  const onClose = vi.fn();
  const onOpen = vi.fn();
  render(
    <Chat
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      pm25={285}
      place="New Delhi, IN"
      budget={12.95}
      net={12.95}
      appliedSwaps={[]}
    />
  );
  return { onClose, onOpen };
}

describe('Chat', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    mocks.requestPlan.mockReset();
  });

  it('exposes a labelled modal dialog', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Ask Saans' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('log')).toBeInTheDocument();
  });

  it('asks for a key when none is saved', () => {
    setup();
    expect(screen.getByLabelText('Gemini API key')).toBeInTheDocument();
    expect(screen.getByText(/no key · example plans still work/)).toBeInTheDocument();
  });

  it('saves a key for this tab once', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Gemini API key'), {
      target: { value: '  AIza-test  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save key' }));

    expect(window.sessionStorage.getItem(KEY_STORAGE)).toBe('AIza-test');
    expect(screen.queryByLabelText('Gemini API key')).not.toBeInTheDocument();
    expect(screen.getByText(/Key saved for this tab/)).toBeInTheDocument();
  });

  it('forgets a saved key on request', () => {
    window.sessionStorage.setItem(KEY_STORAGE, 'AIza-test');
    setup();
    fireEvent.click(screen.getByRole('button', { name: /forget it/ }));
    expect(window.sessionStorage.getItem(KEY_STORAGE)).toBeNull();
    expect(screen.getByLabelText('Gemini API key')).toBeInTheDocument();
  });

  it('sends a question and renders the returned plan', async () => {
    mocks.requestPlan.mockResolvedValue({
      actions: [{ action: 'Take the metro at 8:15.', cigarettes_saved: 0.7, pm25_avoided: 85 }],
      net_budget: '11.3',
      source_note: 'Priced by the ledger.',
    });
    window.sessionStorage.setItem(KEY_STORAGE, 'AIza-test');
    setup();

    fireEvent.change(screen.getByLabelText(/Ask Saans about today/), {
      target: { value: 'What should I change?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Take the metro at 8:15.')).toBeInTheDocument();
    expect(screen.getByText('What should I change?')).toBeInTheDocument();
    expect(mocks.requestPlan).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'AIza-test' })
    );
  });

  it('falls back to the example plan when the request fails', async () => {
    mocks.requestPlan.mockRejectedValue(new Error('Gemini 500'));
    window.sessionStorage.setItem(KEY_STORAGE, 'AIza-test');
    setup();

    fireEvent.change(screen.getByLabelText(/Ask Saans about today/), {
      target: { value: 'Plan my day' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(
      await screen.findByText(/Example plan · Gemini unavailable or key missing/)
    ).toBeInTheDocument();
  });

  it('does not send an empty question', () => {
    window.sessionStorage.setItem(KEY_STORAGE, 'AIza-test');
    setup();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('closes on Escape', () => {
    const { onClose } = setup();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('offers the floating button while closed', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask Saans' })).toBeInTheDocument();
  });
});
