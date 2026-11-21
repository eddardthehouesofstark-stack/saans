import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import SectionHeading from './SectionHeading';
import { reveal } from '../lib/reveal';
import { formatCigs, HACKS, hackSavings, SAVINGS_EPSILON } from '../lib/air';
import {
  addFamilyMember,
  DEFAULT_FAMILY,
  familyMemberBudget,
  removeFamilyMember,
  updateFamilyMember,
} from '../lib/family';

/** Five columns: name, age, budget, saved, remove. */
const FAMILY_GRID = 'grid-cols-[1fr_48px_64px_58px_16px]';

const ROW_CLASS = `grid ${FAMILY_GRID} items-center gap-2`;

/**
 * Indoor fixes (each one reprices the ledger) plus a family view that scales
 * the same routine by each member's dose.
 *
 * @param {{
 *   pm25: number,
 *   swaps: Record<string, boolean>,
 *   hacks: Record<string, boolean>,
 *   ledger: import('../lib/air').Ledger,
 *   onToggleHack: (key: string) => void,
 * }} props
 */
export default function HacksAct({ pm25, swaps, hacks, ledger, onToggleHack }) {
  const [family, setFamily] = useState(DEFAULT_FAMILY);

  const update = (id, patch) => setFamily((prev) => updateFamilyMember(prev, id, patch));
  const addMember = () => setFamily((prev) => addFamilyMember(prev));
  const removeMember = (id) => setFamily((prev) => removeFamilyMember(prev, id));

  return (
    <section id="hacks" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <SectionHeading
          index="04"
          kicker="Indoor hacks + family mode"
          title="The air inside is yours to fix."
          lede="Four changes that need no policy, no app, and mostly no money. Apply one and watch the ledger reprice itself."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="space-y-4">
            {HACKS.map((hack, index) => {
              const applied = Boolean(hacks[hack.key]);
              const gain = hackSavings(pm25, swaps, hacks, hack.key);

              return (
                <motion.div
                  key={hack.key}
                  {...reveal(index * 0.06)}
                  className={`border p-5 transition-colors duration-300 ${
                    applied ? 'border-green/35 bg-green/[0.04]' : 'border-white/[0.08] bg-[#11141b]/85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-grotesk text-[10px] tracking-[0.2em] text-mute">
                        {hack.index}
                      </span>
                      <h3 className="font-grotesk text-base leading-snug text-ink">{hack.title}</h3>
                    </div>
                    <span className="shrink-0 border border-white/10 px-2 py-1 font-grotesk text-[10px] uppercase tracking-[0.12em] text-amber">
                      {hack.claim}
                    </span>
                  </div>

                  <p className="mt-3 max-w-lg text-xs leading-relaxed text-ink/70">{hack.copy}</p>
                  <p className="mt-2 font-grotesk text-[10px] uppercase tracking-[0.12em] text-ink/70">
                    {hack.meta}
                  </p>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.07] pt-3">
                    <div>
                      <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                        saves
                      </p>
                      <p className="mt-1 font-grotesk text-sm tabular-nums text-green">
                        {formatCigs(gain)} 🚬 / day
                      </p>
                      <p className="mt-1 font-grotesk text-[10px] leading-relaxed text-mute/85">
                        {hack.source}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleHack(hack.key)}
                      aria-pressed={applied}
                      className={
                        applied
                          ? 'btn border border-green/40 px-3 py-2 font-grotesk text-[10px] uppercase tracking-[0.16em] text-green hover:bg-green/10'
                          : 'btn-ghost px-3 py-2 font-grotesk text-[10px] uppercase tracking-[0.16em]'
                      }
                    >
                      {applied ? 'Applied ✓' : 'Apply'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* family mode */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="micro">Family mode</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight">
                    The same air, smaller lungs.
                  </h3>
                </div>
                <span className="shrink-0 border border-amber/40 px-2 py-1 font-grotesk text-[10px] uppercase tracking-[0.14em] text-amber">
                  1.8× kids
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink/70">
                Children breathe more air per kilogram of body weight, so their row is priced at 1.8×.
                Edit names and ages — the table reprices immediately.
              </p>

              <div role="table" aria-label="Family budget by member" className="mt-6">
                <div
                  role="row"
                  className={`${ROW_CLASS} border-b border-white/10 pb-2`}
                >
                  <span role="columnheader" className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                    Name
                  </span>
                  <span role="columnheader" className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                    Age
                  </span>
                  <span role="columnheader" className="text-right font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                    Budget
                  </span>
                  <span role="columnheader" className="text-right font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                    Saved
                  </span>
                  <span aria-hidden="true" />
                </div>

                <div role="rowgroup" className="divide-y divide-white/[0.06]">
                  <AnimatePresence initial={false}>
                    {family.map((member) => {
                      const { weight, budget: personBudget, saved: personSaved } =
                        familyMemberBudget(ledger, member);

                      return (
                        <motion.div
                          key={member.id}
                          role="row"
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`${ROW_CLASS} py-2.5`}
                        >
                          <div role="cell" className="min-w-0">
                            <input
                              value={member.name}
                              onChange={(event) =>
                                update(member.id, { name: event.target.value })
                              }
                              aria-label="Family member name"
                              className="w-full border-b border-transparent bg-transparent py-0.5 font-grotesk text-xs text-ink focus:border-amber focus:outline-none"
                            />
                            <span
                              className={`font-grotesk text-[10px] uppercase tracking-[0.12em] ${
                                weight > 1 ? 'text-amber/80' : 'text-mute/85'
                              }`}
                            >
                              {weight > 1 ? 'child · 1.8×' : 'adult · 1.0×'}
                            </span>
                          </div>

                          <div role="cell">
                            <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              max="99"
                              value={member.age}
                              onChange={(event) =>
                                update(member.id, { age: Number(event.target.value) || 0 })
                              }
                              aria-label={`${member.name || 'Member'} age`}
                              className="w-full border-b border-white/10 bg-transparent py-0.5 text-center font-grotesk text-xs tabular-nums text-ink focus:border-amber focus:outline-none"
                            />
                          </div>

                          <span
                            role="cell"
                            className="text-right font-grotesk text-xs tabular-nums text-ink/80"
                          >
                            {formatCigs(personBudget)}
                          </span>

                          <span
                            role="cell"
                            className={`text-right font-grotesk text-xs tabular-nums ${
                              personSaved > SAVINGS_EPSILON ? 'text-green' : 'text-mute/85'
                            }`}
                          >
                            {personSaved > SAVINGS_EPSILON ? `−${formatCigs(personSaved)}` : '—'}
                          </span>

                          <div role="cell">
                            <button
                              type="button"
                              onClick={() => removeMember(member.id)}
                              aria-label={`Remove ${member.name || 'member'}`}
                              className="text-mute transition-colors hover:text-alarm"
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <button
                type="button"
                onClick={addMember}
                className="mt-4 font-grotesk text-[10px] uppercase tracking-[0.16em] text-amber transition-colors hover:text-ink"
              >
                + Add a family member
              </button>

              <p className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] leading-relaxed text-mute/85">
                Each row prices the same routine for that person; savings scale with their dose. A
                child at 1.8× pays almost twice what an adult pays for the same afternoon outside.
              </p>
            </div>

            <p className="mt-4 px-1 text-[10px] leading-relaxed text-mute/85">
              Hack savings are applied to the unprotected price of each row, so a swap and an indoor fix
              never double-count the same cigarette.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
