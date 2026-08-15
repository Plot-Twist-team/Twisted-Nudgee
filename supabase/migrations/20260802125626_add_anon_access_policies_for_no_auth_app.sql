/*
# Add anon access policies for no-auth app functionality

## Problem
All RLS policies are scoped to `authenticated` only. The NUDGEE app has no
sign-in screen, so the frontend talks to Supabase with the anon key. Every
SELECT returns zero rows and every INSERT fails the WITH CHECK because
`auth.uid()` is null for the anon role. This makes the entire app appear
broken after the splash screen.

## Changes
Adds anon-role policies alongside the existing authenticated policies so the
app works without requiring login. Existing authenticated policies are NOT
modified or removed — they continue to enforce ownership checks for signed-in
users. The new anon policies are additive.

### Anon SELECT (read) policies added on:
- clubs, events, rewards, mentors, feed_posts, twist_lines (public content)
- club_members, event_rsvps (for dashboard counts)
- pressure_reports, wellness_checks (for dashboard counts)
- influence_ledger (so dashboard can sum points)
- reward_redemptions (so users can see their redemptions)

### Anon INSERT (write) policies added on:
- pressure_reports (file reports without login)
- wellness_checks (check in without login)
- event_rsvps (RSVP without login)
- club_members (join clubs without login)
- reward_redemptions (redeem rewards without login)
- influence_ledger (trigger writes, also allows direct insert)
- mentor_assignments (request mentors without login)

## Security impact
- Anon can read all public content (events, clubs, rewards, mentors, feed)
- Anon can submit reports, wellness checks, RSVPs, club joins, reward claims
- Anon cannot UPDATE or DELETE any data (no anon UPDATE/DELETE policies)
- Authenticated policies remain unchanged — signed-in users still get
  ownership-scoped access
- Admin-only operations (creating events, clubs, rewards, etc.) remain
  admin-only — no anon INSERT policies on those tables
*/
-- ── Anon SELECT on public content tables ──
DROP POLICY IF EXISTS "anon_select_clubs" ON clubs;
CREATE POLICY "anon_select_clubs" ON clubs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_rewards" ON rewards;
CREATE POLICY "anon_select_rewards" ON rewards FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_mentors" ON mentors;
CREATE POLICY "anon_select_mentors" ON mentors FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_feed_posts" ON feed_posts;
CREATE POLICY "anon_select_feed_posts" ON feed_posts FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_twist_lines" ON twist_lines;
CREATE POLICY "anon_select_twist_lines" ON twist_lines FOR SELECT TO anon USING (true);

-- ── Anon SELECT on user-submitted tables (for dashboard counts) ──
DROP POLICY IF EXISTS "anon_select_club_members" ON club_members;
CREATE POLICY "anon_select_club_members" ON club_members FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_event_rsvps" ON event_rsvps;
CREATE POLICY "anon_select_event_rsvps" ON event_rsvps FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_pressure_reports" ON pressure_reports;
CREATE POLICY "anon_select_pressure_reports" ON pressure_reports FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_wellness_checks" ON wellness_checks;
CREATE POLICY "anon_select_wellness_checks" ON wellness_checks FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_influence_ledger" ON influence_ledger;
CREATE POLICY "anon_select_influence_ledger" ON influence_ledger FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_reward_redemptions" ON reward_redemptions;
CREATE POLICY "anon_select_reward_redemptions" ON reward_redemptions FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_select_mentor_assignments" ON mentor_assignments;
CREATE POLICY "anon_select_mentor_assignments" ON mentor_assignments FOR SELECT TO anon USING (true);

-- ── Anon INSERT on user-submitted tables ──
DROP POLICY IF EXISTS "anon_insert_pressure_reports" ON pressure_reports;
CREATE POLICY "anon_insert_pressure_reports" ON pressure_reports FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_wellness_checks" ON wellness_checks;
CREATE POLICY "anon_insert_wellness_checks" ON wellness_checks FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_event_rsvps" ON event_rsvps;
CREATE POLICY "anon_insert_event_rsvps" ON event_rsvps FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_club_members" ON club_members;
CREATE POLICY "anon_insert_club_members" ON club_members FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_reward_redemptions" ON reward_redemptions;
CREATE POLICY "anon_insert_reward_redemptions" ON reward_redemptions FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_influence_ledger" ON influence_ledger;
CREATE POLICY "anon_insert_influence_ledger" ON influence_ledger FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_insert_mentor_assignments" ON mentor_assignments;
CREATE POLICY "anon_insert_mentor_assignments" ON mentor_assignments FOR INSERT TO anon WITH CHECK (true);
