import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { lazy, Suspense, useRef, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';
import SectionHeading from './SectionHeading';
import { reveal } from '../lib/reveal';

const PmChart = lazy(() => import('./charts/PmChart'));

const STEPS = [
  {
    key: 'now',
    label: 'PM2.5 right now',
    note: 'Live hourly reading for your coordinates, from Open-Meteo.',
    unit: 'µg/m³',
    decimals: 0,
  },
  {
    key: 'cig',
    label: 'One cigarette ≈',
    note: 'Berkeley Earth: 22 µg/m³ of PM2.5 over 24 hours equals one cigarette.',
    unit: 'µg/m³ · 24 h',
    decimals: 0,
  },
  {
    key: 'budget',
    label: 'So today’s air is worth',
    note: 'Your lungs pay this whether or not you smoke. The next act is the bill.',
    unit: '🚬 today',
    decimals: 1,
  },
];

export default function MathAct({ pm25, budget, series, demo, loading }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const rail = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.3 ? 0 : value < 0.62 ? 1 : 2;
    setStep((current) => (current === next ? current : next));
  });

  const values = {
    now: pm25,
    cig: 22,
    budget,
  };

  return (
    <section id="math" ref={ref} className="relative md:h-[300vh]">
      <div className="relative flex items-center overflow-hidden py-24 md:sticky md:top-0 md:h-[100svh] md:py-0">
        <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-6 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-16 md:px-10">
          <div>
            <SectionHeading
              index="01"
              kicker="The math"
              title={`${Math.round(budget)} cigarettes. Not one of them lit.`}
              lede="This is not a metaphor. It is a dose, converted with the same number epidemiologists use to compare smoke exposure."
            />

            <div className="relative mt-10 pl-6">
              <span className="absolute left-0 top-1 h-full w-px bg-white/10" />
              <motion.span
                className="absolute left-0 top-1 w-px origin-top bg-amber"
                style={{ height: '100%', scaleY: reduceMotion ? 1 : rail }}
              />

              <div className="space-y-8">
                {STEPS.map((item, index) => {
                  const active = step >= index;
                  return (
                    <motion.div
                      key={item.key}
                      {...reveal(index * 0.08, { y: 16, duration: 0.6, margin: '-10%' })}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-grotesk text-[10px] tracking-[0.2em] text-mute">
                          0{index + 1}
                        </span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-colors ${
                            active ? 'bg-amber' : 'bg-white/20'
                          }`}
                        />
                        <span className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-ink/80">
                          {item.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <AnimatedNumber
                          value={values[item.key]}
                          decimals={item.decimals}
                          className={`font-display text-[clamp(2.6rem,5vw,4rem)] leading-none tracking-[-0.02em] ${
                            item.key === 'budget' ? 'text-amber' : 'text-ink'
                          }`}
                        />
                        <span className="font-grotesk text-[11px] uppercase tracking-[0.14em] text-mute">
                          {item.unit}
                        </span>
                      </div>
                      <p className="mt-2 max-w-sm text-xs leading-relaxed text-ink/70">{item.note}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-4 font-grotesk text-[11px] tracking-[0.06em] text-ink/75">
              <span className="text-mute">cigs/day</span>
              <span>=</span>
              <span>PM2.5 ÷ 22</span>
              <span>=</span>
              <span>
                {pm25} ÷ 22
              </span>
              <span>=</span>
              <span className="text-amber">{budget.toFixed(1)}</span>
            </div>
          </div>

          <div className="panel relative">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <p className="micro">PM2.5 · last 24 hours</p>
                <p className="mt-1 font-grotesk text-[11px] text-ink/70">
                  {demo ? 'Demo series · 285 µg/m³ baseline' : 'Open-Meteo · this location'}
                </p>
              </div>
              <span className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: demo ? '#e8a33d' : '#2dd4a7' }}
                />
                <span className="micro text-[10px]">{loading ? 'updating' : demo ? 'demo' : 'live'}</span>
              </span>
            </div>

            <div className="px-3 pt-4">
              <Suspense
                fallback={
                  <div className="h-[240px] w-full animate-pulse bg-white/[0.03] sm:h-[280px]" />
                }
              >
                <PmChart series={series} />
              </Suspense>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-grotesk text-[10px] uppercase tracking-[0.16em] text-green">
                22 µg/m³ reference = 1 cigarette / day
              </p>
              <p className="font-grotesk text-[10px] text-mute">Berkeley Earth equivalence</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
