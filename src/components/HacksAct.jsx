import { useState } from 'react';
import SectionHeading from './SectionHeading';
import HackCard from './hacks/HackCard';
import FamilyTable from './hacks/FamilyTable';
import { HACKS, hackSavings } from '../lib/air';
import { CHILD_DOSE_MULTIPLIER } from '../constants/impact';
import {
  addFamilyMember,
  DEFAULT_FAMILY,
  removeFamilyMember,
  updateFamilyMember,
} from '../lib/family';

/**
 * Act 04 — indoor fixes (each one reprices the ledger) plus a family view that
 * scales the same routine by each member's dose.
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
            {HACKS.map((hack, index) => (
              <HackCard
                key={hack.key}
                hack={hack}
                index={index}
                applied={Boolean(hacks[hack.key])}
                gain={hackSavings(pm25, swaps, hacks, hack.key)}
                onToggle={onToggleHack}
              />
            ))}
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
                  {CHILD_DOSE_MULTIPLIER}× kids
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-ink/70">
                Children breathe more air per kilogram of body weight, so their row is priced at{' '}
                {CHILD_DOSE_MULTIPLIER}×. Edit names and ages — the table reprices immediately.
              </p>

              <FamilyTable
                family={family}
                ledger={ledger}
                onUpdate={update}
                onAdd={addMember}
                onRemove={removeMember}
              />
            </div>

            <p className="mt-4 px-1 text-[10px] leading-relaxed text-mute/85">
              Hack savings are applied to the unprotected price of each row, so a swap and an indoor
              fix never double-count the same cigarette.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
