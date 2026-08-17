-- =============================================================================
-- CumIN Dungeon: Row Level Security Policies
-- Run this in Supabase SQL Editor after creating your tables.
-- Ensures only active members can access protected content.
-- =============================================================================

-- Enable RLS on all relevant tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE performer_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE performer_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTION: Check if current user has active membership
-- =============================================================================

CREATE OR REPLACE FUNCTION is_active_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE email = auth.jwt()->>'email'
    AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- HELPER FUNCTION: Check if current user is a VIP member
-- =============================================================================

CREATE OR REPLACE FUNCTION is_vip_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE email = auth.jwt()->>'email'
    AND status = 'active'
    AND plan ILIKE '%VIP%'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- HELPER FUNCTION: Check if current user is a performer
-- =============================================================================

CREATE OR REPLACE FUNCTION is_performer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM performer_profiles
    WHERE user_id = auth.uid()::text
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- MEMBERS TABLE
-- Users can only read their own membership record
-- =============================================================================

CREATE POLICY "members_read_own"
  ON members FOR SELECT
  USING (email = auth.jwt()->>'email');

-- Service role can do everything (for webhook inserts/updates)
CREATE POLICY "members_service_all"
  ON members FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- PERFORMER_STREAMS TABLE
-- Anyone can read (viewers need playback URLs)
-- Only the performer who owns it can update
-- Service role handles webhook updates
-- =============================================================================

CREATE POLICY "streams_public_read"
  ON performer_streams FOR SELECT
  USING (true);

CREATE POLICY "streams_performer_update"
  ON performer_streams FOR UPDATE
  USING (performer_id = auth.uid()::text);

CREATE POLICY "streams_performer_insert"
  ON performer_streams FOR INSERT
  WITH CHECK (performer_id = auth.uid()::text);

CREATE POLICY "streams_service_all"
  ON performer_streams FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- PERFORMER_PROFILES TABLE
-- Public read (members can see performer info)
-- Performers can update their own profile
-- =============================================================================

CREATE POLICY "profiles_public_read"
  ON performer_profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_performer_update"
  ON performer_profiles FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "profiles_service_all"
  ON performer_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- TEMPLATE: Member-only table
-- Copy and adapt this for any new table that should require active membership
-- =============================================================================

-- CREATE TABLE your_protected_table (...);
-- ALTER TABLE your_protected_table ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "protected_member_read"
--   ON your_protected_table FOR SELECT
--   USING (is_active_member());
--
-- CREATE POLICY "protected_service_all"
--   ON your_protected_table FOR ALL
--   USING (auth.role() = 'service_role');

-- =============================================================================
-- TEMPLATE: VIP-only table
-- For content restricted to VIP members
-- =============================================================================

-- CREATE TABLE your_vip_table (...);
-- ALTER TABLE your_vip_table ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "vip_only_read"
--   ON your_vip_table FOR SELECT
--   USING (is_vip_member());
--
-- CREATE POLICY "vip_service_all"
--   ON your_vip_table FOR ALL
--   USING (auth.role() = 'service_role');

-- =============================================================================
-- TEMPLATE: Chat messages (member-only write, public read)
-- =============================================================================

-- CREATE TABLE chat_messages (...);
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "chat_public_read"
--   ON chat_messages FOR SELECT
--   USING (true);  -- free tier can watch, just can't participate
--
-- CREATE POLICY "chat_member_write"
--   ON chat_messages FOR INSERT
--   WITH CHECK (is_active_member());
--
-- CREATE POLICY "chat_service_all"
--   ON chat_messages FOR ALL
--   USING (auth.role() = 'service_role');

-- =============================================================================
-- TEMPLATE: Tips/gifts (member-only, sender must be self)
-- =============================================================================

-- CREATE TABLE tips (...);
-- ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "tips_member_insert"
--   ON tips FOR INSERT
--   WITH CHECK (
--     is_active_member()
--     AND sender_id = auth.uid()::text
--   );
--
-- CREATE POLICY "tips_read_own"
--   ON tips FOR SELECT
--   USING (
--     sender_id = auth.uid()::text
--     OR recipient_id = auth.uid()::text
--   );
--
-- CREATE POLICY "tips_service_all"
--   ON tips FOR ALL
--   USING (auth.role() = 'service_role');

-- =============================================================================
-- NOTES
-- =============================================================================
-- 
-- 1. Your Vercel edge functions use the SUPABASE_ANON_KEY which goes through RLS.
--    For webhook handlers that need to bypass RLS (billing, mux, lovense),
--    use SUPABASE_SERVICE_ROLE_KEY instead.
--
-- 2. The is_active_member() function checks by email from the JWT.
--    Make sure your Supabase auth is configured so the JWT includes the email claim.
--
-- 3. For the anon key (unauthenticated users), all writes are blocked by default.
--    Only reads on public tables (streams, profiles) work without auth.
--
-- 4. To apply a policy to a new table:
--    a) ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;
--    b) CREATE POLICY with the appropriate check
--    c) Always add a service_role policy so your backend can still operate
--
