-- BuildIt community schema for Supabase
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: it drops and recreates the policies each time.
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
-- This app talks to Supabase with the public anon key (no user login), so the
-- policies below intentionally allow the anon role to read approved posts,
-- insert new posts, and update like counts.
-- Tighten these later if you add moderation or auth.
alter table public.community_posts enable row level security;

drop policy if exists "anon can read approved posts"  on public.community_posts;
drop policy if exists "anon can insert posts"          on public.community_posts;
drop policy if exists "anon can update posts (likes)"  on public.community_posts;

create policy "anon can read approved posts"
  on public.community_posts for select
  to anon, authenticated
  using (approved = true);

create policy "anon can insert posts"
  on public.community_posts for insert
  to anon, authenticated
  with check (true);

create policy "anon can update posts (likes)"
  on public.community_posts for update
  to anon, authenticated
  using (true) with check (true);

-- 3. Public storage bucket for uploaded project photos
insert into storage.buckets (id, name, public)
values ('community-photos', 'community-photos', true)
on conflict (id) do nothing;

drop policy if exists "anon can read community photos"   on storage.objects;
drop policy if exists "anon can upload community photos"  on storage.objects;

create policy "anon can read community photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'community-photos');

create policy "anon can upload community photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'community-photos');
