import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import AnimatedNumber from './AnimatedNumber';
import SectionHeading from './SectionHeading';
import { reveal } from '../lib/reveal';
import { formatCigs, pmBand, SAVINGS_EPSILON } from '../lib/air';

const LocationMap = lazy(() => import('./map/LocationMap'));

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
            lede="Your routine, priced with the air you actually move through. Indoor rows use a 0.6 infiltration factor — some of the outside stays outside."
          />
          <p className="max-w-[220px] font-grotesk text-[11px] leading-relaxed text-mute">
            {demo ? 'Demo budget · 285 µg/m³' : `Live budget · ${pm25} µg/m³`}
            <br />
            <span className="text-ink/70">Values update with the hour.</span>
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          {/* location + context */}
          <div className="space-y-6">
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: band.color, boxShadow: `0 0 12px ${band.color}` }}
                  />
                  <span className="font-grotesk text-[11px] uppercase tracking-[0.16em] text-ink/80">
                    {place}
                  </span>
                </div>
                {demo ? (
                  <span className="border border-amber/40 px-1.5 py-0.5 font-grotesk text-[10px] uppercase tracking-[0.2em] text-amber">
                    demo
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-grotesk text-[10px] uppercase tracking-[0.2em] text-green">
                    <span className="h-1 w-1 rounded-full bg-green" /> live
                  </span>
                )}
              </div>

              <div className="relative">
                <Suspense fallback={<div className="h-[200px] w-full animate-pulse bg-white/[0.03]" />}>
                  <LocationMap
                    key={`${coords.lat},${coords.lon}`}
                    lat={coords.lat}
                    lon={coords.lon}
                    color={band.color}
                  />
                </Suspense>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0d0f14] to-transparent" />
              </div>

              <dl className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07]">
                <div className="px-4 py-4">
                  <dt className="micro text-[10px]">PM2.5</dt>
                  <dd className="mt-1.5 font-grotesk text-xl text-ink">{pm25}</dd>
                </div>
                <div className="px-4 py-4">
                  <dt className="micro text-[10px]">Band</dt>
                  <dd className="mt-2 font-grotesk text-xs" style={{ color: band.color }}>
                    {band.label}
                  </dd>
                </div>
                <div className="px-4 py-4">
                  <dt className="micro text-[10px]">{usAqi ? 'US AQI' : 'Coords'}</dt>
                  <dd className="mt-1.5 font-grotesk text-xs text-ink/70">
                    {usAqi ?? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-white/[0.07] p-5">
              <p className="font-grotesk text-[11px] uppercase tracking-[0.18em] text-ink/70">
                How the price is set
              </p>
              <div className="mt-3 space-y-2 font-grotesk text-[11px] leading-relaxed text-mute">
                <p>
                  <span className="text-ink/80">price</span> = (PM2.5 × rate × hours) ÷ (22 × 0.6 × 24)
                </p>
                <p>
                  <span className="text-ink/80">rate</span> = m³ of air you move per hour.
                </p>
                <p>
                  <span className="text-ink/80">0.6</span> = indoor infiltration; 22 µg/m³/day = 1 🚬.
                </p>
              </div>
              <p className="mt-4 border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-mute/85">
                No account, no tracking. Your location is used once to fetch air quality and never stored.
              </p>
            </div>
          </div>

          {/* ledger */}
          <div className="panel flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
              <div>
                <p className="micro">The ledger</p>
                <p className="mt-1 font-grotesk text-[11px] text-ink/70">Five daily activities · per person</p>
              </div>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">🚬 / day</span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {ledger.rows.map((row, index) => (
                <motion.div
                  key={row.key}
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
                      className={`font-grotesk text-xl tabular-nums ${
                        row.swapped ? 'text-green' : 'text-ink'
                      }`}
                    >
                      {formatCigs(row.now)}
                      <span className="ml-1 text-[11px] text-mute">🚬</span>
                    </p>
                    {row.saved > SAVINGS_EPSILON ? (
                      <p className="mt-0.5 font-grotesk text-[10px] text-mute/85">
                        was {formatCigs(row.base)}
                      </p>
                    ) : (
                      <p className="mt-0.5 font-grotesk text-[10px] text-mute/85">{row.tag.split(' · ')[0]}</p>
                    )}
                  </div>
                </motion.div>
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
                <span className="text-ink/70">{formatCigs(ledger.nowTotal)} 🚬</span> of it. The other{' '}
                {formatCigs(ledger.background)} is background air — the commute home, the school run, the
                spaces between.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
