// Types for the workout tracker app

export type WorkoutType = 'pull' | 'push';

export type MuscleGroup = 
  | 'back' 
  | 'biceps' 
  | 'rear-delts' 
  | 'shrugs'
  | 'chest' 
  | 'shoulders' 
  | 'triceps' 
  | 'legs';

export type SetScheme = '4sets' | '3sets' | '3x5';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  workoutType: WorkoutType;
  setScheme: SetScheme;
  maxWeight: number | null;
  isBodyweight: boolean;  // If true, this exercise uses bodyweight (e.g., pull ups)
  lastNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutEntry {
  exerciseId: string;
  weight: number | null;
  isBodyweight?: boolean;  // If true, exercise done with bodyweight
  note: string | null;
  clearNote?: boolean;  // If true, clear the previous note from the exercise
}

export interface Workout {
  id: string;
  type: WorkoutType;
  date: string;
  entries: WorkoutEntry[];
  completed: boolean;
}

// Body weight tracking
export interface BodyWeightEntry {
  id: string;
  weight: number;
  date: string;
}

export interface AppData {
  exercises: Exercise[];
  workouts: Workout[];
  lastPullWorkoutId: string | null;
  lastPushWorkoutId: string | null;
  bodyWeightHistory: BodyWeightEntry[];
}

// Default exercises with your actual data
export const defaultExercises: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============ CHEST (Push) ============
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: null },
  { name: 'Incline Barbell Press', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: null },
  { name: 'Incline Dumbbell Flys', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 15, isBodyweight: false, lastNote: null },
  { name: 'Decline Barbell Press (Power Rack)', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 30, isBodyweight: false, lastNote: null },
  { name: 'Decline Seated Press Machine', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 45, isBodyweight: false, lastNote: null },
  { name: 'Flat Barbell Press', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: 'medium' },
  { name: 'Flat Dumbbell Press', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 30, isBodyweight: false, lastNote: '4 clean' },
  { name: 'Flat Dumbbell Flys', muscleGroup: 'chest', workoutType: 'push', setScheme: '4sets', maxWeight: 12, isBodyweight: false, lastNote: null },
  { name: 'Standing Dumbbell Flys', muscleGroup: 'chest', workoutType: 'push', setScheme: '3sets', maxWeight: 6, isBodyweight: false, lastNote: null },
  { name: 'Machine Cable Flys', muscleGroup: 'chest', workoutType: 'push', setScheme: '3sets', maxWeight: 5, isBodyweight: false, lastNote: 'plates' },
  { name: 'Plate Press (Squeeze)', muscleGroup: 'chest', workoutType: 'push', setScheme: '3sets', maxWeight: 10, isBodyweight: false, lastNote: '5+5kg plate' },
  { name: 'Pushups', muscleGroup: 'chest', workoutType: 'push', setScheme: '3sets', maxWeight: null, isBodyweight: true, lastNote: null },

  // ============ SHOULDERS (Push) ============
  { name: 'Shoulder Machine Press', muscleGroup: 'shoulders', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: null },
  { name: 'Shoulder Press Dumbbell', muscleGroup: 'shoulders', workoutType: 'push', setScheme: '4sets', maxWeight: 15, isBodyweight: false, lastNote: null },
  { name: 'Bent Arm Lateral Raise Dumbbell', muscleGroup: 'shoulders', workoutType: 'push', setScheme: '3sets', maxWeight: 10, isBodyweight: false, lastNote: 'struggled' },
  { name: 'Side Raise Half Dumbbell', muscleGroup: 'shoulders', workoutType: 'push', setScheme: '3sets', maxWeight: 6, isBodyweight: false, lastNote: null },
  { name: 'Side Little Front Raise Half', muscleGroup: 'shoulders', workoutType: 'push', setScheme: '3sets', maxWeight: 8, isBodyweight: false, lastNote: null },

  // ============ REAR DELTS (Pull - 3 sets) ============
  { name: 'Rear Delt Fly Dumbbell', muscleGroup: 'rear-delts', workoutType: 'pull', setScheme: '3sets', maxWeight: 4, isBodyweight: false, lastNote: 'help needed' },
  { name: 'Rear Delt Thumbless Raise Seated', muscleGroup: 'rear-delts', workoutType: 'pull', setScheme: '3sets', maxWeight: 17.5, isBodyweight: false, lastNote: null },

  // ============ TRICEPS (Push - 3 sets) ============
  { name: 'Rod Pushdown', muscleGroup: 'triceps', workoutType: 'push', setScheme: '3sets', maxWeight: 10, isBodyweight: false, lastNote: 'straight rod' },
  { name: 'Rope Pushdown', muscleGroup: 'triceps', workoutType: 'push', setScheme: '3sets', maxWeight: 6, isBodyweight: false, lastNote: 'plates' },
  { name: 'Dumbbell Pullover', muscleGroup: 'triceps', workoutType: 'push', setScheme: '3sets', maxWeight: 25, isBodyweight: false, lastNote: '9 clean' },
  { name: 'Skull Crusher Barbell', muscleGroup: 'triceps', workoutType: 'push', setScheme: '3sets', maxWeight: null, isBodyweight: false, lastNote: null },

  // ============ BACK/LATS (Pull) ============
  { name: 'Pull Ups', muscleGroup: 'back', workoutType: 'pull', setScheme: '3x5', maxWeight: null, isBodyweight: true, lastNote: '2 self, 3 assisted' },
  { name: 'Cable Lat Pushdown', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 6, isBodyweight: false, lastNote: 'plates' },
  { name: 'T-Bar Straight Grip', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 65, isBodyweight: false, lastNote: 'struggled but 4 clean rep' },
  { name: 'Low Row Machine (Neutral Grip)', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 55, isBodyweight: false, lastNote: null },
  { name: 'Low Row Machine (Overhand Grip)', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 45, isBodyweight: false, lastNote: null },
  { name: 'Incline Level Row', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 60, isBodyweight: false, lastNote: null },
  { name: 'Lat Pulldown', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 12, isBodyweight: false, lastNote: 'plates' },
  { name: 'Cable Rows', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 7, isBodyweight: false, lastNote: 'plates' },
  { name: 'Cable Row (Wing Handle)', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 10, isBodyweight: false, lastNote: 'plates' },
  { name: 'Rack Pull', muscleGroup: 'back', workoutType: 'pull', setScheme: '4sets', maxWeight: 130, isBodyweight: false, lastNote: '5 clean' },

  // ============ BICEPS (Pull) ============
  { name: 'Machine Curls', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: 6, isBodyweight: false, lastNote: 'plates' },
  { name: 'Biceps Curls Barbell', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: 7.5, isBodyweight: false, lastNote: null },
  { name: 'Dumbbell Curls (Half)', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: 12, isBodyweight: false, lastNote: null },
  { name: 'Dumbbell Curls (Simple)', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: 12, isBodyweight: false, lastNote: null },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: 12, isBodyweight: false, lastNote: null },
  { name: 'Hammer Curl', muscleGroup: 'biceps', workoutType: 'pull', setScheme: '4sets', maxWeight: null, isBodyweight: false, lastNote: null },

  // ============ SHRUGS (Pull) ============
  { name: 'Dumbbell Shrugs', muscleGroup: 'shrugs', workoutType: 'pull', setScheme: '4sets', maxWeight: 30, isBodyweight: false, lastNote: null },
  { name: 'Smith Machine Barbell Shrugs', muscleGroup: 'shrugs', workoutType: 'pull', setScheme: '4sets', maxWeight: 40, isBodyweight: false, lastNote: null },

  // ============ LEGS (Push - Extension, Squats) ============
  { name: 'Leg Extension', muscleGroup: 'legs', workoutType: 'push', setScheme: '4sets', maxWeight: 7, isBodyweight: false, lastNote: 'plates' },
  { name: 'Barbell/Rod Squats', muscleGroup: 'legs', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: null },
  { name: 'Dumbbell Squats', muscleGroup: 'legs', workoutType: 'push', setScheme: '4sets', maxWeight: 40, isBodyweight: false, lastNote: null },
  { name: 'Barbell Squats', muscleGroup: 'legs', workoutType: 'push', setScheme: '4sets', maxWeight: 25, isBodyweight: false, lastNote: 'each side' },
  { name: 'Lunges', muscleGroup: 'legs', workoutType: 'push', setScheme: '4sets', maxWeight: 20, isBodyweight: false, lastNote: null },

  // ============ LEGS (Pull - Curls, RDL, Press) ============
  { name: 'Leg Curls', muscleGroup: 'legs', workoutType: 'pull', setScheme: '4sets', maxWeight: 7, isBodyweight: false, lastNote: '4 clean, plates' },
  { name: 'Dumbbell Romanian Deadlift (RDL)', muscleGroup: 'legs', workoutType: 'pull', setScheme: '4sets', maxWeight: 30, isBodyweight: false, lastNote: null },
  { name: 'Leg Press (Single Leg)', muscleGroup: 'legs', workoutType: 'pull', setScheme: '4sets', maxWeight: 110, isBodyweight: false, lastNote: null },
];

// Default body weight history
export const defaultBodyWeightHistory: Omit<BodyWeightEntry, 'id'>[] = [
  { weight: 93.8, date: '2025-11-02T00:00:00.000Z' },
  { weight: 96.6, date: '2025-12-25T00:00:00.000Z' },
  { weight: 97.2, date: '2026-01-12T00:00:00.000Z' },
  { weight: 97.3, date: '2026-02-02T00:00:00.000Z' },
];

// Helper to get muscle groups for each workout type
export const pullMuscleGroups: MuscleGroup[] = ['back', 'biceps', 'rear-delts', 'shrugs', 'legs'];
export const pushMuscleGroups: MuscleGroup[] = ['chest', 'shoulders', 'triceps', 'legs'];

// Display names for muscle groups
export const muscleGroupNames: Record<MuscleGroup, string> = {
  'back': 'Back',
  'biceps': 'Biceps',
  'rear-delts': 'Rear Delts',
  'shrugs': 'Shrugs',
  'chest': 'Chest',
  'shoulders': 'Shoulders',
  'triceps': 'Triceps',
  'legs': 'Legs',
};

// Set scheme display
export const setSchemeDisplay: Record<SetScheme, string> = {
  '4sets': '4 sets (12, 10, 8, 6)',
  '3sets': '3 sets (12, 12, 12)',
  '3x5': '3 sets of 5 reps',
};
