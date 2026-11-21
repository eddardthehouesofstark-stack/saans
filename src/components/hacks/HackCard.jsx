import { motion } from 'framer-motion';
import { formatCigs } from '../../lib/air';
import { reveal } from '../../lib/reveal';

/**
 * One indoor fix: the claim, the citation, and the repricing it buys.
 * @param {{
 *   hack: import('../../lib/air').Hack,
 *   index: number,
 *   applied: boolean,
 *   gain: number,
 *   onToggle: (key: string) => void,
 * }} props
 */
export default function HackCard({ hack, index, applied, gain, onToggle }) {
  return (
    <motion.div
      {...reveal(index * 0.06)}
      className={`border p-5 transition-colors duration-300 ${
        applied ? 'border-green/35 bg-green/[0.04]' : 'border-white/[0.08] bg-[#11141b]/85'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="font-grotesk text-[10px] tracking-[0.2em] text-mute">{hack.index}</span>
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
          <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">saves</p>
          <p className="mt-1 font-grotesk text-sm tabular-nums text-green">
            {formatCigs(gain)} 🚬 / day
          </p>
          <p className="mt-1 font-grotesk text-[10px] leading-relaxed text-mute/85">
            {hack.source}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(hack.key)}
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
}
