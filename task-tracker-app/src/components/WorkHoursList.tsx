"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  WorkLog, 
  subscribeToWorkLogs, 
  deleteWorkLog, 
  calculateHours, 
  formatHours 
} from '../lib/work-hours-store';

interface WorkHoursListProps {
  refreshTrigger?: number;
}

export default function WorkHoursList({ refreshTrigger }: WorkHoursListProps) {
  const { user } = useAuth();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (!user) {
      setWorkLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToWorkLogs(user.uid, (updatedWorkLogs: WorkLog[]) => {
      setWorkLogs(updatedWorkLogs);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!user || deletingId) return;

    const confirmed = window.confirm('Are you sure you want to delete this work log?');
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteWorkLog(id);
    } catch (error) {
      console.error('Failed to delete work log:', error);
      alert('Failed to delete work log. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTotalHours = (): number => {
    return workLogs.reduce((total, log) => {
      return total + calculateHours(log.startTime, log.endTime);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-300">Loading work logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20">
      <div className="p-6 border-b border-blue-200/50 dark:border-blue-300/20">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            Work Log History
          </h2>
          {workLogs.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Total Hours: <span className="font-semibold">{formatHours(getTotalHours())}</span>
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400">
                {workLogs.length} log{workLogs.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {workLogs.length === 0 ? (
          <div className="p-6 text-center text-blue-600 dark:text-blue-300">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No work logs yet. Add your first entry above!</p>
          </div>
        ) : (
          <div className="divide-y divide-blue-200/30 dark:divide-blue-300/20">
            {workLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-blue-100/20 dark:hover:bg-blue-800/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-300">
                        {formatTime(log.startTime)} - {formatTime(log.endTime)}
                      </span>
                      <span className="text-sm font-medium bg-blue-200/40 dark:bg-blue-700/40 
                                     text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {formatHours(calculateHours(log.startTime, log.endTime))}
                      </span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="ml-4 p-2 text-red-600 hover:text-red-700 dark:text-red-400 
                             dark:hover:text-red-300 transition-colors disabled:opacity-50 
                             disabled:cursor-not-allowed hover:bg-red-100/20 dark:hover:bg-red-900/20 
                             rounded-lg"
                    title="Delete work log"
                  >
                    {deletingId === log.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
