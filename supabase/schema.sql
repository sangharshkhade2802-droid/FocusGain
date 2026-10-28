-- FocusGain Web Database Schema (PostgreSQL / Supabase)
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Focus Pioneer',
    avatar_url TEXT DEFAULT '',
    focus_streak INT NOT NULL DEFAULT 0,
    total_focus_minutes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. FOCUS SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('pomodoro', 'stopwatch', 'scheduled')),
    duration_minutes INT NOT NULL DEFAULT 25,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SCHEDULED BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.scheduled_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. STUDY ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.study_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_participants INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ROOM PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'focusing' CHECK (status IN ('focusing', 'break', 'idle')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, user_id)
);

-- 6. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    score INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scoring', 'accepted', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INT NOT NULL DEFAULT 0,
    weak_areas TEXT[] DEFAULT '{}',
    strong_areas TEXT[] DEFAULT '{}',
    content_recommendations JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ENABLE ROW-LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES: FOCUS SESSIONS
CREATE POLICY "Users can manage own focus sessions" 
ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);

-- POLICIES: SCHEDULED BLOCKS
CREATE POLICY "Users can manage own scheduled blocks" 
ON public.scheduled_blocks FOR ALL USING (auth.uid() = user_id);

-- POLICIES: STUDY ROOMS
CREATE POLICY "Active study rooms viewable by authenticated users" 
ON public.study_rooms FOR SELECT USING (true);

CREATE POLICY "Users can create study rooms" 
ON public.study_rooms FOR INSERT WITH CHECK (auth.uid() = host_id OR host_id IS NULL);

CREATE POLICY "Hosts can update study rooms" 
ON public.study_rooms FOR UPDATE USING (auth.uid() = host_id);

-- POLICIES: ROOM PARTICIPANTS
CREATE POLICY "Participants viewable by authenticated users" 
ON public.room_participants FOR SELECT USING (true);

CREATE POLICY "Users can manage own room participation" 
ON public.room_participants FOR ALL USING (auth.uid() = user_id);

-- POLICIES: TASKS
CREATE POLICY "Users can manage own tasks" 
ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- POLICIES: QUIZZES
CREATE POLICY "Users can manage own quizzes" 
ON public.quizzes FOR ALL USING (auth.uid() = user_id);

-- REALTIME CONFIGURATION
-- Note: Run in Supabase SQL editor to add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;

-- TRIGGER: AUTO PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, focus_streak, total_focus_minutes)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    1,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED DATA FOR DEMO ROOMS
INSERT INTO public.study_rooms (id, title, is_active, max_participants)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Deep Work & Systems Architecture 🧠', true, 25),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Medical & MCAT Intense Focus Ward 🩺', true, 15),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Late Night Lo-Fi Code Sprint 💻', true, 30),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Silent Pomodoro Sprint (50/10) ⏱️', true, 20)
ON CONFLICT (id) DO NOTHING;
