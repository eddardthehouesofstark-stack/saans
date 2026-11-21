import { AnimatePresence, motion } from 'framer-motion';
import { formatCigs } from '../../lib/air';
import { reveal } from '../../lib/reveal';

/**
 * One swap card: the offer, its price, and the flying "+/− cigarettes" badge.
 *
 * @param {{
 *   row: import('../../lib/air').LedgerRow,
 *   index: number,
 *   fly: { id: number, delta: number } | null,
 *   onSwap: (key: string) => void,
 * }} props
 */
export default function SwapCard({ row, index, fly, onSwap }) {
  return (
    <motion.div
      {...reveal(index * 0.08, { y: 22 })}
      className={`relative flex flex-col border p-5 transition-colors duration-300 ${
        row.swapped
          ? 'border-green/40 bg-green/[0.045]'
          : 'border-white/[0.08] bg-[#11141b]/85 hover:border-white/20'
      }`}
    >
      <AnimatePresence>
        {fly ? (
          <motion.span
            key={fly.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -44 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-none absolute right-4 top-3 z-10 font-grotesk text-sm font-medium ${
              fly.delta >= 0 ? 'text-green' : 'text-ink/80'
            }`}
          >
            {fly.delta >= 0 ? '−' : '+'}
            {formatCigs(Math.abs(fly.delta))} 🚬 {fly.delta >= 0 ? 'saved' : 'back'}
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

      <h3 className="mt-4 font-grotesk text-[17px] leading-snug text-ink">{row.swap.title}</h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-ink/70">{row.swap.detail}</p>

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
          <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">saves</p>
          <p
            className={`mt-1 font-grotesk text-lg tabular-nums ${
              row.swapped ? 'text-green' : 'text-ink'
            }`}
          >
            {formatCigs(row.swapSaving)} <span className="text-xs text-mute">🚬</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSwap(row.key)}
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
}
