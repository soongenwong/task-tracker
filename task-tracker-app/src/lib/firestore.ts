import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  taskDate: Date; // The date this task is assigned to
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TaskItemFirestore {
  title: string;
  completed: boolean;
  dueDate?: Timestamp;
  taskDate: Timestamp; // The date this task is assigned to
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

const TASKS_COLLECTION = 'tasks';

// Convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Add a new task
export const addTask = async (title: string, userId: string, taskDate: Date, dueDate?: Date): Promise<string> => {
  try {
    const now = new Date();
    const taskData: TaskItemFirestore = {
      title: title.trim(),
      completed: false,
      userId,
      taskDate: convertDateToTimestamp(taskDate),
      createdAt: convertDateToTimestamp(now),
      updatedAt: convertDateToTimestamp(now),
    };

    if (dueDate) {
      taskData.dueDate = convertDateToTimestamp(dueDate);
    }

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (
  id: string, 
  updates: Partial<Pick<TaskItem, 'title' | 'completed' | 'dueDate'>>
): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    const updateData: Partial<TaskItemFirestore> = {
      updatedAt: convertDateToTimestamp(new Date()),
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }

    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }

    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? convertDateToTimestamp(updates.dueDate) : undefined;
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get all tasks for a user on a specific date (one-time fetch)
export const getTasksForDate = async (userId: string, taskDate: Date): Promise<TaskItem[]> => {
  try {
    const startOfDay = new Date(taskDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(taskDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, TASKS_COLLECTION), 
      where('userId', '==', userId),
      where('taskDate', '>=', convertDateToTimestamp(startOfDay)),
      where('taskDate', '<=', convertDateToTimestamp(endOfDay)),
      orderBy('taskDate', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as TaskItemFirestore;
      return {
        id: doc.id,
        title: data.title,
        completed: data.completed,
        userId: data.userId,
        taskDate: convertTimestampToDate(data.taskDate),
        dueDate: data.dueDate ? convertTimestampToDate(data.dueDate) : undefined,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as TaskItem;
    });
  } catch (error) {
    console.error('Error getting tasks for date:', error);
    throw error;
  }
};

// Subscribe to real-time task updates for a user on a specific date
export const subscribeToTasksForDate = (userId: string, taskDate: Date, callback: (tasks: TaskItem[]) => void): () => void => {
  const startOfDay = new Date(taskDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(taskDate);
  endOfDay.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, TASKS_COLLECTION), 
    where('userId', '==', userId),
    where('taskDate', '>=', convertDateToTimestamp(startOfDay)),
    where('taskDate', '<=', convertDateToTimestamp(endOfDay)),
    orderBy('taskDate', 'desc'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data() as TaskItemFirestore;
      return {
        id: doc.id,
        title: data.title,
        completed: data.completed,
        userId: data.userId,
        taskDate: convertTimestampToDate(data.taskDate),
        dueDate: data.dueDate ? convertTimestampToDate(data.dueDate) : undefined,
        createdAt: convertTimestampToDate(data.createdAt),
        updatedAt: convertTimestampToDate(data.updatedAt),
      } as TaskItem;
    });
    
    callback(tasks);
  }, (error) => {
    console.error('Error in task subscription:', error);
  });
};

// Get all dates that have tasks for a user (for calendar visualization)
export const getDatesWithTasks = async (userId: string, startDate: Date, endDate: Date): Promise<Set<string>> => {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION), 
      where('userId', '==', userId),
      where('taskDate', '>=', convertDateToTimestamp(startDate)),
      where('taskDate', '<=', convertDateToTimestamp(endDate))
    );
    const querySnapshot = await getDocs(q);
    
    const taskDates = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as TaskItemFirestore;
      const taskDate = convertTimestampToDate(data.taskDate);
      const dateKey = taskDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      taskDates.add(dateKey);
    });
    
    return taskDates;
  } catch (error) {
    console.error('Error getting dates with tasks:', error);
    throw error;
  }
};
