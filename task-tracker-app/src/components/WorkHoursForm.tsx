"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addWorkLog } from '../lib/work-hours-store';

interface WorkHoursFormProps {
  onWorkLogAdded?: () => void;
}

export default function WorkHoursForm({ onWorkLogAdded }: WorkHoursFormProps) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isLoading) return;

    // Validation
    if (!date || !startTime || !endTime || !description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await addWorkLog(date, startTime, endTime, description.trim(), user.uid);
      
      // Reset form
      setDescription('');
      setError('');
      
      // Notify parent component
      onWorkLogAdded?.();
    } catch (error) {
      console.error('Failed to add work log:', error);
      setError('Failed to add work log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20 p-6">
      <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-6">
        Log Work Hours
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Input */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 
                       bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 
                       focus:ring-blue-300/50 dark:focus:ring-blue-400/30 
                       text-blue-900 dark:text-white"
              required
            />
          </div>

          {/* Start Time Input */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 
                       bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 
                       focus:ring-blue-300/50 dark:focus:ring-blue-400/30 
                       text-blue-900 dark:text-white"
              required
            />
          </div>

          {/* End Time Input */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 
                       bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 
                       focus:ring-blue-300/50 dark:focus:ring-blue-400/30 
                       text-blue-900 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            What did you work on?
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you worked on today..."
            rows={4}
            className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 
                     bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 
                     focus:ring-blue-300/50 dark:focus:ring-blue-400/30 
                     text-blue-900 dark:text-white placeholder:text-blue-600/50 
                     dark:placeholder:text-blue-300/60 resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                   text-white font-medium rounded-lg transition-colors duration-200 
                   disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Work Log...' : 'Add Work Log'}
        </button>
      </form>
    </div>
  );
}
