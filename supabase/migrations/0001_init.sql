-- Run this in the Supabase SQL editor (or via supabase migration up).

create table if not exists donors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists settings (
  id int primary key default 1,
  total_raised numeric default 0,
  goal numeric default 100000,
  constraint single_row check (id = 1)
);

insert into settings (id) values (1)
  on conflict (id) do nothing;

-- Enable RLS
alter table donors enable row level security;
alter table settings enable row level security;

-- Public can read donors
drop policy if exists "donors_select_anon" on donors;
create policy "donors_select_anon"
  on donors for select
  using (true);

-- Public can read settings
drop policy if exists "settings_select_anon" on settings;
create policy "settings_select_anon"
  on settings for select
  using (true);

-- No public insert/update/delete; service role bypasses RLS automatically.

-- Realtime
alter publication supabase_realtime add table donors;
alter publication supabase_realtime add table settings;
