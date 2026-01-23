-- Add stripe_session_id to link hearts to checkout sessions for sharing
ALTER TABLE public.hearts ADD COLUMN stripe_session_id text UNIQUE;