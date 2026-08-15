/*
# Make user_id columns nullable for anon inserts

## Problem
Several tables have `user_id uuid NOT NULL DEFAULT auth.uid()`. When the
anon role inserts (no login), `auth.uid()` returns NULL, which violates the
NOT NULL constraint and the insert fails. Since this app has no sign-in
screen, all writes come from the anon role.

## Changes
Make `user_id` nullable on all user-submitted tables so anon inserts work.
The DEFAULT auth.uid() stays — it still fills the column for authenticated
users. For anon, the column will be NULL, which is fine since we don't need
to track who submitted what in a no-auth app.

Tables affected:
- pressure_reports
- wellness_checks
- event_rsvps
- club_members
- influence_ledger
- reward_redemptions
- mentor_assignments

## Security impact
- No change to RLS policies — anon INSERT policies already use WITH CHECK (true)
- Authenticated users still get ownership-scoped policies using auth.uid()
- user_id being nullable doesn't weaken any existing policy because the
  authenticated policies check user_id = auth.uid(), which is false when
  user_id is NULL
*/
ALTER TABLE pressure_reports ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE wellness_checks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE event_rsvps ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE club_members ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE influence_ledger ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE reward_redemptions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE mentor_assignments ALTER COLUMN user_id DROP NOT NULL;
