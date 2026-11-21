import { motion } from 'framer-motion';
import AnimatedNumber from '../AnimatedNumber';
import { CLEAR_THRESHOLD, formatCigs, SAVINGS_EPSILON } from '../../lib/air';
import { SMOG_CLEAR_THRESHOLD } from '../../constants/impact';

/**
 * The live receipt: today's net, the progress to a cleared day, and every
 * applied swap. Reprices itself from the ledger on each toggle.
 *
 * @param {{ ledger: import('../../lib/air').Ledger }} props
 */
export default function SwapReceipt({ ledger }) {
  const toThreshold = Math.max(0, CLEAR_THRESHOLD - ledger.savings);
  const progress = Math.min(100, (ledger.savings / CLEAR_THRESHOLD) * 100);
  const clear = ledger.savings >= CLEAR_THRESHOLD;
  const target = SMOG_CLEAR_THRESHOLD.toFixed(1);

  return (
    <>
      <div className="panel p-6">
        <div className="flex items-center justify-between">
          <p className="micro">Net today</p>
          <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
            live
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-3" aria-live="polite" aria-atomic="true">
          <AnimatedNumber
            value={ledger.net}
            decimals={1}
            className="font-display text-[clamp(4rem,7vw,5.6rem)] leading-[0.8] tracking-[-0.03em] text-ink"
          />
          <span className="text-2xl" aria-hidden="true">
            🚬
          </span>
          {ledger.savings > SAVINGS_EPSILON ? (
            <span className="font-grotesk text-sm text-mute/85 line-through">
              {formatCigs(ledger.budget)}
            </span>
          ) : null}
        </div>

        <p className="mt-4 font-grotesk text-[11px] uppercase tracking-[0.14em] text-green">
          {ledger.savings > SAVINGS_EPSILON
            ? `−${formatCigs(ledger.savings)} 🚬 saved so far`
            : 'Nothing saved yet'}
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between font-grotesk text-[10px] text-mute">
            <span>{clear ? 'The smog is thinning' : `Clearer air at ${target}`}</span>
            <span className="tabular-nums">
              {formatCigs(ledger.savings)} / {target}
            </span>
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
        Savings are computed against the unprotected row, not against each other. Applying an indoor
        fix adjusts the same rows — never double-counted.
      </p>
    </>
  );
}
