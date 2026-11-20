import { useEffect, useState } from 'react';

export default function Nav({ pm25, demo, onAsk }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'border-b border-white/[0.07] bg-base/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <a
          href="#top"
          className="font-display text-lg leading-none tracking-[0.32em] text-ink transition-colors hover:text-amber"
        >
          SAANS
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          <a href="#math" className="micro transition-colors hover:text-ink">
            The math
          </a>
          <a href="#day" className="micro transition-colors hover:text-ink">
            Your day
          </a>
          <a href="#swaps" className="micro transition-colors hover:text-ink">
            Swaps
          </a>
          <a href="#hacks" className="micro transition-colors hover:text-ink">
            Indoor
          </a>
          <a href="#block" className="micro transition-colors hover:text-ink">
            Block C
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 border border-white/10 px-3 py-1.5 sm:flex">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: pm25 > 60 ? '#f87171' : '#2dd4a7' }}
            />
            <span className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-ink/70">
              PM2.5 {pm25}
            </span>
            {demo ? <span className="micro text-[8px] text-amber">demo</span> : null}
          </span>
          <button type="button" onClick={onAsk} className="btn-solid px-4 py-2">
            Ask Saans
          </button>
        </div>
      </div>
    </header>
  );
}
