# Secure Supabase SQL Migration
# Run this in: Supabase Dashboard → SQL Editor → New Query

## Step 1: Add unique constraint on responses
```sql
ALTER TABLE public.responses 
  DROP CONSTRAINT IF EXISTS responses_unique_rating;

ALTER TABLE public.responses 
  ADD CONSTRAINT responses_unique_rating 
  UNIQUE (participant_id, prompt_number, actual_model, metric_name);
```

## Step 2: Enable RLS and Restrict Access
```sql
-- Enable RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Drop any existing public SELECT policies
DROP POLICY IF EXISTS "participants_select" ON public.participants;
DROP POLICY IF EXISTS "responses_select" ON public.responses;

-- Drop other existing policies to recreate them safely
DROP POLICY IF EXISTS "participants_insert" ON public.participants;
DROP POLICY IF EXISTS "responses_insert" ON public.responses;
DROP POLICY IF EXISTS "responses_upsert" ON public.responses;
DROP POLICY IF EXISTS "responses_update" ON public.responses;

-- Participants: anyone can register (insert only)
CREATE POLICY "participants_insert" ON public.participants 
  FOR INSERT WITH CHECK (true);

-- Responses: anyone can submit (insert) or update their own via upsert
CREATE POLICY "responses_insert" ON public.responses 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "responses_update" ON public.responses 
  FOR UPDATE USING (true) WITH CHECK (true);
```

## Step 3: Create Secure RPCs for Data Access
```sql
-- RPC to securely check if an email exists without exposing participant data
CREATE OR REPLACE FUNCTION public.check_participant_email(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS for this specific check
AS $$
DECLARE
  email_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.participants WHERE email = check_email
  ) INTO email_exists;
  
  RETURN email_exists;
END;
$$;

-- RPC to securely fetch a participant's responses using their UUID
CREATE OR REPLACE FUNCTION public.get_participant_responses(pid uuid)
RETURNS TABLE (
  prompt_number integer,
  actual_model text,
  metric_name text,
  rating integer
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS for this specific query
AS $$
BEGIN
  RETURN QUERY
  SELECT r.prompt_number, r.actual_model, r.metric_name, r.rating
  FROM public.responses r
  WHERE r.participant_id = pid;
END;
$$;

-- ADMIN DASHBOARD RPCs
-- These RPCs are used exclusively by the Admin Dashboard to fetch analytics data.
-- They run as SECURITY DEFINER to bypass RLS.
CREATE OR REPLACE FUNCTION public.get_all_participants()
RETURNS SETOF public.participants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.participants ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_responses()
RETURNS SETOF public.responses
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.responses;
END;
$$;
```
