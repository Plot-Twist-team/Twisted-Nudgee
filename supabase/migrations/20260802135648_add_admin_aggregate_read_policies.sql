/*
# Add admin aggregate read policies for dashboard metrics

## Why
The app now has two roles:
- Students: read their own data + public content (events, clubs, rewards, etc.)
- Admins: read aggregated data across all students for the admin dashboard

Existing policies use auth.uid() = user_id which blocks NULL user_id rows
(demo seed data). Admins need to see all rows for aggregate metrics.

## Changes
Add SELECT policies for admin role on user-submitted tables so admins can
read all rows (including demo data with NULL user_id) for dashboard metrics.

These are ADDITIVE — existing student policies remain unchanged.
*/

-- Admin can read all pressure reports
DROP POLICY IF EXISTS "pr_select_all_admin" ON pressure_reports;
CREATE POLICY "pr_select_all_admin" ON pressure_reports FOR SELECT
  TO authenticated USING (is_admin());

-- Admin can read all wellness checks
DROP POLICY IF EXISTS "wc_select_all_admin" ON wellness_checks;
CREATE POLICY "wc_select_all_admin" ON wellness_checks FOR SELECT
  TO authenticated USING (is_admin());

-- Admin can read all influence ledger entries
-- (il_select_admin already exists from the previous migration)

-- Admin can read all event RSVPs
DROP POLICY IF EXISTS "er_select_all_admin" ON event_rsvps;
CREATE POLICY "er_select_all_admin" ON event_rsvps FOR SELECT
  TO authenticated USING (is_admin());

-- Admin can read all club members
DROP POLICY IF EXISTS "cm_select_all_admin" ON club_members;
CREATE POLICY "cm_select_all_admin" ON club_members FOR SELECT
  TO authenticated USING (is_admin());

-- Admin can read all reward redemptions
-- (rr_select_own_or_admin already exists)

-- Admin can read all mentor assignments
-- (ma_select_own_or_admin already exists)

-- Students can read their own wellness checks (in addition to admin)
-- wc_select_own_or_admin already exists and handles this.

-- Students can read aggregate counts (we use head:true count queries)
-- The select_all policies on clubs, events, etc. already cover this.
-- For wellness_checks and pressure_reports, students should only see their own.
-- But for dashboard COUNT queries, we need students to at least get a count.
-- Solution: students query with count:true head:true which doesn't need SELECT policy
-- if the table has any SELECT policy for authenticated. Actually, count queries
-- DO need SELECT policy. So we need a student-friendly aggregate approach.
-- For now, the dashboard will query these tables and the student will see counts
-- of only their own rows. That's correct behavior — students see their own stats.
