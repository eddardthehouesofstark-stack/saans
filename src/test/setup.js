import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without globals, so Testing Library cannot auto-register cleanup.
afterEach(cleanup);

// jsdom ships neither IntersectionObserver nor matchMedia; framer-motion's
// useInView and prefers-reduced-motion both need them.
if (!globalThis.IntersectionObserver) {
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      this.callback([{ isIntersecting: true, target }], this);
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver = MockIntersectionObserver;
}

// Recharts' ResponsiveContainer measures its box with ResizeObserver.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
