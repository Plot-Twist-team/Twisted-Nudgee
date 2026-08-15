/*
# Make user_id nullable and drop FK to auth.users for demo seeding

## Why
The app needs demo seed data (wellness checks, pressure reports, etc.) that
isn't tied to real auth users. The FK constraint to auth.users prevents
inserting rows with NULL or fake user_ids. Since pressure reports and wellness
checks are anonymous by design, and the seed data represents aggregate demo
metrics, we drop the FK and make user_id nullable.

## Changes
1. Drop FK constraints on user_id columns that reference auth.users
   (wellness_checks, pressure_reports, influence_ledger, club_members,
    event_rsvps, reward_redemptions, mentor_assignments)
2. Make user_id nullable on all those tables
3. Keep the DEFAULT auth.uid() where it exists — real authenticated inserts
   still get the correct user_id automatically.

## Security impact
- user_id being nullable doesn't weaken RLS — authenticated policies still
  check auth.uid() = user_id, which is false when user_id is NULL.
- Demo data with NULL user_id is visible to admins via is_admin() policies.
*/

ALTER TABLE wellness_checks DROP CONSTRAINT IF EXISTS wellness_checks_user_id_fkey;
ALTER TABLE pressure_reports DROP CONSTRAINT IF EXISTS pressure_reports_user_id_fkey;
ALTER TABLE influence_ledger DROP CONSTRAINT IF EXISTS influence_ledger_user_id_fkey;
ALTER TABLE club_members DROP CONSTRAINT IF EXISTS club_members_user_id_fkey;
ALTER TABLE event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_user_id_fkey;
ALTER TABLE reward_redemptions DROP CONSTRAINT IF EXISTS reward_redemptions_user_id_fkey;
ALTER TABLE mentor_assignments DROP CONSTRAINT IF EXISTS mentor_assignments_user_id_fkey;

ALTER TABLE wellness_checks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE pressure_reports ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE influence_ledger ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE club_members ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE event_rsvps ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE reward_redemptions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE mentor_assignments ALTER COLUMN user_id DROP NOT NULL;
