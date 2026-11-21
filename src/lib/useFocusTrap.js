import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Panels slide in before they can take focus; wait for the transition. */
const FOCUS_DELAY_MS = 380;

/**
 * Keeps keyboard focus inside a dialog while it is open, closes it on Escape,
 * and restores focus to whatever was focused before it opened.
 *
 * @param {import('react').RefObject<HTMLElement>} containerRef dialog element
 * @param {boolean} active whether the dialog is open
 * @param {{ onEscape?: () => void, initialFocusRef?: import('react').RefObject<HTMLElement>, delay?: number }} [options]
 */
export function useFocusTrap(containerRef, active, options = {}) {
  const { onEscape, initialFocusRef, delay = FOCUS_DELAY_MS } = options;
  const escapeRef = useRef(onEscape);

  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return undefined;

    const container = containerRef.current;
    const restoreTo = document.activeElement;
    const focusable = () =>
      Array.from(container?.querySelectorAll(FOCUSABLE) ?? []);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const timer = setTimeout(
      () => (initialFocusRef?.current ?? container)?.focus(),
      delay
    );
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
      restoreTo?.focus?.();
    };
  }, [active, containerRef, initialFocusRef, delay]);
}
