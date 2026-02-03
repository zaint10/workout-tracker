'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, RotateCcw, Plus, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { WorkoutType, MuscleGroup, WorkoutEntry, muscleGroupNames, pullMuscleGroups, pushMuscleGroups } from '@/types';
import { useApp } from '@/context/AppContext';
import { ExerciseEntry } from './ExerciseEntry';
import { AddExerciseModal } from './AddExerciseModal';

interface ActiveWorkoutProps {
  onComplete: () => void;
  onCancel: () => void;
}

// Format today's date nicely
const getTodayFormatted = (): string => {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ onComplete, onCancel }) => {
  const {
    currentWorkout,
    getExercisesByMuscleGroup,
    getLastWorkoutByType,
    updateCurrentWorkout,
    completeCurrentWorkout,
    getExerciseById,
  } = useApp();

  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<Map<string, WorkoutEntry>>(new Map());
  const [expandedGroups, setExpandedGroups] = useState<Set<MuscleGroup>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalMuscleGroup, setAddModalMuscleGroup] = useState<MuscleGroup | undefined>();

  if (!currentWorkout) return null;

  const workoutType = currentWorkout.type;
  const isPull = workoutType === 'pull';
  const muscleGroups = isPull ? pullMuscleGroups : pushMuscleGroups;
  const lastWorkout = getLastWorkoutByType(workoutType);

  const toggleGroup = (group: MuscleGroup) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const selectExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    newSelected.add(exerciseId);
    setSelectedExercises(newSelected);

    // Create a default entry when exercise is selected
    const exercise = getExerciseById(exerciseId);
    if (exercise) {
      const newEntries = new Map(entries);
      newEntries.set(exerciseId, {
        exerciseId,
        weight: exercise.isBodyweight ? null : exercise.maxWeight,
        isBodyweight: exercise.isBodyweight,
        note: null,
      });
      setEntries(newEntries);
    }
  };

  const deselectExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    newSelected.delete(exerciseId);
    setSelectedExercises(newSelected);

    const newEntries = new Map(entries);
    newEntries.delete(exerciseId);
    setEntries(newEntries);
  };

  const updateEntry = (entry: WorkoutEntry) => {
    const newEntries = new Map(entries);
    newEntries.set(entry.exerciseId, entry);
    setEntries(newEntries);
  };

  const repeatLastWorkout = () => {
    if (!lastWorkout) return;

    const newSelected = new Set<string>();
    const newEntries = new Map<string, WorkoutEntry>();

    lastWorkout.entries.forEach((entry) => {
      const exercise = getExerciseById(entry.exerciseId);
      if (exercise) {
        newSelected.add(entry.exerciseId);
        newEntries.set(entry.exerciseId, {
          exerciseId: entry.exerciseId,
          weight: exercise.isBodyweight ? null : exercise.maxWeight,
          isBodyweight: exercise.isBodyweight,
          note: null,
        });
      }
    });

    setSelectedExercises(newSelected);
    setEntries(newEntries);
    setExpandedGroups(new Set(muscleGroups));
  };

  const handleComplete = () => {
    const workoutEntries = Array.from(entries.values());
    // Pass entries directly to avoid race condition with React state
    completeCurrentWorkout(workoutEntries);
    onComplete();
  };

  const openAddModal = (muscleGroup?: MuscleGroup) => {
    setAddModalMuscleGroup(muscleGroup);
    setShowAddModal(true);
  };

  const bgGradient = isPull
    ? 'from-pull-light to-white'
    : 'from-push-light to-white';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <div className="text-center">
            <h1 className={`text-lg font-bold ${isPull ? 'text-pull-dark' : 'text-push-dark'}`}>
              {isPull ? 'Pull Day' : 'Push Day'}
            </h1>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{getTodayFormatted()}</span>
            </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={selectedExercises.size === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
              selectedExercises.size > 0
                ? `${isPull ? 'bg-pull text-white' : 'bg-push text-white'}`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        {lastWorkout && selectedExercises.size === 0 && (
          <button
            onClick={repeatLastWorkout}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-medium">Repeat Last {isPull ? 'Pull' : 'Push'} Day</span>
          </button>
        )}

        {/* Clear All button - shows when exercises are selected */}
        {selectedExercises.size > 0 && (
          <button
            onClick={() => {
              setSelectedExercises(new Set());
              setEntries(new Map());
              setExpandedGroups(new Set());
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 rounded-xl py-3 text-red-600 hover:bg-red-100 hover:border-red-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Clear All ({selectedExercises.size} selected)</span>
          </button>
        )}

        {/* Selected exercises summary */}
        {selectedExercises.size > 0 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{selectedExercises.size}</span> exercises selected
            </p>
          </div>
        )}

        {/* Muscle Groups */}
        {muscleGroups.map((group) => {
          const exercises = getExercisesByMuscleGroup(group, workoutType);
          const isExpanded = expandedGroups.has(group);
          const selectedInGroup = exercises.filter((ex) => selectedExercises.has(ex.id));

          return (
            <div key={group} className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-800">
                    {muscleGroupNames[group]}
                  </h3>
                  {selectedInGroup.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isPull ? 'bg-pull-light text-pull-dark' : 'bg-push-light text-push-dark'
                    }`}>
                      {selectedInGroup.length} selected
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Selected exercises first */}
                  {selectedInGroup.map((exercise) => (
                    <ExerciseEntry
                      key={exercise.id}
                      exercise={exercise}
                      entry={entries.get(exercise.id)}
                      onUpdate={updateEntry}
                      isSelected={true}
                      onSelect={() => {}}
                      onDeselect={() => deselectExercise(exercise.id)}
                    />
                  ))}

                  {/* Unselected exercises */}
                  {exercises
                    .filter((ex) => !selectedExercises.has(ex.id))
                    .map((exercise) => (
                      <ExerciseEntry
                        key={exercise.id}
                        exercise={exercise}
                        entry={undefined}
                        onUpdate={updateEntry}
                        isSelected={false}
                        onSelect={() => selectExercise(exercise.id)}
                        onDeselect={() => {}}
                      />
                    ))}

                  {/* Add new exercise button */}
                  <button
                    onClick={() => openAddModal(group)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add {muscleGroupNames[group]} Exercise</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddExerciseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        workoutType={workoutType}
        defaultMuscleGroup={addModalMuscleGroup}
      />
    </div>
  );
};
