'use client';

import React from 'react';
import { Dumbbell, ArrowDown, ArrowUp, Calendar, Sparkles } from 'lucide-react';
import { WorkoutType, muscleGroupNames } from '@/types';
import { useApp } from '@/context/AppContext';
import { getDaysSince, formatDate } from '@/lib/storage';

interface WorkoutCardProps {
  type: WorkoutType;
  onStart: () => void;
  isRecommended?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ type, onStart, isRecommended = false }) => {
  const { getLastWorkoutByType, getExerciseById } = useApp();
  
  const lastWorkout = getLastWorkoutByType(type);
  const isPull = type === 'pull';
  
  const bgColor = isPull ? 'bg-pull-light' : 'bg-push-light';
  const borderColor = isPull ? 'border-pull' : 'border-push';
  const textColor = isPull ? 'text-pull-dark' : 'text-push-dark';
  const btnBg = isPull ? 'bg-pull hover:bg-pull-dark' : 'bg-push hover:bg-push-dark';
  
  const Icon = isPull ? ArrowDown : ArrowUp;

  // Group exercises by muscle group for better display
  const getExercisesByMuscle = () => {
    if (!lastWorkout) return {};
    const grouped: Record<string, Array<{ name: string; weight: number | null; isBodyweight: boolean; note: string | null; muscleGroup: string }>> = {};
    
    lastWorkout.entries.forEach((entry) => {
      const exercise = getExerciseById(entry.exerciseId);
      if (!exercise) return;
      
      const group = muscleGroupNames[exercise.muscleGroup];
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push({
        name: exercise.name,
        weight: entry.weight || exercise.maxWeight,
        isBodyweight: entry.isBodyweight ?? exercise.isBodyweight,
        note: entry.note,
        muscleGroup: group,
      });
    });
    
    return grouped;
  };

  const exercisesByMuscle = getExercisesByMuscle();
  const muscleGroups = Object.keys(exercisesByMuscle);
  
  return (
    <div className={`${bgColor} rounded-2xl p-5 border-2 ${isRecommended ? 'border-4' : 'border-2'} ${borderColor} shadow-sm relative ${isRecommended ? 'ring-2 ring-offset-2 ' + (isPull ? 'ring-pull' : 'ring-push') : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isPull ? 'bg-pull' : 'bg-push'} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse`}>
          <Sparkles className="w-3 h-3" />
          DO THIS NEXT
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${isPull ? 'bg-pull' : 'bg-push'} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${textColor}`}>
            {isPull ? 'Pull Day' : 'Push Day'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isPull ? 'Back, Biceps, Rear Delts, Shrugs, Legs' : 'Chest, Shoulders, Triceps, Legs'}
          </p>
        </div>
      </div>
      
      {lastWorkout ? (
        <div className="mb-4">
          {/* Last workout header */}
          <div className="flex items-center gap-2 text-sm mb-3 pb-2 border-b border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-700">Last: {formatDate(lastWorkout.date)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isPull ? 'bg-pull/20 text-pull-dark' : 'bg-push/20 text-push-dark'}`}>
              {getDaysSince(lastWorkout.date) === 0 ? 'Today' : getDaysSince(lastWorkout.date) === 1 ? 'Yesterday' : `${getDaysSince(lastWorkout.date)} days ago`}
            </span>
          </div>
          
          {/* Exercises grouped by muscle */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {muscleGroups.map((muscle) => (
              <div key={muscle}>
                <h4 className={`text-xs font-bold uppercase tracking-wide mb-1.5 ${textColor}`}>
                  {muscle}
                </h4>
                <div className="space-y-1">
                  {exercisesByMuscle[muscle].map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm bg-white/70 rounded-lg px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-800 block truncate">{ex.name}</span>
                        {ex.note && (
                          <span className="text-xs text-amber-600 italic">"{ex.note}"</span>
                        )}
                      </div>
                      {ex.isBodyweight ? (
                        <span className={`font-bold text-blue-600 ml-2 whitespace-nowrap text-xs`}>BW</span>
                      ) : ex.weight ? (
                        <span className={`font-bold ${textColor} ml-2 whitespace-nowrap`}>{ex.weight} kg</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
            {lastWorkout.entries.length} exercises completed
          </div>
        </div>
      ) : (
        <div className="mb-4 py-8 text-center text-gray-500">
          <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No previous workout</p>
        </div>
      )}
      
      <button
        onClick={onStart}
        className={`w-full ${btnBg} text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.98]`}
      >
        Start {isPull ? 'Pull' : 'Push'} Day
      </button>
    </div>
  );
};
