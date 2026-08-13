# Supabase Database Setup

## Your env vars are set. Now run the schema.

1. Go to https://supabase.com/dashboard
2. Open your `cumin-dungeon` project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `backend/schema.sql` from the repo
6. Paste it into the SQL editor
7. Click **Run**

This creates all the tables: users, rooms, sessions, memberships, transactions, messages, moderation, etc.

## After running the schema:

Seed some initial data by running this:

```sql
-- Seed venue categories
INSERT INTO venue_categories (id, slug, name, short_label, icon_key, sort_order) VALUES
  (gen_random_uuid(), 'women', 'Women', 'Live rooms', 'feminine-crest', 10),
  (gen_random_uuid(), 'men', 'Men', 'Live rooms', 'masculine-crest', 20),
  (gen_random_uuid(), 'couples', 'Couples', 'Live rooms', 'double-ring', 30),
  (gen_random_uuid(), 'gay', 'Gay', 'Social + live', 'pride-crest', 40),
  (gen_random_uuid(), 'bi', 'Bi', 'Social + live', 'interlocking-rings', 50),
  (gen_random_uuid(), 'trans', 'Trans', 'Social + live', 'phoenix-crest', 60),
  (gen_random_uuid(), 'fetish', 'Fetish', 'Themed rooms', 'masked-crest', 70),
  (gen_random_uuid(), 'vip', 'VIP', 'Members only', 'crown-crest', 80);

-- Seed rooms
INSERT INTO rooms (id, name, description, visibility, status) VALUES
  (gen_random_uuid(), 'Velvet Room', 'Women performers live. Intimate, warm.', 'members', 'live'),
  (gen_random_uuid(), 'Tangled Throne', 'Couples room, get twisted together.', 'members', 'live'),
  (gen_random_uuid(), 'Pink Silk', 'Young performers 18-21. Fresh, bold.', 'members', 'live'),
  (gen_random_uuid(), 'Devils Playground', 'Fetish and kink. Consensual, intense, unleashed.', 'members', 'open'),
  (gen_random_uuid(), 'Back Room', 'Gay and bi. Dark, discreet, real.', 'public', 'live'),
  (gen_random_uuid(), 'The Dungeon', 'Very Intimate Pleasure. Private 1-on-1.', 'private', 'live'),
  (gen_random_uuid(), 'Haleys Halo', 'She looks innocent but she is not.', 'members', 'live'),
  (gen_random_uuid(), 'Trans Kinks', 'Trans performers. Bold, expressive, electric.', 'public', 'live');
```

## Done!

Once the schema + seed data is in, the API routes can be switched from mock data to real database queries. The Supabase client is at `api/lib/supabase.ts`.
