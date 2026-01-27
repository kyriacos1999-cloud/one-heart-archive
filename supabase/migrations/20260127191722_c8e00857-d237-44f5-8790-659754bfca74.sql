-- Fix 1: Create a public view that hides sensitive columns
-- This allows the heart wall to remain public while protecting PII

-- Create a public-safe view excluding sensitive fields
CREATE VIEW public.hearts_public AS 
SELECT 
  id, 
  name, 
  category, 
  message, 
  date, 
  created_at
FROM public.hearts;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.hearts_public TO anon, authenticated;

-- Revoke direct SELECT on hearts table from public roles
-- This forces all reads to go through the view
REVOKE SELECT ON public.hearts FROM anon, authenticated;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view hearts" ON public.hearts;

-- Create a new SELECT policy that only allows service_role to read full data
-- This is needed for edge functions to still work
CREATE POLICY "Only service role can view full hearts"
ON public.hearts 
FOR SELECT 
TO service_role
USING (true);