/*
# Auto-create profile on signup with role detection from email domain

## What this does
When a user signs up via Supabase Auth, a profile row is automatically created
in the `profiles` table. The role is detected from the email domain:
  - @jagannath.org → role = 'student'
  - @jims.delhi    → role = 'admin'
  - anything else  → role = 'student' (fallback, signup screen blocks other domains)

## Changes
1. Creates a `handle_new_user()` SECURITY DEFINER function that inserts a
   profile row with the role derived from the email domain.
2. Creates a trigger on `auth.users` that fires AFTER INSERT to call it.
3. Grants EXECUTE on the function to the `anon` and `authenticated` roles
   so the trigger works during signup.
4. Removes the old anon RLS policies that allowed unrestricted access —
   the app now requires authentication, so anon access is no longer needed.
5. Re-enables proper authenticated-only RLS policies with admin overrides.

## Security
- The function is SECURITY DEFINER so it can insert into profiles even though
  the caller (anon during signup) doesn't have INSERT rights.
- Profile creation is driven by the trigger, not by client code — users can't
  spoof roles by inserting arbitrary profile rows.
- The role is derived server-side from the email, never from client input.
*/

-- ── Function to auto-create profile on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, hostel)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.email LIKE '%@jims.delhi' THEN 'admin'
      ELSE 'student'
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'hostel'
  );
  RETURN NEW;
END;
$$;

-- ── Trigger on auth.users ──
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Grant execute so the trigger works ──
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- ── Remove all old anon policies (app now requires auth) ──
DROP POLICY IF EXISTS "anon_select_clubs" ON clubs;
DROP POLICY IF EXISTS "anon_select_events" ON events;
DROP POLICY IF EXISTS "anon_select_rewards" ON rewards;
DROP POLICY IF EXISTS "anon_select_mentors" ON mentors;
DROP POLICY IF EXISTS "anon_select_feed_posts" ON feed_posts;
DROP POLICY IF EXISTS "anon_select_twist_lines" ON twist_lines;
DROP POLICY IF EXISTS "anon_select_club_members" ON club_members;
DROP POLICY IF EXISTS "anon_select_event_rsvps" ON event_rsvps;
DROP POLICY IF EXISTS "anon_select_pressure_reports" ON pressure_reports;
DROP POLICY IF EXISTS "anon_select_wellness_checks" ON wellness_checks;
DROP POLICY IF EXISTS "anon_select_influence_ledger" ON influence_ledger;
DROP POLICY IF EXISTS "anon_select_reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "anon_select_mentor_assignments" ON mentor_assignments;
DROP POLICY IF EXISTS "anon_insert_pressure_reports" ON pressure_reports;
DROP POLICY IF EXISTS "anon_insert_wellness_checks" ON wellness_checks;
DROP POLICY IF EXISTS "anon_insert_event_rsvps" ON event_rsvps;
DROP POLICY IF EXISTS "anon_insert_club_members" ON club_members;
DROP POLICY IF EXISTS "anon_insert_reward_redemptions" ON reward_redemptions;
DROP POLICY IF EXISTS "anon_insert_influence_ledger" ON influence_ledger;
DROP POLICY IF EXISTS "anon_insert_mentor_assignments" ON mentor_assignments;

-- ── Profiles: students read own, admin reads all ──
-- profiles already has: profiles_insert_self, profiles_select_own_or_admin, profiles_update_own
-- These are fine as-is. The trigger handles inserts now.

-- ── Pressure reports: students insert own, admin reads all ──
DROP POLICY IF EXISTS "pr_insert_own" ON pressure_reports;
CREATE POLICY "pr_insert_own" ON pressure_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Keep pr_select_admin and pr_delete_own as-is.

-- ── Wellness checks: students insert/select own, admin reads all ──
DROP POLICY IF EXISTS "wc_insert_own" ON wellness_checks;
CREATE POLICY "wc_insert_own" ON wellness_checks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Keep wc_select_own_or_admin and wc_delete_own as-is.

-- ── Event RSVPs: students insert/select own, admin reads all ──
DROP POLICY IF EXISTS "er_insert_own" ON event_rsvps;
CREATE POLICY "er_insert_own" ON event_rsvps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Keep er_select_all (all authenticated can see RSVPs for dashboard counts)
-- Keep er_delete_own as-is.

-- ── Club members: students insert/select, admin reads all ──
DROP POLICY IF EXISTS "cm_insert_own" ON club_members;
CREATE POLICY "cm_insert_own" ON club_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Keep cm_select_all and cm_delete_own as-is.

-- ── Influence ledger: students insert/select own, admin reads all ──
DROP POLICY IF EXISTS "il_insert_own" ON influence_ledger;
CREATE POLICY "il_insert_own" ON influence_ledger FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add admin select on influence_ledger
DROP POLICY IF EXISTS "il_select_admin" ON influence_ledger;
CREATE POLICY "il_select_admin" ON influence_ledger FOR SELECT
  TO authenticated USING (is_admin());

-- Keep il_select_own as-is.

-- ── Reward redemptions: students insert/select own, admin reads all ──
DROP POLICY IF EXISTS "rr_insert_own" ON reward_redemptions;
CREATE POLICY "rr_insert_own" ON reward_redemptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Keep rr_select_own_or_admin and rr_delete_own as-is.

-- ── Mentor assignments: admin inserts, students read own ──
-- ma_admin_write and ma_select_own_or_admin already exist.
-- Add a policy so students can request mentors (insert with their own user_id)
DROP POLICY IF EXISTS "ma_insert_own" ON mentor_assignments;
CREATE POLICY "ma_insert_own" ON mentor_assignments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Clubs, Events, Rewards, Mentors, Feed, Twist lines ──
-- These already have:
--   - select_all (authenticated can read)
--   - admin_write (admin can insert)
--   - admin_update (admin can update)
--   - admin_delete (admin can delete)
-- These are fine as-is.

-- ── AI insights: admin only (already has ai_select_admin, ai_insert_admin) ──
-- Fine as-is.
