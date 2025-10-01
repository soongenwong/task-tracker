"use client";

import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../lib/auth';

export default function UserProfile() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20">
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Welcome back, {user.displayName || user.email}!
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-300">
          {user.email}
        </p>
      </div>
      
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
      >
        Sign Out
      </button>
    </div>
  );
}
