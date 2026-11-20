import { motion } from 'framer-motion';

const PARTICLES = [
  { left: '8%', top: '30%', size: 3, duration: 26, x: [-14, 18], y: [10, -22], delay: 0 },
  { left: '17%', top: '62%', size: 2, duration: 32, x: [12, -20], y: [-14, 12], delay: 1.2 },
  { left: '28%', top: '22%', size: 2, duration: 24, x: [10, -12], y: [18, -10], delay: 2.4 },
  { left: '39%', top: '74%', size: 3, duration: 35, x: [-18, 8], y: [-20, 16], delay: 0.6 },
  { left: '52%', top: '38%', size: 2, duration: 29, x: [14, -16], y: [12, -18], delay: 3.1 },
  { left: '63%', top: '68%', size: 2, duration: 33, x: [-10, 20], y: [16, -12], delay: 1.8 },
  { left: '72%', top: '26%', size: 3, duration: 27, x: [18, -10], y: [-16, 14], delay: 0.9 },
  { left: '81%', top: '54%', size: 2, duration: 31, x: [-16, 12], y: [-10, 20], delay: 2.7 },
  { left: '89%', top: '36%', size: 2, duration: 25, x: [8, -18], y: [14, -20], delay: 4.0 },
  { left: '94%', top: '70%', size: 3, duration: 34, x: [-12, 16], y: [20, -14], delay: 1.5 },
];

export default function Particulates() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-ink/40"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px rgba(232,163,61,0.5)',
            background: i % 3 === 0 ? 'rgba(232,163,61,0.55)' : 'rgba(242,239,233,0.4)',
          }}
          animate={{ x: p.x, y: p.y, opacity: [0.15, 0.5, 0.15] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
