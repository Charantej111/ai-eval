
ALTER TABLE public.responses 
  DROP CONSTRAINT IF EXISTS responses_unique_rating;

ALTER TABLE public.responses 
  ADD CONSTRAINT responses_unique_rating 
  UNIQUE (participant_id, prompt_number, actual_model, metric_name);

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

-- Step 1.5: Add completed flag to participants table
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Drop existing RPC before recreating it with a new return type
DROP FUNCTION IF EXISTS public.check_participant_email(text);

-- RPC to securely check if an email exists and return its status
CREATE OR REPLACE FUNCTION public.check_participant_email(check_email text)
RETURNS TABLE (
  email_exists boolean,
  is_completed boolean,
  participant_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true AS email_exists,
    p.completed AS is_completed,
    p.id AS participant_id
  FROM public.participants p
  WHERE p.email = check_email
  LIMIT 1;
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

-- RPC to mark a participant as completed securely
CREATE OR REPLACE FUNCTION public.mark_participant_completed(pid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.participants
  SET completed = true
  WHERE id = pid;
END;
$$;

-- RPC to upsert a rating securely without exposing public SELECT policies
CREATE OR REPLACE FUNCTION public.upsert_participant_rating(
  p_participant_id uuid,
  p_prompt_number integer,
  p_displayed_position integer,
  p_actual_model text,
  p_metric_name text,
  p_rating integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_exists boolean;
BEGIN
  -- 1. Validate participant exists
  SELECT EXISTS (
    SELECT 1 FROM participants WHERE id = p_participant_id
  ) INTO participant_exists;
  
  IF NOT participant_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Participant not found');
  END IF;

  -- 2. Validate prompt number (1-6)
  IF p_prompt_number < 1 OR p_prompt_number > 6 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid prompt number');
  END IF;

  -- 3. Validate rating (1-5)
  IF p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid rating value');
  END IF;

  -- 4. Validate metric name
  IF p_metric_name NOT IN (
    'prompt_adherence', 
    'cultural_accuracy', 
    'language_correctness', 
    'text_readability', 
    'visual_appeal', 
    'business_usability', 
    'overall_preference'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid metric name');
  END IF;

  -- 5. Validate actual model
  IF p_actual_model NOT IN ('Model_A', 'Model_B', 'Model_C') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid model name');
  END IF;

  -- All validations passed, perform the upsert
  INSERT INTO responses (participant_id, prompt_number, displayed_position, actual_model, metric_name, rating)
  VALUES (p_participant_id, p_prompt_number, p_displayed_position, p_actual_model, p_metric_name, p_rating)
  ON CONFLICT (participant_id, prompt_number, actual_model, metric_name)
  DO UPDATE SET rating = EXCLUDED.rating;

  RETURN jsonb_build_object('success', true, 'message', 'Rating saved successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
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
