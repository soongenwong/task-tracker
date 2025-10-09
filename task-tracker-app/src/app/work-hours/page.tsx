"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from '../../components/AuthForm';
import UserProfile from '../../components/UserProfile';
import Navigation from '../../components/Navigation';
import WorkHoursForm from '../../components/WorkHoursForm';
import WorkHoursList from '../../components/WorkHoursList';

export default function WorkHoursPage() {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWorkLogAdded = () => {
    // Trigger refresh of the work hours list
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20 sm:p-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Work Hours Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your daily work hours and accomplishments
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        {user ? (
          <>
            <div className="mb-8">
              <UserProfile />
            </div>
            
            <Navigation />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div>
                <WorkHoursForm onWorkLogAdded={handleWorkLogAdded} />
              </div>

              {/* List Section */}
              <div>
                <WorkHoursList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        )}
      </div>
    </div>
  );
}
