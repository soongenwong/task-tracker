"use client";

import { useState } from 'react';
import { signIn, signUp, signInWithGoogle, resetPassword } from '../lib/auth';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      onSuccess?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (resetEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Check Your Email
          </h2>
          <p className="text-blue-700 dark:text-blue-200 mb-4">
            We&apos;ve sent a password reset link to {email}
          </p>
          <button
            onClick={() => setResetEmailSent(false)}
            className="text-blue-600 dark:text-blue-300 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20">
      <h2 className="text-2xl font-bold text-center text-blue-900 dark:text-blue-100 mb-6">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={isSignUp}
              className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-400/30 text-blue-900 dark:text-white"
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-400/30 text-blue-900 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-blue-200/50 dark:border-blue-300/20 bg-white/50 dark:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-400/30 text-blue-900 dark:text-white"
            placeholder="Enter your password"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-200/50 dark:border-blue-300/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-blue-50/30 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-4 py-3 px-4 border border-blue-200/50 dark:border-blue-300/20 bg-white/50 dark:bg-blue-800/30 hover:bg-white/70 dark:hover:bg-blue-700/30 text-blue-900 dark:text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 dark:text-blue-300 hover:underline text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
        </button>

        {!isSignUp && (
          <div>
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="text-blue-600 dark:text-blue-300 hover:underline text-sm disabled:cursor-not-allowed"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
