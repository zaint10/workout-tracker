'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppData, Exercise, Workout, WorkoutType, MuscleGroup, BodyWeightEntry, WorkoutEntry } from '@/types';
import {
  loadData,
  addExercise as addExerciseToStorage,
  updateExercise as updateExerciseInStorage,
  deleteExercise as deleteExerciseFromStorage,
  startWorkout as startWorkoutInStorage,
  updateWorkout as updateWorkoutInStorage,
  completeWorkout as completeWorkoutInStorage,
  getLastWorkout,
  addBodyWeight as addBodyWeightToStorage,
  deleteBodyWeight as deleteBodyWeightFromStorage,
  getLatestBodyWeight,
  resetData as resetDataInStorage,
} from '@/lib/storage';

interface AppContextType {
  data: AppData | null;
  isLoading: boolean;
  
  // Exercise operations
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExercise: (exerciseId: string, updates: Partial<Exercise>) => void;
  deleteExercise: (exerciseId: string) => void;
  getExercisesByType: (type: WorkoutType) => Exercise[];
  getExercisesByMuscleGroup: (muscleGroup: MuscleGroup, type: WorkoutType) => Exercise[];
  
  // Workout operations
  currentWorkout: Workout | null;
  startWorkout: (type: WorkoutType) => void;
  updateCurrentWorkout: (updates: Partial<Workout>) => void;
  completeCurrentWorkout: (entries?: WorkoutEntry[]) => void;
  cancelWorkout: () => void;
  
  // Last workout info
  getLastWorkoutByType: (type: WorkoutType) => Workout | null;
  getExerciseById: (id: string) => Exercise | undefined;

  // Body weight operations
  addBodyWeight: (weight: number, date?: string) => void;
  deleteBodyWeight: (entryId: string) => void;
  latestBodyWeight: BodyWeightEntry | null;

  // Reset data
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
    setIsLoading(false);
  }, []);

  const addExercise = (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data) return;
    const newData = addExerciseToStorage(data, exercise);
    setData(newData);
  };

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    if (!data) return;
    const newData = updateExerciseInStorage(data, exerciseId, updates);
    setData(newData);
  };

  const deleteExercise = (exerciseId: string) => {
    if (!data) return;
    const newData = deleteExerciseFromStorage(data, exerciseId);
    setData(newData);
  };

  const getExercisesByType = (type: WorkoutType): Exercise[] => {
    if (!data) return [];
    return data.exercises.filter((ex) => ex.workoutType === type);
  };

  const getExercisesByMuscleGroup = (muscleGroup: MuscleGroup, type: WorkoutType): Exercise[] => {
    if (!data) return [];
    return data.exercises.filter(
      (ex) => ex.muscleGroup === muscleGroup && ex.workoutType === type
    );
  };

  const startWorkout = (type: WorkoutType) => {
    if (!data) return;
    const { data: newData, workout } = startWorkoutInStorage(data, type);
    setData(newData);
    setCurrentWorkout(workout);
  };

  const updateCurrentWorkout = (updates: Partial<Workout>) => {
    if (!data || !currentWorkout) return;
    const newData = updateWorkoutInStorage(data, currentWorkout.id, updates);
    setData(newData);
    setCurrentWorkout({ ...currentWorkout, ...updates });
  };

  const completeCurrentWorkout = (entries?: WorkoutEntry[]) => {
    if (!data || !currentWorkout) return;
    
    // First update the workout with entries if provided
    let dataWithEntries = data;
    if (entries && entries.length > 0) {
      dataWithEntries = updateWorkoutInStorage(data, currentWorkout.id, { entries });
    }
    
    // Then complete the workout using the updated data
    const newData = completeWorkoutInStorage(dataWithEntries, currentWorkout.id);
    setData(newData);
    setCurrentWorkout(null);
  };

  const cancelWorkout = () => {
    if (!data || !currentWorkout) return;
    // Remove incomplete workout
    const newData = {
      ...data,
      workouts: data.workouts.filter((w) => w.id !== currentWorkout.id),
    };
    setData(newData);
    setCurrentWorkout(null);
  };

  const getLastWorkoutByType = (type: WorkoutType): Workout | null => {
    if (!data) return null;
    return getLastWorkout(data, type);
  };

  const getExerciseById = (id: string): Exercise | undefined => {
    if (!data) return undefined;
    return data.exercises.find((ex) => ex.id === id);
  };

  const addBodyWeight = (weight: number, date?: string) => {
    if (!data) return;
    const newData = addBodyWeightToStorage(data, weight, date);
    setData(newData);
  };

  const deleteBodyWeight = (entryId: string) => {
    if (!data) return;
    const newData = deleteBodyWeightFromStorage(data, entryId);
    setData(newData);
  };

  const latestBodyWeight = data ? getLatestBodyWeight(data) : null;

  const resetData = () => {
    const newData = resetDataInStorage();
    setData(newData);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        addExercise,
        updateExercise,
        deleteExercise,
        getExercisesByType,
        getExercisesByMuscleGroup,
        currentWorkout,
        startWorkout,
        updateCurrentWorkout,
        completeCurrentWorkout,
        cancelWorkout,
        getLastWorkoutByType,
        getExerciseById,
        addBodyWeight,
        deleteBodyWeight,
        latestBodyWeight,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
