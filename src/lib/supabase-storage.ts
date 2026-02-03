import { supabase } from './supabase';
import { AppData, Exercise, Workout, WorkoutEntry, BodyWeightEntry, defaultExercises, defaultBodyWeightHistory } from '@/types';

// Convert snake_case from DB to camelCase for app
const toExercise = (row: any): Exercise => ({
  id: row.id,
  name: row.name,
  muscleGroup: row.muscle_group,
  workoutType: row.workout_type,
  setScheme: row.set_scheme,
  maxWeight: row.max_weight ? Number(row.max_weight) : null,
  isBodyweight: row.is_bodyweight,
  lastNote: row.last_note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toWorkout = (row: any, entries: WorkoutEntry[] = []): Workout => ({
  id: row.id,
  type: row.type,
  date: row.date,
  entries,
  completed: row.completed,
});

const toBodyWeightEntry = (row: any): BodyWeightEntry => ({
  id: row.id,
  weight: Number(row.weight),
  date: row.date,
});

// Load all data from Supabase
export const loadDataFromSupabase = async (): Promise<AppData> => {
  try {
    // Load exercises
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: true });

    if (exercisesError) throw exercisesError;

    // Load workouts with their entries
    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: true });

    if (workoutsError) throw workoutsError;

    // Load workout entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('workout_entries')
      .select('*');

    if (entriesError) throw entriesError;

    // Load body weight history
    const { data: bodyWeightData, error: bodyWeightError } = await supabase
      .from('body_weight_history')
      .select('*')
      .order('date', { ascending: true });

    if (bodyWeightError) throw bodyWeightError;

    // Load app state
    const { data: appStateData, error: appStateError } = await supabase
      .from('app_state')
      .select('*')
      .single();

    if (appStateError) throw appStateError;

    // Map entries to workouts
    const entriesByWorkout = (entriesData || []).reduce((acc: Record<string, WorkoutEntry[]>, entry: any) => {
      if (!acc[entry.workout_id]) acc[entry.workout_id] = [];
      acc[entry.workout_id].push({
        exerciseId: entry.exercise_id,
        weight: entry.weight ? Number(entry.weight) : null,
        isBodyweight: entry.is_bodyweight,
        note: entry.note,
      });
      return acc;
    }, {});

    const exercises = (exercisesData || []).map(toExercise);
    const workouts = (workoutsData || []).map((w: any) => toWorkout(w, entriesByWorkout[w.id] || []));
    const bodyWeightHistory = (bodyWeightData || []).map(toBodyWeightEntry);

    return {
      exercises,
      workouts,
      lastPullWorkoutId: appStateData?.last_pull_workout_id || null,
      lastPushWorkoutId: appStateData?.last_push_workout_id || null,
      bodyWeightHistory,
    };
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    throw error;
  }
};

// Seed default exercises if none exist
export const seedDefaultData = async (): Promise<void> => {
  const { data: existingExercises } = await supabase
    .from('exercises')
    .select('id')
    .limit(1);

  if (existingExercises && existingExercises.length > 0) {
    return; // Already has data
  }

  // Insert default exercises
  const exercisesToInsert = defaultExercises.map((ex) => ({
    name: ex.name,
    muscle_group: ex.muscleGroup,
    workout_type: ex.workoutType,
    set_scheme: ex.setScheme,
    max_weight: ex.maxWeight,
    is_bodyweight: ex.isBodyweight,
    last_note: ex.lastNote,
  }));

  const { error: exercisesError } = await supabase
    .from('exercises')
    .insert(exercisesToInsert);

  if (exercisesError) {
    console.error('Error seeding exercises:', exercisesError);
    throw exercisesError;
  }

  // Insert default body weight history
  const bodyWeightToInsert = defaultBodyWeightHistory.map((entry) => ({
    weight: entry.weight,
    date: entry.date,
  }));

  const { error: bodyWeightError } = await supabase
    .from('body_weight_history')
    .insert(bodyWeightToInsert);

  if (bodyWeightError) {
    console.error('Error seeding body weight:', bodyWeightError);
  }

  console.log('Default data seeded successfully');
};

// Add exercise
export const addExerciseToSupabase = async (
  exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Exercise> => {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: exercise.name,
      muscle_group: exercise.muscleGroup,
      workout_type: exercise.workoutType,
      set_scheme: exercise.setScheme,
      max_weight: exercise.maxWeight,
      is_bodyweight: exercise.isBodyweight,
      last_note: exercise.lastNote,
    })
    .select()
    .single();

  if (error) throw error;
  return toExercise(data);
};

// Update exercise
export const updateExerciseInSupabase = async (
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<void> => {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.muscleGroup !== undefined) dbUpdates.muscle_group = updates.muscleGroup;
  if (updates.workoutType !== undefined) dbUpdates.workout_type = updates.workoutType;
  if (updates.setScheme !== undefined) dbUpdates.set_scheme = updates.setScheme;
  if (updates.maxWeight !== undefined) dbUpdates.max_weight = updates.maxWeight;
  if (updates.isBodyweight !== undefined) dbUpdates.is_bodyweight = updates.isBodyweight;
  if (updates.lastNote !== undefined) dbUpdates.last_note = updates.lastNote;

  const { error } = await supabase
    .from('exercises')
    .update(dbUpdates)
    .eq('id', exerciseId);

  if (error) throw error;
};

// Delete exercise
export const deleteExerciseFromSupabase = async (exerciseId: string): Promise<void> => {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId);

  if (error) throw error;
};

// Start workout
export const startWorkoutInSupabase = async (type: 'pull' | 'push'): Promise<Workout> => {
  const { data, error } = await supabase
    .from('workouts')
    .insert({ type, completed: false })
    .select()
    .single();

  if (error) throw error;
  return toWorkout(data, []);
};

// Complete workout
export const completeWorkoutInSupabase = async (
  workoutId: string,
  entries: WorkoutEntry[]
): Promise<void> => {
  // Insert workout entries
  if (entries.length > 0) {
    const entriesToInsert = entries.map((entry) => ({
      workout_id: workoutId,
      exercise_id: entry.exerciseId,
      weight: entry.weight,
      is_bodyweight: entry.isBodyweight,
      note: entry.note,
    }));

    const { error: entriesError } = await supabase
      .from('workout_entries')
      .insert(entriesToInsert);

    if (entriesError) throw entriesError;
  }

  // Get workout type
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('type')
    .eq('id', workoutId)
    .single();

  if (workoutError) throw workoutError;

  // Mark workout as completed
  const { error: updateError } = await supabase
    .from('workouts')
    .update({ completed: true })
    .eq('id', workoutId);

  if (updateError) throw updateError;

  // Update app state with last workout ID
  const updateField = workout.type === 'pull' 
    ? { last_pull_workout_id: workoutId }
    : { last_push_workout_id: workoutId };

  const { error: stateError } = await supabase
    .from('app_state')
    .update({ ...updateField, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (stateError) throw stateError;

  // Update exercise max weights and notes
  for (const entry of entries) {
    const { data: exercise } = await supabase
      .from('exercises')
      .select('max_weight, is_bodyweight')
      .eq('id', entry.exerciseId)
      .single();

    if (exercise) {
      const updates: any = { updated_at: new Date().toISOString() };
      
      // Update weight if not bodyweight and higher
      if (!entry.isBodyweight && entry.weight !== null) {
        if (exercise.max_weight === null || entry.weight > Number(exercise.max_weight)) {
          updates.max_weight = entry.weight;
        }
      }
      
      // Update bodyweight status
      if (entry.isBodyweight !== undefined) {
        updates.is_bodyweight = entry.isBodyweight;
        if (entry.isBodyweight) {
          updates.max_weight = null;
        }
      }

      // Update note
      if (entry.note) {
        updates.last_note = entry.note;
      } else if ((entry as any).clearNote) {
        updates.last_note = null;
      }

      await supabase
        .from('exercises')
        .update(updates)
        .eq('id', entry.exerciseId);
    }
  }
};

// Cancel/delete workout
export const deleteWorkoutFromSupabase = async (workoutId: string): Promise<void> => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);

  if (error) throw error;
};

// Add body weight entry
export const addBodyWeightToSupabase = async (
  weight: number,
  date?: string
): Promise<BodyWeightEntry> => {
  const { data, error } = await supabase
    .from('body_weight_history')
    .insert({ weight, date: date || new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return toBodyWeightEntry(data);
};

// Delete body weight entry
export const deleteBodyWeightFromSupabase = async (entryId: string): Promise<void> => {
  const { error } = await supabase
    .from('body_weight_history')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
};

// Reset all data
export const resetDataInSupabase = async (): Promise<void> => {
  // Delete all data
  await supabase.from('workout_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('body_weight_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Reset app state
  await supabase
    .from('app_state')
    .update({ 
      last_pull_workout_id: null, 
      last_push_workout_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1);

  // Re-seed default data
  await seedDefaultData();
};

// Helper functions (same as before)
export const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
