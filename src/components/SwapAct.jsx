import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';
import SectionHeading from './SectionHeading';
import { reveal } from '../lib/reveal';
import { CLEAR_THRESHOLD, formatCigs } from '../lib/air';

export default function SwapAct({ ledger, onToggleSwap }) {
  const [fly, setFly] = useState(null);
  const flyTimer = useRef(null);
  const flyId = useRef(0);

  useEffect(() => () => clearTimeout(flyTimer.current), []);

  function handleSwap(key) {
    const delta = onToggleSwap(key);
    setFly({ key, delta, id: (flyId.current += 1) });
    clearTimeout(flyTimer.current);
    flyTimer.current = setTimeout(() => setFly(null), 1200);
  }

  const toThreshold = Math.max(0, CLEAR_THRESHOLD - ledger.savings);
  const progress = Math.min(100, (ledger.savings / CLEAR_THRESHOLD) * 100);
  const clear = ledger.savings >= CLEAR_THRESHOLD;

  return (
    <section id="swaps" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <SectionHeading
          index="03"
          kicker="The swap engine"
          title="Same day. Cheaper air."
          lede="Every swap is priced on the client, with the same formula that priced the ledger. Tap to apply — tap again to undo. The number at the bottom is the only number that matters."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {ledger.rows
              .filter((row) => row.swap)
              .map((row, index) => {
                const activeFly = fly && fly.key === row.key;

                return (
                  <motion.div
                    key={row.key}
                    {...reveal(index * 0.08, { y: 22 })}
                    className={`relative flex flex-col border p-5 transition-colors duration-300 ${
                      row.swapped
                        ? 'border-green/40 bg-green/[0.045]'
                        : 'border-white/[0.08] bg-[#11141b]/85 hover:border-white/20'
                    }`}
                  >
                    <AnimatePresence>
                      {activeFly ? (
                        <motion.span
                          key={activeFly.id}
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: -6, scale: 1 }}
                          exit={{ opacity: 0, y: -44 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className={`pointer-events-none absolute right-4 top-3 z-10 font-grotesk text-sm font-medium ${
                            activeFly.delta >= 0 ? 'text-green' : 'text-ink/80'
                          }`}
                        >
                          {activeFly.delta >= 0 ? '−' : '+'}
                          {formatCigs(Math.abs(activeFly.delta))} 🚬{' '}
                          {activeFly.delta >= 0 ? 'saved' : 'back'}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                        <span aria-hidden="true">{row.emoji}</span>
                        {row.name}
                      </span>
                      <span className="font-grotesk text-[10px] tabular-nums text-ink/70">
                        {formatCigs(row.now)} now
                      </span>
                    </div>

                    <h3 className="mt-4 font-grotesk text-[17px] leading-snug text-ink">
                      {row.swap.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-ink/70">
                      {row.swap.detail}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="border border-white/10 px-2 py-1 font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute">
                        {row.swap.tag}
                      </span>
                      {row.swapped ? (
                        <span className="border border-green/30 px-2 py-1 font-grotesk text-[10px] uppercase tracking-[0.14em] text-green">
                          applied
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t border-white/[0.07] pt-4">
                      <div>
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                          saves
                        </p>
                        <p className={`mt-1 font-grotesk text-lg tabular-nums ${row.swapped ? 'text-green' : 'text-ink'}`}>
                          {formatCigs(row.swapSaving)} <span className="text-xs text-mute">🚬</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSwap(row.key)}
                        className={
                          row.swapped
                            ? 'btn border border-green/40 px-3 py-2 font-grotesk text-[10px] uppercase tracking-[0.16em] text-green hover:bg-green/10'
                            : 'btn-solid px-3 py-2 font-grotesk text-[10px] uppercase tracking-[0.16em]'
                        }
                        aria-pressed={row.swapped}
                      >
                        {row.swapped ? 'Undo' : 'Apply swap'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}

            <div className="border border-white/[0.06] p-5 sm:col-span-2">
              <p className="flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                <span aria-hidden="true">💻</span> Work from home · already protected
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink/70">
                Your nine indoor hours are the cheapest block in the day — 0.6 m³/h behind closed
                windows. The Corsi–Rosenthal box in act 04 makes them cheaper still.
              </p>
            </div>
          </div>

          {/* live receipt */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="panel p-6">
              <div className="flex items-center justify-between">
                <p className="micro">Net today</p>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                  live
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <AnimatedNumber
                  value={ledger.net}
                  decimals={1}
                  className="font-display text-[clamp(4rem,7vw,5.6rem)] leading-[0.8] tracking-[-0.03em] text-ink"
                />
                <span className="text-2xl" aria-hidden="true">
                  🚬
                </span>
                {ledger.savings > 0.05 ? (
                  <span className="font-grotesk text-sm text-mute/85 line-through">
                    {formatCigs(ledger.budget)}
                  </span>
                ) : null}
              </div>

              <p className="mt-4 font-grotesk text-[11px] uppercase tracking-[0.14em] text-green">
                {ledger.savings > 0.05
                  ? `−${formatCigs(ledger.savings)} 🚬 saved so far`
                  : 'Nothing saved yet'}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between font-grotesk text-[10px] text-mute">
                  <span>{clear ? 'The smog is thinning' : 'Clearer air at 3.0'}</span>
                  <span className="tabular-nums">{formatCigs(ledger.savings)} / 3.0</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden bg-white/[0.07]">
                  <motion.div
                    className="h-full bg-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 20 }}
                  />
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-mute/85">
                  {clear
                    ? 'Your choices are buying back the air. Keep stacking swaps and indoor fixes.'
                    : `Another ${formatCigs(toThreshold)} 🚬 and the inversion layer starts to lift.`}
                </p>
              </div>

              <div className="mt-6 border-t border-white/[0.07] pt-4">
                <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                  Applied today
                </p>
                {ledger.rows.some((row) => row.swapped) ? (
                  <ul className="mt-3 space-y-2">
                    {ledger.rows
                      .filter((row) => row.swapped)
                      .map((row) => (
                        <li key={row.key} className="flex items-center justify-between gap-3">
                          <span className="font-grotesk text-[11px] text-ink/70">
                            {row.emoji} {row.swap.short}
                          </span>
                          <span className="font-grotesk text-[10px] tabular-nums text-green">
                            −{formatCigs(row.saved)}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[11px] leading-relaxed text-ink/70">
                    No swaps yet. The ledger stays exactly where it started.
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 px-1 text-[10px] leading-relaxed text-mute/85">
              Savings are computed against the unprotected row, not against each other. Applying an
              indoor fix adjusts the same rows — never double-counted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
