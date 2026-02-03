-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('pull', 'push')),
  set_scheme TEXT NOT NULL DEFAULT '4sets',
  max_weight DECIMAL,
  is_bodyweight BOOLEAN DEFAULT false,
  last_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pull', 'push')),
  date TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout entries (exercises done in a workout)
CREATE TABLE workout_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  weight DECIMAL,
  is_bodyweight BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body weight history
CREATE TABLE body_weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weight DECIMAL NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App state (for tracking last workout IDs)
CREATE TABLE app_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_pull_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  last_push_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize app state
INSERT INTO app_state (id) VALUES (1);

-- Enable Row Level Security (but allow all for now - no auth)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Allow public access (since we're not using auth yet)
CREATE POLICY "Allow all" ON exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON workouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON workout_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON body_weight_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON app_state FOR ALL USING (true) WITH CHECK (true);
