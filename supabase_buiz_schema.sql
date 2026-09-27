-- ==============================================================================
-- Buiz Arena & Buiz Studio: Supabase PostgreSQL Schema & Realtime Setup
-- Copy and paste this directly into Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create the buiz_saved_quizzes table
CREATE TABLE IF NOT EXISTS public.buiz_saved_quizzes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_possible_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create the buiz_history table
CREATE TABLE IF NOT EXISTS public.buiz_history (
    id TEXT PRIMARY KEY,
    quiz_name TEXT NOT NULL,
    pin TEXT DEFAULT '',
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    game_mode TEXT DEFAULT 'hostPaced',
    questions_count INTEGER DEFAULT 0,
    total_possible_points INTEGER DEFAULT 0,
    total_players INTEGER DEFAULT 0,
    players JSONB NOT NULL DEFAULT '[]'::jsonb,
    winners JSONB NOT NULL DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create the buiz_rooms table
CREATE TABLE IF NOT EXISTS public.buiz_rooms (
    pin TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'waiting',
    host_id TEXT DEFAULT 'admin',
    quiz_name TEXT NOT NULL DEFAULT 'Buiz Arena Quiz',
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_possible_points INTEGER DEFAULT 0,
    current_q_index INTEGER DEFAULT 0,
    question_status TEXT DEFAULT 'answering',
    game_mode TEXT DEFAULT 'hostPaced',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create the buiz_players table
CREATE TABLE IF NOT EXISTS public.buiz_players (
    id TEXT PRIMARY KEY,
    room_pin TEXT NOT NULL REFERENCES public.buiz_rooms(pin) ON DELETE CASCADE,
    name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    progress NUMERIC DEFAULT 0,
    avatar TEXT DEFAULT '',
    current_q_index INTEGER DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for fast room lookup and real-time responsiveness
CREATE INDEX IF NOT EXISTS idx_buiz_players_room_pin ON public.buiz_players(room_pin);
CREATE INDEX IF NOT EXISTS idx_buiz_players_score ON public.buiz_players(score DESC);
CREATE INDEX IF NOT EXISTS idx_buiz_history_date ON public.buiz_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_buiz_saved_quizzes_created ON public.buiz_saved_quizzes(created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.buiz_saved_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buiz_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buiz_players ENABLE ROW LEVEL SECURITY;

-- 7. Policies for buiz_saved_quizzes
DROP POLICY IF EXISTS "Public can view saved quizzes" ON public.buiz_saved_quizzes;
CREATE POLICY "Public can view saved quizzes" ON public.buiz_saved_quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert saved quizzes" ON public.buiz_saved_quizzes;
CREATE POLICY "Public can insert saved quizzes" ON public.buiz_saved_quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete saved quizzes" ON public.buiz_saved_quizzes;
CREATE POLICY "Public can delete saved quizzes" ON public.buiz_saved_quizzes FOR DELETE USING (true);

-- 8. Policies for buiz_history
DROP POLICY IF EXISTS "Public can view history" ON public.buiz_history;
CREATE POLICY "Public can view history" ON public.buiz_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert history" ON public.buiz_history;
CREATE POLICY "Public can insert history" ON public.buiz_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete history" ON public.buiz_history;
CREATE POLICY "Public can delete history" ON public.buiz_history FOR DELETE USING (true);

-- 9. Policies for buiz_rooms
DROP POLICY IF EXISTS "Public can view rooms" ON public.buiz_rooms;
CREATE POLICY "Public can view rooms" ON public.buiz_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert rooms" ON public.buiz_rooms;
CREATE POLICY "Public can insert rooms" ON public.buiz_rooms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update rooms" ON public.buiz_rooms;
CREATE POLICY "Public can update rooms" ON public.buiz_rooms FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete rooms" ON public.buiz_rooms;
CREATE POLICY "Public can delete rooms" ON public.buiz_rooms FOR DELETE USING (true);

-- 10. Policies for buiz_players
DROP POLICY IF EXISTS "Public can view players" ON public.buiz_players;
CREATE POLICY "Public can view players" ON public.buiz_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert players" ON public.buiz_players;
CREATE POLICY "Public can insert players" ON public.buiz_players FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update players" ON public.buiz_players;
CREATE POLICY "Public can update players" ON public.buiz_players FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete players" ON public.buiz_players;
CREATE POLICY "Public can delete players" ON public.buiz_players FOR DELETE USING (true);

-- 11. Enable Realtime Publications for live games
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'buiz_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buiz_rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'buiz_players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.buiz_players;
  END IF;
END $$;
