import { formatCigs } from '../../lib/air';

/**
 * The co-pilot's opening card: it restates the ledger the user is looking at,
 * so the chat never disagrees with the page behind it.
 *
 * @param {{ place: string, pm25: number, budget: number }} props
 */
export default function ChatIntro({ place, pm25, budget }) {
  return (
    <div className="border border-white/[0.08] bg-white/[0.015] p-4">
      <p className="micro text-[10px] text-amber">Saans</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink/85">
        I read the same ledger you do — same PM2.5, same maths. Tell me what your day looks like and
        I’ll find the cheapest air in it.
      </p>
      <p className="mt-2 font-grotesk text-[11px] text-ink/70">
        {place} · {pm25} µg/m³ · {formatCigs(budget)} 🚬 today
      </p>
    </div>
  );
}
