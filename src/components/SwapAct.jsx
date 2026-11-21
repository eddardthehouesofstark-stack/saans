import { useEffect, useRef, useState } from 'react';
import SectionHeading from './SectionHeading';
import SwapCard from './swap/SwapCard';
import SwapReceipt from './swap/SwapReceipt';
import { BREATHING_RATE_INDOOR } from '../constants/impact';

/**
 * Act 03 — the swap cards and the live receipt that reprices on every toggle.
 *
 * @param {{
 *   ledger: import('../lib/air').Ledger,
 *   onToggleSwap: (key: string) => number,
 * }} props
 */
export default function SwapAct({ ledger, onToggleSwap }) {
  const [fly, setFly] = useState(null);
  const flyTimer = useRef(null);
  const flyId = useRef(0);

  useEffect(() => () => clearTimeout(flyTimer.current), []);

  function handleSwap(key) {
    const delta = onToggleSwap(key);
    setFly({ key, delta, id: (flyId.current += 1) });
    clearTimeout(flyTimer.current);
    flyTimer.current = setTimeout(() => setFly(null), 1200);
  }

  return (
    <section id="swaps" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <SectionHeading
          index="03"
          kicker="The swap engine"
          title="Same day. Cheaper air."
          lede="Every swap is priced on the client, with the same formula that priced the ledger. Tap to apply — tap again to undo. The number at the bottom is the only number that matters."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {ledger.rows
              .filter((row) => row.swap)
              .map((row, index) => (
                <SwapCard
                  key={row.key}
                  row={row}
                  index={index}
                  fly={fly && fly.key === row.key ? fly : null}
                  onSwap={handleSwap}
                />
              ))}

            <div className="border border-white/[0.06] p-5 sm:col-span-2">
              <p className="flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-mute">
                <span aria-hidden="true">💻</span> Work from home · already protected
              </p>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-ink/70">
                Your nine indoor hours are the cheapest block in the day — {BREATHING_RATE_INDOOR}{' '}
                m³/h behind closed windows. The Corsi–Rosenthal box in act 04 makes them cheaper
                still.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <SwapReceipt ledger={ledger} />
          </div>
        </div>
      </div>
    </section>
  );
}
