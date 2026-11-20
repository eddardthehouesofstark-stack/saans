# SAANS — Your Daily Lung Budget

An immersive, parallax-scrolling essay that prices a day of air pollution in cigarettes, then lets you buy part of it back with swaps and indoor fixes. Built for PromptWars.

You didn't light anything. It's the air.

## What it does

- **Live exposure** — PM2.5 for your coordinates from Open-Meteo, with a New Delhi demo fallback and a visible "demo data" badge.
- **The math, on screen** — `cigarettes/day = PM2.5 ÷ 22` (Berkeley Earth: 22 µg/m³ of PM2.5 over 24 h ≈ one cigarette), visualised against the last 24 hours.
- **Your day, priced** — five everyday activities priced with `(PM2.5 × breathing rate × hours) ÷ (22 × 0.6 × 24)`; indoor rows use a 0.6 infiltration factor.
- **Swap engine** — four swaps, each with its own rate and exposure factor. Savings are computed against the unprotected row, so a swap and an indoor hack never double-count.
- **Indoor hacks + family mode** — four interventions that reprice affected rows, and a family table where children 4–12 are dosed at 1.8×.
- **Community** — 24 seeded households plus yours, against a 200-cigarette weekly block goal; optionally persisted in Supabase.
- **Ask Saans** — an optional Gemini co-pilot that proposes actions as JSON cards. The model never computes the budget; the ledger does.

## Stack

React 18 · Vite 5 · JavaScript (no TypeScript) · Tailwind CSS · Recharts · react-leaflet / OpenStreetMap · Supabase (optional) · framer-motion. Static build, no server, no auth.

## Run it

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # dist/
npm run test     # Vitest
npm run lint     # ESLint
```

No environment variables are required. The app runs on live data if geolocation is granted, otherwise on the demo series.

## Configuration

| What | Where | Behaviour when unset |
| --- | --- | --- |
| Supabase URL + anon key | `src/supabaseConfig.js` | Community runs on seeded local data, badge reads "demo data" |
| Gemini API key | Pasted in the Ask Saans panel | Example plan is shown; nothing breaks |

For Supabase, run `supabase/schema.sql` first. Its policies are deliberately demo-permissive (anonymous insert/read, 24-hour delete window, constrained values) because there is no auth; do not reuse them for private data.

The Gemini key is kept in `sessionStorage` for the current tab, sent only to Google's endpoint as an `x-goog-api-key` header (never a query string), and can be forgotten with one click. Nothing else leaves the browser.

## Structure

```
src/
  lib/
    air.js          exposure math, activities, swaps, hacks, live data — the single source of numbers
    gemini.js       prompt, context, response parsing, transport
    supabase.js     lazy client, validated writes, weekly total
    community.js    deterministic neighbour seed data
    reveal.js       shared viewport-reveal props
  components/
    Hero, MathAct, DayAct, SwapAct, HacksAct, CommunityAct, CloseAct
    Chat + chat/PlanCard
    Skyline, Atmosphere, Particulates, Grain, Nav, SectionHeading, AnimatedNumber
    charts/PmChart, map/LocationMap   (both lazy-loaded)
  test/setup.js     jsdom shims
supabase/schema.sql
```

Every displayed number derives from `computeLedger()` in `lib/air.js`; components only format and lay it out.

## Accessibility

- Skip link, landmark structure, `aria-label`ed controls, real table semantics for the family grid.
- The dialog traps Tab, restores focus on close, closes on Escape, and announces new answers through a polite live region.
- Animated counters expose their final value to assistive technology instead of the in-flight digits.
- `prefers-reduced-motion` disables the count-ups, particles, parallax and pin pulse.
- Text contrast was raised across the muted palette; focus rings are visible on every interactive element.

## Security notes

- Production builds ship a Content-Security-Policy (injected by `vite.config.js`, so it never blocks the dev server) plus a strict referrer policy.
- The only client secrets are user-supplied and session-scoped; the Supabase anon key is safe to ship because RLS is enabled and writes are constrained.
- The map marker colour is whitelisted before it is interpolated into Leaflet's HTML icon.

## Verification

```bash
npm run test   # 35+ unit tests: pricing, hacks, parsing, transport, session ids, seed data
npm run lint   # ESLint flat config, React + hooks rules
npm run build  # production bundle, CSP injected
```

## Deploy

`npm run build` produces a static `dist/`. Host it anywhere that serves files — Cloudflare Pages, Netlify, Vercel, GitHub Pages — with no server and no build-time secrets.
