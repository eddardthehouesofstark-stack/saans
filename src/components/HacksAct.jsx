import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import SectionHeading from './SectionHeading';
import { reveal } from '../lib/reveal';
import { formatCigs, HACKS, hackSavings } from '../lib/air';

const DEFAULT_FAMILY = [
  { id: 'a1', name: 'You', age: 34 },
  { id: 'a2', name: 'Partner', age: 32 },
  { id: 'k1', name: 'Kid 1', age: 8 },
  { id: 'k2', name: 'Kid 2', age: 5 },
];

function weightFor(age) {
  return age >= 4 && age <= 12 ? 1.8 : 1;
}

export default function HacksAct({ pm25, swaps, hacks, ledger, onToggleHack }) {
  const [family, setFamily] = useState(DEFAULT_FAMILY);

  function update(id, patch) {
    setFamily((prev) => prev.map((member) => (member.id === id ? { ...member, ...patch } : member)));
  }

  function addMember() {
    setFamily((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: 'New member', age: 30 },
    ]);
  }

  function removeMember(id) {
    setFamily((prev) => prev.filter((member) => member.id !== id));
  }

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
                    <span className="shrink-0 border border-white/10 px-2 py-1 font-grotesk text-[9px] uppercase tracking-[0.12em] text-amber">
                      {hack.claim}
                    </span>
                  </div>

                  <p className="mt-3 max-w-lg text-xs leading-relaxed text-ink/50">{hack.copy}</p>
                  <p className="mt-2 font-grotesk text-[10px] uppercase tracking-[0.12em] text-ink/40">
                    {hack.meta}
                  </p>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/[0.07] pt-3">
                    <div>
                      <p className="font-grotesk text-[9px] uppercase tracking-[0.18em] text-mute">
                        saves
                      </p>
                      <p className="mt-1 font-grotesk text-sm tabular-nums text-green">
                        {formatCigs(gain)} 🚬 / day
                      </p>
                      <p className="mt-1 font-grotesk text-[9px] leading-relaxed text-mute/70">
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
                  <h3 className="mt-2 font-display text-2xl leading-tight">The same air, smaller lungs.</h3>
                </div>
                <span className="shrink-0 border border-amber/40 px-2 py-1 font-grotesk text-[9px] uppercase tracking-[0.14em] text-amber">
                  1.8× kids
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink/45">
                Children breathe more air per kilogram of body weight, so their row is priced at 1.8×.
                Edit names and ages — the table reprices immediately.
              </p>

              <div className="mt-6 grid grid-cols-[1fr_48px_64px_58px_16px] items-center gap-2 border-b border-white/10 pb-2">
                <span className="font-grotesk text-[8px] uppercase tracking-[0.18em] text-mute">Name</span>
                <span className="font-grotesk text-[8px] uppercase tracking-[0.18em] text-mute">Age</span>
                <span className="text-right font-grotesk text-[8px] uppercase tracking-[0.18em] text-mute">Budget</span>
                <span className="text-right font-grotesk text-[8px] uppercase tracking-[0.18em] text-mute">Saved</span>
                <span />
              </div>

              <div className="divide-y divide-white/[0.06]">
                <AnimatePresence initial={false}>
                  {family.map((member) => {
                    const weight = weightFor(member.age);
                    const personBudget = ledger.budget * weight;
                    const personSaved = ledger.savings * weight;
                    return (
                      <motion.div
                        key={member.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-[1fr_48px_64px_58px_16px] items-center gap-2 py-2.5"
                      >
                        <div className="min-w-0">
                          <input
                            value={member.name}
                            onChange={(event) => update(member.id, { name: event.target.value })}
                            aria-label="Family member name"
                            className="w-full border-b border-transparent bg-transparent py-0.5 font-grotesk text-xs text-ink focus:border-amber focus:outline-none"
                          />
                          {weight > 1 ? (
                            <span className="font-grotesk text-[8px] uppercase tracking-[0.12em] text-amber/80">
                              child · 1.8×
                            </span>
                          ) : (
                            <span className="font-grotesk text-[8px] uppercase tracking-[0.12em] text-mute/60">
                              adult · 1.0×
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={member.age}
                          onChange={(event) =>
                            update(member.id, { age: Number(event.target.value) || 0 })
                          }
                          aria-label={`${member.name || 'Member'} age`}
                          className="w-full border-b border-white/10 bg-transparent py-0.5 text-center font-grotesk text-xs tabular-nums text-ink focus:border-amber focus:outline-none"
                        />
                        <span className="text-right font-grotesk text-xs tabular-nums text-ink/80">
                          {formatCigs(personBudget)}
                        </span>
                        <span
                          className={`text-right font-grotesk text-xs tabular-nums ${
                            personSaved > 0.05 ? 'text-green' : 'text-mute/50'
                          }`}
                        >
                          {personSaved > 0.05 ? `−${formatCigs(personSaved)}` : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          aria-label={`Remove ${member.name || 'member'}`}
                          className="text-mute transition-colors hover:text-alarm"
                        >
                          ×
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={addMember}
                className="mt-4 font-grotesk text-[10px] uppercase tracking-[0.16em] text-amber transition-colors hover:text-ink"
              >
                + Add a family member
              </button>

              <p className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] leading-relaxed text-mute/65">
                Each row prices the same routine for that person; savings scale with their dose. A
                child at 1.8× pays almost twice what an adult pays for the same afternoon outside.
              </p>
            </div>

            <p className="mt-4 px-1 text-[10px] leading-relaxed text-mute/60">
              Hack savings are applied to the unprotected price of each row, so a swap and an indoor fix
              never double-count the same cigarette.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
