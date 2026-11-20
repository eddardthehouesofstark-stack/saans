-- SAANS community persistence (Supabase free tier)
-- Run this in the SQL editor, then paste the project URL + anon key
-- into src/supabaseConfig.js.
--
-- NOTE: this demo has no authentication and deliberately permissive policies
-- so any visitor can add their swap savings and read the weekly total.
-- Never use policies like these for data that belongs to a real account.

create table if not exists public.swaps (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  swap_key text not null,
  cigarettes_saved numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists swaps_created_at_idx on public.swaps (created_at desc);

alter table public.swaps enable row level security;

drop policy if exists "demo swaps insert" on public.swaps;
create policy "demo swaps insert"
  on public.swaps for insert to anon with check (true);

drop policy if exists "demo swaps read" on public.swaps;
create policy "demo swaps read"
  on public.swaps for select to anon using (true);

drop policy if exists "demo swaps delete" on public.swaps;
create policy "demo swaps delete"
  on public.swaps for delete to anon using (true);

-- Optional: a weekly aggregate view the client could read instead of summing rows.
create or replace view public.community_totals as
select
  date_trunc('week', created_at) as week,
  sum(cigarettes_saved) as cigarettes_saved
from public.swaps
group by 1;
