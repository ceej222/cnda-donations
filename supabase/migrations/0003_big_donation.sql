-- Adds a flag for "big donation" donors so the display can highlight them.
alter table donors
  add column if not exists big_donation boolean not null default false;
