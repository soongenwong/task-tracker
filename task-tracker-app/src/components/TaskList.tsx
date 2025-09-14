"use client";

import { useState } from 'react';
import Task from './Task';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    if (draggedTaskId === targetId) return;

    const taskList = [...tasks];
    const draggedTaskIndex = taskList.findIndex(task => task.id === draggedTaskId);
    const targetTaskIndex = taskList.findIndex(task => task.id === targetId);

    const [draggedTask] = taskList.splice(draggedTaskIndex, 1);
    taskList.splice(targetTaskIndex, 0, draggedTask);

    setTasks(taskList);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={addTask} className="mb-8">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What are your top priorities for today?"
          className="w-full p-4 rounded-xl border border-blue-200/50 dark:border-blue-300/20
                   bg-blue-50/30 dark:bg-blue-900/20 backdrop-blur-sm focus:outline-none focus:ring-2 
                   focus:ring-blue-300/50 dark:focus:ring-blue-400/30 placeholder:text-blue-600/50
                   dark:placeholder:text-blue-300/60 text-blue-900 dark:text-white
                   transition-all duration-300 hover:border-blue-300/50 dark:hover:border-blue-200/30
                   hover:bg-blue-100/30 dark:hover:bg-blue-800/30 hover:shadow-lg hover:shadow-blue-200/20 dark:hover:shadow-blue-500/10"
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
