"use client";

import { useState, useEffect } from 'react';
import Task from './Task';
import Calendar from './Calendar';
import { useAuth } from '../contexts/AuthContext';
import { 
  addTask as addTaskToFirestore, 
  updateTask as updateTaskInFirestore, 
  deleteTask as deleteTaskFromFirestore,
  subscribeToTasksForDate,
  getDatesWithTasks,
  TaskItem
} from '../lib/firestore';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());

  // Subscribe to real-time updates from Firestore for the selected date
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const unsubscribe = subscribeToTasksForDate(user.uid, selectedDate, (updatedTasks: TaskItem[]) => {
      setTasks(updatedTasks);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, selectedDate]);

  // Load dates with tasks for calendar
  useEffect(() => {
    if (!user) {
      setTaskDates(new Set());
      return;
    }

    const loadTaskDates = async () => {
      try {
        // Get tasks for the current month
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const dates = await getDatesWithTasks(user.uid, startOfMonth, endOfMonth);
        setTaskDates(dates);
      } catch (error) {
        console.error('Error loading task dates:', error);
      }
    };

    loadTaskDates();
  }, [user, selectedDate]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isLoading || !user) return;

    setIsLoading(true);
    try {
      await addTaskToFirestore(newTaskTitle.trim(), user.uid, selectedDate);
      setNewTaskTitle('');
      
      // Refresh task dates for calendar
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const dates = await getDatesWithTasks(user.uid, startOfMonth, endOfMonth);
      setTaskDates(dates);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await updateTaskInFirestore(id, { completed: !task.completed });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskFromFirestore(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, _targetId: string) => {
    e.preventDefault();
    // TODO: Implement task reordering with Firestore
    // This would require adding an 'order' field to tasks and updating multiple documents
    console.log('Drag and drop reordering not yet implemented with Firestore', _targetId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div>
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Calendar
          </h2>
          <Calendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            taskDates={taskDates}
          />
        </div>

        {/* Tasks Section */}
        <div>
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Tasks for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          <form onSubmit={addTask} className="mb-6">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What do you need to do today?"
              disabled={isLoading}
              className="w-full p-4 rounded-xl border border-blue-200/50 dark:border-blue-300/20
                       bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm focus:outline-none focus:ring-2 
                       focus:ring-blue-300/50 dark:focus:ring-blue-400/30 placeholder:text-blue-600/50
                       dark:placeholder:text-blue-300/60 text-blue-900 dark:text-white
                       transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-200/30
                       hover:bg-blue-100/30 dark:hover:bg-blue-800/30 hover:shadow-lg hover:shadow-blue-200/20 dark:hover:shadow-blue-500/10
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </form>

          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task.id)}
              >
                <Task
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  dueDate={task.dueDate}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                />
              </div>
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-6 flex justify-between items-center text-sm">
              <span className="font-medium text-blue-900 dark:text-blue-100 bg-blue-200/40 dark:bg-blue-700/40 px-3 py-1 rounded-full">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </span>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {tasks.filter(t => t.completed).length} completed
              </span>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-300">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No tasks for this day. Add one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
