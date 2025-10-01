"use client";

import { useState, useEffect } from 'react';
import Task from './Task';
import { useAuth } from '../contexts/AuthContext';
import { 
  addTask as addTaskToFirestore, 
  updateTask as updateTaskInFirestore, 
  deleteTask as deleteTaskFromFirestore,
  subscribeToTasks,
  TaskItem
} from '../lib/firestore';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const unsubscribe = subscribeToTasks(user.uid, (updatedTasks: TaskItem[]) => {
      setTasks(updatedTasks);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isLoading || !user) return;

    setIsLoading(true);
    try {
      await addTaskToFirestore(newTaskTitle.trim(), user.uid);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to add task:', error);
      // You could add a toast notification here
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

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    // TODO: Implement task reordering with Firestore
    // This would require adding an 'order' field to tasks and updating multiple documents
    console.log('Drag and drop reordering not yet implemented with Firestore');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={addTask} className="mb-8">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What are your top priorities for today?"
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

      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
          >
            <Task
              {...task}
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
    </div>
  );
}
