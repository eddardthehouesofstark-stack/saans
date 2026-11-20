import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Counts from the previously displayed value to `value` when it enters view.
 * Values changed later (swaps, live AQI) animate from where they were.
 * Assistive tech reads the final value, never the in-flight digits.
 */
export default function AnimatedNumber({ value, decimals = 1, className = '', duration = 1.1 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px -8% 0px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(current.current, value, {
      duration: reduceMotion ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        current.current = latest;
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, inView, duration, reduceMotion]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display.toFixed(decimals)}</span>
      <span className="sr-only">{value.toFixed(decimals)}</span>
    </span>
  );
}
