-- Create a table to track completed quick tests
CREATE TABLE public.quick_test_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public inserts and reads (anonymous tracking)
ALTER TABLE public.quick_test_completions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a completion record
CREATE POLICY "Anyone can insert test completions"
ON public.quick_test_completions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to count completions
CREATE POLICY "Anyone can view test completions"
ON public.quick_test_completions
FOR SELECT
USING (true);