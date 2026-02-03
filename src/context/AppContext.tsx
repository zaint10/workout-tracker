'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AppData, Exercise, Workout, WorkoutType, MuscleGroup, BodyWeightEntry, WorkoutEntry } from '@/types';
import {
  loadData as loadHybridData,
  addExercise as addExerciseHybrid,
  updateExercise as updateExerciseHybrid,
  deleteExercise as deleteExerciseHybrid,
  startWorkout as startWorkoutHybrid,
  completeWorkout as completeWorkoutHybrid,
  cancelWorkout as cancelWorkoutHybrid,
  addBodyWeight as addBodyWeightHybrid,
  deleteBodyWeight as deleteBodyWeightHybrid,
  resetData as resetDataHybrid,
  syncPendingToSupabase,
  isOnline,
  hasPendingSync,
  getPendingSyncCount,
} from '@/lib/hybrid-storage';

interface AppContextType {
  data: AppData | null;
  isLoading: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  
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
  
  // Refresh data from server
  refreshData: () => Promise<void>;
  
  // Manual sync
  syncNow: () => Promise<void>;
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
  const [online, setOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const updateSyncStatus = useCallback(() => {
    setOnline(isOnline());
    setPendingSyncCount(getPendingSyncCount());
  }, []);

  const loadData = async () => {
    try {
      const loadedData = await loadHybridData();
      setData(loadedData);
      updateSyncStatus();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for online/offline changes
    const handleOnline = () => {
      setOnline(true);
      // Try to sync when coming back online
      syncPendingToSupabase().then(() => {
        updateSyncStatus();
        loadData(); // Reload to get latest from Supabase
      });
    };
    
    const handleOffline = () => {
      setOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateSyncStatus]);

  const refreshData = async () => {
    setIsLoading(true);
    await loadData();
  };

  const syncNow = async () => {
    if (isOnline()) {
      await syncPendingToSupabase();
      await loadData();
    }
  };

  const addExercise = (exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data) return;
    const newData = addExerciseHybrid(data, exercise);
    setData(newData);
    updateSyncStatus();
  };

  const updateExercise = (exerciseId: string, updates: Partial<Exercise>) => {
    if (!data) return;
    const newData = updateExerciseHybrid(data, exerciseId, updates);
    setData(newData);
    updateSyncStatus();
  };

  const deleteExercise = (exerciseId: string) => {
    if (!data) return;
    const newData = deleteExerciseHybrid(data, exerciseId);
    setData(newData);
    updateSyncStatus();
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
    const { data: newData, workout } = startWorkoutHybrid(data, type);
    setData(newData);
    setCurrentWorkout(workout);
  };

  const updateCurrentWorkout = (updates: Partial<Workout>) => {
    if (!currentWorkout) return;
    setCurrentWorkout({ ...currentWorkout, ...updates });
  };

  const completeCurrentWorkout = (entries?: WorkoutEntry[]) => {
    if (!data || !currentWorkout) return;
    const workoutEntries = entries || [];
    const newData = completeWorkoutHybrid(data, currentWorkout.id, workoutEntries);
    setData(newData);
    setCurrentWorkout(null);
    updateSyncStatus();
  };

  const cancelWorkout = () => {
    if (!data || !currentWorkout) return;
    const newData = cancelWorkoutHybrid(data, currentWorkout.id);
    setData(newData);
    setCurrentWorkout(null);
  };

  const getLastWorkoutByType = (type: WorkoutType): Workout | null => {
    if (!data) return null;
    const lastWorkoutId = type === 'pull' ? data.lastPullWorkoutId : data.lastPushWorkoutId;
    if (!lastWorkoutId) return null;
    return data.workouts.find((w) => w.id === lastWorkoutId) || null;
  };

  const getExerciseById = (id: string): Exercise | undefined => {
    if (!data) return undefined;
    return data.exercises.find((ex) => ex.id === id);
  };

  const addBodyWeight = (weight: number, date?: string) => {
    if (!data) return;
    const newData = addBodyWeightHybrid(data, weight, date);
    setData(newData);
    updateSyncStatus();
  };

  const deleteBodyWeight = (entryId: string) => {
    if (!data) return;
    const newData = deleteBodyWeightHybrid(data, entryId);
    setData(newData);
    updateSyncStatus();
  };

  const latestBodyWeight = data?.bodyWeightHistory?.length
    ? data.bodyWeightHistory.reduce((latest, entry) =>
        new Date(entry.date) > new Date(latest.date) ? entry : latest
      )
    : null;

  const resetData = async () => {
    try {
      setIsLoading(true);
      const newData = await resetDataHybrid();
      setData(newData);
      updateSyncStatus();
    } catch (error) {
      console.error('Error resetting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        isOnline: online,
        pendingSyncCount,
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
        refreshData,
        syncNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
