-- Add RLS policies to prevent public UPDATE/DELETE on demo_config
-- Only service_role should be able to modify this table

-- Drop the existing SELECT policy and recreate it properly
DROP POLICY IF EXISTS "Anyone can read demo config" ON demo_config;

-- Create a proper restrictive SELECT policy for public reads
CREATE POLICY "Anyone can read demo config"
ON demo_config FOR SELECT
USING (true);

-- Deny all UPDATE operations from anon/authenticated roles
-- (service_role bypasses RLS so it can still update)
CREATE POLICY "Deny public updates to demo config"
ON demo_config FOR UPDATE
USING (false)
WITH CHECK (false);

-- Deny all DELETE operations from anon/authenticated roles
CREATE POLICY "Deny public deletes to demo config"
ON demo_config FOR DELETE
USING (false);

-- Deny all INSERT operations from anon/authenticated roles
CREATE POLICY "Deny public inserts to demo config"
ON demo_config FOR INSERT
WITH CHECK (false);