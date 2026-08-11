-- ============================================================
-- Travel Logger — Supabase Schema
-- Run this in your Supabase project's SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Trips table ──────────────────────────────────────────────
create table if not exists public.trips (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  country       text not null,
  city          text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  start_date    date not null,
  end_date      date not null,
  rating        smallint not null check (rating between 1 and 5),
  cover_image_url text,
  notes         text,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_updated_at
  before update on public.trips
  for each row execute procedure public.handle_updated_at();

-- ── Trip Photos table ─────────────────────────────────────────
create table if not exists public.trip_photos (
  id         uuid primary key default uuid_generate_v4(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  url        text not null,
  caption    text,
  created_at timestamptz not null default now()
);

-- ── Storage bucket ────────────────────────────────────────────
-- Create a 'trip-photos' bucket in Supabase Storage (Dashboard > Storage)
-- Then run these policies:

-- ── Row Level Security ────────────────────────────────────────
alter table public.trips enable row level security;
alter table public.trip_photos enable row level security;

-- Trips: users can only see/edit their own trips
create policy "Users can view own trips"
  on public.trips for select using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete using (auth.uid() = user_id);

-- Trip photos: same pattern
create policy "Users can view own photos"
  on public.trip_photos for select using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on public.trip_photos for insert with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.trip_photos for delete using (auth.uid() = user_id);

-- Storage policies (run after creating 'trip-photos' bucket)
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'trip-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own photos"
  on storage.objects for select
  using (bucket_id = 'trip-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'trip-photos' and auth.uid()::text = (storage.foldername(name))[1]);


-- ── Add stops column for multi-city support ───────────────────
-- Run this if you already ran the original schema above
alter table public.trips
  add column if not exists stops jsonb not null default '[]'::jsonb;


-- ── Planned Trips table ───────────────────────────────────────
create table if not exists public.planned_trips (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  destination   text not null default '',
  country       text not null default '',
  start_date    date,
  end_date      date,
  status        text not null default 'planning' check (status in ('planning', 'completed')),
  cover_emoji   text not null default '✈️',
  notes         text not null default '',
  itinerary     jsonb not null default '[]'::jsonb,
  places        jsonb not null default '[]'::jsonb,
  budget        jsonb not null default '[]'::jsonb,
  packing       jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger planned_trips_updated_at
  before update on public.planned_trips
  for each row execute procedure public.handle_updated_at();

alter table public.planned_trips enable row level security;

create policy "Users can view own planned trips"
  on public.planned_trips for select using (auth.uid() = user_id);
create policy "Users can insert own planned trips"
  on public.planned_trips for insert with check (auth.uid() = user_id);
create policy "Users can update own planned trips"
  on public.planned_trips for update using (auth.uid() = user_id);
create policy "Users can delete own planned trips"
  on public.planned_trips for delete using (auth.uid() = user_id);