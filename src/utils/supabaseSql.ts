export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- B-Forms: Supabase PostgreSQL Schema & Realtime Setup
-- Copy and paste this directly into Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create the forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    response_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create the form_responses table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id TEXT PRIMARY KEY DEFAULT ('res_' || floor(extract(epoch from now()) * 1000)::text || '_' || substr(md5(random()::text), 1, 5)),
    form_id TEXT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    respondent_name TEXT DEFAULT 'Anonymous',
    respondent_email TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON public.forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON public.form_responses(submitted_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Allow anyone to read forms
DROP POLICY IF EXISTS "Public can view forms" ON public.forms;
CREATE POLICY "Public can view forms" ON public.forms
    FOR SELECT USING (true);

-- Allow creating, editing, and deleting forms
DROP POLICY IF EXISTS "Anyone can create forms" ON public.forms;
CREATE POLICY "Anyone can create forms" ON public.forms
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update forms" ON public.forms;
CREATE POLICY "Anyone can update forms" ON public.forms
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete forms" ON public.forms;
CREATE POLICY "Anyone can delete forms" ON public.forms
    FOR DELETE USING (true);

-- Form Responses Policies
DROP POLICY IF EXISTS "Public can view responses" ON public.form_responses;
CREATE POLICY "Public can view responses" ON public.form_responses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can submit responses" ON public.form_responses;
CREATE POLICY "Public can submit responses" ON public.form_responses
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete responses" ON public.form_responses;
CREATE POLICY "Anyone can delete responses" ON public.form_responses
    FOR DELETE USING (true);

-- 6. RPC Function to atomically increment response count
CREATE OR REPLACE FUNCTION public.increment_form_response_count(form_id_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.forms
    SET response_count = response_count + 1,
        updated_at = NOW()
    WHERE id = form_id_param;
END;
$$;

-- 7. Enable Supabase Realtime for instant live responses & updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'forms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.forms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'form_responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.form_responses;
  END IF;
END $$;
`;
