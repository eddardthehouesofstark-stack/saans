import { AnimatePresence, motion } from 'framer-motion';
import { formatCigs, SAVINGS_EPSILON } from '../../lib/air';
import { CHILD_DOSE_MULTIPLIER } from '../../constants/impact';
import { familyMemberBudget } from '../../lib/family';

/** Five columns: name, age, budget, saved, remove. */
const FAMILY_GRID = 'grid-cols-[1fr_48px_64px_58px_16px]';

const ROW_CLASS = `grid ${FAMILY_GRID} items-center gap-2`;

/**
 * The editable family budget table. Each row prices the same routine for one
 * person, so a child's dose is the adult dose times the child multiplier.
 *
 * @param {{
 *   family: import('../../lib/family').FamilyMember[],
 *   ledger: import('../../lib/air').Ledger,
 *   onUpdate: (id: string, patch: object) => void,
 *   onAdd: () => void,
 *   onRemove: (id: string) => void,
 * }} props
 */
export default function FamilyTable({ family, ledger, onUpdate, onAdd, onRemove }) {
  return (
    <>
      <div role="table" aria-label="Family budget by member" className="mt-6">
        <div role="row" className={`${ROW_CLASS} border-b border-white/10 pb-2`}>
          <span
            role="columnheader"
            className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute"
          >
            Name
          </span>
          <span
            role="columnheader"
            className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute"
          >
            Age
          </span>
          <span
            role="columnheader"
            className="text-right font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute"
          >
            Budget
          </span>
          <span
            role="columnheader"
            className="text-right font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute"
          >
            Saved
          </span>
          <span aria-hidden="true" />
        </div>

        <div role="rowgroup" className="divide-y divide-white/[0.06]">
          <AnimatePresence initial={false}>
            {family.map((member) => {
              const {
                weight,
                budget: personBudget,
                saved: personSaved,
              } = familyMemberBudget(ledger, member);

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
                      onChange={(event) => onUpdate(member.id, { name: event.target.value })}
                      aria-label="Family member name"
                      className="w-full border-b border-transparent bg-transparent py-0.5 font-grotesk text-xs text-ink focus:border-amber focus:outline-none"
                    />
                    <span
                      className={`font-grotesk text-[10px] uppercase tracking-[0.12em] ${
                        weight > 1 ? 'text-amber/80' : 'text-mute/85'
                      }`}
                    >
                      {weight > 1 ? `child · ${CHILD_DOSE_MULTIPLIER}×` : 'adult · 1.0×'}
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
                        onUpdate(member.id, { age: Number(event.target.value) || 0 })
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
                      onClick={() => onRemove(member.id)}
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
        onClick={onAdd}
        className="mt-4 font-grotesk text-[10px] uppercase tracking-[0.16em] text-amber transition-colors hover:text-ink"
      >
        + Add a family member
      </button>

      <p className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] leading-relaxed text-mute/85">
        Each row prices the same routine for that person; savings scale with their dose. A child at{' '}
        {CHILD_DOSE_MULTIPLIER}× pays almost twice what an adult pays for the same afternoon
        outside.
      </p>
    </>
  );
}
