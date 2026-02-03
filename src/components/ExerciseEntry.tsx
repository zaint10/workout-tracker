'use client';

import React, { useState } from 'react';
import { Check, Plus, Minus, MessageSquare, X, User, Dumbbell } from 'lucide-react';
import { Exercise, WorkoutEntry, SetScheme } from '@/types';
import { setSchemeDisplay } from '@/types';

interface ExerciseEntryProps {
  exercise: Exercise;
  entry: WorkoutEntry | undefined;
  onUpdate: (entry: WorkoutEntry & { setScheme?: SetScheme; clearNote?: boolean }) => void;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export const ExerciseEntry: React.FC<ExerciseEntryProps> = ({
  exercise,
  entry,
  onUpdate,
  isSelected,
  onSelect,
  onDeselect,
}) => {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(entry?.note || '');
  const [clearNote, setClearNote] = useState(false);
  const [isBodyweight, setIsBodyweight] = useState(entry?.isBodyweight ?? exercise.isBodyweight);
  const [weight, setWeight] = useState<string>(
    entry?.weight?.toString() || exercise.maxWeight?.toString() || ''
  );
  const [setScheme, setSetScheme] = useState<SetScheme>(exercise.setScheme);

  const handleWeightChange = (delta: number) => {
    const currentWeight = parseFloat(weight) || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    setWeight(newWeight.toString());
    onUpdate({
      exerciseId: exercise.id,
      weight: newWeight,
      isBodyweight: false,
      note: note || null,
      setScheme,
      clearNote,
    });
  };

  const handleWeightInput = (value: string) => {
    setWeight(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdate({
        exerciseId: exercise.id,
        weight: numValue,
        isBodyweight: false,
        note: note || null,
        setScheme,
        clearNote,
      });
    }
  };

  const handleBodyweightToggle = (bodyweight: boolean) => {
    setIsBodyweight(bodyweight);
    onUpdate({
      exerciseId: exercise.id,
      weight: bodyweight ? null : (parseFloat(weight) || null),
      isBodyweight: bodyweight,
      note: note || null,
      setScheme,
      clearNote,
    });
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    setClearNote(false);
    onUpdate({
      exerciseId: exercise.id,
      weight: isBodyweight ? null : (parseFloat(weight) || null),
      isBodyweight,
      note: value || null,
      setScheme,
      clearNote: false,
    });
  };

  const handleClearNote = () => {
    setNote('');
    setClearNote(true);
    setShowNote(false);
    onUpdate({
      exerciseId: exercise.id,
      weight: isBodyweight ? null : (parseFloat(weight) || null),
      isBodyweight,
      note: null,
      setScheme,
      clearNote: true,
    });
  };

  const handleSetSchemeChange = (newScheme: SetScheme) => {
    setSetScheme(newScheme);
    onUpdate({
      exerciseId: exercise.id,
      weight: isBodyweight ? null : (parseFloat(weight) || null),
      isBodyweight,
      note: note || null,
      setScheme: newScheme,
      clearNote,
    });
  };

  if (!isSelected) {
    return (
      <button
        onClick={onSelect}
        className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">{exercise.name}</h4>
            <p className="text-xs text-gray-500">{setSchemeDisplay[exercise.setScheme]}</p>
          </div>
          {exercise.isBodyweight ? (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Bodyweight
            </span>
          ) : exercise.maxWeight ? (
            <span className="text-sm font-medium text-gray-600">
              Max: {exercise.maxWeight} kg
            </span>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-green-500 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
          </div>
        </div>
        <button
          onClick={onDeselect}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Remove
        </button>
      </div>

      {/* Set Scheme Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleSetSchemeChange('4sets')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
            setScheme === '4sets'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          4×(12,10,8,6)
        </button>
        <button
          onClick={() => handleSetSchemeChange('3sets')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
            setScheme === '3sets'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          3×12
        </button>
        <button
          onClick={() => handleSetSchemeChange('3x5')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
            setScheme === '3x5'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          3×5
        </button>
      </div>

      {/* Bodyweight / Weighted Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => handleBodyweightToggle(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition ${
            !isBodyweight
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Weighted
        </button>
        <button
          onClick={() => handleBodyweightToggle(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition ${
            isBodyweight
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          Bodyweight
        </button>
      </div>

      {/* Weight Input - only show if not bodyweight */}
      {!isBodyweight && (
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => handleWeightChange(-2.5)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => handleWeightInput(e.target.value)}
              className="w-full text-center text-2xl font-bold py-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              placeholder="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              kg
            </span>
          </div>
          
          <button
            onClick={() => handleWeightChange(2.5)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Previous info section */}
      {(exercise.maxWeight || exercise.isBodyweight || exercise.lastNote) && (
        <div className="text-xs text-center text-gray-500 mb-3">
          {exercise.isBodyweight ? (
            <span className="text-blue-600">Default: Bodyweight</span>
          ) : exercise.maxWeight ? (
            <span>Previous max: {exercise.maxWeight} kg</span>
          ) : null}
          {exercise.lastNote && !clearNote && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="italic text-amber-600">"{exercise.lastNote}"</span>
              <button
                onClick={handleClearNote}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 transition"
                title="Clear this note"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            </div>
          )}
          {clearNote && (
            <div className="mt-1 text-green-600 font-medium">
              ✓ Note will be cleared
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowNote(!showNote)}
          className={`flex items-center gap-2 text-sm ${showNote ? 'text-green-600' : 'text-gray-500'} hover:text-green-600 transition`}
        >
          <MessageSquare className="w-4 h-4" />
          {showNote ? 'Hide note' : 'Add note'}
        </button>
      </div>

      {showNote && (
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="e.g., only 4 clean reps, struggled a lot..."
          className="w-full mt-2 p-3 text-sm border border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
          rows={2}
        />
      )}
    </div>
  );
};
