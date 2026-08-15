/*
# Lock down SECURITY DEFINER functions from direct RPC execution

## Problem
Five functions in the `public` schema were executable by the `anon` and
`authenticated` roles via the PostgREST RPC endpoint (`/rest/v1/rpc/...`).
Four of them are trigger functions that must run as SECURITY DEFINER (so they
can write to tables on behalf of the row owner), but they should never be
invoked directly by any client. The fifth (`is_admin`) is a helper meant for
authenticated callers only and can safely run as SECURITY INVOKER since it
relies on `auth.uid()` and reads the caller's own profile row (RLS-scoped).

## Changes

### 1. Trigger functions — revoke direct EXECUTE (keep SECURITY DEFINER)
These functions are called exclusively by table triggers. Revoking EXECUTE
from all roles prevents direct RPC invocation while triggers continue to
work normally (trigger execution uses the function owner's privileges).

- `add_ledger_and_points()` — trigger that adds influence points on insert
- `bump_club_count()` — trigger that maintains club member counts
- `bump_event_count()` — trigger that maintains event RSVP counts
- `handle_new_user()` — trigger that creates a profile row on signup

### 2. `is_admin()` — switch to SECURITY INVOKER + restrict to authenticated
This function checks whether the calling user has the 'admin' role. It uses
`auth.uid()` and queries `profiles` for the caller's own row, so it works
correctly under the caller's privileges (RLS allows reading own profile).
- Recreated as SECURITY INVOKER
- EXECUTE revoked from PUBLIC and anon
- EXECUTE granted to authenticated only

## Security impact
- anon role can no longer call any of these functions via RPC
- authenticated role can no longer call the four trigger functions via RPC
- authenticated role can still call is_admin() (intentional — it is a
  read-only check scoped to the caller's own auth.uid())
- All four triggers continue to fire normally on table mutations
*/
-- ── Trigger functions: revoke direct EXECUTE from everyone ──
REVOKE EXECUTE ON FUNCTION public.add_ledger_and_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_club_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_event_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ── is_admin(): switch to SECURITY INVOKER, restrict to authenticated ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
