-- Adds (or creates) a tiny settings table with a flag the admin toggles to
-- show the goal-reached celebration overlay on the public telecast page.

create table if not exists settings (
  id int primary key default 1,
  celebration_active boolean not null default false,
  constraint single_row check (id = 1)
);

-- If the table existed already without the flag, add it now.
alter table settings
  add column if not exists celebration_active boolean not null default false;

-- Ensure the single row exists.
insert into settings (id) values (1)
  on conflict (id) do nothing;

-- Public read access (the display page reads this with the anon key).
alter table settings enable row level security;

drop policy if exists "settings_select_anon" on settings;
create policy "settings_select_anon"
  on settings for select
  using (true);

-- Make sure realtime is publishing this table so toggling the flag pushes
-- to the display in real time.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'settings'
  ) then
    execute 'alter publication supabase_realtime add table settings';
  end if;
end$$;
