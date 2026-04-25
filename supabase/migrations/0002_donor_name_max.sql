-- Cap donor name length at 200 characters at the database level so the
-- constraint is enforced even if a client bypasses the API check.
alter table donors
  add constraint donors_name_max_200 check (char_length(name) <= 200)
  not valid;

-- Validate against existing rows. If any row exceeds 200 chars, this will
-- fail and you'll need to fix that row before re-running.
alter table donors validate constraint donors_name_max_200;
