import AnimatedNumber from './AnimatedNumber';
import { formatCigs } from '../lib/air';

export default function CloseAct({ ledger }) {
  return (
    <section
      id="close"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60% 70% at 50% 100%, rgba(232,163,61,0.16), rgba(232,163,61,0) 70%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-6 md:px-10">
        <div className="flex items-center gap-4">
          <span className="font-grotesk text-[10px] uppercase tracking-[0.28em] text-amber">06</span>
          <span className="h-px w-8 bg-white/20" />
          <span className="micro">The close</span>
        </div>

        <h2 className="mt-8 font-display text-[clamp(5rem,19vw,17rem)] leading-[0.78] tracking-[-0.05em] text-ink">
          Saans.
        </h2>

        <div className="mt-10 grid gap-10 border-t border-white/10 pt-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <p className="max-w-xl font-display text-[clamp(1.7rem,3.6vw,3rem)] leading-[1.05] tracking-[-0.02em]">
            Stop watching the AQI.
            <br />
            <span className="text-ink/45">Start spending it.</span>
          </p>

          <div className="flex flex-wrap items-end gap-8 md:justify-end">
            <div>
              <p className="micro">This morning</p>
              <p className="mt-2 font-display text-3xl text-ink/45 tabular-nums">
                {formatCigs(ledger.budget)}
              </p>
            </div>
            <span className="mb-2 text-xl text-mute" aria-hidden="true">
              →
            </span>
            <div>
              <p className="micro">Your day now</p>
              <p className="mt-2 font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-amber tabular-nums">
                <AnimatedNumber value={ledger.net} decimals={1} />
              </p>
              <p className="mt-1 font-grotesk text-[9px] uppercase tracking-[0.18em] text-green">
                {ledger.savings > 0.05 ? `${formatCigs(ledger.savings)} 🚬 bought back` : 'no swaps yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative mx-auto mt-16 w-full max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-sm tracking-[0.32em]">SAANS</span>
            <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
              Your daily lung budget
            </span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 font-grotesk text-[10px] uppercase tracking-[0.14em] text-mute/70">
            <span>Built at PromptWars</span>
            <span>Air · Open-Meteo</span>
            <span>Equivalence · Berkeley Earth 22 µg/m³</span>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[10px] leading-relaxed text-mute/40">
          SAANS is an awareness tool, not a medical device. Cigarette-equivalence is a communication
          device, not a diagnosis. If the air is bad, reduce exposure — and push for cleaner air.
        </p>
      </footer>
    </section>
  );
}
