-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'addressed', 'closed')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature', 'improvement', 'other'))
);

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS enforce_feedback_limit ON public.feedback;
DROP FUNCTION IF EXISTS check_feedback_limit();
DROP TRIGGER IF EXISTS update_feedback_updated_at ON public.feedback;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Delete any existing policies
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback status" ON public.feedback;

-- Policy for users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
  ON public.feedback 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all feedback
CREATE POLICY "Admins can view all feedback" 
  ON public.feedback 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy for admins to update feedback status
CREATE POLICY "Admins can update feedback status" 
  ON public.feedback 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to prevent spamming (limit to 5 feedback submissions per day per user)
CREATE OR REPLACE FUNCTION check_feedback_limit()
RETURNS TRIGGER AS $$
DECLARE
  feedback_count INTEGER;
  time_since_last_feedback INTERVAL;
BEGIN
  -- Get count of feedback in last 24 hours
  SELECT COUNT(*), NOW() - MAX(created_at)
  INTO feedback_count, time_since_last_feedback
  FROM public.feedback
  WHERE user_id = NEW.user_id
  AND created_at > NOW() - INTERVAL '24 hours';
  
  -- If user has submitted 5 or more feedback in the last 24 hours
  IF feedback_count >= 5 THEN
    -- Calculate time until next available submission
    RAISE EXCEPTION 'Rate limit exceeded. You can submit feedback again in % hours and % minutes.', 
      EXTRACT(HOUR FROM (INTERVAL '24 hours' - time_since_last_feedback)),
      EXTRACT(MINUTE FROM (INTERVAL '24 hours' - time_since_last_feedback));
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If something goes wrong, prevent the insert and return a generic error
    RAISE EXCEPTION 'Unable to submit feedback at this time. Please try again later.';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce feedback limit
CREATE TRIGGER enforce_feedback_limit
BEFORE INSERT ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION check_feedback_limit(); 