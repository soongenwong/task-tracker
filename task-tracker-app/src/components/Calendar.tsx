"use client";

import { useState } from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  taskDates: Set<string>; // Dates that have tasks (in YYYY-MM-DD format)
}

export default function Calendar({ selectedDate, onDateSelect, taskDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = formatDateKey(date);
      const hasTasks = taskDates.has(dateKey);
      
      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(date)}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
            ${isSelected(date) 
              ? 'bg-blue-600 text-white shadow-lg' 
              : isToday(date)
              ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 ring-2 ring-blue-400'
              : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-900 dark:text-blue-100'
            }
            ${hasTasks ? 'ring-2 ring-green-400 dark:ring-green-500' : ''}
          `}
        >
          {day}
          {hasTasks && (
            <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-0.5"></div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-300/20 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-blue-600 dark:text-blue-300 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>Selected day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Has tasks</span>
        </div>
      </div>
    </div>
  );
}
