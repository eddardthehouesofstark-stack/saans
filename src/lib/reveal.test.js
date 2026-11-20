import { describe, expect, it } from 'vitest';
import { reveal } from './reveal.js';

describe('reveal', () => {
  it('reveals once, on viewport entry, with the requested offset', () => {
    const props = reveal(0.16);
    expect(props.initial).toEqual({ opacity: 0, y: 20, x: 0 });
    expect(props.whileInView).toEqual({ opacity: 1, y: 0, x: 0 });
    expect(props.viewport.once).toBe(true);
    expect(props.transition.delay).toBe(0.16);
  });

  it('accepts per-section direction, distance, duration and margin', () => {
    const props = reveal(0, { x: -18, y: 0, duration: 0.6, margin: '-12%' });
    expect(props.initial).toEqual({ opacity: 0, y: 0, x: -18 });
    expect(props.viewport.margin).toBe('-12%');
    expect(props.transition.duration).toBe(0.6);
  });
});
