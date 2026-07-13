-- Analytics table for the portfolio's /admin dashboard.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  referrer    text,
  country     text,        -- 2-letter ISO code from Vercel geo header
  city        text,
  device      text,        -- Mobile / Tablet / Desktop
  visitor_id  text,        -- anonymous first-party id, for unique-visitor counts
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);

-- Row Level Security: anyone (the public anon key) may INSERT a visit,
-- but only a logged-in admin session may READ the data back.
alter table public.page_views enable row level security;

create policy "anon can insert views"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "authenticated can read views"
  on public.page_views for select
  to authenticated
  using (true);
