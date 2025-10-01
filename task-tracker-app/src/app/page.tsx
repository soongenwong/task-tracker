"use client";

import TaskList from '../components/TaskList';
import AuthForm from '../components/AuthForm';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

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
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Task Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your effortless path to a more productive day
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        {user ? (
          <>
            <div className="mb-8">
              <UserProfile />
            </div>
            <TaskList />
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
