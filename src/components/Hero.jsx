import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import AnimatedNumber from './AnimatedNumber';
import Particulates from './Particulates';
import Skyline from './Skyline';
import { pmBand } from '../lib/air';

export default function Hero({ pm25, budget, demo, place, loading }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const band = pmBand(pm25);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-28 md:px-10"
    >
      <Skyline />
      <Particulates />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto w-full max-w-[1440px]"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="micro text-ink/55">Your daily lung budget</span>
          <span className="h-px w-8 bg-white/25" />
          <span className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: band.color, boxShadow: `0 0 10px ${band.color}` }}
            />
            <span className="micro text-ink/80">
              {loading ? 'Measuring the air' : `${place} · ${pm25} µg/m³`}
            </span>
            {demo && !loading ? (
              <span className="border border-amber/40 px-1.5 py-0.5 font-grotesk text-[8px] uppercase tracking-[0.2em] text-amber">
                demo data
              </span>
            ) : null}
          </span>
        </div>

        <h1 className="mt-7">
          <span className="block font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[0.95] text-ink/75">
            You smoked
          </span>

          <span className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-2 md:gap-x-10">
            <span
              className="font-display text-[clamp(9rem,26vw,22rem)] leading-[0.72] tracking-[-0.045em] text-amber"
              style={{ textShadow: '0 0 120px rgba(232,163,61,0.22)' }}
            >
              <AnimatedNumber value={budget} decimals={0} duration={2.4} />
            </span>
            <span className="mb-2 flex flex-col md:mb-8">
              <span className="font-display text-[clamp(2rem,4.2vw,3.7rem)] leading-[0.9]">
                cigarettes
              </span>
              <span className="font-display text-[clamp(2rem,4.2vw,3.7rem)] leading-[0.9] text-ink/45">
                today.
              </span>
            </span>
          </span>
        </h1>

        <div className="mt-8 border-t border-white/10 pt-6 md:mt-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-lg leading-snug text-ink/70 md:text-xl">
              You didn’t touch one.{' '}
              <span className="text-ink">It’s the air.</span>
            </p>

            <dl className="grid grid-cols-3 gap-6 md:gap-10">
              <div>
                <dt className="micro">PM2.5 now</dt>
                <dd className="mt-2 font-grotesk text-lg text-ink">
                  {pm25}
                  <span className="ml-1 text-[10px] text-mute">µg/m³</span>
                </dd>
                <dd className="mt-1 font-grotesk text-[10px] uppercase tracking-[0.16em]" style={{ color: band.color }}>
                  {band.label}
                </dd>
              </div>
              <div>
                <dt className="micro">One cigarette</dt>
                <dd className="mt-2 font-grotesk text-lg text-ink">
                  22
                  <span className="ml-1 text-[10px] text-mute">µg/m³</span>
                </dd>
                <dd className="mt-1 font-grotesk text-[10px] uppercase tracking-[0.16em] text-mute">
                  24 h exposure
                </dd>
              </div>
              <div>
                <dt className="micro">Your day</dt>
                <dd className="mt-2 font-grotesk text-lg text-ink">5 activities</dd>
                <dd className="mt-1 font-grotesk text-[10px] uppercase tracking-[0.16em] text-green">
                  4 can be swapped
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-10 flex justify-center md:mt-14">
            <a href="#math" className="group flex flex-col items-center gap-2" aria-label="Scroll to the math">
              <span className="micro text-ink/45 transition-colors group-hover:text-ink/80">
                Scroll to see your day
              </span>
              <svg
                className="animate-nudge text-amber/80"
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                aria-hidden="true"
              >
                <path d="M8 1v14M2.5 10.5 8 16l5.5-5.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
