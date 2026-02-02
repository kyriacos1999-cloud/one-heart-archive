-- Drop and recreate hearts_public view with security definer to allow public read
DROP VIEW IF EXISTS hearts_public;

CREATE VIEW hearts_public 
WITH (security_invoker = false)
AS SELECT 
    id,
    name,
    category,
    message,
    date,
    created_at
FROM hearts;

-- Grant SELECT access to anon and authenticated roles
GRANT SELECT ON hearts_public TO anon;
GRANT SELECT ON hearts_public TO authenticated;