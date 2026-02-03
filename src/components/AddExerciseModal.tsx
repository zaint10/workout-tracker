'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { MuscleGroup, WorkoutType, SetScheme, muscleGroupNames, setSchemeDisplay } from '@/types';
import { useApp } from '@/context/AppContext';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutType: WorkoutType;
  defaultMuscleGroup?: MuscleGroup;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  workoutType,
  defaultMuscleGroup,
}) => {
  const { addExercise } = useApp();
  
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(defaultMuscleGroup || 'back');
  const [setScheme, setSetScheme] = useState<SetScheme>('4sets');
  const [isBodyweight, setIsBodyweight] = useState(false);

  const muscleGroups: MuscleGroup[] = workoutType === 'pull'
    ? ['back', 'biceps', 'rear-delts', 'shrugs', 'legs']
    : ['chest', 'shoulders', 'triceps', 'legs'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addExercise({
      name: name.trim(),
      muscleGroup,
      workoutType,
      setScheme,
      maxWeight: null,
      isBodyweight,
      lastNote: null,
    });

    setName('');
    setIsBodyweight(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lat Pulldown"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Group
            </label>
            <div className="grid grid-cols-2 gap-2">
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setMuscleGroup(mg)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    muscleGroup === mg
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {muscleGroupNames[mg]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Scheme
            </label>
            <div className="space-y-2">
              {(['4sets', '3sets', '3x5'] as SetScheme[]).map((scheme) => (
                <button
                  key={scheme}
                  type="button"
                  onClick={() => setSetScheme(scheme)}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition text-left ${
                    setScheme === scheme
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {setSchemeDisplay[scheme]}
                </button>
              ))}
            </div>
          </div>

          {/* Bodyweight Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBodyweight(false)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  !isBodyweight
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weighted
              </button>
              <button
                type="button"
                onClick={() => setIsBodyweight(true)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isBodyweight
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bodyweight
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        </form>
      </div>
    </div>
  );
};
