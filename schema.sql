-- Archemyst Lab whitelist entries. Run once against the Supabase project.
create table if not exists public.entries (
  id          bigserial primary key,
  address     text        not null,
  proof       text        not null,
  ip_hash     text        not null,
  created_at  timestamptz not null default now(),
  constraint entries_address_fmt check (address ~ '^0x[0-9a-f]{40}$'),
  constraint entries_proof_fmt   check (proof ~* '^https://(x|twitter)\.com/[^/]+/status/[0-9]+')
);

-- One entry per wallet, one entry per proof link. Spam is rejected by the DB, not by app code.
create unique index if not exists entries_address_key on public.entries (address);
create unique index if not exists entries_proof_key   on public.entries (proof);
-- Supports the per-IP window count.
create index if not exists entries_ip_recent on public.entries (ip_hash, created_at desc);

-- Writes go through the service_role key in the serverless function only.
alter table public.entries enable row level security;

-- PostgREST connects as service_role/anon; owner-created tables need explicit grants.
grant all on public.entries to service_role;
grant usage, select on sequence public.entries_id_seq to service_role;
