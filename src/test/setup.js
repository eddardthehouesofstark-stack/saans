import '@testing-library/jest-dom/vitest';

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
