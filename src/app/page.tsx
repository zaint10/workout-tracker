'use client';

import React, { useState } from 'react';
import { Dumbbell, RotateCcw, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { WorkoutCard } from '@/components/WorkoutCard';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { BodyWeightTracker } from '@/components/BodyWeightTracker';
import { WorkoutType } from '@/types';

// Format today's date
const getTodayFormatted = (): string => {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

export default function Home() {
  const { isLoading, currentWorkout, startWorkout, resetData, getLastWorkoutByType } = useApp();
  const [view, setView] = useState<'home' | 'workout'>('home');

  const handleStartWorkout = (type: WorkoutType) => {
    startWorkout(type);
    setView('workout');
  };

  const handleWorkoutComplete = () => {
    setView('home');
  };

  const handleWorkoutCancel = () => {
    setView('home');
  };

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This will clear all your workout history but restore your exercise list with your recorded weights.')) {
      resetData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (view === 'workout' && currentWorkout) {
    return (
      <ActiveWorkout
        onComplete={handleWorkoutComplete}
        onCancel={handleWorkoutCancel}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Workout Tracker</h1>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{getTodayFormatted()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Reset to defaults"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4 safe-bottom">
        {/* Body Weight Tracker */}
        <BodyWeightTracker />

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Today&apos;s Workout
          </h2>
          <p className="text-gray-600 text-sm">
            Select your workout type to start tracking
          </p>
        </div>

        {(() => {
          // Determine which workout to recommend next
          const lastPull = getLastWorkoutByType('pull');
          const lastPush = getLastWorkoutByType('push');
          
          let recommendedNext: WorkoutType | null = null;
          
          if (!lastPull && !lastPush) {
            // No workouts yet, recommend pull (or could be either)
            recommendedNext = 'pull';
          } else if (!lastPull) {
            recommendedNext = 'pull';
          } else if (!lastPush) {
            recommendedNext = 'push';
          } else {
            // Both exist, recommend opposite of most recent
            const pullDate = new Date(lastPull.date).getTime();
            const pushDate = new Date(lastPush.date).getTime();
            recommendedNext = pullDate > pushDate ? 'push' : 'pull';
          }
          
          return (
            <>
              <WorkoutCard 
                type="pull" 
                onStart={() => handleStartWorkout('pull')} 
                isRecommended={recommendedNext === 'pull'}
              />
              <WorkoutCard 
                type="push" 
                onStart={() => handleStartWorkout('push')} 
                isRecommended={recommendedNext === 'push'}
              />
            </>
          );
        })()}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-2xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>Select Pull Day or Push Day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Pick exercises from each muscle group</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Update weight only if it changed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Add notes for rep quality (optional)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">5.</span>
              <span>Next time, quickly see your last workout!</span>
            </li>
          </ul>
        </div>

        {/* Set Schemes Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">Set Schemes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Standard (4 sets)</span>
              <span className="font-medium text-gray-800">12, 10, 8, 6 reps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Isolation (3 sets)</span>
              <span className="font-medium text-gray-800">12, 12, 12 reps</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
