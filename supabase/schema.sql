-- Run this once in your Supabase project's SQL editor.
-- Two small tables: one generic progress store for every checkbox/note in
-- the app, and one for the daily practice log.

create table if not exists progress (
  item_id text primary key,
  done boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists daily_logs (
  log_date date primary key,
  coding_minutes integer not null default 0,
  debugging_minutes integer not null default 0,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists email_schedules (
  id text primary key,
  time text not null,
  subject text not null default 'Your daily Switch reminder',
  body text not null default 'Make one small step on your next task today.',
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Row Level Security: this is a single-user personal tracker, gated by the
-- passphrase screen in the app itself rather than per-row Supabase auth.
-- The policies below let the anon key (the one in your .env) read and write
-- freely. If you'd rather layer in real Supabase Auth later, replace these
-- with policies scoped to auth.uid().
alter table progress enable row level security;
alter table daily_logs enable row level security;

create policy "anon full access" on progress
  for all using (true) with check (true);

create policy "anon full access" on daily_logs
  for all using (true) with check (true);

alter table email_schedules enable row level security;
