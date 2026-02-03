import { AppData, Exercise, Workout, BodyWeightEntry, defaultExercises, defaultBodyWeightHistory } from '@/types';

const STORAGE_KEY = 'workout-tracker-data';

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current timestamp
export const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Initialize default data
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

// Load data from localStorage
export const loadData = (): AppData => {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure bodyWeightHistory exists for older data
      if (!data.bodyWeightHistory) {
        data.bodyWeightHistory = defaultBodyWeightHistory.map((entry) => ({
          ...entry,
          id: generateId(),
        }));
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }

  const defaultData = getDefaultData();
  saveData(defaultData);
  return defaultData;
};

// Save data to localStorage
export const saveData = (data: AppData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Add exercise
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

  saveData(newData);
  return newData;
};

// Update exercise
export const updateExercise = (data: AppData, exerciseId: string, updates: Partial<Exercise>): AppData => {
  const newData = {
    ...data,
    exercises: data.exercises.map((ex) =>
      ex.id === exerciseId
        ? { ...ex, ...updates, updatedAt: getTimestamp() }
        : ex
    ),
  };

  saveData(newData);
  return newData;
};

// Delete exercise
export const deleteExercise = (data: AppData, exerciseId: string): AppData => {
  const newData = {
    ...data,
    exercises: data.exercises.filter((ex) => ex.id !== exerciseId),
  };

  saveData(newData);
  return newData;
};

// Start a new workout
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

  saveData(newData);
  return { data: newData, workout };
};

// Update workout
export const updateWorkout = (data: AppData, workoutId: string, updates: Partial<Workout>): AppData => {
  const newData = {
    ...data,
    workouts: data.workouts.map((w) =>
      w.id === workoutId ? { ...w, ...updates } : w
    ),
  };

  saveData(newData);
  return newData;
};

// Complete workout and update exercise max weights
export const completeWorkout = (data: AppData, workoutId: string): AppData => {
  const workout = data.workouts.find((w) => w.id === workoutId);
  if (!workout) return data;

  // Update exercises with new max weights, notes, and bodyweight status
  let updatedExercises = [...data.exercises];
  workout.entries.forEach((entry) => {
    updatedExercises = updatedExercises.map((ex) => {
      if (ex.id === entry.exerciseId) {
        // Only update weight if not bodyweight and weight is higher
        const shouldUpdateWeight = !entry.isBodyweight && entry.weight !== null && (ex.maxWeight === null || entry.weight > ex.maxWeight);
        
        // Determine the new note:
        // - If clearNote is true, set to null
        // - If entry has a note, use it
        // - Otherwise keep existing note
        let newNote = ex.lastNote;
        if (entry.clearNote) {
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

  const newData = {
    ...data,
    exercises: updatedExercises,
    workouts: data.workouts.map((w) =>
      w.id === workoutId ? { ...w, completed: true } : w
    ),
    lastPullWorkoutId: workout.type === 'pull' ? workoutId : data.lastPullWorkoutId,
    lastPushWorkoutId: workout.type === 'push' ? workoutId : data.lastPushWorkoutId,
  };

  saveData(newData);
  return newData;
};

// Get last workout by type
export const getLastWorkout = (data: AppData, type: 'pull' | 'push'): Workout | null => {
  const lastWorkoutId = type === 'pull' ? data.lastPullWorkoutId : data.lastPushWorkoutId;
  if (!lastWorkoutId) return null;
  return data.workouts.find((w) => w.id === lastWorkoutId) || null;
};

// Get days since last workout
export const getDaysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with year
export const formatDateLong = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Body weight functions
export const addBodyWeight = (data: AppData, weight: number, date?: string): AppData => {
  const newEntry: BodyWeightEntry = {
    id: generateId(),
    weight,
    date: date || getTimestamp(),
  };

  const newData = {
    ...data,
    bodyWeightHistory: [...data.bodyWeightHistory, newEntry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };

  saveData(newData);
  return newData;
};

export const deleteBodyWeight = (data: AppData, entryId: string): AppData => {
  const newData = {
    ...data,
    bodyWeightHistory: data.bodyWeightHistory.filter((e) => e.id !== entryId),
  };

  saveData(newData);
  return newData;
};

export const getLatestBodyWeight = (data: AppData): BodyWeightEntry | null => {
  if (data.bodyWeightHistory.length === 0) return null;
  return data.bodyWeightHistory[data.bodyWeightHistory.length - 1];
};

// Reset data to defaults (for debugging or fresh start)
export const resetData = (): AppData => {
  const defaultData = getDefaultData();
  saveData(defaultData);
  return defaultData;
};
