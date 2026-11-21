import { lazy, Suspense } from 'react';

const LocationMap = lazy(() => import('../map/LocationMap'));

/**
 * The location card: live/demo badge, map, and the three headline readings.
 *
 * @param {{
 *   pm25: number,
 *   place: string,
 *   coords: { lat: number, lon: number },
 *   demo: boolean,
 *   usAqi: number | null,
 *   band: { label: string, color: string },
 * }} props
 */
export default function AirPanel({ pm25, place, coords, demo, usAqi, band }) {
  return (
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
  );
}
