-- BuildIt community schema for Supabase
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Matches the columns used by src/services/communityService.js.

-- 1. Creations table (the "Creations" tab — shared photo posts)
create table if not exists public.community_posts (
  id            uuid primary key default gen_random_uuid(),
  student_name  text,
  project_title text,
  category      text,
  caption       text,
  photo_url     text,
  project_data  jsonb,
  likes         integer not null default 0,
  approved      boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

-- 2. Row Level Security
-- This app authenticates with the public anon key (no user login), so the
-- policies below intentionally allow anonymous read of approved posts,
-- anonymous insert of new posts, and anonymous like-count updates.
-- Tighten these later if you add moderation or auth.
alter table public.community_posts enable row level security;

create policy "anon can read approved posts"
  on public.community_posts for select
  using (approved = true);

create policy "anon can insert posts"
  on public.community_posts for insert
  with check (true);

create policy "anon can update posts (likes)"
  on public.community_posts for update
  using (true) with check (true);

-- 3. Public storage bucket for uploaded project photos
insert into storage.buckets (id, name, public)
values ('community-photos', 'community-photos', true)
on conflict (id) do nothing;

create policy "anon can read community photos"
  on storage.objects for select
  using (bucket_id = 'community-photos');

create policy "anon can upload community photos"
  on storage.objects for insert
  with check (bucket_id = 'community-photos');
