/** One reveal for every section: fade and drift in once, on viewport entry. */
const EASE = [0.16, 1, 0.3, 1];

export function reveal(delay = 0, { y = 20, x = 0, duration = 0.55, margin = '-8%' } = {}) {
  return {
    initial: { opacity: 0, y, x },
    whileInView: { opacity: 1, y: 0, x: 0 },
    viewport: { once: true, margin },
    transition: { duration, delay, ease: EASE },
  };
}
