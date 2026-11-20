import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/**
 * The smog inversion layer: clean pale sky at the top, a thick brown haze
 * through the middle, clean blue again at the close. The smog thins as the
 * user's savings grow (`clearing` 0 → 1).
 */
export default function Atmosphere({ clearing = 0 }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.5 });

  const clear = useMotionValue(0);
  useEffect(() => {
    clear.set(clearing);
  }, [clearing, clear]);

  const topClean = useTransform(progress, [0, 0.22, 0.36], [0.9, 0.55, 0]);
  const smogRaw = useTransform(progress, [0, 0.22, 0.52, 0.8, 1], [0.04, 0.46, 0.86, 0.6, 0.08]);
  const smog = useTransform([smogRaw, clear], ([s, c]) => s * (1 - 0.55 * c));
  const endClean = useTransform(progress, [0.76, 0.97], [0, 0.92]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-base" aria-hidden="true">
      <motion.div style={{ opacity: topClean }} className="sky-clean absolute inset-x-0 top-0 h-[88vh]" />

      <motion.div style={{ opacity: smog }} className="smog-field absolute inset-0" />

      <motion.div
        style={{ opacity: endClean }}
        className="sky-end absolute inset-x-0 bottom-0 h-[85vh]"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 50%, rgba(13,15,20,0) 35%, rgba(13,15,20,0.55) 100%)',
        }}
      />
    </div>
  );
}
