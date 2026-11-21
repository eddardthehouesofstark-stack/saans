import { motion } from 'framer-motion';
import { formatCigs, SAVINGS_EPSILON } from '../../lib/air';
import { reveal } from '../../lib/reveal';

/**
 * One priced activity in the day ledger.
 * @param {{ row: import('../../lib/air').LedgerRow, index: number }} props
 */
export default function LedgerRow({ row, index }) {
  return (
    <motion.div
      {...reveal(index * 0.07, { x: -18, y: 0, margin: '-12%' })}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:px-6"
    >
      <span className="w-7 text-xl leading-none" aria-hidden="true">
        {row.emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-grotesk text-sm text-ink">{row.name}</p>
          {row.swapped ? (
            <span className="border border-green/30 bg-green/[0.06] px-1.5 py-0.5 font-grotesk text-[10px] uppercase tracking-[0.16em] text-green">
              swapped
            </span>
          ) : null}
          {row.protected ? (
            <span className="border border-white/10 px-1.5 py-0.5 font-grotesk text-[10px] uppercase tracking-[0.16em] text-mute">
              protected
            </span>
          ) : null}
        </div>
        <p className="mt-1 font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute">
          {row.window} · {row.swapped ? row.swap.tag : row.tag}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`font-grotesk text-xl tabular-nums ${row.swapped ? 'text-green' : 'text-ink'}`}
        >
          {formatCigs(row.now)}
          <span className="ml-1 text-[11px] text-mute">🚬</span>
        </p>
        {row.saved > SAVINGS_EPSILON ? (
          <p className="mt-0.5 font-grotesk text-[10px] text-mute/85">was {formatCigs(row.base)}</p>
        ) : (
          <p className="mt-0.5 font-grotesk text-[10px] text-mute/85">{row.tag.split(' · ')[0]}</p>
        )}
      </div>
    </motion.div>
  );
}
