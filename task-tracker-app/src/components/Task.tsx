"use client";

import { useState } from 'react';

interface TaskProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Task({ id, title, completed, dueDate, createdAt, updatedAt, onComplete, onDelete }: TaskProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group flex items-center justify-between p-4 bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20 hover:border-blue-300/50 dark:hover:border-blue-200/30 hover:bg-blue-100/30 dark:hover:bg-blue-800/30 hover:shadow-lg hover:shadow-blue-200/20 dark:hover:shadow-blue-500/10 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => onComplete(id)}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center
            ${completed 
              ? 'bg-blue-400 border-blue-400 hover:bg-blue-500 hover:border-blue-500 scale-105' 
              : 'border-blue-300 dark:border-blue-400 hover:border-blue-400 dark:hover:border-blue-300 hover:scale-105'
            }`}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <span className={`text-sm font-medium tracking-tight ${completed ? 'line-through text-white/50 dark:text-white/40' : 'text-white dark:text-white'}`}>
          {title}
        </span>
        
        {dueDate && (
          <span className="text-xs font-semibold bg-white/20 dark:bg-white/10 text-white dark:text-white/90 px-2 py-0.5 rounded-full">
            Due: {dueDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {isHovered && (
        <button
          onClick={() => onDelete(id)}
          className="text-white/40 hover:text-red-300 dark:text-white/30 dark:hover:text-red-300 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
