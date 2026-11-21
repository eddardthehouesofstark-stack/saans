import { useEffect, useMemo, useState } from 'react';
import Atmosphere from './components/Atmosphere';
import Chat from './components/Chat';
import CloseAct from './components/CloseAct';
import CommunityAct from './components/CommunityAct';
import DayAct from './components/DayAct';
import Grain from './components/Grain';
import HacksAct from './components/HacksAct';
import Hero from './components/Hero';
import MathAct from './components/MathAct';
import Nav from './components/Nav';
import SwapAct from './components/SwapAct';
import {
  CLEAR_SCALE,
  computeLedger,
  DEFAULT_LOCATION,
  DEFAULT_PM25,
  demoSeries,
  fetchLiveAir,
  locate,
} from './lib/air';
import { logSwap, removeSwap } from './lib/supabase';

export default function App() {
  const [air, setAir] = useState({
    pm25: DEFAULT_PM25,
    series: demoSeries(),
    demo: true,
    loading: true,
    place: DEFAULT_LOCATION.label,
    coords: { lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon },
    usAqi: null,
  });

  const [swaps, setSwaps] = useState({});
  const [hacks, setHacks] = useState({});
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const location = await locate();
      try {
        const live = await fetchLiveAir(location.lat, location.lon);
        if (!alive) return;
        setAir({
          pm25: live.pm25,
          series: live.series,
          demo: false,
          loading: false,
          place: location.label,
          coords: { lat: location.lat, lon: location.lon },
          usAqi: live.usAqi,
        });
      } catch {
        if (!alive) return;
        setAir({
          pm25: DEFAULT_PM25,
          series: demoSeries(),
          demo: true,
          loading: false,
          place: location.label,
          coords: { lat: location.lat, lon: location.lon },
          usAqi: null,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const ledger = useMemo(
    () => computeLedger(air.pm25, swaps, hacks),
    [air.pm25, swaps, hacks]
  );

  const toggleSwap = (key) => {
    const next = { ...swaps, [key]: !swaps[key] };
    const delta = computeLedger(air.pm25, next, hacks).savings - ledger.savings;

    if (next[key]) logSwap(key, delta);
    else removeSwap(key);

    setSwaps(next);
    return delta;
  };

  const toggleHack = (key) => {
    setHacks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearing = Math.min(1, ledger.savings / CLEAR_SCALE);
  const appliedSwaps = ledger.rows
    .filter((row) => row.swapped)
    .map((row) => `${row.name} → ${row.swap.short}`);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-amber focus:px-4 focus:py-2 focus:font-grotesk focus:text-[11px] focus:uppercase focus:tracking-[0.18em] focus:text-base"
      >
        Skip to content
      </a>
      <Atmosphere clearing={clearing} />
      <Grain />

      <Nav pm25={air.pm25} demo={air.demo} onAsk={() => setChatOpen(true)} />

      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero
          pm25={air.pm25}
          budget={ledger.budget}
          demo={air.demo}
          place={air.place}
          loading={air.loading}
        />

        <MathAct
          pm25={air.pm25}
          budget={ledger.budget}
          series={air.series}
          demo={air.demo}
          loading={air.loading}
        />

        <DayAct
          ledger={ledger}
          pm25={air.pm25}
          place={air.place}
          coords={air.coords}
          demo={air.demo}
          usAqi={air.usAqi}
        />

        <SwapAct ledger={ledger} onToggleSwap={toggleSwap} />

        <HacksAct
          pm25={air.pm25}
          swaps={swaps}
          hacks={hacks}
          ledger={ledger}
          onToggleHack={toggleHack}
        />

        <CommunityAct savings={ledger.savings} />

        <CloseAct ledger={ledger} />
      </main>

      <Chat
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        pm25={air.pm25}
        place={air.place}
        budget={ledger.budget}
        net={ledger.net}
        appliedSwaps={appliedSwaps}
      />
    </div>
  );
}
