/*
# Revoke public execute on handle_new_user trigger function

The handle_new_user function is a SECURITY DEFINER trigger that auto-creates
profiles on signup. It only needs to be called by the trigger on auth.users,
not by any client via the REST API. Revoke EXECUTE from anon and authenticated
to close the surface. The trigger itself runs with the function's privileges
regardless of these grants.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
