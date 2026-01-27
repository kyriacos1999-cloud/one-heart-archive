-- Fix the SECURITY DEFINER view issue by recreating with security_invoker=on
DROP VIEW IF EXISTS public.hearts_public;

CREATE VIEW public.hearts_public 
WITH (security_invoker=on) AS 
SELECT 
  id, 
  name, 
  category, 
  message, 
  date, 
  created_at
FROM public.hearts;

-- Re-grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.hearts_public TO anon, authenticated;