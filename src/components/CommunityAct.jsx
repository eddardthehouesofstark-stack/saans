import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BLOCK, MOCK_HOUSEHOLDS, MOCK_TOTAL } from '../lib/community';
import { formatCigs } from '../lib/air';
import { isSupabaseConfigured, weekSwapTotal } from '../lib/supabase';
import SectionHeading from './SectionHeading';

const MYTHS = [
  {
    emoji: '🪴',
    claim: 'Balcony plants purify the air.',
    verdict:
      'No measurable PM2.5 effect. A balcony of areca palms moves less air than one open window, and PM2.5 is far too fine to stick to a leaf.',
  },
  {
    emoji: '😷',
    claim: 'Cloth masks work.',
    verdict:
      'They don’t — not against PM2.5. Only a fitted N95/KN95 filters the fine fraction. Cloth is a droplet barrier, not a smog barrier.',
  },
];

export default function CommunityAct({ savings }) {
  const [remote, setRemote] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let alive = true;
    weekSwapTotal().then((value) => {
      if (!alive) return;
      setRemote(value);
    });
    return () => {
      alive = false;
    };
  }, [savings]);

  const live = isSupabaseConfigured && remote != null;
  const contributed = live ? remote : savings;
  const total = MOCK_TOTAL + contributed;
  const pct = Math.min(100, (total / BLOCK.goal) * 100);

  return (
    <section id="block" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <SectionHeading
          index="05"
          kicker="Community mode"
          title="Your block breathes it too."
          lede="Twenty-five households, one weekly target. Your applied swaps are written to the block ledger — the bar fills as the street spends less."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber shadow-[0_0_12px_rgba(232,163,61,0.7)]" />
                  <p className="font-grotesk text-sm text-ink">{BLOCK.name}</p>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.16em] text-mute">
                    · {BLOCK.households} households
                  </span>
                </div>
                <p className="mt-2 font-grotesk text-[11px] uppercase tracking-[0.16em] text-mute">
                  Week goal · cut {BLOCK.goal} 🚬 as a block
                </p>
              </div>
              <span
                className={`flex items-center gap-1.5 border px-2 py-1 font-grotesk text-[10px] uppercase tracking-[0.18em] ${
                  live
                    ? 'border-green/40 text-green'
                    : 'border-amber/40 text-amber'
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${live ? 'bg-green' : 'bg-amber'}`}
                />
                {live ? 'live · supabase' : 'demo data'}
              </span>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-[clamp(3.4rem,7vw,5.4rem)] leading-none tracking-[-0.03em] text-ink">
                {formatCigs(total, 0)}
              </span>
              <span className="font-grotesk text-sm text-mute">/ {BLOCK.goal} 🚬</span>
              <span className="ml-auto font-grotesk text-xs tabular-nums text-green">
                {pct.toFixed(0)}%
              </span>
            </div>

            <div className="relative mt-4 h-2 w-full overflow-hidden bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber/80 to-amber"
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
              <span
                className="absolute inset-y-0 w-px bg-white/35"
                style={{ left: '40%' }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-2 flex justify-between font-grotesk text-[10px] uppercase tracking-[0.16em] text-mute/85">
              <span>Week start · 0</span>
              <span>Target · 200</span>
            </div>

            <div className="mt-8 grid grid-cols-5 gap-2">
              {MOCK_HOUSEHOLDS.map((house) => (
                <div
                  key={house.id}
                  title={`${house.id} · ${house.cigs} 🚬 this week`}
                  className="flex h-9 items-center justify-center border border-white/[0.06] font-grotesk text-[10px] tracking-[0.08em] text-ink/70"
                  style={{
                    background: `rgba(232,163,61,${0.08 + Math.min(0.42, house.cigs / 10)})`,
                  }}
                >
                  {house.id.replace('C-', '')}
                </div>
              ))}
              <div
                title={`You · ${formatCigs(savings)} 🚬 today`}
                className={`flex h-9 items-center justify-center border font-grotesk text-[10px] uppercase tracking-[0.08em] ${
                  savings > 0.05
                    ? 'border-green/60 bg-green/20 text-green'
                    : 'border-dashed border-amber/50 text-amber'
                }`}
              >
                you
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
              <p className="max-w-md text-[11px] leading-relaxed text-mute/85">
                Each square is one household; brighter means more cigarettes bought back. Your swaps
                add <span className="text-green">{formatCigs(savings)} 🚬</span> today.
              </p>
              <p className="font-grotesk text-[10px] leading-relaxed text-mute/85">
                {isSupabaseConfigured
                  ? 'Rows persist in Supabase. 24 neighbour totals are seeded locally.'
                  : 'Supabase not configured — mock households only. Add keys in src/supabaseConfig.js.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="micro">Myth check</p>
            {MYTHS.map((myth) => (
              <div key={myth.claim} className="border border-white/[0.08] bg-[#11141b]/80 p-5">
                <span className="text-2xl" aria-hidden="true">
                  {myth.emoji}
                </span>
                <h3 className="mt-3 font-grotesk text-sm leading-snug text-ink/70 line-through decoration-alarm/70 decoration-2">
                  {myth.claim}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink/80">{myth.verdict}</p>
              </div>
            ))}
            <p className="px-1 text-[10px] leading-relaxed text-mute/85">
              Filters, seals and timing do the work. Everything else is decoration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
