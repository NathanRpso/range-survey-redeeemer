-- ─── Redemption Passes ─────────────────────────────────────────────────────
-- Run this once in Supabase SQL editor (Dashboard → SQL Editor → New query).

create table public.redemption_passes (
  id                       uuid        not null default gen_random_uuid() primary key,
  full_name                text        not null,
  contact_raw              text        not null,
  contact_normalized       text        not null,
  range_name               text        not null,
  survey_location_context  text,
  claim_code_used          text        not null,
  short_code               text        not null,
  status                   text        not null default 'valid',
  redeemed                 boolean     not null default false,
  created_at               timestamptz not null default now(),
  redeemed_at              timestamptz,
  expires_at               timestamptz not null,

  constraint redemption_passes_contact_normalized_key unique (contact_normalized),
  constraint redemption_passes_short_code_key         unique (short_code),
  constraint redemption_passes_status_check           check  (status in ('valid', 'redeemed', 'expired'))
);

-- Index for fast staff lookups by short code
create index redemption_passes_short_code_idx on public.redemption_passes (short_code);

-- ─── Row-Level Security ─────────────────────────────────────────────────────
-- RLS is ENABLED with no public policies.
--
-- Why enabled:  Defence in depth. If the Supabase anon key is ever obtained
--               (e.g. from browser DevTools of an unrelated Supabase project,
--               logs, etc.), direct PostgREST access to this table is blocked.
--
-- Why no policies: The app has no anon or authenticated role that needs direct
--               table access. All reads and writes go through Next.js server
--               actions, which use the service role key. The service role key
--               bypasses RLS entirely, so no policy is required for normal
--               operations.
--
-- When to add a policy: If you later add Supabase Auth for staff login, add a
--               SELECT / UPDATE policy scoped to authenticated staff users and
--               remove the service role key from the redeem action.

alter table public.redemption_passes enable row level security;
