-- Switch is_admin() from SECURITY DEFINER to SECURITY INVOKER.
-- The function only reads the caller's own profile row, so it needs
-- no elevated privileges. This resolves the security advisor warning
-- about authenticated users being able to execute a SECURITY DEFINER fn.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
SELECT EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND role = 'admin'
);
$function$;
