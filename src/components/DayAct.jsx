import AnimatedNumber from './AnimatedNumber';
import SectionHeading from './SectionHeading';
import AirPanel from './day/AirPanel';
import LedgerRow from './day/LedgerRow';
import { formatCigs, pmBand, SAVINGS_EPSILON } from '../lib/air';
import {
  CIGARETTE_PM25_UG_M3,
  DEFAULT_PM25_UG_M3,
  HOURS_PER_DAY,
  INFILTRATION_FACTOR,
} from '../constants/impact';

/**
 * Act 02 — the visitor's routine, priced row by row on the live reading.
 *
 * @param {{
 *   ledger: import('../lib/air').Ledger,
 *   pm25: number,
 *   place: string,
 *   coords: { lat: number, lon: number },
 *   demo: boolean,
 *   usAqi: number | null,
 * }} props
 */
export default function DayAct({ ledger, pm25, place, coords, demo, usAqi }) {
  const band = pmBand(pm25);

  return (
    <section id="day" className="relative py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            index="02"
            kicker="Your day"
            title="Five ordinary hours. One expensive day."
            lede={`Your routine, priced with the air you actually move through. Indoor rows use a ${INFILTRATION_FACTOR} infiltration factor — some of the outside stays outside.`}
          />
          <p className="max-w-[220px] font-grotesk text-[11px] leading-relaxed text-mute">
            {demo ? `Demo budget · ${DEFAULT_PM25_UG_M3} µg/m³` : `Live budget · ${pm25} µg/m³`}
            <br />
            <span className="text-ink/70">Values update with the hour.</span>
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          {/* location + context */}
          <div className="space-y-6">
            <AirPanel
              pm25={pm25}
              place={place}
              coords={coords}
              demo={demo}
              usAqi={usAqi}
              band={band}
            />

            <div className="border border-white/[0.07] p-5">
              <p className="font-grotesk text-[11px] uppercase tracking-[0.18em] text-ink/70">
                How the price is set
              </p>
              <div className="mt-3 space-y-2 font-grotesk text-[11px] leading-relaxed text-mute">
                <p>
                  <span className="text-ink/80">price</span> = (PM2.5 × rate × hours) ÷ (
                  {CIGARETTE_PM25_UG_M3} × {INFILTRATION_FACTOR} × {HOURS_PER_DAY})
                </p>
                <p>
                  <span className="text-ink/80">rate</span> = m³ of air you move per hour.
                </p>
                <p>
                  <span className="text-ink/80">{INFILTRATION_FACTOR}</span> = indoor infiltration;{' '}
                  {CIGARETTE_PM25_UG_M3} µg/m³/day = 1 🚬.
                </p>
              </div>
              <p className="mt-4 border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-mute/85">
                No account, no tracking. Your location is used once to fetch air quality and never
                stored.
              </p>
            </div>
          </div>

          {/* ledger */}
          <div className="panel flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
              <div>
                <p className="micro">The ledger</p>
                <p className="mt-1 font-grotesk text-[11px] text-ink/70">
                  Five daily activities · per person
                </p>
              </div>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                🚬 / day
              </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {ledger.rows.map((row, index) => (
                <LedgerRow key={row.key} row={row} index={index} />
              ))}
            </div>

            <div className="mt-auto border-t border-white/10 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="micro">Net today</p>
                  <p className="mt-1.5 flex items-baseline gap-2">
                    <AnimatedNumber
                      value={ledger.net}
                      decimals={1}
                      className="font-display text-[clamp(2.4rem,4vw,3.2rem)] leading-none tracking-[-0.02em] text-ink"
                    />
                    <span className="text-xl">🚬</span>
                    {ledger.savings > SAVINGS_EPSILON ? (
                      <span className="font-grotesk text-[11px] text-mute/85 line-through">
                        {formatCigs(ledger.budget)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <a href="#swaps" className="btn-ghost">
                  Swap something
                  <span aria-hidden="true">↘</span>
                </a>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-mute/85">
                The five activities above carry{' '}
                <span className="text-ink/70">{formatCigs(ledger.nowTotal)} 🚬</span> of it. The
                other {formatCigs(ledger.background)} is background air — the commute home, the
                school run, the spaces between.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
