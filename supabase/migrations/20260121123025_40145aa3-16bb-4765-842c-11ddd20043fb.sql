-- Create hearts table
CREATE TABLE public.hearts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recipient_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hearts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view hearts" 
ON public.hearts 
FOR SELECT 
USING (true);

-- Create policy for public insert access
CREATE POLICY "Anyone can add hearts" 
ON public.hearts 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.hearts;