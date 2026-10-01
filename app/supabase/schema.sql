-- Wavelength schema. Paste into the Supabase SQL editor once per project.
--
-- Prototype security: anyone with the anon key can read and write sessions they know the
-- code for. That's fine for classroom testing; milestone 3 adds sign-in and tightens these
-- policies so only the facilitator can regroup.

create table if not exists public.sessions (
  code text primary key check (code ~ '^[A-Z0-9]{3,10}$'),
  title text not null default '',
  group_count int not null default 1 check (group_count between 1 and 10),
  status text not null default 'lobby' check (status in ('lobby', 'grouped')),
  grouped_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key,
  session_code text not null references public.sessions (code) on delete cascade,
  name text not null check (length(name) between 1 and 60),
  group_index int check (group_index between 0 and 9),
  joined_at timestamptz not null default now()
);

create index if not exists participants_session_code_idx on public.participants (session_code);

alter table public.sessions enable row level security;
alter table public.participants enable row level security;

drop policy if exists "prototype anon access" on public.sessions;
create policy "prototype anon access" on public.sessions for all to anon using (true) with check (true);

drop policy if exists "prototype anon access" on public.participants;
create policy "prototype anon access" on public.participants for all to anon using (true) with check (true);

-- Regrouping a whole class in one call, so phones never see a half-applied shuffle.
create or replace function public.set_groups(p_code text, p_groups jsonb)
returns void
language sql
as $$
  update public.participants p
     set group_index = (p_groups ->> p.id::text)::int
   where p.session_code = p_code
     and p_groups ? p.id::text;
$$;

grant execute on function public.set_groups(text, jsonb) to anon;

-- Realtime change feeds for live updates.
do $$
begin
  alter publication supabase_realtime add table public.sessions;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.participants;
exception when duplicate_object then null;
end $$;
