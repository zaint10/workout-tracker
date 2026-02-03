'use client';

import React, { useState } from 'react';
import { Scale, Plus, X, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDateLong } from '@/lib/storage';

export const BodyWeightTracker: React.FC = () => {
  const { data, addBodyWeight, deleteBodyWeight, latestBodyWeight } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    addBodyWeight(weightNum, new Date(date).toISOString());
    setWeight('');
    setShowModal(false);
  };

  const weightChange = () => {
    if (!data || data.bodyWeightHistory.length < 2) return null;
    const history = data.bodyWeightHistory;
    const current = history[history.length - 1].weight;
    const previous = history[history.length - 2].weight;
    return current - previous;
  };

  const change = weightChange();

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Body Weight</h3>
              {latestBodyWeight && (
                <p className="text-xs text-gray-500">
                  Last: {formatDateLong(latestBodyWeight.date)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-purple-500 hover:bg-purple-600 rounded-full text-white transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {latestBodyWeight ? (
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-800">
              {latestBodyWeight.weight}
            </span>
            <span className="text-xl text-gray-500 mb-1">kg</span>
            {change !== null && (
              <div className={`flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full text-sm font-medium ${
                change > 0 
                  ? 'bg-green-100 text-green-700' 
                  : change < 0 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                <span>{change > 0 ? '+' : ''}{change.toFixed(1)} kg</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No weight recorded yet</p>
        )}

        {data && data.bodyWeightHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showHistory ? 'Hide history' : `View history (${data.bodyWeightHistory.length} entries)`}
          </button>
        )}

        {showHistory && data && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {[...data.bodyWeightHistory].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-600">
                  {formatDateLong(entry.date)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800">{entry.weight} kg</span>
                  <button
                    onClick={() => deleteBodyWeight(entry.id)}
                    className="p-1 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Weight Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Log Body Weight</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g., 97.5"
                  step="0.1"
                  className="w-full px-4 py-3 text-2xl font-bold text-center border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!weight || parseFloat(weight) <= 0}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition"
              >
                Save Weight
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
