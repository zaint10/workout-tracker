import { AppData, Exercise, Workout, WorkoutEntry, BodyWeightEntry, defaultExercises, defaultBodyWeightHistory } from '@/types';
import { supabase } from './supabase';

const STORAGE_KEY = 'workout-tracker-data';
const PENDING_SYNC_KEY = 'workout-tracker-pending-sync';

// ============ LOCAL STORAGE FUNCTIONS ============

const generateId = (): string => {
  // Generate a proper UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Get default data
const getDefaultData = (): AppData => {
  const now = getTimestamp();
  const exercises: Exercise[] = defaultExercises.map((ex) => ({
    ...ex,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));

  const bodyWeightHistory: BodyWeightEntry[] = defaultBodyWeightHistory.map((entry) => ({
    ...entry,
    id: generateId(),
  }));

  return {
    exercises,
    workouts: [],
    lastPullWorkoutId: null,
    lastPushWorkoutId: null,
    bodyWeightHistory,
  };
};

// Load from localStorage
const loadFromLocalStorage = (): AppData => {
  if (typeof window === 'undefined') return getDefaultData();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (!data.bodyWeightHistory) {
        data.bodyWeightHistory = [];
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  return getDefaultData();
};

// Save to localStorage
const saveToLocalStorage = (data: AppData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// ============ PENDING SYNC QUEUE ============

interface PendingAction {
  id: string;
  type: 'add_exercise' | 'update_exercise' | 'delete_exercise' | 
        'complete_workout' | 'delete_workout' |
        'add_body_weight' | 'delete_body_weight' | 'reset_data';
  payload: any;
  timestamp: string;
}

const getPendingActions = (): PendingAction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PENDING_SYNC_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePendingActions = (actions: PendingAction[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Error saving pending actions:', error);
  }
};

const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp'>): void => {
  const actions = getPendingActions();
  actions.push({
    ...action,
    id: generateId(),
    timestamp: getTimestamp(),
  });
  savePendingActions(actions);
};

const clearPendingActions = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PENDING_SYNC_KEY);
};

// ============ ONLINE CHECK ============

export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return false;
  return navigator.onLine;
};

// ============ SUPABASE SYNC FUNCTIONS ============

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

// Sync pending actions to Supabase
export const syncPendingToSupabase = async (): Promise<boolean> => {
  if (!isOnline()) return false;
  
  const actions = getPendingActions();
  if (actions.length === 0) return true;
  
  console.log(`Syncing ${actions.length} pending actions to Supabase...`);
  
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'add_exercise':
          await supabase.from('exercises').insert({
            id: action.payload.id,
            name: action.payload.name,
            muscle_group: action.payload.muscleGroup,
            workout_type: action.payload.workoutType,
            set_scheme: action.payload.setScheme,
            max_weight: action.payload.maxWeight,
            is_bodyweight: action.payload.isBodyweight,
            last_note: action.payload.lastNote,
            created_at: action.payload.createdAt,
            updated_at: action.payload.updatedAt,
          });
          break;
          
        case 'update_exercise':
          const updates: any = { updated_at: action.payload.updatedAt };
          if (action.payload.updates.maxWeight !== undefined) updates.max_weight = action.payload.updates.maxWeight;
          if (action.payload.updates.isBodyweight !== undefined) updates.is_bodyweight = action.payload.updates.isBodyweight;
          if (action.payload.updates.lastNote !== undefined) updates.last_note = action.payload.updates.lastNote;
          if (action.payload.updates.setScheme !== undefined) updates.set_scheme = action.payload.updates.setScheme;
          await supabase.from('exercises').update(updates).eq('id', action.payload.exerciseId);
          break;
          
        case 'delete_exercise':
          await supabase.from('exercises').delete().eq('id', action.payload.exerciseId);
          break;
          
        case 'complete_workout':
          // Insert workout
          await supabase.from('workouts').upsert({
            id: action.payload.workout.id,
            type: action.payload.workout.type,
            date: action.payload.workout.date,
            completed: true,
          });
          
          // Insert entries
          if (action.payload.entries.length > 0) {
            const entriesToInsert = action.payload.entries.map((e: any) => ({
              workout_id: action.payload.workout.id,
              exercise_id: e.exerciseId,
              weight: e.weight,
              is_bodyweight: e.isBodyweight,
              note: e.note,
            }));
            await supabase.from('workout_entries').insert(entriesToInsert);
          }
          
          // Update app state
          const stateUpdate = action.payload.workout.type === 'pull'
            ? { last_pull_workout_id: action.payload.workout.id }
            : { last_push_workout_id: action.payload.workout.id };
          await supabase.from('app_state').update(stateUpdate).eq('id', 1);
          
          // Update exercise stats
          for (const entry of action.payload.entries) {
            const exUpdates: any = { updated_at: getTimestamp() };
            if (!entry.isBodyweight && entry.weight) {
              const { data: ex } = await supabase.from('exercises').select('max_weight').eq('id', entry.exerciseId).single();
              if (ex && (ex.max_weight === null || entry.weight > Number(ex.max_weight))) {
                exUpdates.max_weight = entry.weight;
              }
            }
            if (entry.isBodyweight !== undefined) exUpdates.is_bodyweight = entry.isBodyweight;
            if (entry.note) exUpdates.last_note = entry.note;
            await supabase.from('exercises').update(exUpdates).eq('id', entry.exerciseId);
          }
          break;
          
        case 'delete_workout':
          await supabase.from('workouts').delete().eq('id', action.payload.workoutId);
          break;
          
        case 'add_body_weight':
          await supabase.from('body_weight_history').insert({
            id: action.payload.id,
            weight: action.payload.weight,
            date: action.payload.date,
          });
          break;
          
        case 'delete_body_weight':
          await supabase.from('body_weight_history').delete().eq('id', action.payload.entryId);
          break;
          
        case 'reset_data':
          // This is complex - skip for now, will sync on next full load
          break;
      }
    } catch (error) {
      console.error(`Error syncing action ${action.type}:`, error);
      // Continue with other actions
    }
  }
  
  clearPendingActions();
  console.log('Sync complete!');
  return true;
};

// Load from Supabase
const loadFromSupabase = async (): Promise<AppData | null> => {
  try {
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: true });

    if (exercisesError) throw exercisesError;

    const { data: workoutsData, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: true });

    if (workoutsError) throw workoutsError;

    const { data: entriesData, error: entriesError } = await supabase
      .from('workout_entries')
      .select('*');

    if (entriesError) throw entriesError;

    const { data: bodyWeightData, error: bodyWeightError } = await supabase
      .from('body_weight_history')
      .select('*')
      .order('date', { ascending: true });

    if (bodyWeightError) throw bodyWeightError;

    const { data: appStateData, error: appStateError } = await supabase
      .from('app_state')
      .select('*')
      .single();

    if (appStateError) throw appStateError;

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

    return {
      exercises: (exercisesData || []).map(toExercise),
      workouts: (workoutsData || []).map((w: any) => toWorkout(w, entriesByWorkout[w.id] || [])),
      lastPullWorkoutId: appStateData?.last_pull_workout_id || null,
      lastPushWorkoutId: appStateData?.last_push_workout_id || null,
      bodyWeightHistory: (bodyWeightData || []).map(toBodyWeightEntry),
    };
  } catch (error) {
    console.error('Error loading from Supabase:', error);
    return null;
  }
};

// Seed default data to Supabase
const seedToSupabase = async (): Promise<void> => {
  const { data: existing } = await supabase.from('exercises').select('id').limit(1);
  if (existing && existing.length > 0) return;

  const exercisesToInsert = defaultExercises.map((ex) => ({
    name: ex.name,
    muscle_group: ex.muscleGroup,
    workout_type: ex.workoutType,
    set_scheme: ex.setScheme,
    max_weight: ex.maxWeight,
    is_bodyweight: ex.isBodyweight,
    last_note: ex.lastNote,
  }));

  await supabase.from('exercises').insert(exercisesToInsert);

  const bodyWeightToInsert = defaultBodyWeightHistory.map((entry) => ({
    weight: entry.weight,
    date: entry.date,
  }));

  await supabase.from('body_weight_history').insert(bodyWeightToInsert);
};

// ============ HYBRID STORAGE API ============

export const loadData = async (): Promise<AppData> => {
  // First, try to sync any pending actions
  if (isOnline()) {
    await syncPendingToSupabase();
  }
  
  // Try to load from Supabase if online
  if (isOnline()) {
    try {
      await seedToSupabase();
      const supabaseData = await loadFromSupabase();
      if (supabaseData) {
        // Save to localStorage as backup
        saveToLocalStorage(supabaseData);
        return supabaseData;
      }
    } catch (error) {
      console.error('Supabase load failed, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  console.log('Loading from localStorage (offline mode)');
  return loadFromLocalStorage();
};

export const addExercise = (data: AppData, exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): AppData => {
  const now = getTimestamp();
  const newExercise: Exercise = {
    ...exercise,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  const newData = {
    ...data,
    exercises: [...data.exercises, newExercise],
  };

  // Save locally immediately
  saveToLocalStorage(newData);
  
  // Queue for sync
  addPendingAction({
    type: 'add_exercise',
    payload: newExercise,
  });
  
  // Try to sync now if online
  if (isOnline()) {
    syncPendingToSupabase();
  }

  return newData;
};

export const updateExercise = (data: AppData, exerciseId: string, updates: Partial<Exercise>): AppData => {
  const now = getTimestamp();
  const newData = {
    ...data,
    exercises: data.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, ...updates, updatedAt: now } : ex
    ),
  };

  saveToLocalStorage(newData);
  
  addPendingAction({
    type: 'update_exercise',
    payload: { exerciseId, updates, updatedAt: now },
  });
  
  if (isOnline()) syncPendingToSupabase();

  return newData;
};

export const deleteExercise = (data: AppData, exerciseId: string): AppData => {
  const newData = {
    ...data,
    exercises: data.exercises.filter((ex) => ex.id !== exerciseId),
  };

  saveToLocalStorage(newData);
  
  addPendingAction({
    type: 'delete_exercise',
    payload: { exerciseId },
  });
  
  if (isOnline()) syncPendingToSupabase();

  return newData;
};

export const startWorkout = (data: AppData, type: 'pull' | 'push'): { data: AppData; workout: Workout } => {
  const workout: Workout = {
    id: generateId(),
    type,
    date: getTimestamp(),
    entries: [],
    completed: false,
  };

  const newData = {
    ...data,
    workouts: [...data.workouts, workout],
  };

  saveToLocalStorage(newData);
  // Don't sync incomplete workouts

  return { data: newData, workout };
};

export const completeWorkout = (data: AppData, workoutId: string, entries: WorkoutEntry[]): AppData => {
  const workout = data.workouts.find((w) => w.id === workoutId);
  if (!workout) return data;

  // Update exercises with new max weights
  let updatedExercises = [...data.exercises];
  entries.forEach((entry) => {
    updatedExercises = updatedExercises.map((ex) => {
      if (ex.id === entry.exerciseId) {
        const shouldUpdateWeight = !entry.isBodyweight && entry.weight !== null && 
          (ex.maxWeight === null || entry.weight > ex.maxWeight);
        
        let newNote = ex.lastNote;
        if ((entry as any).clearNote) {
          newNote = null;
        } else if (entry.note) {
          newNote = entry.note;
        }
        
        return {
          ...ex,
          maxWeight: shouldUpdateWeight ? entry.weight : (entry.isBodyweight ? null : ex.maxWeight),
          isBodyweight: entry.isBodyweight ?? ex.isBodyweight,
          lastNote: newNote,
          updatedAt: getTimestamp(),
        };
      }
      return ex;
    });
  });

  const completedWorkout = { ...workout, entries, completed: true };

  const newData = {
    ...data,
    exercises: updatedExercises,
    workouts: data.workouts.map((w) => w.id === workoutId ? completedWorkout : w),
    lastPullWorkoutId: workout.type === 'pull' ? workoutId : data.lastPullWorkoutId,
    lastPushWorkoutId: workout.type === 'push' ? workoutId : data.lastPushWorkoutId,
  };

  saveToLocalStorage(newData);
  
  addPendingAction({
    type: 'complete_workout',
    payload: { workout: completedWorkout, entries },
  });
  
  if (isOnline()) syncPendingToSupabase();

  return newData;
};

export const cancelWorkout = (data: AppData, workoutId: string): AppData => {
  const newData = {
    ...data,
    workouts: data.workouts.filter((w) => w.id !== workoutId),
  };

  saveToLocalStorage(newData);
  // No need to sync - workout wasn't saved to Supabase yet

  return newData;
};

export const getLastWorkout = (data: AppData, type: 'pull' | 'push'): Workout | null => {
  const lastWorkoutId = type === 'pull' ? data.lastPullWorkoutId : data.lastPushWorkoutId;
  if (!lastWorkoutId) return null;
  return data.workouts.find((w) => w.id === lastWorkoutId) || null;
};

export const addBodyWeight = (data: AppData, weight: number, date?: string): AppData => {
  const newEntry: BodyWeightEntry = {
    id: generateId(),
    weight,
    date: date || getTimestamp(),
  };

  const newData = {
    ...data,
    bodyWeightHistory: [...data.bodyWeightHistory, newEntry],
  };

  saveToLocalStorage(newData);
  
  addPendingAction({
    type: 'add_body_weight',
    payload: newEntry,
  });
  
  if (isOnline()) syncPendingToSupabase();

  return newData;
};

export const deleteBodyWeight = (data: AppData, entryId: string): AppData => {
  const newData = {
    ...data,
    bodyWeightHistory: data.bodyWeightHistory.filter((e) => e.id !== entryId),
  };

  saveToLocalStorage(newData);
  
  addPendingAction({
    type: 'delete_body_weight',
    payload: { entryId },
  });
  
  if (isOnline()) syncPendingToSupabase();

  return newData;
};

export const getLatestBodyWeight = (data: AppData): BodyWeightEntry | null => {
  if (data.bodyWeightHistory.length === 0) return null;
  return data.bodyWeightHistory.reduce((latest, entry) =>
    new Date(entry.date) > new Date(latest.date) ? entry : latest
  );
};

export const resetData = async (): Promise<AppData> => {
  const newData = getDefaultData();
  saveToLocalStorage(newData);
  clearPendingActions();
  
  // If online, reset Supabase too
  if (isOnline()) {
    try {
      await supabase.from('workout_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('body_weight_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('app_state').update({ 
        last_pull_workout_id: null, 
        last_push_workout_id: null 
      }).eq('id', 1);
      await seedToSupabase();
      
      // Reload from Supabase to get proper IDs
      const freshData = await loadFromSupabase();
      if (freshData) {
        saveToLocalStorage(freshData);
        return freshData;
      }
    } catch (error) {
      console.error('Error resetting Supabase:', error);
    }
  }
  
  return newData;
};

// Helper functions
export const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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

// Check for pending syncs
export const hasPendingSync = (): boolean => {
  return getPendingActions().length > 0;
};

export const getPendingSyncCount = (): number => {
  return getPendingActions().length;
};
