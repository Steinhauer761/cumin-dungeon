-- Migration 002: Taxonomy system for discovery, categories, tags
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This adds to the existing schema without breaking anything.

-- Tags table (flexible labeling system)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  group_name text, -- optional grouping: 'category', 'attribute', 'language', 'kink'
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Creator tags (many-to-many)
create table if not exists creator_tags (
  performer_id uuid not null references performer_profiles(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (performer_id, tag_id)
);

-- Room tags (many-to-many)
create table if not exists room_tags (
  room_id uuid not null references rooms(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (room_id, tag_id)
);

-- Token balances (persistent per user, replaces localStorage)
create table if not exists token_balances (
  user_id uuid primary key references users(id) on delete cascade,
  balance bigint not null default 1000000 check (balance >= 0),
  lifetime_earned bigint not null default 1000000,
  lifetime_spent bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Token transactions log
create table if not exists token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount bigint not null, -- positive = credit, negative = debit
  type text not null check (type in ('purchase','game_bet','game_win','tip_sent','tip_received','gift_sent','gift_received','admin_grant','refund')),
  reference_id text, -- game name, room id, etc
  created_at timestamptz not null default now()
);

-- Add thumbnail and preview fields to rooms
alter table rooms add column if not exists thumbnail_url text;
alter table rooms add column if not exists preview_video_url text;
alter table rooms add column if not exists max_viewers integer default 500;

-- Add fields to performer_profiles
alter table performer_profiles add column if not exists avatar_url text;
alter table performer_profiles add column if not exists country text;
alter table performer_profiles add column if not exists languages text[] default '{}';
alter table performer_profiles add column if not exists is_verified boolean default false;
alter table performer_profiles add column if not exists is_featured boolean default false;
alter table performer_profiles add column if not exists vip_rate integer; -- tokens per minute for private
alter table performer_profiles add column if not exists follower_count integer default 0;

-- Indexes
create index if not exists idx_tags_group on tags(group_name, sort_order);
create index if not exists idx_tags_active on tags(active, sort_order);
create index if not exists idx_creator_tags_tag on creator_tags(tag_id);
create index if not exists idx_room_tags_tag on room_tags(tag_id);
create index if not exists idx_token_transactions_user on token_transactions(user_id, created_at desc);
create index if not exists idx_token_balances_balance on token_balances(balance desc);

-- =====================================================
-- SEED DATA: Categories and Tags
-- =====================================================

-- Primary categories (venue_categories table already exists)
insert into venue_categories (id, slug, name, short_label, icon_key, sort_order, active) values
  (gen_random_uuid(), 'women', 'Women', 'Women', 'venus', 1, true),
  (gen_random_uuid(), 'men', 'Men', 'Men', 'mars', 2, true),
  (gen_random_uuid(), 'couples', 'Couples', 'Couples', 'rings', 3, true),
  (gen_random_uuid(), 'trans', 'Trans', 'Trans', 'rainbow', 4, true),
  (gen_random_uuid(), 'groups', 'Groups', 'Groups', 'users', 5, true),
  (gen_random_uuid(), 'lgbtq', 'LGBTQ+', 'LGBTQ+', 'pride', 6, true),
  (gen_random_uuid(), 'solo', 'Solo', 'Solo', 'star', 7, true),
  (gen_random_uuid(), 'fetish', 'Fetish', 'Fetish', 'chains', 8, true),
  (gen_random_uuid(), 'vip', 'VIP', 'VIP', 'crown', 9, true)
on conflict (slug) do nothing;

-- Tags (flexible attributes)
insert into tags (id, slug, name, group_name, sort_order, active) values
  -- Status tags
  (gen_random_uuid(), 'verified', 'Verified', 'status', 1, true),
  (gen_random_uuid(), 'featured', 'Featured', 'status', 2, true),
  (gen_random_uuid(), 'new', 'New', 'status', 3, true),
  (gen_random_uuid(), 'popular', 'Popular', 'status', 4, true),
  (gen_random_uuid(), 'vip-creator', 'VIP Creator', 'status', 5, true),
  -- Availability tags
  (gen_random_uuid(), 'online', 'Online Now', 'availability', 1, true),
  (gen_random_uuid(), 'private-available', 'Private Available', 'availability', 2, true),
  (gen_random_uuid(), 'free-chat', 'Free Chat', 'availability', 3, true),
  -- Content tags
  (gen_random_uuid(), 'bdsm', 'BDSM', 'content', 1, true),
  (gen_random_uuid(), 'roleplay', 'Roleplay', 'content', 2, true),
  (gen_random_uuid(), 'domination', 'Domination', 'content', 3, true),
  (gen_random_uuid(), 'submission', 'Submission', 'content', 4, true),
  (gen_random_uuid(), 'toys', 'Toys', 'content', 5, true),
  (gen_random_uuid(), 'lovense', 'Lovense', 'content', 6, true),
  (gen_random_uuid(), 'feet', 'Feet', 'content', 7, true),
  (gen_random_uuid(), 'leather', 'Leather', 'content', 8, true),
  (gen_random_uuid(), 'lingerie', 'Lingerie', 'content', 9, true),
  (gen_random_uuid(), 'cosplay', 'Cosplay', 'content', 10, true),
  -- Language tags
  (gen_random_uuid(), 'english', 'English', 'language', 1, true),
  (gen_random_uuid(), 'french', 'French', 'language', 2, true),
  (gen_random_uuid(), 'spanish', 'Spanish', 'language', 3, true),
  (gen_random_uuid(), 'german', 'German', 'language', 4, true),
  -- Body type tags
  (gen_random_uuid(), 'petite', 'Petite', 'body', 1, true),
  (gen_random_uuid(), 'curvy', 'Curvy', 'body', 2, true),
  (gen_random_uuid(), 'athletic', 'Athletic', 'body', 3, true),
  (gen_random_uuid(), 'bbw', 'BBW', 'body', 4, true),
  (gen_random_uuid(), 'muscular', 'Muscular', 'body', 5, true)
on conflict (slug) do nothing;

-- Seed the rooms that already exist in the mock data
insert into rooms (id, name, description, visibility, status, thumbnail_url) values
  (gen_random_uuid(), 'Velvet Room', 'Women performers live. Intimate, warm.', 'members', 'live', '/public/assets/art/rooms/velvet-room.jpg'),
  (gen_random_uuid(), 'Tangled Throne', 'Couples only. Watch together, play together.', 'members', 'live', '/public/assets/art/rooms/tangled-throne.jpg'),
  (gen_random_uuid(), 'Pink Silk', 'Young performers 18-21. Fresh, bold.', 'members', 'live', '/public/assets/art/rooms/pink-silk.jpg'),
  (gen_random_uuid(), 'Devil''s Playground', 'Fetish and kink. Consensual, intense, unleashed.', 'members', 'open', '/public/assets/art/rooms/devils-playground.jpg'),
  (gen_random_uuid(), 'Back Room', 'Gay and bi. Dark, discreet, real.', 'public', 'live', '/public/assets/art/rooms/back-room.jpg'),
  (gen_random_uuid(), 'The Dungeon', 'Very Intimate Pleasure. Private 1-on-1.', 'private', 'live', '/public/assets/art/rooms/the-dungeon.jpg'),
  (gen_random_uuid(), 'Haley''s Halo', 'She looks innocent but she is not.', 'members', 'live', '/public/assets/art/rooms/haleys-halo.jpg'),
  (gen_random_uuid(), 'Trans Kinks', 'Trans performers. Bold, expressive, electric.', 'public', 'live', '/public/assets/art/rooms/trans-kinks.jpg')
on conflict do nothing;
